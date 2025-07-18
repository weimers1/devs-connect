import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../Decal/Modal';
import Layout from '../Layout';
import { Icon } from '@iconify/react/dist/iconify.js';

const Authenticate: React.FC = () => {
    // grab params
    const [params] = useSearchParams();
    // get token for checking and storing session info
    const token = params.get('token');

    // track whether the call to verify the link has already been made
    let calledVerify = false;

    // prep navigating if needed
    const navigate = useNavigate();

    // init default modal response config
    const [modalInfo, setModalInfo] = useState({
        title: 'Oops!',
        icon: 'mdi-emoticon-sad-outline',
        message: 'Something went wrong...',
        isLoaded: false,
    });

    // if no token, have them try to log in again
    React.useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // if the call to verify has already been made, ignore
        if (calledVerify) return;

        // the call to verify is being made next, so track it to prevent future repeat calls
        calledVerify = true;

        // otherwise, send the request to the backend to try verifying with stytch
        fetch(`http://localhost:6969/auth/verify?token=${token}`, {
            method: 'GET',
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('data: ', data);
                if (data.error) {
                    const errorObject =
                        typeof data.error === 'object'
                            ? data.error
                            : JSON.parse(data.error);
                    switch (errorObject.status_code) {
                        case 400:
                            setModalInfo({
                                ...modalInfo,
                                title: 'Invalid Request',
                                isLoaded: true,
                            });
                            break;
                        case 401:
                            setModalInfo({
                                icon: 'mdi-emoticon-frown-outline',
                                title: 'Expired Link',
                                message:
                                    'The link you used is outdated. Please try signing in again with a different link.',
                                isLoaded: true,
                            });
                            break;
                        case 403:
                            setModalInfo({
                                icon: 'mdi-emoticon-frown-outline',
                                title: 'Access Denied',
                                message: 'Access denied for this link.',
                                isLoaded: true,
                            });
                            break;
                        case 500:
                            setModalInfo({
                                icon: 'mdi-emoticon-frown-outline',
                                title: 'Our Bad...',
                                message:
                                    "Something went wrong on our end. We'll try to fix this shortly.",
                                isLoaded: true,
                            });
                            break;
                        default:
                            break;
                    }

                    return;
                }

                if (data.isNewUser) {
                    // @TODO: if they are a new user, have them finish setting up their account
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

    return (
        <Layout>
            {modalInfo.isLoaded && (
                <Modal title={modalInfo.title}>
                    <div className="flex grid grid-cols-12">
                        <Icon
                            icon={modalInfo.icon}
                            className="me-2 w-6 h-6 col-span-2 lg:col-span-1"
                        />
                        <span className="col-span-10 lg:col-span-11">
                            {modalInfo.message}
                        </span>
                    </div>
                </Modal>
            )}
        </Layout>
    );
};

export default Authenticate;
