import { StytchLogin } from '@stytch/react';
import { Products } from '@stytch/vanilla-js';
const URL_CLIENT = import.meta.env.URL_CLIENT;

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

const stytchStyle = {
    fontFamily: 'Monospace',
    container: {
        backgroundColor: 'white',
        borderColor: 'white',
    },
    colors: {
        primary: 'navy',
    },
};

// @TODO Need to implement A Register Feature; Just tested The magic link functionality
const Login = () => (
    <div className="h-screen w-screen bg-linear-to-tr from-blue-700 to-slate-950">
        <div className="h-screen flex flex-col items-center justify-center">
            <h1 className="text-center mb-8 text-6xl text-white font-black tracking-tight text-shadow-sm">
                Connect. Code. Create.
            </h1>
            <div className="shadow-xl">
                <StytchLogin
                    config={stytchConfig}
                    styles={stytchStyle}
                />
            </div>
        </div>
    </div>
);

export default Login;
