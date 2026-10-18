import nodemailer from 'nodemailer';

const allowedCategories = new Set([
    'Feedback',
    'Bug report',
    'Feature request',
    'Account help',
    'Other',
]);

const isValidEmail = (value) =>
    typeof value === 'string' &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const sendFeedback = async (req, res) => {
    const { category, contactEmail, message } = req.body || {};

    if (!allowedCategories.has(category)) {
        return res.status(400).json({ error: 'Select a valid feedback category' });
    }
    if (
        typeof message !== 'string' ||
        message.trim().length < 5 ||
        message.length > 5000
    ) {
        return res
            .status(400)
            .json({ error: 'Message must be between 5 and 5000 characters' });
    }
    if (
        contactEmail !== undefined &&
        contactEmail !== '' &&
        !isValidEmail(contactEmail)
    ) {
        return res.status(400).json({ error: 'Enter a valid reply email' });
    }

    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpAppPassword = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, '');
    const supportEmails = process.env.SUPPORT_EMAILS?.trim();
    const missingSettings = [
        ['SMTP_USER', smtpUser],
        ['SMTP_APP_PASSWORD', smtpAppPassword],
        ['SUPPORT_EMAILS', supportEmails],
    ]
        .filter(([, value]) => !value)
        .map(([name]) => name);
    if (missingSettings.length) {
        console.error('Feedback email configuration is incomplete:', {
            missingSettings,
        });
        return res
            .status(503)
            .json({
                error:
                    process.env.NODE_ENV === 'production'
                        ? 'Feedback email is temporarily unavailable'
                        : `Feedback email setup is missing: ${missingSettings.join(', ')}.`,
            });
    }

    const invalidSettings = [];
    if (!isValidEmail(smtpUser)) invalidSettings.push('SMTP_USER');
    if (!/^[A-Za-z0-9]{16}$/.test(smtpAppPassword)) {
        invalidSettings.push('SMTP_APP_PASSWORD (must be a 16-character Google App Password)');
    }
    if (invalidSettings.length) {
        console.error('Feedback email configuration is invalid:', {
            invalidSettings,
        });
        return res
            .status(503)
            .json({
                error:
                    process.env.NODE_ENV === 'production'
                        ? 'Feedback email is temporarily unavailable'
                        : `Feedback email setup is invalid: ${invalidSettings.join(', ')}.`,
            });
    }

    const recipients = supportEmails
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean);
    if (!recipients.length || recipients.some((email) => !isValidEmail(email))) {
        console.error('Feedback recipient configuration is invalid:', {
            invalidRecipientCount: recipients.filter((email) => !isValidEmail(email))
                .length,
        });
        return res
            .status(503)
            .json({ error: 'Feedback email is temporarily unavailable' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: smtpUser,
                pass: smtpAppPassword,
            },
        });

        await transporter.sendMail({
            from: `Devs Connect Feedback <${smtpUser}>`,
            to: recipients,
            replyTo: contactEmail || undefined,
            subject: `Devs Connect ${category}`,
            text: [
                `Category: ${category}`,
                `Reply to: ${contactEmail || '(not provided)'}`,
                '',
                message.trim(),
            ].join('\n'),
        });

        return res.status(200).json({ message: 'Feedback sent successfully' });
    } catch (error) {
        console.error('Failed to deliver feedback email:', {
            name: error.name,
            code: error.code,
            responseCode: error.responseCode,
            command: error.command,
        });
        return res
            .status(502)
            .json({ error: 'Feedback could not be sent. Please try again later.' });
    }
};
