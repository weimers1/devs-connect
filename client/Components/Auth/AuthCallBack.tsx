import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import getCsrfToken from '../Utils/Csrf';
import Modal from '../Decal/Modal';
import Layout from '../Layout';
import Typeahead from '../Utils/Typeahead';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useAuth } from './AuthContext';
import { useTheme } from '../../src/ThemeContext';

// BUG FIX: Define baseUrl that was missing and causing ReferenceError
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:6969';

const Authenticate: React.FC = () => {
    const [params] = useSearchParams();
    const token = params.get('token');
    const navigate = useNavigate();
    const { loadUserTheme } = useTheme();
    const calledVerify = useRef(false);
    const { login } = useAuth();

    const [modalInfo, setModalInfo] = useState<{
        title: string;
        icon: string;
        message: string;
        allowClose: boolean;
    } | null>(null);

    const [isNewUser, setIsNewUser] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [careerId, setCareerId] = useState(-1);
    const [shouldNavigateOnClose, setShouldNavigateOnClose] = useState(false);

    const closeModal = () => setModalInfo(null);

    const showModal = (info: typeof modalInfo) => setModalInfo(info);

    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!firstName.trim() || !lastName.trim() || careerId === -1) {
            showModal({
                icon: 'mdi-emoticon-frown-outline',
                title: 'Missing Info',
                message: 'Please fill out all fields before submitting.',
                allowClose: true,
            });
            return;
        }

        try {
            const sessionToken = localStorage.getItem('session_token');
            if (!sessionToken) {
                throw new Error('No authentication token found');
            }
            
            const csrfToken = await getCsrfToken();
            const response = await fetch(`${baseUrl}/user/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    // amazonq-ignore-next-line
                    'X-CSRF-Token': csrfToken,
                    Authorization: `Bearer ${sessionToken}`,
                },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    careerId,
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                throw new Error('Invalid response from server');
            }

            if (data.status !== 200) {
                showModal({
                    icon: 'mdi-emoticon-frown-outline',
                    title: 'Oops!',
                    message: data.message,
                    allowClose: true,
                });
                return;
            }

            setShouldNavigateOnClose(true);
            showModal({
                icon: 'mdi-emoticon-outline',
                title: 'All Set!',
                message: 'Account setup complete! 🧩',
                allowClose: true,
            });
        } catch (error) {
            console.error('Profile update failed:', error);
            showModal({
                icon: 'mdi-emoticon-frown-outline',
                title: 'Our Bad...',
                message:
                    "Something went wrong on our end. We'll try to fix this shortly.",
                allowClose: true,
            });
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // avoid duplicate calls
        if (calledVerify.current) return;
        calledVerify.current = true;

        const verifyToken = async () => {
            try {
                const response = await fetch(
                    `${baseUrl}/auth/verify?token=${token}`,
                    {
                        method: 'GET',
                        credentials: 'include',
                    }
                );

                const data = await response.json();

                if (data.error) {
                    const errorObject =
                        typeof data.error === 'object'
                            ? data.error
                            : JSON.parse(data.error);
                    const errorMessages = {
                        400: {
                            title: 'Invalid Request',
                            message: 'The request was invalid.',
                        },
                        401: {
                            title: 'Expired Link',
                            message:
                                'The link you used is outdated. Please try signing in again.',
                        },
                        403: {
                            title: 'Access Denied',
                            message: 'Access denied for this link.',
                        },
                        500: {
                            title: 'Our Bad...',
                            message:
                                "Something went wrong on our end. We'll try to fix this shortly.",
                        },
                    };

                    const error = errorMessages[
                        errorObject.status_code as keyof typeof errorMessages
                    ] || {
                        title: 'Error',
                        message: 'An unexpected error occurred.',
                    };

                    showModal({
                        icon: 'mdi-emoticon-frown-outline',
                        title: error.title,
                        message: error.message,
                        allowClose: false,
                    });
                    return;
                }

                login(data.session_token);

                // Load user's theme preference after successful authentication
                await loadUserTheme();

                if (data.isNewUser) {
                    showModal({
                        icon: 'mdi-emoticon-smile-outline',
                        title: 'Welcome New User!',
                        message:
                            'Please take a few seconds to finish filling out some details.',
                        allowClose: true,
                    });
                    setIsNewUser(true);
                } else {
                    // BUG FIX: Navigate to root path '/' instead of '/home' since that's the actual home route
                    navigate('/');
                }
            } catch (error) {
                console.error('Authentication failed:', error);
                showModal({
                    icon: 'mdi-emoticon-frown-outline',
                    title: 'Our Bad...',
                    message:
                        "Something went wrong on our end. We'll try to fix this shortly.",
                    allowClose: false,
                });
            }
        };

        verifyToken();
    }, [token, navigate]);

    return (
        <Layout>
            {modalInfo && (
                <Modal
                    title={modalInfo.title}
                    allowClose={modalInfo.allowClose}
                    onClose={
                        shouldNavigateOnClose
                            ? () => navigate('/')
                            : closeModal
                    }
                >
                    <div className="flex justify-center items-center">
                        <Icon
                            icon={modalInfo.icon}
                            className="me-2 w-6 h-6 text-blue-700"
                        />
                        <span>{modalInfo.message}</span>
                    </div>
                </Modal>
            )}
            {isNewUser && (
                <section className="absolute top-5 left-0 lg:top-0 lg:relative w-screen lg:w-full h-full lg:mt-50 flex justify-center items-center">
                    <form
                        onSubmit={handleAccountSubmit}
                        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-blue-200"
                    >
                        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
                            Complete Your Profile
                        </h2>

                        <div className="lg:space-y-4">
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="block text-sm font-medium text-blue-700 mb-1"
                                >
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter first name"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="block text-sm font-medium text-blue-700 mb-1"
                                >
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter last name"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="career"
                                    className="block text-sm font-medium text-blue-700 mb-1"
                                >
                                    Career Goal
                                </label>
                                <Typeahead
                                    apiEndpoint={`${
                                        import.meta.env.VITE_API_URL ||
                                        'http://localhost:6969'
                                    }/utils/careers/search`}
                                    id="career"
                                    inputClasses="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeHolder="Search career goals..."
                                    inheritedOnChange={setCareerId}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-6 bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Complete Setup
                        </button>
                    </form>
                </section>
            )}
        </Layout>
    );
};

export default Authenticate;
