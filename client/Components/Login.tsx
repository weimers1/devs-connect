import { StytchLogin } from '@stytch/react';
import { Products } from '@stytch/vanilla-js';
import { assets } from '../assets/assets';

// Login Page That Uses Magic Link
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
  <div className="h-screen relative overflow-hidden">
    {/* Background Image Grid */}
    <div className="fixed inset-0 grid grid-cols-4 gap-4 p-4 -z-10">
      {/* Column 1 */}
      <div className="flex flex-col gap-4">
        <img src={assets.Coding} className="w-full h-48 rounded-lg opacity-60 border-1" alt="coding" />
        <img src={assets.MessageImg} className="w-full h-48 rounded-lg opacity-60 border-1" alt="message" />
        <img src={assets.Communities} className="w-full h-48 rounded-lg opacity-60 border-1" alt="communities" />
        <img src={assets.MessagesDavid} className="w-full h-48 rounded-lg opacity-60 border-1" alt="messages david" />
      </div>
      
      {/* Column 2 */}
      <div className="flex flex-col gap-4">
        <img src={assets.MessagesGreg} className="w-full h-48 rounded-lg opacity-60 border-1" alt="messages greg" />
        <img src={assets.Coding} className="w-full h-48 rounded-lg opacity-60 border-1" alt="coding" />
        <img src={assets.MessagesDavid} className="w-full h-48 rounded-lg opacity-60 border-1" alt="messages david" />
        <img src={assets.Communities} className="w-full h-48 rounded-lg opacity-60 border-1" alt="communities" />
      </div>
      
      {/* Column 3 */}
      <div className="flex flex-col gap-4">
        <img src={assets.MessageImg} className="w-full h-48 rounded-lg opacity-60 border-1" alt="message" />
        <img src={assets.ProgrammingImg} className="w-full h-48 rounded-lg opacity-60 border-1" alt="programming" />
        <img src={assets.MessagesGreg} className="w-full h-48 rounded-lg opacity-60 border-1" alt="messages greg" />
        <img src={assets.ProgrammingImg} className="w-full h-48 rounded-lg opacity-60 border-1" alt="programming" />
      </div>
      
      {/* Column 4 */}
      <div className="flex flex-col gap-4">
        <img src={assets.ProgrammingImg} className="w-full h-48 rounded-lg opacity-60 border-1" alt="programming" />
        <img src={assets.Coding} className="w-full h-48 rounded-lg opacity-60 border-1" alt="coding" />
        <img src={assets.MessagesDavid} className="w-full h-48 rounded-lg opacity-60 border-1" alt="messages david" />
        <img src={assets.Embedded} className="w-full h-48 rounded-lg opacity-60 border-1" alt="embedded" />
      </div>
    </div>

    {/* Login Content */}
    <div className="relative z-10 h-screen flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-sans font-black tracking-tight text-black drop-shadow-2xl">
          Connect. Code. Create.
        </h1>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-2xl">
        <StytchLogin config={loginOrSignupViewConfig} />
      </div>
    </div>
  </div>
);

export default Login;