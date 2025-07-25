import React, { useState, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../Decal/Modal';
import Layout from '../Layout';
import Typeahead from '../Utils/Typeahead';
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
        allowClose: false,
    });

    // track whether they are a new user
    const [isNewUser, setIsNewUser] = useState(false);

    // track new user info
    const [firstNameValue, setFirstNameValue] = useState('');
    const [lastNameValue, setLastNameValue] = useState('');
    const [careerIdValue, setCareerIdValue] = useState(-1);

    // handle change for fields
    const handleChange = <T,>(
        setterFunction: React.Dispatch<React.SetStateAction<T>>,
        valueOrEvent: ChangeEvent<HTMLInputElement> | T // Accepts either an event or the raw value
    ) => {
        let valueToSet: T;

        // Check if it's a synthetic event or a direct value
        if (
            typeof valueOrEvent === 'object' &&
            valueOrEvent !== null &&
            'target' in valueOrEvent
        ) {
            // It's a ChangeEvent
            const event = valueOrEvent as ChangeEvent<HTMLInputElement>;
            // For number inputs, remember value is always a string from event.target.value
            if (event.target.type === 'number') {
                valueToSet = Number(event.target.value) as T;
            } else {
                valueToSet = event.target.value as T;
            }
        } else {
            // It's a direct value (like selectedId)
            valueToSet = valueOrEvent;
        }

        setterFunction(valueToSet);
    };

    // handle when they submit new user info
    const handleAccountSubmit = () => {
        console.log(firstNameValue, lastNameValue, careerIdValue);
        // fetch(`http://localhost:6969/user/profile`, {
        //     method: 'PUT',
        //     credentials: 'include',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ email }), // Send email in body
        // })
        //     .then((res) => res.json())
        //     .then((data) => {
        //         if (data.error) {
        //             // @TODO: display error
        //             return;
        //         }
        //         // @TODO: display response
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //     });
    };

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
                                ...modalInfo,
                                icon: 'mdi-emoticon-frown-outline',
                                title: 'Expired Link',
                                message:
                                    'The link you used is outdated. Please try signing in again with a different link.',
                                isLoaded: true,
                            });
                            break;
                        case 403:
                            setModalInfo({
                                ...modalInfo,
                                icon: 'mdi-emoticon-frown-outline',
                                title: 'Access Denied',
                                message: 'Access denied for this link.',
                                isLoaded: true,
                            });
                            break;
                        case 500:
                            setModalInfo({
                                ...modalInfo,
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

                // set the session token in localStorage
                localStorage.setItem('session_token', data.session_token);

                if (data.isNewUser) {
                    // @TODO: if they are a new user, have them finish setting up their account
                    setModalInfo({
                        icon: 'mdi-emoticon-smile-outline',
                        title: 'Welcome New User!',
                        message:
                            'Please take a few seconds to finish filling out some details.',
                        isLoaded: true,
                        allowClose: true,
                    });
                    setIsNewUser(true);
                    return;
                } else {
                    console.log('User logged in:', data.email);
                    navigate('/home');
                }
            })
            .catch((error) => {
                // @TODO: probably wanna send emails here since this is unexpected
                console.error('Authentication failed:', error);
                setModalInfo({
                    ...modalInfo,
                    icon: 'mdi-emoticon-frown-outline',
                    title: 'Our Bad...',
                    message:
                        "Something went wrong on our end. We'll try to fix this shortly.",
                    isLoaded: true,
                });
            });
    }, [token]);

    return (
        <Layout>
            {modalInfo.isLoaded && (
                <Modal
                    title={modalInfo.title}
                    allowClose={modalInfo.allowClose}
                >
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
            {isNewUser && (
                <section className="relative w-full h-full flex justify-center items-center">
                    <form className="mt-45 lg:mt-70 h-85 lg:h-95 w-100 bg-white rounded-md shadow-md p-4 flex flex-col justify-center items-center">
                        <p className="text-lg text-blue-700 mt-3 mb-7">
                            Finish Setting Up Your Account
                        </p>
                        <input
                            className="p-2 w-75 bg-white rounded-md border border-gray-200 shadow-sm mb-4 lg:mb-8"
                            type="text"
                            placeholder="First Name"
                            onChange={(e) => {
                                handleChange(setFirstNameValue, e);
                            }}
                        />
                        <input
                            className="p-2 w-75 bg-white rounded-md border border-gray-200 shadow-sm mb-4 lg:mb-8"
                            type="text"
                            placeholder="Last Name"
                            onChange={(e) => {
                                handleChange(setLastNameValue, e);
                            }}
                        />
                        <Typeahead
                            apiEndpoint="http://localhost:6969/utils/careers/search"
                            id="career-goal"
                            inputClasses="p-2 w-75 bg-white rounded-md border border-gray-200 shadow-sm"
                            placeHolder="Search Career Goals..."
                            inheritedOnChange={(
                                e: ChangeEvent<HTMLInputElement>
                            ) => {
                                handleChange(setCareerIdValue, e);
                            }}
                        ></Typeahead>
                        <div className="w-full flex justify-end">
                            <button
                                type="button"
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 cursor-pointer text-white font-bold mt-4 lg:mt-8 py-2 px-4 me-1 rounded shadow-md"
                                onClick={() => {
                                    handleAccountSubmit();
                                }}
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </section>
            )}
        </Layout>
    );
};

export default Authenticate;
