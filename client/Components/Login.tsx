/// <reference types="vite/client" />
import { StytchLogin } from '@stytch/react';
import { Products } from '@stytch/vanilla-js';
import Layout from './Layout';
import React from 'react';
const URL_CLIENT = 'http://localhost:6969' ;
 //import.meta.env.VITE_URL_CLIENT;

// Define TypeScript interface for stytchStyle
interface StytchStyle {
    fontFamily: string;
    container: {
        backgroundColor: string;
        borderColor: string;
        width?: string;
        [key: string]: string | undefined;
    };
    input: {
        textAlign: string;
    };
    buttons: {
        primary: {
            backgroundColor?: string;
            textColor?: string;
            borderColor?: string;
            borderRadius?: string;
        };
        secondary: {
            backgroundColor?: string;
            textColor?: string;
            borderColor?: string;
            borderRadius?: string;
        };
    };
    colors: {
        primary: string;
    };
}

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

const stytchStyle: StytchStyle = {
    fontFamily: 'Monospace',
    container: {
        backgroundColor: 'white',
        borderColor: 'white',
        ...(isSmallScreen ? { width: '100%' } : { width: '500px' }), // Conditionally add width
    },
    input: {
        textAlign: 'center', // Center text in input fields
    },
    buttons: {
        primary: {
            backgroundColor: '#1447e6',
            textColor: 'white',
        },
        secondary: {
            backgroundColor: 'white',
            textColor: '#1447e6',
        },
    },
    colors: {
        primary: '#1447e6',
    },
};

const Login = () => {
    return (
        <Layout>
            <section className="h-175 lg:h-[100vh] flex flex-col items-center justify-center">
                <h1 className="text-center mb-8 text-6xl text-white font-black tracking-tight text-shadow-sm">
                    Connect. Code. Create.
                </h1>
                <div className="shadow-xl">
                    <StytchLogin
                        config={stytchConfig}
                        styles={stytchStyle}
                    />
                </div>
            </section>
        </Layout>
    );
};

export default Login;
