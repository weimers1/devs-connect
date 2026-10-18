import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { Icon } from '@iconify/react';
import Layout from './Layout';
import API from '../Service/service';
import { useLanguage } from '../src/i18n/LanguageContext';

const CATEGORIES = ['Feedback', 'Bug report', 'Feature request', 'Account help', 'Other'];

const HelpAndSupport: React.FC = () => {
    const { t } = useLanguage();
    const [category, setCategory] = useState('Feedback');
    const [message, setMessage] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSending(true);
        setStatus(null);
        try {
            await API.submitFeedback({
                category,
                contactEmail: contactEmail.trim(),
                message: message.trim(),
            });
            setMessage('');
            setContactEmail('');
            setStatus({
                type: 'success',
                message: t('help.success'),
            });
        } catch (error) {
            console.error('Failed to send feedback:', error);
            setStatus({
                type: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : t('help.failure'),
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <Layout>
            <main className="mx-auto mt-16 max-w-4xl px-4 py-10">
                <header className="mb-8 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white shadow-lg">
                    <div className="mb-3 flex items-center gap-3">
                        <Icon icon="mdi:lifebuoy" className="h-9 w-9" />
                        <h1 className="                        text-3xl font-bold">{t('help.title')}</h1>
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
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {status && (
                            <p
                                className={`rounded-lg border p-3 text-sm ${
                                    status.type === 'success'
                                        ? 'border-green-200 bg-green-50 text-green-800'
                                        : 'border-red-200 bg-red-50 text-red-700'
                                }`}
                                role={status.type === 'error' ? 'alert' : 'status'}
                            >
                                {status.message}
                            </p>
                        )}
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
                                onChange={(event) => setCategory(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {t(`help.category.${c}`)}
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
                                value={contactEmail}
                                onChange={(event) => setContactEmail(event.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                required
                                minLength={5}
                                aria-describedby="feedback-message-hint"
                                rows={7}
                                placeholder={t('help.messagePlaceholder')}
                                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sending || message.trim().length < 5}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Icon icon="mdi:email-send-outline" className="h-5 w-5" />
                            {sending ? t('help.sending') : t('help.send')}
                        </button>
                        <p
                            id="feedback-message-hint"
                            className="mt-2 text-sm text-gray-600"
                            aria-live="polite"
                        >
                            {message.trim().length < 5
                                ? t('help.hintShort')
                                : t('help.hintReady')}
                        </p>
                    </form>
                </section>
            </main>
        </Layout>
    );
};

export default HelpAndSupport;
