import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import UserCard from './UserCard';
import Sidebar from '../Connections/Sidebar';
import Communities from './ProfileCommunities';
// import { useTheme } from '../../src/ThemeContext';
import API from '../../Service/service';
import { Icon } from '@iconify/react';
import { assets } from '../../assets/assets';

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
   export const validateImageUrl = (url: string) => {
        try {
            const parsedUrl = new URL(url);
            const allowedHosts = ['s3.amazonaws.com', 'amazonaws.com'];
            return (
                  allowedHosts.some((host) =>
                    parsedUrl.hostname.endsWith(host)
                ) && parsedUrl.protocol === 'https:'
            );
        } catch {
            return false;
        }
    };

function Profile() {
    const { userId } = useParams<{ userId: string }>();
    // const navigate = useNavigate();
    const isOwnProfile = !userId;
    // const [showCertModal, setShowCertModal] = React.useState(false); //Certification Modal
    const [showProfModal, setShowProfModal] = React.useState(false); // Profile Modal
    const [certSaving, setCertSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [currentProfileImage, setCurrentProfileImage] = useState('');
    const [certSaveStatus, setCertSaveStatus] = useState(''); // 'success', 'error', ''
    const [hasChanges, setHasChanges] = useState(false);
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


    // TYPE FIX: Added explicit File type to prevent TypeScript implicit any error
    const handleImageUpload = async (file: File) => {
        setImageUploading(true);

        try {
            // Upload to S3
            const formData = new FormData();
            formData.append('profileImage', file);

            const baseUrl =
               import.meta.env.VITE_API_URL ||
                'http://localhost:6969';
            const uploadResponse = await fetch(
                `${baseUrl}/api/upload/profile-image`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!uploadResponse.ok) {
                throw new Error(`Upload failed: ${uploadResponse.status}`);
            }

            const uploadResult = await uploadResponse.json();

            if (!uploadResult.success) {
                throw new Error('Upload to S3 failed');
            }

            // Validate returned URL to prevent SSRF
            if (!validateImageUrl(uploadResult.imageUrl)) {
                throw new Error('Invalid image URL returned from server');
            }

            // Save URL to database
            const token = localStorage.getItem('session_token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const saveResponse = await fetch(
                `${baseUrl}/api/settings/profile-image`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                    body: JSON.stringify({
                        imageUrl: uploadResult.imageUrl,
                    }),
                }
            );

            if (!saveResponse.ok) {
                throw new Error(`Database save failed: ${saveResponse.status}`);
            }

            let saveResult;
            try {
                saveResult = await saveResponse.json();
            } catch (jsonError) {
                throw new Error('Invalid response from server');
            }

            if (!saveResult || saveResult.error) {
                throw new Error(saveResult?.error || 'Database save failed');
            }

            setCurrentProfileImage(uploadResult.imageUrl);
            console.log('Profile image saved to database!');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload profile image. Please try again.');
        } finally {
            setImageUploading(false);
        
        }
    };

    // Profile edit data
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        location: '',
        career: '',
        school: '',
        github: '',
    });
    const [profileSaving, setProfileSaving] = useState(false);  
    const [profileSaveStatus, setProfileSaveStatus] = useState('');
    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const response = isOwnProfile
                    ? await API.getProfileInformation()
                    : await API.getUserProfile(userId!);
                setProfileData(response);
                setCurrentProfileImage(response.pfp || '');
            } catch (error) {
                console.error('Failed to load profile data:', error);
                setProfileData({
                    firstName: '',
                    lastName: '',
                    bio: '',
                    location: '',
                    career: '',
                    school: '',
                    github: '',
                });
            }
        };
        loadProfileData();
    }, [userId, isOwnProfile]);
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

    // TYPE FIX: Added explicit string types for date combination parameters
    // Combine month and year into date string
    // const combineDateFields = (month: string, year: string) => {
    //     if (!month || !year) return '';
    //     return `${month}-${year}`;
    // };

    //Handle Save for updating
    const handleSave = async () => {
        setCertSaving(true);
        setCertSaveStatus('');
        try {
            // Combine the date fields before sending
            // const certPayload = {
            //     certName: certData.certName,
            //     issuer: certData.issuer,
            //     dateEarned: combineDateFields(
            //         certData.issuedMonth,
            //         certData.issuedYear
            //     ),
            //     dateExpiration: combineDateFields(
            //         certData.expiryMonth,
            //         certData.expiryYear
            //     ),
            //     credentialID: certData.credentialID,
            //     credentialURL: certData.credentialURL,
            // };

            // await API.addCertifications(certPayload);
            // setCertSaveStatus('success');
            // console.log('Certification saved:', certPayload);
            // Handle Save for updating
            const handleSave = async () => {
                setCertSaving(true);
                setCertSaveStatus('');
                try {
                 //   Combine the date fields before sending
                    // const certPayload = {
                    //     certName: certData.certName,
                    //     issuer: certData.issuer,
                    //     dateEarned: combineDateFields(
                    //         certData.issuedMonth,
                    //         certData.issuedYear
                    //     ),
                    //     dateExpiration: combineDateFields(
                    //         certData.expiryMonth,
                    //         certData.expiryYear
                    //     ),
                    //     credentialID: certData.credentialID,
                    //     credentialURL: certData.credentialURL,
                    // };

                    // await API.addCertifications(certPayload);
                    // setCertSaveStatus('success');
                    // console.log('Certification saved:', certPayload);

                    // setTimeout(() => {
                    //     setShowCertModal(false);
                    //     setCertSaving(false);
                    //     setCertSaveStatus('');
                    //     // Re-enable scrolling
                    //     document.body.style.overflow = 'auto';
                    //     document.documentElement.style.overflow = 'auto';
                    // }, 1500);
                } catch (error) {
                    console.error('Error saving certification:', error);
                    setCertSaveStatus('error');
                    setCertSaving(false);
                }
            };
            //Handle Change for certData
            // const handleChange = (field: string, value: string) => {
            //     setCertData((prevData) => ({
            //         ...prevData,
            //         [field]: value,
            //     }));
            //     setHasChanges(true);
            // };

            // Handle Change for profile data
            // const handleProfileChange = (field: string, value: string) => {
            //     setProfileData((prevData) => ({
            //         ...prevData,
            //         [field]: value,
            //     }));
            //     setHasChanges(true);
            // };

            // Handle Profile Save
            const handleProfileSave = async () => {
                setProfileSaving(true);
                setProfileSaveStatus('');
                try {
                    await API.updateProfileSettings(profileData);
                    setProfileSaveStatus('success');
                    console.log('Profile saved:', profileData);

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
                    setProfileSaving(false);
                }
            };
            const currentYear = new Date().getFullYear();
            // setTimeout(() => {
            //     setShowCertModal(false);
            //     setCertSaving(false);
            //     setCertSaveStatus('');
            //     // Re-enable scrolling
            //     document.body.style.overflow = 'auto';
            //     document.documentElement.style.overflow = 'auto';
            // }, 1500);
        } catch (error) {
            console.error('Error saving certification:', error);
            setCertSaveStatus('error');
            setCertSaving(false);
        }
    };
    //Handle Change for certData
    // const handleChange = (field: string, value: string) => {
    //     setCertData((prevData) => ({
    //         ...prevData,
    //         [field]: value,
    //     }));
    //     setHasChanges(true);
    // };

    // Handle Change for profile data
    const handleProfileChange = (field: string, value: string) => {
        setProfileData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
        setHasChanges(true);
    };

    // Handle Profile Save
    const handleProfileSave = async () => {
        setProfileSaving(true);
        setProfileSaveStatus('');
        try {
            await API.updateProfileSettings(profileData);
            setProfileSaveStatus('success');
            console.log('Profile saved:', profileData);

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
            setProfileSaving(false);
        }
    };
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100; // Or any desired start year
    const years = Array.from(
        { length: currentYear - startYear + 1 },
        (_, i) => startYear + i
    );
    const sortedYears = [...years].sort((a, b) => b - a); //Sort Years from most recent to oldest
    return (
        <Layout>
            {/* Main container - centered for other users, full width for own profile */}
            <div
                className={`bg-gradient-to-b  mt-4  ${
                    isOwnProfile ? ' md:mr-7 md:w-auto' : 'max-w-4xl mx-auto px-4'
                }`}
            >
                {/* User Profile Card */}
                <UserCard
                    userId={userId}
                    isOwnProfile={isOwnProfile}
                    profileData={profileData}
                />

                {/* Profile sections */}
                <div className="divide-y-0 divide-transparent">
                    <Communities userId={userId} />
                </div>

                {/* Sidebar for desktop only - only show for own profile */}
                {isOwnProfile && (
                    <div className="hidden lg:block fixed right-4 top-24">
                        <Sidebar />
                    </div>
                )}
            </div>
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
                    className="fixed inset-0 flex items-start justify-center pt-8 z-[9999]"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <div className="bg-white w-170 mr-12 max-h-[90vh] overflow-y-auto rounded-xl p-6 mx-4">
                        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                        <hr className="mb-6" />

                        {/* Profile Photo Section */}
                        <div className="flex flex-col items-center mb-6">
                            <img
                                src={
                                    currentProfileImage &&
                                    currentProfileImage.startsWith(
                                        'https://'
                                    ) &&
                                    /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s<>"']*)?$/.test(
                                        currentProfileImage
                                    )
                                        ? currentProfileImage
                                        : assets.Profile
                                }
                                alt="Profile"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = assets.Profile;
                                }}
                                className="w-20 h-20 rounded-full border-4 border-gray-300 shadow-lg object-cover mb-3"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                data-testId="profile-upload-input"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        // Check file type
                                        if (!file.type.startsWith('image/')) {
                                            alert(
                                                'Please select an image file'
                                            );
                                            return;
                                        }
                                        // Check file size (5MB)
                                        if (file.size > 5 * 1024 * 1024) {
                                            alert(
                                                'File size must be less than 5MB'
                                            );
                                            return;
                                        }
                                        handleImageUpload(file);
                                    }
                                }}
                                className="hidden"
                                id="profile-upload"
                            />
                            <label
                                htmlFor="profile-upload"
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer"
                            >
                                {imageUploading
                                    ? 'Uploading...'
                                    : 'Change Profile Photo'}
                            </label>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
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
                                    placeholder="City, State"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Career */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Career Goal
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
                                    placeholder="Software Engineer"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* School */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    School
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
                                    placeholder="University Name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio
                                </label>
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) =>
                                        handleProfileChange(
                                            'bio',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Tell others about yourself..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                            <button
                                onClick={() => setShowProfModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleProfileSave}
                                disabled={profileSaving}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
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
                                            className="animate-spin w-4 h-4 mr-2"
                                        />
                                        Saving...
                                    </>
                                ) : profileSaveStatus === 'success' ? (
                                    <>
                                        <Icon
                                            icon="mdi:check"
                                            className="w-4 h-4 mr-2"
                                        />
                                        Saved!
                                    </>
                                ) : profileSaveStatus === 'error' ? (
                                    <>
                                        <Icon
                                            icon="mdi:alert"
                                            className="w-4 h-4 mr-2"
                                        />
                                        Error
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default Profile;
