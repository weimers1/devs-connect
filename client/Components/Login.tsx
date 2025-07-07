import { StytchLogin } from "@stytch/react";
import { Products } from "@stytch/vanilla-js";
import Layout from "./Layout";
const URL_CLIENT = import.meta.env.URL_CLIENT;

// Login Page That Uses Magic Link
const stytchConfig = {
    emailMagicLinksOptions: {
        createUserAsPending: true,
        loginExpirationMinutes: 30,
        loginRedirectURL: URL_CLIENT + "/authenticate",
        signupExpirationMinutes: 30,
        signupRedirectURL: URL_CLIENT + "/authenticate",
    },
    products: [Products.emailMagicLinks],
};

const stytchStyle = {
    fontFamily: "Monospace",
    container: {
        backgroundColor: "white",
        borderColor: "white",
    },
    colors: {
        primary: "navy",
    },
};

// @TODO Need to implement A Register Feature; Just tested The magic link functionality
const Login = () => (
    <Layout>
        <section className="h-screen flex flex-col items-center justify-center">
            <h1 className="text-center mb-8 text-6xl text-white font-black tracking-tight text-shadow-sm">
                Connect. Code. Create.
            </h1>
            <div className="shadow-xl">
                <StytchLogin config={stytchConfig} styles={stytchStyle} />
            </div>
        </section>
    </Layout>
);

export default Login;
