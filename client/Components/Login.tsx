/// <reference types="vite/client" />
import { Products, StytchLogin } from '@stytch/react';
import Layout from './Layout';
import React, { useState } from 'react';
import { useLanguage } from '../src/i18n/LanguageContext';

export const TERMS_URL = '/devs-connect-legal-suite.pdf';
const URL_CLIENT = import.meta.env.VITE_URL_CLIENT || 'http://localhost:6969';
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:6969';

// Login Page That Uses Magic Link
const stytchConfig = {
    emailMagicLinksOptions: {
        createUserAsPending: true,
        loginExpirationMinutes: 30,
        loginRedirectURL: URL_CLIENT + '/authenticate',
        signupExpirationMinutes: 30,
        signupRedirectURL: URL_CLIENT + '/authenticate',
    },
    products: [Products.emailMagicLinks],
};

// Conditionally set the width based on screen size
const isSmallScreen = window.innerWidth < 1024;

const stytchPresentation = {
    theme: {
        'color-scheme': 'light' as const,
        'font-family': 'monospace',
        'container-width': isSmallScreen ? '100%' : '600px',
        background: 'white',
        foreground: '#111827',
        primary: '#1447e6',
        'primary-foreground': 'white',
    },
};

const Login = () => {
    const { t } = useLanguage();
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setTermsAccepted(checked);
        if (checked) {
            try {
                await fetch(`${baseUrl}/auth/consent`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({}),
                });
            } catch (err) {
                console.error('Consent registration failed:', err);
            }
        }
    };

    return (
        <Layout>
            <section className="h-175 lg:h-[100vh] flex flex-col items-center justify-center">
                <h1 className="text-center mb-8 text-6xl text-bg-linear-to-tr from-blue-700 to-slate-950 font-mono select-none font-black tracking-tight text-shadow-sm mb-25">
                    {t('login.tagline')}
                </h1>

                <div className="w-full max-w-[600px] px-4 mb-4">
                    <label className="flex items-start gap-2.5 text-sm text-slate-700 select-none cursor-pointer p-3 bg-white/80 backdrop-blur-xs rounded-lg border border-slate-200 shadow-xs">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={handleCheckboxChange}
                            required
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="leading-snug">
                            I'm at least 18 years of age and agree to the{' '}
                            <a
                                href={`${TERMS_URL}#terms`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 font-medium underline hover:text-blue-800"
                            >
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a
                                href={`${TERMS_URL}#privacy`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 font-medium underline hover:text-blue-800"
                            >
                                Privacy Policy
                            </a>
                            .
                        </span>
                    </label>
                </div>

                <div
                    className={`shadow-xl transition-all duration-200 ${
                        !termsAccepted
                            ? 'pointer-events-none opacity-40 select-none cursor-not-allowed filter grayscale'
                            : ''
                    }`}
                    aria-disabled={!termsAccepted}
                >
                    <StytchLogin
                        config={stytchConfig}
                        presentation={stytchPresentation}
                    />
                </div>
            </section>
        </Layout>
    );
};

export default Login;
