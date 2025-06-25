import { StytchLogin } from "@stytch/react";
import { Products } from "@stytch/vanilla-js";
import {navbar} from "./navbar.jsx";

// Login Page That Uses Magic Link
const stytchConfig = {
  emailMagicLinksOptions: {
    createUserAsPending: true,
    loginExpirationMinutes: 30,
    loginRedirectURL: "http://localhost:5173/authenticate",
    signupExpirationMinutes: 30,
    signupRedirectURL: "http://localhost:5173/authenticate",
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
    Text: "shadow-xl"
  },

};

// @TODO Need to implement A Register Feature; Just tested The magic link functionality
const Login = () => (
  
  <div className="h-screen w-screen bg-linear-to-tr from-blue-700 to-slate-950">
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-center mb-8 text-6xl font-mono text-white font-black tracking-tight text-shadow-sm">
        Connect. Code. Create.
      </h1>
      <div className="shadow-xl">
        <StytchLogin config={stytchConfig} styles={stytchStyle} />
      </div>
    </div>
  </div>

);

export default Login;
