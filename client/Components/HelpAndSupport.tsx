import React, { useEffect, useState } from 'react';
import Featurebase, { initFeedback, destroyFeedback } from 'featurebase-js';
import { Icon } from '@iconify/react';
import Layout from './Layout';
import API from '../Service/service';
import { useLanguage } from '../src/i18n/LanguageContext';

const HelpAndSupport: React.FC = () => {
    const { t, language } = useLanguage();
    const featurebaseAppId = import.meta.env.VITE_FEATURES_APP_ID;
    const [portalReady, setPortalReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [portalError, setPortalError] = useState<string | null>(null);

    useEffect(() => () => destroyFeedback(), []);

    const openFeedback = async () => {
        if (!featurebaseAppId) {
            setPortalError(t('help.portal.unavailable'));
            return;
        }
        setLoading(true);
        setPortalError(null);
        try {
            const { featurebaseJwt } = await API.getFeaturebaseToken();
            destroyFeedback();
            // Messenger stays off: only the feedback widget is loaded.
            Featurebase({
                appId: featurebaseAppId,
                featurebaseJwt,
                messenger: false,
            });
            initFeedback({
                theme: 'light',
                placement: 'bottom-right',
                locale: language === 'es' ? 'es' : 'en',
            });
            setPortalReady(true);
        } catch (error) {
            console.error('Feedback portal unavailable:', error);
            setPortalError(
                error instanceof Error && error.message
                    ? error.message
                    : t('help.portal.unavailable'),
            );
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

                <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {t('help.portal.title')}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {t('help.portal.description')}
                        </p>
                        {portalError && (
                            <p className="mt-2 text-sm text-red-700" role="alert">
                                {portalError}
                            </p>
                        )}
                    </div>
                    {portalReady ? (
                        <p className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                            <Icon icon="mdi:arrow-bottom-right" className="h-5 w-5" />
                            {t('help.portal.open')}
                        </p>
                    ) : (
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => void openFeedback()}
                            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
                        >
                            {t('help.portal.start')}
                        </button>
                    )}
                </section>
            </main>
        </Layout>
    );
};

export default HelpAndSupport;
