import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import UserCard from './UserCard';
import Sidebar from '../Connections/Sidebar';
import Communities from './ProfileCommunities';
// import { useTheme } from '../../src/ThemeContext';
import API from '../../Service/service';
import { Icon } from '@iconify/react';
import { assets } from '../../assets/assets';
import { useLanguage } from '../../src/i18n/LanguageContext';

// const MONTHS = [
//     'January',
//     'February',
//     'March',
//     'April',
//     'May',
//     'June',
//     'July',
//     'August',
//     'September',
//     'October',
//     'November',
//     'December',
// ];
   export const validateImageUrl = (
       url: string,
       apiBaseUrl = 'http://localhost:6969',
   ) => {
        try {
            const parsedUrl = new URL(url);
            const apiBase = new URL(apiBaseUrl);
            const isAmazonHost =
                parsedUrl.hostname === 'amazonaws.com' ||
                parsedUrl.hostname.endsWith('.amazonaws.com');
            const isApiImage =
                parsedUrl.origin === apiBase.origin &&
                parsedUrl.pathname.startsWith('/api/upload/images/');
            return (
                ((isAmazonHost || isApiImage) &&
                    (parsedUrl.protocol === 'https:' ||
                        (parsedUrl.hostname === 'localhost' &&
                            parsedUrl.protocol === 'http:')))
            );
        } catch {
            return false;
        }
    };

function Profile() {
    const { userId } = useParams<{ userId: string }>();
    // const navigate = useNavigate();
    const isOwnProfile = !userId;
    const navigate = useNavigate();
    const { t } = useLanguage();
    // const [showCertModal, setShowCertModal] = React.useState(false); //Certification Modal
    const [showProfModal, setShowProfModal] = React.useState(false); // Profile Modal
    const [imageUploading, setImageUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const [currentProfileImage, setCurrentProfileImage] = useState('');
    const [currentBannerImage, setCurrentBannerImage] = useState('');
    const [pendingProfileImage, setPendingProfileImage] = useState<File | null>(
        null
    );
    const [pendingBannerImage, setPendingBannerImage] = useState<File | null>(
        null
    );
    const [profileImagePreview, setProfileImagePreview] = useState('');
    const [bannerImagePreview, setBannerImagePreview] = useState('');
    const [currentUser, setcurrentUser] = useState('');
    const [profileOwnerId, setProfileOwnerId] = useState('');
    const [profilePublicId, setProfilePublicId] = useState('');
    const [communityCount, setCommunityCount] = useState(0);
    const updateCommunityCount = useCallback((count: number) => {
        setCommunityCount(count);
    }, []);
    // const theme = useTheme(); //Change Theme

    // const [certData, setCertData] = useState({
    //     certName: '',
    //     issuer: '',
    //     issuedMonth: '',
    //     issuedYear: '',
    //     expiryMonth: '',
    //     expiryYear: '',
    //     credentialID: '',
    //     credentialURL: '',
    // });
    // TYPE FIX: Added explicit string type for URL validation parameter


    // const [connectionData, setConnectionData] = useState({
    //     user2Id: userId,
    //     currentUserId: ''
    // });

    // Profile edit data
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        location: '',
        career: '',
        school: '',
        github: '',
        pfp: '',
        bannerImageUrl: '',
    });
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSaving, setProfileSaving] = useState(false);  
    const [profileSaveStatus, setProfileSaveStatus] = useState('');
    const closeProfileModal = useCallback(() => {
        if (profileSaving) return;
        setPendingProfileImage(null);
        setPendingBannerImage(null);
        setProfileSaveStatus('');
        setShowProfModal(false);
    }, [profileSaving]);

    useEffect(() => {
        let active = true;
        const initializeProfile = async () => {
            setProfileLoading(true);
            setProfileError(null);
            try {
                const [user, response] = await Promise.all([
                    API.getCurrentUser(),
                    isOwnProfile
                        ? API.getProfileInformation()
                        : API.getUserProfile(userId!),
                ]);
                if (!active) return;
                if (!user) {
                    navigate('/login');
                    return;
                }
                setcurrentUser(String(user.userId));
                setProfileOwnerId(String(response.id || user.userId));
                setProfilePublicId(String(response.publicId || user.publicId || ''));

                if (userId && userId.toLowerCase() === user.publicId?.toLowerCase()) {
                    navigate('/profile', { replace: true });
                    return;
                }

                setProfileData(response);
                setCurrentProfileImage(response.pfp || '');
                setCurrentBannerImage(response.bannerImageUrl || '');
            } catch (error) {
                console.error('Failed to load profile data:', error);
                if (active) {
                    setProfileError('profile.page.loadError');
                }
            } finally {
                if (active) setProfileLoading(false);
            }
        };

        initializeProfile();
        return () => {
            active = false;
        };
    }, [userId, isOwnProfile, navigate]);
// Removed currentUser from deps to avoid infinite loops since we set it inside

    //Check Url For modal trigger so the form for certifications and profile  can pop up
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('showCertModal') === 'true') {
            //Checking if the redirect was for the certification Modal
            // setShowCertModal(true);
        } else if (urlParams.get('showProfModal') === 'true') {
            //Checking if the redirect was for the profile Model
            setShowProfModal(true);
        }
    }, []);

    useEffect(() => {
        if (!showProfModal) return;

        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !profileSaving) {
                closeProfileModal();
            }
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [showProfModal, profileSaving, closeProfileModal]);

    useEffect(() => {
        if (!pendingProfileImage) {
            setProfileImagePreview('');
            return;
        }
        const previewUrl = URL.createObjectURL(pendingProfileImage);
        setProfileImagePreview(previewUrl);
        return () => URL.revokeObjectURL(previewUrl);
    }, [pendingProfileImage]);

    useEffect(() => {
        if (!pendingBannerImage) {
            setBannerImagePreview('');
            return;
        }
        const previewUrl = URL.createObjectURL(pendingBannerImage);
        setBannerImagePreview(previewUrl);
        return () => URL.revokeObjectURL(previewUrl);
    }, [pendingBannerImage]);
  
    // TYPE FIX: Added explicit string types for date combination parameters
    // Combine month and year into date string
    // const combineDateFields = (month: string, year: string) => {
    //     if (!month || !year) return '';
    //     return `${month}-${year}`;
    // };

    const handleProfileChange = (field: string, value: string) => {
        setProfileData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

    const handleImageSelection = (
        file: File,
        setPendingImage: (file: File | null) => void
    ) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        if (!allowedTypes.includes(file.type)) {
            alert(t('profile.edit.imageTypeError'));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert(t('profile.edit.imageSizeError'));
            return;
        }
        setPendingImage(file);
        setProfileSaveStatus('');
    };

    // Handle Profile Save
    const handleProfileSave = async () => {
        setProfileSaving(true);
        setProfileSaveStatus('');
        try {
            const apiBaseUrl =
                import.meta.env.VITE_API_URL || 'http://localhost:6969';
            let profileImageUrl = profileData.pfp || '';
            let bannerImageUrl = profileData.bannerImageUrl || '';

            if (pendingProfileImage) {
                setImageUploading(true);
                const uploadResult =
                    await API.uploadProfileImage(pendingProfileImage);
                if (
                    !uploadResult.success ||
                    typeof uploadResult.imageUrl !== 'string' ||
                    !validateImageUrl(uploadResult.imageUrl, apiBaseUrl)
                ) {
                    throw new Error('Profile photo upload failed');
                }
                profileImageUrl = uploadResult.imageUrl;
            }

            if (pendingBannerImage) {
                setBannerUploading(true);
                const uploadResult =
                    await API.uploadProfileBanner(pendingBannerImage);
                if (
                    typeof uploadResult.imageUrl !== 'string' ||
                    !validateImageUrl(uploadResult.imageUrl, apiBaseUrl)
                ) {
                    throw new Error('Cover photo upload failed');
                }
                bannerImageUrl = uploadResult.imageUrl;
            }

            await API.updateProfileSettings({
                ...profileData,
                pfp: profileImageUrl || null,
                bannerImageUrl: bannerImageUrl || null,
            });
            setProfileData((previous) => ({
                ...previous,
                pfp: profileImageUrl,
                bannerImageUrl,
            }));
            setCurrentProfileImage(profileImageUrl);
            setCurrentBannerImage(bannerImageUrl);
            setPendingProfileImage(null);
            setPendingBannerImage(null);
            setProfileSaveStatus('success');

            setTimeout(() => {
                setShowProfModal(false);
                setProfileSaving(false);
                setProfileSaveStatus('');
                document.body.style.overflow = 'auto';
                document.documentElement.style.overflow = 'auto';
            }, 1500);
        } catch (error) {
            console.error('Error saving profile:', error);
            setProfileSaveStatus('error');
        } finally {
            setImageUploading(false);
            setBannerUploading(false);
            setProfileSaving(false);
        }
    };
    // const currentYear = new Date().getFullYear();
    // const startYear = currentYear - 100; // Or any desired start year
    // const years = Array.from(
    //     { length: currentYear - startYear + 1 },
    //     (_, i) => startYear + i
    // );
    // const sortedYears = [...years].sort((a, b) => b - a); //Sort Years from most recent to oldest
    return (
        <Layout>
            {/* Main container - centered for other users, full width for own profile */}
            {profileLoading ? (
                <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6" role="status"                 aria-label={t('profile.page.loading')}>
                                    <span className="sr-only">{t('profile.page.loadingEllipsis')}</span>
                    <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="h-28 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 motion-reduce:animate-none sm:h-36" />
                        <div className="px-5 pb-6 sm:px-8">
                            <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
                                <div className="flex items-end gap-4">
                                    <div className="h-20 w-20 animate-pulse rounded-full border-4 border-white bg-slate-200 shadow-sm motion-reduce:animate-none sm:h-24 sm:w-24" />
                                    <div className="space-y-2 pb-1">
                                        <div className="h-5 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none sm:w-56" />
                                        <div className="h-3 w-32 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
                                    <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none" />
                                </div>
                            </div>
                            <div className="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,0.8fr)]">
                                <div className="space-y-3">
                                    <div className="h-3 w-14 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                                    <div className="h-3 w-full max-w-lg animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
                                    <div className="h-3 w-4/5 max-w-md animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
                                </div>
                                <div className="h-20 animate-pulse rounded-lg bg-blue-50 motion-reduce:animate-none" />
                            </div>
                        </div>
                    </div>
                    <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 h-4 w-36 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="h-16 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
                            <div className="h-16 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
                        </div>
                    </div>
                </div>
            ) : profileError ? (
                <div className="flex min-h-[50vh] items-center justify-center text-red-600" role="alert">
                    {t(profileError)}
                </div>
            ) : (
                <div className="flex mt-3 flex-col items-center space-y-4">
                    <UserCard
                        currentUserId={currentUser}
                        userId={profileOwnerId || currentUser}
                        publicId={profilePublicId || userId || ''}
                        isOwnProfile={isOwnProfile}
                        profileData={{
                            ...profileData,
                            pfp: currentProfileImage || profileData.pfp,
                            bannerImageUrl:
                                currentBannerImage || profileData.bannerImageUrl,
                        }}
                        communityCount={communityCount}
                        onEditProfile={() => setShowProfModal(true)}
                    />

                    <div className="divide-y-0 divide-transparent w-full mx-auto ">
                        <Communities
                            userId={profileOwnerId || currentUser}
                            isOwnProfile={isOwnProfile}
                            onLoadedCount={updateCommunityCount}
                        />
                    </div>

                    {isOwnProfile && (
                        <div className="hidden lg:block fixed right-4 top-24">
                            <Sidebar />
                        </div>
                    )}
                </div>
            )}
            {/*  Before closing Layout */}
            {/* {showCertModal && (
                <div
                    className=" fixed inset-0 flex items-start justify-center pt-16 z-[9999]"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} //Provides transparency for the background
                >
                    <div className="bg-white rounded-lg p-6 w-170 max-h-fit mr-5">
                        <h2 className="text-xl font-bold mb-2">
                            Add Certification
                        </h2>
                        <hr className="bg-gray-700"></hr>
                        {/* Form fields will go here */}
                        {/* <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                            <label className="block text-sm font-medium mt-2">
                                Certification Name
                            </label>
                            <input
                                type="text"
                                value={certData.certName}
                                onChange={(e) =>
                                    handleChange('certName', e.target.value)
                                }
                                className="w-full px-3 py-1 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <label className="block text-sm font-medium  mt-2">
                                Issuer
                            </label>
                            <input
                                type="text"
                                value={certData.issuer}
                                onChange={(e) =>
                                    handleChange('issuer', e.target.value)
                                }
                                className="w-full px-3 py-1 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div> */}
                        {/* <label className="block text-sm font-medium mt-2 mb-2">
                            Issued Date
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <select
                                className="rounded-xl focus:outline-none focus:ring-1 border-1 py-1"
                                onChange={(e) =>
                                    handleChange('issuedMonth', e.target.value)
                                }
                                value={certData.issuedMonth}
                            >
                                <option value="">Month</option>
                                {MONTHS.map((month) => (
                                    <option
                                        key={month}
                                        value={month}
                                    >
                                        {month}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="rounded-xl focus:outline-none focus:ring-1 border-1 py-1"
                                onChange={(e) =>
                                    handleChange('issuedYear', e.target.value)
                                }
                                value={certData.issuedYear}
                            >
                                <option value="">Year</option>
                                {sortedYears.map(
                                    (
                                        year //to map the years for the licenses/certifications
                                    ) => (
                                        <option
                                            key={year}
                                            value={year}
                                        >
                                            {year}
                                        </option>
                                    )
                                )}
                                <option value="">Year</option>
                                {sortedYears.map(
                                    (
                                        year //to map the years for the licenses/certifications
                                    ) => (
                                        <option
                                            key={year}
                                            value={year}
                                        >
                                            {year}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                        <label className="block text-sm font-medium mt-2 mb-2">
                            Expiration Date
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <select
                                className="rounded-xl focus:outline-none focus:ring-1 border-1 py-1"
                                onChange={(e) =>
                                    handleChange('expiryMonth', e.target.value)
                                }
                                value={certData.expiryMonth}
                            >
                                <option value="">Month</option>
                                {MONTHS.map((month) => (
                                    <option
                                        key={month}
                                        value={month}
                                    >
                                        {month}
                                    </option>
                                ))}
                            </select>
                            <select */}
                                {/* className="rounded-xl focus:outline-none focus:ring-1 border-1 py-1"
                                onChange={(e) =>
                                    handleChange('expiryYear', e.target.value)
                                }
                                value={certData.expiryYear}
                            >
                                <option value="">Year</option>
                                {sortedYears.map(
                                    (
                                        year //to map the years for the licenses/certifications
                                    ) => (
                                        <option
                                            key={year}
                                            value={year}
                                        >
                                            {year}
                                        </option>
                                    )
                                )}
                                <option value="">Year</option>
                                {sortedYears.map(
                                    (
                                        year //to map the years for the licenses/certifications
                                    ) => (
                                        <option
                                            key={year}
                                            value={year}
                                        >
                                            {year}
                                        </option>
                                    )
                                )}
                            </select>
                        </div> */}
                        {/* <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                            <label className="block text-sm font-medium  mt-2">
                                Credential ID
                            </label>
                            <input
                                type="text"
                                value={certData.credentialID}
                                onChange={(e) =>
                                    handleChange('credentialID', e.target.value)
                                }
                                className="w-full px-3 py-1 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <label className="block text-sm font-medium  mt-2">
                                Credential URL
                            </label>
                            <input
                                type="text"
                                value={certData.credentialURL}
                                onChange={(e) =>
                                    handleChange(
                                        'credentialURL',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-1 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                            <button onClick={() => setShowCertModal(false)}>
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={certSaving}
                                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                                    certSaveStatus === 'success'
                                        ? 'bg-green-600 text-white'
                                        : certSaveStatus === 'error'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {certSaving ? (
                                    <>
                                        <Icon
                                            icon="mdi:loading"
                                            className="animate-spin w-4 h-4 mr-2"
                                        />
                                        Saving...
                                    </>
                                ) : certSaveStatus === 'success' ? (
                                    <>
                                        <Icon
                                            icon="mdi:check"
                                            className="w-4 h-4 mr-2"
                                        />
                                        Saved!
                                    </>
                                ) : certSaveStatus === 'error' ? (
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
                    </div>
                </div> */} 
            {/* )} */}
            {/* {showProfModal && (
                <div
                    className="fixed inset-0 flex items-start justify-center pt-8 z-[9999]"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <div className="bg-white w-170 mr-12 max-h-[90vh] overflow-y-auto rounded-xl p-6 mx-4">
                        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                        <hr className="mb-6" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                        <label className="block text-sm font-medium  mt-2">
                            Credential ID
                        </label>
                        <input
                            type="text"
                            value={certData.credentialID}
                            onChange={(e) =>
                                handleChange('credentialID', e.target.value)
                            }
                            className="w-full px-3 py-1 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <label className="block text-sm font-medium  mt-2">
                            Credential URL
                        </label>
                        <input
                            type="text"
                            value={certData.credentialURL}
                            onChange={(e) =>
                                handleChange('credentialURL', e.target.value)
                            }
                            className="w-full px-3 py-1 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                        <button onClick={() => setShowCertModal(false)}>
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={certSaving}
                            className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                                certSaveStatus === 'success'
                                    ? 'bg-green-600 text-white'
                                    : certSaveStatus === 'error'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {certSaving ? (
                                <>
                                    <Icon
                                        icon="mdi:loading"
                                        className="animate-spin w-4 h-4 mr-2"
                                    />
                                    Saving...
                                </>
                            ) : certSaveStatus === 'success' ? (
                                <>
                                    <Icon
                                        icon="mdi:check"
                                        className="w-4 h-4 mr-2"
                                    />
                                    Saved!
                                </>
                            ) : certSaveStatus === 'error' ? (
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
                </div>
            )} */}
            {showProfModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !profileSaving
                        ) {
                            closeProfileModal();
                        }
                    }}
                >
                    <div
                        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-profile-title"
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
                            <div>
                                <h2
                                    id="edit-profile-title"
                                    className="text-xl font-semibold text-slate-900"
                                >
                                    {t('profile.edit.title')}
                                </h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    {t('profile.edit.subtitle')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeProfileModal}
                                disabled={profileSaving}
                                aria-label={t('profile.edit.close')}
                                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                            >
                                <Icon icon="mdi:close" className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-6 px-5 py-6 sm:px-7">
                            <section>
                                <div className="mb-3">
                                    <h3 className="font-semibold text-slate-900">
                                        {t('profile.edit.coverPhoto')}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {t('profile.edit.coverHint')}
                                    </p>
                                </div>
                                <div className="relative h-32 overflow-hidden rounded-xl bg-slate-100 sm:h-40">
                                    <img
                                        src={bannerImagePreview || currentBannerImage || assets.Banner}
                                        alt={t('profile.edit.coverPreviewAlt')}
                                        onError={(event) => {
                                            event.currentTarget.src = assets.Banner;
                                        }}
                                        className="h-full w-full object-cover"
                                    />
                                    <input
                                        id="profile-banner-upload"
                                        type="file"
                                        accept="image/png,image/jpeg,image/gif,image/webp"
                                        className="sr-only"
                                        aria-label={t('profile.edit.chooseCover')}
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (file) {
                                                handleImageSelection(
                                                    file,
                                                    setPendingBannerImage
                                                );
                                            }
                                            event.target.value = '';
                                        }}
                                    />
                                    <label
                                        htmlFor="profile-banner-upload"
                                        className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-slate-800 shadow transition hover:bg-white"
                                    >
                                        <Icon
                                            icon={bannerUploading ? 'mdi:loading' : 'mdi:camera-outline'}
                                            className={`h-4 w-4 ${bannerUploading ? 'animate-spin' : ''}`}
                                        />
                                        {t('profile.edit.changeCover')}
                                    </label>
                                </div>
                                {pendingBannerImage && (
                                    <p className="mt-2 text-sm text-blue-700" role="status">
                                        {t('profile.edit.coverSelected')}
                                    </p>
                                )}
                            </section>

                            <section className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
                                <img
                                    src={profileImagePreview || currentProfileImage || assets.Profile}
                                    alt={t('profile.edit.photoPreviewAlt')}
                                    onError={(event) => {
                                        event.currentTarget.src = assets.Profile;
                                    }}
                                    className="h-20 w-20 rounded-full border-2 border-white object-cover shadow ring-1 ring-slate-200"
                                />
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/gif,image/webp"
                                    data-testid="profile-upload-input"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            handleImageSelection(
                                                file,
                                                setPendingProfileImage
                                            );
                                        }
                                        event.target.value = '';
                                    }}
                                    className="sr-only"
                                    id="profile-upload"
                                />
                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        {t('profile.edit.profilePhoto')}
                                    </h3>
                                    <p className="mb-2 text-sm text-slate-500">
                                        {t('profile.edit.photoHint')}
                                    </p>
                                    <label
                                        htmlFor="profile-upload"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <Icon
                                            icon={imageUploading ? 'mdi:loading' : 'mdi:camera-outline'}
                                            className={`h-4 w-4 ${imageUploading ? 'animate-spin' : ''}`}
                                        />
                                        {t('profile.edit.changePhoto')}
                                    </label>
                                    {pendingProfileImage && (
                                        <p className="mt-2 text-sm text-blue-700" role="status">
                                            {t('profile.edit.photoSelected')}
                                        </p>
                                    )}
                                </div>
                            </section>

                        <section className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-slate-900">
                                    {t('profile.edit.basicInfo')}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {t('profile.edit.basicInfoHint')}
                                </p>
                            </div>
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        {t('profile.edit.firstName')}
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.firstName}
                                        onChange={(e) =>
                                            handleProfileChange(
                                                'firstName',
                                                e.target.value
                                            )
                                        }
                                        maxLength={50}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        {t('profile.edit.lastName')}
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.lastName}
                                        onChange={(e) =>
                                            handleProfileChange(
                                                'lastName',
                                                e.target.value
                                            )
                                        }
                                        maxLength={50}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    {t('profile.edit.location')}
                                </label>
                                <input
                                    type="text"
                                    value={profileData.location}
                                    onChange={(e) =>
                                        handleProfileChange(
                                            'location',
                                            e.target.value
                                        )
                                    }
                                    placeholder={t('profile.edit.locationPlaceholder')}
                                    maxLength={100}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Career */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    {t('profile.edit.careerGoal')}
                                </label>
                                <input
                                    type="text"
                                    value={profileData.career}
                                    onChange={(e) =>
                                        handleProfileChange(
                                            'career',
                                            e.target.value
                                        )
                                    }
                                    placeholder={t('profile.edit.careerPlaceholder')}
                                    maxLength={100}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* School */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    {t('profile.edit.school')}
                                </label>
                                <input
                                    type="text"
                                    value={profileData.school}
                                    onChange={(e) =>
                                        handleProfileChange(
                                            'school',
                                            e.target.value
                                        )
                                    }
                                    placeholder={t('profile.edit.schoolPlaceholder')}
                                    maxLength={100}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            {/* Bio */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    {t('profile.edit.bio')}
                                </label>
                                <textarea
                                    value={profileData.bio || ''}
                                    onChange={(e) =>
                                        handleProfileChange(
                                            'bio',
                                            e.target.value
                                        )
                                    }
                                    placeholder={t('profile.edit.bioPlaceholder')}
                                    rows={3}
                                    maxLength={500}
                                    className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                                <p className="mt-1 text-right text-xs text-slate-500">
                                    {(profileData.bio || '').length}/500
                                </p>
                            </div>
                        </section>

                        {/* Action Buttons */}
                        {profileSaveStatus === 'error' && (
                            <p
                                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                                role="alert"
                            >
                                {t('profile.edit.saveError')}
                            </p>
                        )}
                        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                            <button
                                type="button"
                                onClick={closeProfileModal}
                                disabled={profileSaving}
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                {t('profile.edit.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleProfileSave}
                                disabled={
                                    profileSaving ||
                                    imageUploading ||
                                    bannerUploading ||
                                    profileSaveStatus === 'success'
                                }
                                className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                    profileSaveStatus === 'success'
                                        ? 'bg-green-600 text-white'
                                        : profileSaveStatus === 'error'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {profileSaving ? (
                                    <>
                                        <Icon
                                            icon="mdi:loading"
                                            className="h-4 w-4 animate-spin"
                                        />
                                        {t('profile.edit.saving')}
                                    </>
                                ) : profileSaveStatus === 'success' ? (
                                    <>
                                        <Icon
                                            icon="mdi:check"
                                            className="h-4 w-4"
                                        />
                                        {t('profile.edit.saved')}
                                    </>
                                ) : profileSaveStatus === 'error' ? (
                                    <>
                                        <Icon
                                            icon="mdi:alert"
                                            className="h-4 w-4"
                                        />
                                        {t('profile.edit.error')}
                                    </>
                                ) : (
                                    t('profile.edit.saveChanges')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            )}
        </Layout>
    );
}

export default Profile;
