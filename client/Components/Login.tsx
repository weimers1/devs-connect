import { StytchLogin } from '@stytch/react';
import { Products } from '@stytch/vanilla-js';
import Layout from './Layout';
const URL_CLIENT = import.meta.env.VITE_URL_CLIENT;

// Define TypeScript interface for stytchStyle
interface StytchStyle {
    fontFamily: string;
    container: {
        backgroundColor: string;
        borderColor: string;
        width?: string; // Optional width property
        [key: string]: string | undefined; // Allow additional string properties
    };
    input: {
        textAlign: string;
    };
    buttons: {
        primary: {
            textAlign: string;
        };
        secondary: {
            textAlign: string;
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

const stytchCallbacks = {
    onEvent: () => {
        // grab email
        const email = (
            document.getElementById('email-input') as HTMLInputElement
        )?.value;

        // begin call to log in function
        fetch('http://localhost:6969/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }), // Send email in body
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    // @TODO: display error
                    return;
                }

                // @TODO: display response
            })
            .catch((error) => {
                console.log(error);
            });
    },
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
            textAlign: 'center', // Center text in primary buttons
        },
        secondary: {
            textAlign: 'center', // Center text in secondary buttons
        },
    },
    colors: {
        primary: 'navy',
    },
};

// @TODO Need to implement A Register Feature; Just tested The magic link functionality
const Login = () => (
    <Layout>
        <section className="h-175 lg:h-250 flex flex-col items-center justify-center">
            <h1 className="text-center mb-8 text-6xl text-white font-black tracking-tight text-shadow-sm">
                Connect. Code. Create.
            </h1>
            <div className="shadow-xl">
                <StytchLogin
                    config={stytchConfig}
                    styles={stytchStyle}
                    callbacks={stytchCallbacks}
                />
            </div>
        </section>
    </Layout>
);

export default Login;
