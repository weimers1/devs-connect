import { assets } from '../../assets/assets';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import API from '../../Service/service';
import React, { useState, useEffect } from 'react';

interface UserCardProps {
    userId?: string;
    isOwnProfile: boolean;
    profileData: any;
}

function UserCard({ userId, isOwnProfile, profileData }: UserCardProps) {
        const [imageUploading, setImageUploading] = useState(false);
        const navigate = useNavigate();
        const [currentProfileImage, setCurrentProfileImage] = useState('');

    //Validate Image URL to prevent SSRF attacks
     const validateImageUrl = (url: string) => {
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

    const handleImageUpload = async (file: File) => {
            setImageUploading(true);
    
            try {
                // Upload to S3
                const formData = new FormData();
                formData.append('profileImage', file);
    
                const baseUrl =
                   process.env.VITE_API_URL ||
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
 
    useEffect(() => {
        setCurrentProfileImage(profileData.pfp || '');
    }, [profileData]);

    function handleImageClick() {
        navigate('/profile?showProfModal=true');
        window.location.reload();
    }

    return (
        <div className="w-full  bg-gray-100 overflow-hidden sm:rounded-lg shadow-md mb-2 mt-2">
            {/* Banner - Full width on mobile */}
            <div className="relative">
                <div className="w-full">
                    <img
                        className="w-full h-28 sm:h-36 md:h-42 object-cover"
                        src={assets.Banner}
                        alt="Profile Banner"
                    />
                </div>

                {/* Profile Picture - Different positioning for mobile vs desktop */}
                <div className="absolute -bottom-10 sm:-bottom-12 md:-bottom-16 left-4 sm:left-6 md:left-8">
                    <img
                        src={currentProfileImage || assets.Profile}
                        alt="Profile"
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                        onClick={handleImageClick}
                    />     
                </div>
            </div>

            {/* Profile Info Section - Full width on mobile */}
            <div className="bg-white pt-12 sm:pt-16 md:pt-20 pb-4 sm:pb-6 px-4 sm:px-6 md:px-8">
                {/* Mobile: Stacked layout, Desktop: Side-by-side layout */}
                <div className="flex flex-col md:flex-row md:justify-between">
                    {/* Left Column - Basic Info */}
                    <div className="md:pr-8">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                            {profileData.firstName + ' ' + profileData.lastName}
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base">
                            Student At {profileData.school}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm">
                            {profileData.location}
                        </p>

                        {/* Connections */}
                        <div className="mt-2 flex items-center">
                            <span className="text-blue-600 text-xs sm:text-sm font-medium">
                                500+ Mutuals
                            </span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-blue-600 text-xs sm:text-sm font-medium">
                                Contact info
                            </span>
                        </div>

                        {/* Action Buttons - Only show for other users */}
                        {!isOwnProfile && (
                            <div className="flex flex-col sm:flex-row mt-3 sm:mt-4 sm:space-x-2 space-y-2 sm:space-y-0">
                                <button className="w-full sm:w-auto rounded-full bg-blue-600 text-white px-4 py-1.5 flex items-center justify-center transition-all duration-200 hover:bg-blue-700">
                                    <Icon
                                        icon="mdi:account-plus"
                                        className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5"
                                    />
                                    <span className="font-medium text-sm">
                                        Connect
                                    </span>
                                </button>
                                <button 
                                    onClick={() => navigate(`/messages?user=${userId}`)}
                                    className="w-full sm:w-auto rounded-full bg-white border border-gray-400 text-gray-700 px-4 py-1.5 flex items-center justify-center transition-all duration-200 hover:bg-gray-50"
                                >
                                    <Icon
                                        icon="mdi:message-reply-text"
                                        className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5"
                                    />
                                    <span className="font-medium text-sm">
                                        Message
                                    </span>
                                </button>
                                <button className="w-full sm:w-auto rounded-full bg-white border border-gray-400 text-gray-700 px-3 py-1.5 flex items-center justify-center transition-all duration-200 hover:bg-gray-50">
                                    <span className="font-medium text-sm">
                                        More
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Career Goal (Moves below on mobile) */}
                    <div className="mt-4 md:mt-0 md:ml-4 md:flex-shrink-0">
                        <div className="bg-blue-50 px-3 py-2 rounded-lg">
                            <p className="font-semibold text-sm">Career goal</p>
                            <p className="text-blue-600 text-sm">
                                {profileData.career}
                            </p>
                        </div>
                    </div>
                </div>

                {/*  section divider */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                            About
                        </p>
                        {isOwnProfile && (
                            <button className="text-gray-400">
                                <Icon
                                    icon="mdi:pencil"
                                    className="w-5 h-5"
                                />
                            </button>
                        )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        {profileData.bio}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default UserCard;
