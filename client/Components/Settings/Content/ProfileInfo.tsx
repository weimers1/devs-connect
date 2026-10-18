import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../../../Service/service';
// import { useTheme } from '../../../src/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../src/i18n/LanguageContext';

// React escapes displayed text, so keep profile text readable instead of HTML-encoding it.
const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') return '';
    return input.trim().slice(0, 500);
};

const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
};

const validateAge = (age: string): boolean => {
   // if (!age || age.trim() === '') return false;
    const ageNum = Number(age);
    return Number.isInteger(ageNum) && ageNum >= 0 && ageNum <= 120;
};

const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s'-]{0,50}$/;
    return nameRegex.test(name.trim());
};

//Validate GithubUsername through the githubRegex algorithm
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
    const { t } = useLanguage();
    const [openSetting, setOpenSetting] = useState<string | null>(null);
    // const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [githubConnected, setGithubConnected] = useState(false);
    const [githubEmail, setGithubEmail] = useState('');
    const [githubUsername, setGithubUsername] = useState('');
    const [githubProfileVisible, setGithubProfileVisible] = useState(false);
    const [githubVisibilitySaving, setGithubVisibilitySaving] = useState(false);
    const [githubConnecting, setGithubConnecting] = useState(false);
    const [githubError, setGithubError] = useState('');
    //const [value, setValue] = useState('');
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
    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const githubStatus = params.get('github');
                if (githubStatus === 'error') {
                    const reason = params.get('reason');
                    setGithubError(
                        reason === 'already_linked'
                            ? t('settings.profile.github.alreadyLinked')
                            : t('settings.profile.github.connectFailed')
                    );
                }
                if (githubStatus) {
                    window.history.replaceState(
                        {},
                        '',
                        window.location.pathname
                    );
                }

                const response = await API.getProfileInformation();
                setProfileSettings(response);
                setOriginalData(response);
                setGithubConnected(!!response.githubId && !!response.githubUsername);
                setGithubEmail(response.githubEmail || '');
                setGithubUsername(response.githubUsername || '');
                setGithubProfileVisible(!!response.githubProfileVisible);
            } catch (error) {
                console.error('Failed to load profile data:', error);
                setProfileSettings(INITIAL_PROFILE_DATA);
                setOriginalData(INITIAL_PROFILE_DATA);
            } finally {
                setLoading(false);
            }
        };
        loadProfileData();
    }, []);

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
                gender: sanitizeInput(profileSettings.gender),
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

    const changeGitHubVisibility = useCallback(
        async (visible: boolean) => {
            if (visible === githubProfileVisible) return;
            setGithubVisibilitySaving(true);
            setGithubError('');
            try {
                const result = await API.updateGitHubVisibility(visible);
                setGithubProfileVisible(!!result.githubProfileVisible);
            } catch {
                setGithubError(t('settings.profile.github.visibilityFailed'));
            } finally {
                setGithubVisibilitySaving(false);
            }
        },
        [githubProfileVisible, t]
    );

    const startGitHubConnection = useCallback(async () => {
        setGithubConnecting(true);
        setGithubError('');
        try {
            const baseUrl =
                import.meta.env.VITE_API_URL || 'http://localhost:6969';
            const response = await fetch(`${baseUrl}/oauth/github/start`, {
                method: 'POST',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(t('settings.profile.github.startFailed'));
            }

            const { authorizationUrl } = await response.json();
            const target = new URL(authorizationUrl);
            if (
                target.origin !== 'https://github.com' ||
                target.pathname !== '/login/oauth/authorize'
            ) {
                throw new Error(t('settings.profile.github.invalidUrl'));
            }
            window.location.assign(target.toString());
        } catch (error) {
            setGithubError(
                error instanceof Error
                    ? error.message
                    : t('settings.profile.github.startFailed')
            );
            setGithubConnecting(false);
        }
    }, [t]);

    const sections = useMemo(
        () => [
            {
                id: 'name-location',
                title: t('settings.profile.section.nameLocation.title'),
                description: t('settings.profile.section.nameLocation.description'),
            },
            {
                id: 'demographics',
                title: t('settings.profile.section.demographics.title'),
                description: t('settings.profile.section.demographics.description'),
            },
            {
                id: 'verifications',
                title: t('settings.profile.section.verifications.title'),
                description: t('settings.profile.section.verifications.description'),
            },
            {
                id: 'edit-profile',
                title: t('settings.profile.section.editProfile.title'),
                description: t('settings.profile.section.editProfile.description'),
            },
        ],
        [t]
    );

    return (
        <div>
            <div
                className={`md:w-200 w-full md:rounded-xl mt-4 col-start-1 row-start-1 overflow-hidden shadow-sm border 
                    // theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                `}
            >
                <div
                    className={`p-6 border-b border-gray-100 
                        // theme === 'dark' ? 'text-white' : 'text-gray-900'
                    `}
                >
                    <h2 className="text-xl font-semibold">
                        {t('settings.profile.title')}
                    </h2>
                    <p className="text-sm">
                        {t('settings.profile.subtitle')}
                    </p>
                </div>

                {sections.map((section, index) => (
                    <div key={section.id}>
                        <div
                            className={`px-6 py-4 flex justify-between items-center transition-colors cursor-pointer 
                                // theme === 'dark'
                                //     ? 'hover:bg-gray-700'
                                //     : 'hover:bg-white'
                            `}
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
                                className={` 
                                    // theme === 'dark'
                                    //     ? 'text-white'
                                    //     : 'text-gray-900'
                                `}
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
                                className={`mx-4 mb-4  rounded-lg shadow-sm border
                                    // theme === 'dark'
                                    //     ? 'bg-gray-900'
                                    //     : 'bg-white'
                                `}
                            >
                                <div className="p-6 space-y-4">
                                    {section.id === 'name-location' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div
                                                    className={` 
                                                        // theme === 'dark'
                                                        //     ? 'text-white'
                                                        //     : 'text-gray-700'
                                                    `}
                                                >
                                                    <label className="block text-sm font-medium  mb-2">
                                                        {t('settings.profile.firstName')}
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
                                                        title={t('settings.profile.nameTitle')}
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div
                                                    className={` 
                                                        // theme === 'dark'
                                                        //     ? 'text-white'
                                                        //     : 'text-gray-700'
                                                    `}
                                                >
                                                    <label className="block text-sm font-medium  mb-2">
                                                        {t('settings.profile.lastName')}
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
                                                        title={t('settings.profile.nameTitle')}
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                            <div
                                                className={` 
                                                    // theme === 'dark'
                                                    //     ? 'text-white'
                                                    //     : 'text-gray-700'
                                                `}
                                            >
                                                <label className="block text-sm font-medium  mb-2">
                                                    {t('settings.profile.location')}
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
                                                    placeholder={t('settings.profile.locationPlaceholder')}
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
                                                        {t('settings.common.cancel')}
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
                                                            {t('settings.common.saving')}
                                                        </>
                                                    ) : saveStatus ===
                                                      'success' ? (
                                                        <>
                                                            <div className="flex justify-center">
                                                                {t('settings.common.saved')}
                                                            </div>
                                                        </>
                                                    ) : saveStatus ===
                                                      'error' ? (
                                                        <>
                                                            <Icon
                                                                icon="mdi:alert"
                                                                className="w-4 h-4 mr-2"
                                                            />
                                                            {t('settings.common.error')}
                                                        </>
                                                    ) : (
                                                        t('settings.common.save')
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                    {section.id === 'demographics' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                                {/* Age Input */}
                                                <div
                                                    className={`
                                                        // theme === 'dark'
                                                        //     ? 'text-white'
                                                        //     : 'text-gray-900'
                                                    `}
                                                >
                                                    <label className="block text-sm font-medium mb-2">
                                                        {t('settings.profile.age')}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder={t('settings.profile.agePlaceholder')}
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
                                                        className="w-full px-3 py-1 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent "
                                                    />
                                                      

                                                {/* Gender Select */}
                                                <div
                                                    className={`
                                                        // theme === 'dark'
                                                        //     ? 'text-white'
                                                        //     : 'text-gray-900'
                                                    `}
                                                >
                                                    <label className="block text-sm font-medium mb-2"
                                                    >
                                                        {t('settings.profile.gender')}
                                                    </label>
                                                    <select 

                                                        className={`w-full px-3 py-1.5 rounded-xl border-1   
                                                          
                                                        `}
                                                        value={
                                                            profileSettings.gender
                                                        }
                                                      
                                                        onChange={(e) =>
                                                            handleChange(
                                                                'gender',
                                                                e.target.value,
                                                                
                                                            )
                                                        }
                                                    >
                                                          <option value="" disabled                                                           selected>{t('settings.profile.gender.select')}</option>
                                                        <option value="prefer-not-to-say" className="bg-gray-300 text-black">
                                                                                                                      {t('settings.profile.gender.preferNotToSay')}
                                                        </option>
                                                        <option value="male" className="bg-gray-300 text-black">
                                                                                                                      {t('settings.profile.gender.male')}
                                                        </option>
                                                        <option value="female" className="bg-gray-300 text-black">
                                                                                                                      {t('settings.profile.gender.female')}
                                                        </option>
                                                        <option value="other" className="bg-gray-300 text-black">
                                                                                                                      {t('settings.profile.gender.other')}
                                                        </option>
                                                     
                                                    </select>
                                                    
                                                </div>
                                            </div>
                                            </div>
                                             <div className="flex justify-end space-x-2 space-y-0">
                                                <div className="flex justify-center pt-1 bg-red-600 w-25 rounded-2xl h-8.5 hover:bg-red-500 ">
                                                    <button
                                                        className="border-gray-500"
                                                        onClick={() =>
                                                            handleCancel()
                                                        }
                                                    >
                                                        {t('settings.common.cancel')}
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
                                                            {t('settings.common.saving')}
                                                        </>
                                                    ) : saveStatus ===
                                                      'success' ? (
                                                        <>
                                                            <div className="flex justify-center">
                                                                {t('settings.common.saved')}
                                                            </div>
                                                        </>
                                                    ) : saveStatus ===
                                                      'error' ? (
                                                        <>
                                                            <Icon
                                                                icon="mdi:alert"
                                                                className="w-4 h-4 mr-2"
                                                            />
                                                            {t('settings.common.error')}
                                                        </>
                                                    ) : (
                                                        t('settings.common.save')
                                                    )}
                                                </button>
                                                </div>
                                        </>
                                    )}

                                    {section.id === 'verifications' && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-4">
                                                {t('settings.profile.verifyIntro')}
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
                                                                {t('settings.profile.emailVerified')}
                                                            </span>
                                                            <p className="text-sm text-gray-600">
                                                                {profileSettings.email || t('settings.profile.noEmail')}
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
                                                                className={`font-medium`
                                                                    // theme ===
                                                                    // 'dark'
                                                                    //     ? 'text-white'
                                                                    //     : 'text-gray-900'
                                                                }
                                                            >
                                                                {t('settings.profile.github.account')}
                                                            </span>
                                                            <p className="text-sm text-gray-600">
                                                                {githubConnected
                                                                    ? githubEmail
                                                                        ? t('settings.profile.github.connectedWithEmail', { email: githubEmail, username: githubUsername })
                                                                        : t('settings.profile.github.connected', { username: githubUsername })
                                                                    : t('settings.profile.github.connectPrompt')}
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
                                                            onClick={startGitHubConnection}
                                                            disabled={githubConnecting}
                                                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                                                        >
                                                            {githubConnecting
                                                                ? t('settings.profile.github.connecting')
                                                                : t('settings.profile.github.connect')}
                                                        </button>
                                                    )}
                                                </div>
                                                {githubConnected && (
                                                    <div className="mt-3 rounded-lg border border-gray-200 p-4">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {t('settings.profile.github.visibilityTitle')}
                                                        </p>
                                                        <p className="mt-1 text-sm text-gray-600">
                                                            {t('settings.profile.github.visibilityDescription')}
                                                        </p>
                                                        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t('settings.profile.github.visibilityTitle')}>
                                                            <button
                                                                type="button"
                                                                onClick={() => changeGitHubVisibility(true)}
                                                                disabled={githubVisibilitySaving}
                                                                aria-pressed={githubProfileVisible}
                                                                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
                                                                    githubProfileVisible
                                                                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                                                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                <Icon icon="mdi:link-variant" className="h-4 w-4" />
                                                                {t('settings.profile.github.showOnProfile')}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => changeGitHubVisibility(false)}
                                                                disabled={githubVisibilitySaving}
                                                                aria-pressed={!githubProfileVisible}
                                                                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
                                                                    !githubProfileVisible
                                                                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                                                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                <Icon icon="mdi:eye-off-outline" className="h-4 w-4" />
                                                                {t('settings.profile.github.hideFromProfile')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {githubError && (
                                                    <p
                                                        className="mt-2 text-sm text-red-600"
                                                        role="alert"
                                                    >
                                                        {githubError}
                                                    </p>
                                                )}
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
