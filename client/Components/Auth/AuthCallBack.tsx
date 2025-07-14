import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Authenticate: React.FC = () => {
    // grab params
    const [params] = useSearchParams();
    // get token for checking and storing session info
    const token = params.get('token');

    const navigate = useNavigate();

    // if no token, have them try to log in again
    React.useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // otherwise, send the request to the backend to try verifying with stytch
        fetch(`http://localhost:6969/auth/verify?token=${token}`, {
            method: 'GET',
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('data: ', data);
                if (data.error) {
                    const errorObject = JSON.parse(data.error);
                    switch (errorObject.status_code) {
                        case 400:
                            // @TODO: handle UI for this message
                            console.log('invalid request');
                            break;
                        case 401:
                            // @TODO: handle UI for this message
                            console.log('expired');
                            break;
                        case 403:
                            // @TODO: handle UI for this message
                            console.log('unauthenticated');
                            break;
                        case 500:
                            // @TODO: handle UI for this message
                            console.log('server error');
                            break;
                        default:
                            // @TODO: handle UI for this message
                            console.log(errorObject.error_message);
                            break;
                    }

                    return;
                }

                if (data.userCreated) {
                    // @TODO: if the returned data created a new user, have them finish setting up their account
                    console.log('User created:', data.email);
                } else {
                    console.log('User logged in:', data.email);
                }
                // set the session token in localStorage
                localStorage.setItem('session_token', data.session_token);
                // navigate("/home");
            })
            .catch((error) => {
                console.error('Authentication failed:', error);
                // navigate('/login');
            });
    }, [token, navigate]);

    return <div>Authenticating user ...</div>;
};

export default Authenticate;
