import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../Decal/Modal';
import Layout from '../Layout';
import Typeahead from '../Utils/Typeahead';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useAuth } from './AuthContext';
// import { useTheme } from '../../src/ThemeContext';

// BUG FIX: Define baseUrl that was missing and causing ReferenceError
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:6969';
const TERMS_URL = '/devs-connect-legal-suite.pdf';

const Authenticate: React.FC = () => {
    const [params] = useSearchParams();
    const token = params.get('token');
    const navigate = useNavigate();
    // const { loadUserTheme } = useTheme();
    const calledVerify = useRef(false);
    const { login } = useAuth();

    const [modalInfo, setModalInfo] = useState<{
        title: string;
        icon: string;
        message: string;
        allowClose: boolean;
    } | null>(null);

    const [isNewUser, setIsNewUser] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [termsRequired, setTermsRequired] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isAcceptingTerms, setIsAcceptingTerms] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [careerId, setCareerId] = useState(-1);
    const [careerGoal, setCareerGoal] = useState('');
    const [shouldNavigateOnClose, setShouldNavigateOnClose] = useState(false);

    const closeModal = () => setModalInfo(null);

    const showModal = (info: typeof modalInfo) => setModalInfo(info);

    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !firstName.trim() ||
            !lastName.trim() ||
            careerId === -1 ||
            !careerGoal
        ) {
            showModal({
                icon: 'mdi-emoticon-frown-outline',
                title: 'Missing Info',
                message: 'Please fill out all fields before submitting.',
                allowClose: true,
            });
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/api/settings/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    career: careerGoal,
                }),
            });

            let data: { error?: string; message?: string };
            try {
                data = await response.json();
            } catch {
                throw new Error('The server returned an invalid profile response.');
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        data.message ||
                        `Profile update failed (${response.status}).`,
                );
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
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong on our end. We'll try to fix this shortly.",
                allowClose: true,
            });
        }
    };

    const verifyToken = async () => {
        if (!token || calledVerify.current) return;
        calledVerify.current = true;
        setIsVerifying(true);

        try {
            const query = new URLSearchParams({ token });
            const response = await fetch(
                `${baseUrl}/auth/verify?${query.toString()}`,
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
                            'The link you used is outdated. Please request a new sign-in link.',
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

            if (data.terms_required) {
                setTermsRequired(true);
                return;
            }

            login();

            // Load user's theme preference after successful authentication
            // await loadUserTheme();

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
        } finally {
            setIsVerifying(false);
        }
    };

    const handleAcceptTerms = async () => {
        if (!termsAccepted) return;
        setIsAcceptingTerms(true);
        try {
            const res = await fetch(`${baseUrl}/auth/terms/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ age_confirmed: true }),
            });
            const acceptData = await res.json();
            if (!res.ok || acceptData.error) {
                throw new Error(
                    acceptData.error || 'Failed to record terms acceptance'
                );
            }
            login();
            setTermsRequired(false);
            if (isNewUser) {
                showModal({
                    icon: 'mdi-emoticon-smile-outline',
                    title: 'Welcome New User!',
                    message:
                        'Please take a few seconds to finish filling out some details.',
                    allowClose: true,
                });
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Accept terms failed:', err);
            showModal({
                icon: 'mdi-emoticon-frown-outline',
                title: 'Error',
                message:
                    err instanceof Error
                        ? err.message
                        : 'Failed to record acceptance. Please try again.',
                allowClose: true,
            });
        } finally {
            setIsAcceptingTerms(false);
        }
    };

    useEffect(() => {
        if (!token) navigate('/login');
    }, [token, navigate]);

    return (
        <Layout>
            {token && termsRequired && !modalInfo && (
                <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
                    <div className="rounded-lg border border-blue-200 bg-white p-8 shadow-lg max-w-[500px] w-full text-left">
                        <h1 className="mb-3 text-2xl font-bold text-blue-700 text-center">
                            Terms Acceptance Required
                        </h1>
                        <p className="mb-6 text-slate-700 text-center text-sm">
                            Please confirm your age and agree to our updated policies to access devs-connect.
                        </p>
                        <div className="mb-6">
                            <label className="flex items-start gap-2.5 text-sm text-slate-700 select-none cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    required
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="leading-snug">
                                    I'm at least 18 years of age and agree to the{' '}
                                    <a
                                        href={`${TERMS_URL}#terms`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 font-medium underline hover:text-blue-800"
                                    >
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a
                                        href={`${TERMS_URL}#privacy`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 font-medium underline hover:text-blue-800"
                                    >
                                        Privacy Policy
                                    </a>
                                    .
                                </span>
                            </label>
                        </div>
                        <button
                            type="button"
                            onClick={handleAcceptTerms}
                            disabled={!termsAccepted || isAcceptingTerms}
                            className="w-full rounded-md bg-blue-700 px-5 py-2.5 text-white font-medium transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isAcceptingTerms ? 'Saving...' : 'Accept and Continue'}
                        </button>
                    </div>
                </section>
            )}
            {token && !termsRequired && !isNewUser && !modalInfo && (
                <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
                    <div className="rounded-lg border border-blue-200 bg-white p-8 shadow-lg">
                        <h1 className="mb-3 text-2xl font-bold text-blue-700">
                            Verify your sign-in
                        </h1>
                        <p className="mb-6 text-slate-700">
                            Continue to securely sign in to your account.
                        </p>
                        <button
                            type="button"
                            onClick={verifyToken}
                            disabled={isVerifying}
                            className="rounded-md bg-blue-700 px-5 py-2 text-white transition-colors hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
                        >
                            {isVerifying
                                ? 'Signing you in...'
                                : 'Continue signing in'}
                        </button>
                    </div>
                </section>
            )}
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
                                    onSelect={(result) =>
                                        setCareerGoal(result.text)
                                    }
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
