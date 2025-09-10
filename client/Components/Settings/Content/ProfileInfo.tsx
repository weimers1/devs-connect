import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState, useEffect } from 'react';
import API from '../../../Service/service';
import { useTheme } from '../../../src/ThemeContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
    const [profileSettings, setProfileSettings] = useState({
        //What user is typing/editing right now
        //DB Equivalent
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
    });
    const [originalData, setOriginalData] = useState({
        //What's actually saved in database (Used for cancel functionality) || prevents Data loss
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
    });
    //Handle Change To Profile Made By A User
    const handleChange = async (field: string, value: string) => {
        setProfileSettings((prevProfile) => ({
            ...prevProfile, //Maintain previous data if it remains unchanged
            [field]: value,
        }));
        setHasChanges(true);
    };
    //Side Effect
    useEffect(() => {
        // Check for GitHub OAuth success from URL
        const githubStatus = searchParams.get('github');
        const githubId = searchParams.get('githubId');
        const githubEmailParam = searchParams.get('githubEmail');
        const githubUsernameParam = searchParams.get('githubUsername');

        if (
            githubStatus === 'success' &&
            githubId &&
            githubEmailParam !== 'no-email'
        ) {
            setGithubConnected(true);
            setGithubEmail(githubEmailParam || '');
            setGithubUsername(githubUsernameParam || '');

            // Save GitHub data to database
            saveGitHubData(
                githubId,
                githubUsernameParam || '',
                githubEmailParam || ''
            );

            // Clear URL parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }

        const loadProfileData = async () => {
            try {
                const response = await API.getProfileInformation();
                ({
                    githubUsername: response.githubUsername,
                    githubEmail: response.githubEmail,
                    githubId: response.githubId,
                });

                //Set both current form data and BACKUP
                setProfileSettings(response);
                setOriginalData(response);

                // Check if GitHub is already connected from database
                if (response.githubUsername && response.githubEmail) {
                    console.log('GitHub is connected! Setting state...');
                    setGithubConnected(true);
                    setGithubEmail(response.githubEmail);
                    setGithubUsername(response.githubUsername);
                } else {
                    console.log('GitHub not connected or missing data');
                    setGithubConnected(false);
                }
            } catch (error) {
                console.log('Unable to Fetch settings:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProfileData();
    }, [searchParams]);

    //Handle Form submission (API CALL)
    const handleSave = async () => {
        setLoading(true);
        setSaveStatus('');
        try {
            await API.updateProfileSettings(profileSettings);
            setOriginalData(profileSettings);
            setHasChanges(false);
            setSaveStatus('success');

            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            console.error('Error updating display settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setProfileSettings(originalData);
        setHasChanges(false);
    };

    // Save GitHub data to database
    const saveGitHubData = async (
        githubId: string,
        githubUsername: string,
        githubEmail: string
    ) => {
        try {
            const response = await fetch(
                'http://localhost:6969/user/link-github',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem(
                            'session_token'
                        )}`,
                    },
                    body: JSON.stringify({
                        githubId,
                        githubUsername,
                        githubEmail,
                    }),
                }
            );

            if (response.ok) {
                console.log('GitHub data saved successfully');
            } else {
                console.error('Failed to save GitHub data');
            }
        } catch (error) {
            console.error('Error saving GitHub data:', error);
        }
    };

    const sections = [
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
        // { WILL BE IN FUTURE ITERATION
        //   id: 'certifications',
        //   title: 'Certifications',
        //   description: 'Add your professional certifications'
        // },
        {
            id: 'edit-profile',
            title: 'Edit Profile',
            description: 'Update your profile picture and bio',
        },
    ];

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

                                                        <option value="">
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
                                                                    ? `Connected: ${githubEmail} (@${githubUsername})`
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
                                                            onClick={() =>
                                                                (window.location.href =
                                                                    'http://localhost:6969/oauth/github')
                                                            }
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
