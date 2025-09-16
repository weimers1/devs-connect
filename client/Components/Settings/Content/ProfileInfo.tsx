import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../../../Service/service';
import { useTheme } from '../../../src/ThemeContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Security utility functions - comprehensive XSS protection
const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') return '';
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/\(/g, '&#40;')
        .replace(/\)/g, '&#41;')
        .replace(/\{/g, '&#123;')
        .replace(/\}/g, '&#125;')
        .replace(/\[/g, '&#91;')
        .replace(/\]/g, '&#93;')
        .replace(/=/g, '&#61;')
        .replace(/\+/g, '&#43;')
        .replace(/`/g, '&#96;')
        .replace(/~/g, '&#126;')
        .replace(/!/g, '&#33;')
        .replace(/@/g, '&#64;')
        .replace(/#/g, '&#35;')
        .replace(/\$/g, '&#36;')
        .replace(/%/g, '&#37;')
        .replace(/\^/g, '&#94;')
        .replace(/\*/g, '&#42;')
        .replace(/\|/g, '&#124;')
        .replace(/\\/g, '&#92;')
        .replace(/:/g, '&#58;')
        .replace(/;/g, '&#59;')
        .replace(/\?/g, '&#63;')
        .trim()
        .slice(0, 500);
};

const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
};

const validateAge = (age: string): boolean => {
    if (!age || age.trim() === '') return false;
    const ageNum = Number(age);
    return Number.isInteger(ageNum) && ageNum >= 13 && ageNum <= 120;
};

const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s'-]{1,50}$/;
    return nameRegex.test(name.trim());
};

const validateGitHubUsername = (username: string): boolean => {
    const githubRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    return githubRegex.test(username);
};

interface ProfileData {
    firstName: string;
    lastName: string;
    location: string;
    age: string;
    gender: string;
    githubUsername: string;
    githubId: string;
    githubEmail: string;
    bio: string;
    pfp: string;
    email: string;
}

const INITIAL_PROFILE_DATA: ProfileData = {
    firstName: '',
    lastName: '',
    location: '',
    age: '',
    gender: '',
    githubUsername: '',
    githubId: '',
    githubEmail: '',
    bio: '',
    pfp: '',
    email: '',
};

function ProfileInfo() {
    const [openSetting, setOpenSetting] = useState<string | null>(null);
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [searchParams] = useSearchParams();
    const [githubConnected, setGithubConnected] = useState(false);
    const [githubEmail, setGithubEmail] = useState('');
    const [githubUsername, setGithubUsername] = useState('');
    const navigate = useNavigate();

    const handleSettingClick = (settingType: string) => {
        setOpenSetting(openSetting === settingType ? null : settingType);
    };

    const handleCertificationClick = () => {
        navigate('/profile?showCertModal=true'); //navigate with the query param for adding a certification
    };
    const handleEditProfileClick = () => {
        //Navigating to the profile page so a user can edit their profile
        navigate('/profile?showProfModal=true');
    };

    //Profile State for Update When A User Updates
    const [profileSettings, setProfileSettings] =
        useState<ProfileData>(INITIAL_PROFILE_DATA);
    const [originalData, setOriginalData] =
        useState<ProfileData>(INITIAL_PROFILE_DATA);
    // Secure input validation and sanitization
    const handleChange = useCallback((field: string, value: string) => {
        let sanitizedValue = sanitizeInput(value);
        let isValid = true;

        // Field-specific validation
        switch (field) {
            case 'firstName':
            case 'lastName':
                isValid = validateName(sanitizedValue);
                break;
            case 'age':
                isValid = validateAge(sanitizedValue);
                break;
            case 'email':
                isValid = validateEmail(sanitizedValue);
                break;
            case 'githubUsername':
                isValid = validateGitHubUsername(sanitizedValue);
                break;
            case 'bio':
                sanitizedValue = sanitizedValue.slice(0, 500); // Limit bio length
                break;
            case 'location':
                sanitizedValue = sanitizedValue.slice(0, 100); // Limit location length
                break;
        }

        if (isValid) {
            setProfileSettings((prevProfile) => ({
                ...prevProfile,
                [field]: sanitizedValue,
            }));
            setHasChanges(true);
        }
    }, []);
    //Side Effect
    useEffect(() => {
        // Secure GitHub OAuth parameter handling with validation
        const allowedParams = [
            'github',
            'githubId',
            'githubEmail',
            'githubUsername',
        ];
        const paramEntries = Array.from(searchParams.entries());

        // Validate parameter names to prevent parameter pollution
        const hasInvalidParams = paramEntries.some(
            ([key]) => !allowedParams.includes(key)
        );
        if (hasInvalidParams) {
            console.warn('Invalid URL parameters detected');
            return;
        }

        const githubStatus = searchParams.get('github');
        const githubId = searchParams.get('githubId');
        const githubEmailParam = searchParams.get('githubEmail');
        const githubUsernameParam = searchParams.get('githubUsername');

        // Validate parameter values before processing
        if (githubStatus && githubStatus !== 'success') {
            return;
        }
        if (githubId && (githubId.length > 20 || !/^\d+$/.test(githubId))) {
            return;
        }
        if (githubEmailParam && githubEmailParam.length > 254) {
            return;
        }
        if (githubUsernameParam && githubUsernameParam.length > 39) {
            return;
        }

        // Validate and sanitize GitHub parameters
        if (
            githubStatus === 'success' &&
            githubId &&
            githubEmailParam !== 'no-email' &&
            githubEmailParam &&
            githubUsernameParam
        ) {
            const sanitizedEmail = sanitizeInput(githubEmailParam);
            const sanitizedUsername = sanitizeInput(githubUsernameParam);
            const sanitizedId = sanitizeInput(githubId);

            // Additional validation
            if (
                validateEmail(sanitizedEmail) &&
                validateGitHubUsername(sanitizedUsername) &&
                /^\d+$/.test(sanitizedId) // GitHub ID should be numeric
            ) {
                setGithubConnected(true);
                setGithubEmail(sanitizedEmail);
                setGithubUsername(sanitizedUsername);

                // Save GitHub data and refresh profile
                (async () => {
                    await saveGitHubData(
                        sanitizedId,
                        sanitizedUsername,
                        sanitizedEmail
                    );
                    const response = await API.getProfileInformation();
                    setProfileSettings(response);
                    setOriginalData(response);
                })();

                // Clear URL parameters securely
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }

        const loadProfileData = async () => {
            try {
                const response = await API.getProfileInformation();

                //Set both current form data and BACKUP
                setProfileSettings(response);
                setOriginalData(response);

                // Securely check GitHub connection from database
                if (response.githubUsername && response.githubEmail) {
                    const sanitizedEmail = sanitizeInput(response.githubEmail);
                    const sanitizedUsername = sanitizeInput(
                        response.githubUsername
                    );

                    if (
                        validateEmail(sanitizedEmail) &&
                        validateGitHubUsername(sanitizedUsername)
                    ) {
                        setGithubConnected(true);
                        setGithubEmail(sanitizedEmail);
                        setGithubUsername(sanitizedUsername);
                    }
                } else {
                    setGithubConnected(false);
                }
            } catch (error) {
                console.error('Failed to load profile data:', error);
                // Set safe fallback data
                setProfileSettings(INITIAL_PROFILE_DATA);
                setOriginalData(INITIAL_PROFILE_DATA);
            } finally {
                setLoading(false);
            }
        };
        loadProfileData();
    }, [searchParams]);

    // Secure form submission with validation
    const handleSave = useCallback(async () => {
        setLoading(true);
        setSaveStatus('');

        try {
            // Final validation before submission
            const validatedData = {
                ...profileSettings,
                firstName: sanitizeInput(profileSettings.firstName),
                lastName: sanitizeInput(profileSettings.lastName),
                location: sanitizeInput(profileSettings.location),
                bio: sanitizeInput(profileSettings.bio),
                email: sanitizeInput(profileSettings.email),
            };

            // Validate required fields
            if (
                !validateName(validatedData.firstName) ||
                !validateName(validatedData.lastName)
            ) {
                setSaveStatus('error');
                return;
            }

            await API.updateProfileSettings(validatedData);
            setOriginalData(validatedData);
            setHasChanges(false);
            setSaveStatus('success');

            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            console.error('Error updating profile settings:', error);
            setSaveStatus('error');
        } finally {
            setLoading(false);
        }
    }, [profileSettings]);

    const handleCancel = () => {
        setProfileSettings(originalData);
        setHasChanges(false);
    };

    // Secure GitHub data saving with validation
    const saveGitHubData = useCallback(
        async (
            githubId: string,
            githubUsername: string,
            githubEmail: string
        ) => {
            try {
                // Validate inputs before sending
                if (
                    !validateEmail(githubEmail) ||
                    !validateGitHubUsername(githubUsername) ||
                    !/^\d+$/.test(githubId)
                ) {
                    console.error('Invalid GitHub data provided');
                    return;
                }

                const token = localStorage.getItem('session_token');
                if (!token) {
                    console.error('No authentication token found');
                    return;
                }

                const baseUrl =
                    import.meta.env.VITE_API_URL || 'http://localhost:6969';

                // Validate base URL
                if (
                    !baseUrl.match(
                        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/
                    )
                ) {
                    console.error('Invalid API URL');
                    return;
                }

                const response = await fetch(`${baseUrl}/user/link-github`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        githubId: sanitizeInput(githubId),
                        githubUsername: sanitizeInput(githubUsername),
                        githubEmail: sanitizeInput(githubEmail),
                    }),
                });

                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}: ${response.statusText}`
                    );
                }
            } catch (error) {
                console.error('Error saving GitHub data:', error);
            }
        },
        []
    );

    const sections = useMemo(
        () => [
            {
                id: 'name-location',
                title: 'Name & Location',
                description: 'Update your display name and location',
            },
            {
                id: 'demographics',
                title: 'Demographics',
                description: 'Personal demographic information',
            },
            {
                id: 'verifications',
                title: 'Verifications',
                description: 'Verify your identity and accounts',
            },
            {
                id: 'edit-profile',
                title: 'Edit Profile',
                description: 'Update your profile picture and bio',
            },
        ],
        []
    );

    return (
        <div>
            <div
                className={`md:w-200 w-full md:rounded-xl mt-4 col-start-1 row-start-1 overflow-hidden shadow-sm border ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                }`}
            >
                <div
                    className={`p-6 border-b border-gray-100 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                >
                    <h2 className="text-xl font-semibold">
                        Profile Information
                    </h2>
                    <p className="text-sm">
                        Manage your personal details and verification
                    </p>
                </div>

                {sections.map((section, index) => (
                    <div key={section.id}>
                        <div
                            className={`px-6 py-4 flex justify-between items-center transition-colors cursor-pointer ${
                                theme === 'dark'
                                    ? 'hover:bg-gray-700'
                                    : 'hover:bg-white'
                            }`}
                            onClick={() => {
                                if (section.id === 'certifications') {
                                    handleCertificationClick(); // Open Modal instead
                                } else if (section.id === 'edit-profile') {
                                    handleEditProfileClick(); //Open Profile Edit
                                } else {
                                    handleSettingClick(section.id);
                                }
                            }}
                        >
                            <div
                                className={` ${
                                    theme === 'dark'
                                        ? 'text-white'
                                        : 'text-gray-900'
                                }`}
                            >
                                <h3 className="font-medium ">
                                    {section.title}
                                </h3>
                                <p className="text-sm ">
                                    {section.description}
                                </p>
                            </div>
                            <Icon
                                icon={
                                    openSetting === section.id
                                        ? 'mdi:chevron-up'
                                        : 'mdi:chevron-down'
                                }
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                    openSetting === section.id
                                        ? 'rotate-180'
                                        : ''
                                }`}
                            />
                        </div>

                        {openSetting === section.id && (
                            <div
                                className={`mx-4 mb-4  rounded-lg shadow-sm border${
                                    theme === 'dark'
                                        ? 'bg-gray-900'
                                        : 'bg-white'
                                }`}
                            >
                                <div className="p-6 space-y-4">
                                    {section.id === 'name-location' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div
                                                    className={` ${
                                                        theme === 'dark'
                                                            ? 'text-white'
                                                            : 'text-gray-700'
                                                    }`}
                                                >
                                                    <label className="block text-sm font-medium  mb-2">
                                                        First Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            profileSettings.firstName
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                'firstName',
                                                                e.target.value
                                                            )
                                                        }
                                                        maxLength={50}
                                                        pattern="[a-zA-Z\s'-]+"
                                                        title="Only letters, spaces, hyphens, and apostrophes allowed"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div
                                                    className={` ${
                                                        theme === 'dark'
                                                            ? 'text-white'
                                                            : 'text-gray-700'
                                                    }`}
                                                >
                                                    <label className="block text-sm font-medium  mb-2">
                                                        Last Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            profileSettings.lastName
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                'lastName',
                                                                e.target.value
                                                            )
                                                        }
                                                        maxLength={50}
                                                        pattern="[a-zA-Z\s'-]+"
                                                        title="Only letters, spaces, hyphens, and apostrophes allowed"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                            <div
                                                className={` ${
                                                    theme === 'dark'
                                                        ? 'text-white'
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                <label className="block text-sm font-medium  mb-2">
                                                    Location
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        profileSettings.location
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            'location',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter your location"
                                                    maxLength={100}
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>{' '}
                                            {/* Form Submission*/}
                                            <div className="flex justify-end space-x-2 space-y-0">
                                                <div className="flex justify-center pt-1 bg-red-600 w-25 rounded-2xl h-8.5 hover:bg-red-500 ">
                                                    <button
                                                        className="border-gray-500"
                                                        onClick={() =>
                                                            handleCancel()
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={
                                                        !hasChanges || loading
                                                    }
                                                    className={`w-25 rounded-2xl font-medium transition-colors ${
                                                        saveStatus === 'success'
                                                            ? 'bg-green-600 text-white'
                                                            : saveStatus ===
                                                              'error'
                                                            ? 'bg-red-600 text-white'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                                >
                                                    {' '}
                                                    {loading ? (
                                                        <>
                                                            <Icon
                                                                icon="mdi:loading"
                                                                className="animate-spin w-4 h-4 mr-2"
                                                            />
                                                            Saving...
                                                        </>
                                                    ) : saveStatus ===
                                                      'success' ? (
                                                        <>
                                                            <div className="flex justify-center">
                                                                Saved!
                                                            </div>
                                                        </>
                                                    ) : saveStatus ===
                                                      'error' ? (
                                                        <>
                                                            <Icon
                                                                icon="mdi:alert"
                                                                className="w-4 h-4 mr-2"
                                                            />
                                                            Error
                                                        </>
                                                    ) : (
                                                        'Save'
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                    {section.id === 'demographics' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Age Input */}
                                                <div
                                                    className={`${
                                                        theme === 'dark'
                                                            ? 'text-white'
                                                            : 'text-gray-900'
                                                    }`}
                                                >
                                                    <label className="block text-sm font-medium mb-2">
                                                        Age
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="Enter your age"
                                                        value={
                                                            profileSettings.age
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                'age',
                                                                e.target.value
                                                            )
                                                        }
                                                        min="13"
                                                        max="120"
                                                        className="w-full px-3 py-1 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                {/* Gender Select */}
                                                <div
                                                    className={`${
                                                        theme === 'dark'
                                                            ? 'text-white'
                                                            : 'text-gray-900'
                                                    }`}
                                                >
                                                    <label className="block text-sm font-medium mb-2">
                                                        Gender
                                                    </label>
                                                    <select
                                                        className={`w-full px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 border-1   ${
                                                            theme === 'dark'
                                                                ? 'bg-gray-900 text-white border-gray-300 '
                                                                : 'bg-white text-gray-900 border-gray-300'
                                                        }`}
                                                        value={
                                                            profileSettings.gender
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                'gender',
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Select gender
                                                        </option>
                                                        <option value="prefer-not-to-say">
                                                            Prefer not to say
                                                        </option>
                                                        <option value="male">
                                                            Male
                                                        </option>
                                                        <option value="female">
                                                            Female
                                                        </option>
                                                        <option value="other">
                                                            Other
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {section.id === 'verifications' && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Verify your identity to build
                                                trust in the community.
                                            </p>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-green-50">
                                                    <div className="flex items-center">
                                                        <Icon
                                                            icon="mdi:email"
                                                            className="w-5 h-5 text-green-600 mr-3"
                                                        />
                                                        <div>
                                                            <span className="font-medium text-gray-900">
                                                                Email Verified
                                                            </span>
                                                            <p className="text-sm text-gray-600">
                                                                ethanmclaughlin24@gmail.com
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Icon
                                                        icon="mdi:check-circle"
                                                        className="w-5 h-5 text-green-600"
                                                    />
                                                </div>
                                                <div
                                                    className={`flex items-center justify-between p-4 border rounded-lg ${
                                                        githubConnected
                                                            ? 'border-green-200 bg-green-50'
                                                            : 'border-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <Icon
                                                            icon="mdi:github"
                                                            className={`w-5 h-5 mr-3 ${
                                                                githubConnected
                                                                    ? 'text-green-600'
                                                                    : 'text-gray-400'
                                                            }`}
                                                        />
                                                        <div>
                                                            <span
                                                                className={`font-medium ${
                                                                    theme ===
                                                                    'dark'
                                                                        ? 'text-white'
                                                                        : 'text-gray-900'
                                                                }`}
                                                            >
                                                                GitHub Account
                                                            </span>
                                                            <p className="text-sm text-gray-600">
                                                                {githubConnected
                                                                    ? `Connected: ${sanitizeInput(
                                                                          githubEmail
                                                                      )} (@${sanitizeInput(
                                                                          githubUsername
                                                                      )})`
                                                                    : 'Connect your GitHub profile'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {githubConnected ? (
                                                        <Icon
                                                            icon="mdi:check-circle"
                                                            className="w-5 h-5 text-green-600"
                                                        />
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                const baseUrl =
                                                                    import.meta
                                                                        .env
                                                                        .VITE_API_URL ||
                                                                    'http://localhost:6969';

                                                                // Validate URL before redirect
                                                                if (
                                                                    baseUrl.match(
                                                                        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/
                                                                    )
                                                                ) {
                                                                    window.location.href = `${baseUrl}/oauth/github`;
                                                                } else {
                                                                    console.error(
                                                                        'Invalid OAuth URL'
                                                                    );
                                                                }
                                                            }}
                                                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                        >
                                                            Connect
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'certifications' && (
                                        <div></div>
                                    )}
                                </div>
                            </div>
                        )}

                        {index !== sections.length - 1 && (
                            <hr className="border-gray-100" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProfileInfo;
