/// <reference types="vite/client" />
import { Products, StytchLogin } from '@stytch/react';
import Layout from './Layout';
import React from 'react';
import { useLanguage } from '../src/i18n/LanguageContext';
const URL_CLIENT =  import.meta.env.VITE_URL_CLIENT || 'http://localhost:6969';

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
    return (
        <Layout>
            <section className="h-175 lg:h-[100vh] flex flex-col items-center justify-center">
                <h1 className="text-center mb-8 text-6xl text-bg-linear-to-tr from-blue-700 to-slate-950 font-mono select-none font-black tracking-tight text-shadow-sm mb-25">
                    {t('login.tagline')}
                </h1>
                <div className="shadow-xl">
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
