import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import Layout from './Layout';
import API from '../Service/service';
import { useLanguage } from '../src/i18n/LanguageContext';

const feedbackCategories = [
    'Feedback',
    'Bug report',
    'Feature request',
    'Account help',
    'Other',
] as const;

type FeedbackCategory = (typeof feedbackCategories)[number];

const HelpAndSupport: React.FC = () => {
    const { t } = useLanguage();
    const [category, setCategory] = useState<FeedbackCategory>('Feedback');
    const [contactEmail, setContactEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const submitFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setSubmissionStatus(null);
        try {
            await API.sendFeedback({
                category,
                contactEmail: contactEmail.trim(),
                message: message.trim(),
            });
            setMessage('');
            setSubmissionStatus({
                type: 'success',
                message: t('help.success'),
            });
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            setSubmissionStatus({
                type: 'error',
                message:
                    error instanceof Error && error.message
                        ? error.message
                        : t('help.failure'),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <main className="mx-auto mt-16 max-w-4xl px-4 py-10">
                <header className="mb-8 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white shadow-lg">
                    <div className="mb-3 flex items-center gap-3">
                        <Icon icon="mdi:lifebuoy" className="h-9 w-9" />
                        <h1 className="text-3xl font-bold">{t('help.title')}</h1>
                    </div>
                    <p className="max-w-2xl text-blue-100">{t('help.intro')}</p>
                </header>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {t('help.sendTitle')}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {t('help.sendDescription')}
                        </p>
                        {submissionStatus && (
                            <p
                                className={`mt-3 text-sm ${
                                    submissionStatus.type === 'success'
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                }`}
                                role={submissionStatus.type === 'error' ? 'alert' : 'status'}
                            >
                                {submissionStatus.message}
                            </p>
                        )}
                    </div>
                    <form className="space-y-5" onSubmit={(event) => void submitFeedback(event)}>
                        <div>
                            <label
                                htmlFor="feedback-category"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                {t('help.category')}
                            </label>
                            <select
                                id="feedback-category"
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value as FeedbackCategory)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            >
                                {feedbackCategories.map((option) => (
                                    <option key={option} value={option}>
                                        {t(`help.category.${option}`)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="feedback-email"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                {t('help.email')} <span className="font-normal text-gray-500">{t('help.optional')}</span>
                            </label>
                            <input
                                id="feedback-email"
                                type="email"
                                maxLength={254}
                                value={contactEmail}
                                onChange={(event) => setContactEmail(event.target.value)}
                                autoComplete="email"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="feedback-message"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                {t('help.message')}
                            </label>
                            <textarea
                                id="feedback-message"
                                required
                                minLength={5}
                                maxLength={5000}
                                rows={6}
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                placeholder={t('help.messagePlaceholder')}
                                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || message.trim().length < 5}
                                className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading && (
                                    <Icon icon="mdi:loading" className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {loading ? t('help.sending') : t('help.send')}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </Layout>
    );
};

export default HelpAndSupport;
