import { StytchLogin} from '@stytch/react';
import { Products } from '@stytch/vanilla-js';
//Login Page That Uses Magic Link 
const loginOrSignupViewConfig = {
  emailMagicLinksOptions: {
    createUserAsPending: true,
    loginExpirationMinutes: 30,
    loginRedirectURL: 'http://localhost:5173/authenticate',
    signupExpirationMinutes: 30,
    signupRedirectURL: 'http://localhost:5173/authenticate'
  },
  products: [Products.emailMagicLinks]
};
// @TODO Need to implement A Register Feature; Just tested The magic link functionality
const Login = () => (
  <div className="min-h-screen flex flex-col items-center justify-center">
    <div className="text-center mb-20">
      <h1 className="text-5xl font-sans font-black tracking-tight">Connect. Code. Create.</h1>
    </div>
    <div>
      <StytchLogin config={loginOrSignupViewConfig} />
    </div>
  </div>
)



export default Login;