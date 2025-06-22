import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStytch, useStytchSession } from '@stytch/react';

//Uses Stytch to Authenticate The User || Invited You To The Stytch Project; Verify Everything is Correct in the dashboard//  (I haven't Implemented This Before)

const Authenticate = () => {
  const [params] = useSearchParams();
  const token = params.get('token');

  const stytch = useStytch();
  const session = useStytchSession();

  const navigate = useNavigate();

  React.useEffect(() => {
    if (session) {
      navigate('/home');
      return;
    }

    if (token) {
      stytch.magicLinks.authenticate(token, {
        session_duration_minutes: 60
      }).catch((error) => {
        console.error('Authentication failed:', error);
      });
    }
  }, [stytch, session, token, navigate]);

  return <div>Authenticating user ...</div>;
};

export default Authenticate;