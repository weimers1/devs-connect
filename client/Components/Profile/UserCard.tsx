import { assets } from '../../assets/assets';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import API from '../../Service/service';
import React, { useState, useEffect } from 'react';
import {useUserConnections} from "../Connections/UserConnectionContext";
import { useLanguage } from '../../src/i18n/LanguageContext';



interface UserCardProps {
    userId: string;
    publicId: string;
    isOwnProfile: boolean;
    profileData: {
        firstName: string;
        lastName: string;
        bio?: string | null;
        location?: string | null;
        career?: string | null;
        school?: string | null;
        pfp?: string | null;
        bannerImageUrl?: string | null;
        githubUrl?: string | null;
    };
    currentUserId: string;
    onEditProfile: () => void;
    communityCount: number;
}
//Connection Data
 interface connectionData  {
    career: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
    userId: string;
}

function UserCard({ userId, publicId, isOwnProfile, profileData, currentUserId, onEditProfile, communityCount }: UserCardProps) {
        // const [imageUploading, setImageUploading] = useState(false);
        const navigate = useNavigate();
        const { t } = useLanguage();
        // const [currentProfileImage, setCurrentProfileImage] = useState('');
        const {connections, handleConnect, handleDisconnect, handleBlockUser, connectStatus, setconnectStatus} = useUserConnections();
        const [otherConnections, setOtherConnections] = useState<connectionData[] | null>(null);
        const [isUpdatingConnection, setIsUpdatingConnection] = useState(false);
        const [connectionActionError, setConnectionActionError] = useState('');
        const [isBlocked, setIsBlocked] = useState(false);
        const [blockStatusLoading, setBlockStatusLoading] = useState(true);
        const [isUpdatingBlock, setIsUpdatingBlock] = useState(false);
        const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
    
    //Validate Image URL to prevent SSRF attacks
    //  const validateImageUrl = (url: string) => {
    //     try {
    //         const parsedUrl = new URL(url);
    //         const allowedHosts = ['s3.amazonaws.com', 'amazonaws.com', 'localhost'];
    //         return (
    //               (allowedHosts.some((host) =>
    //                 parsedUrl.hostname.endsWith(host)
    //             ) && parsedUrl.protocol === 'https:') ||
    //             (parsedUrl.hostname === 'localhost' && parsedUrl.protocol === 'http:')
    //         );
    //     } catch {
    //         return false;
    //     }
    // };
//  console.log(userId);
    function handleClick() {
       onEditProfile();
    }

    // const handleConnect = async () => {
    //     try{
    //         if(!userId) {
    //             navigate('/login');  
    //         }
    //         const connect = await API.connectToUser(userId, currentUserId);
    //         if(connect.success == false) {
    //             console.log("failed to connect to user");
    //             setconnectStatus(false);
    //         }
    //         setconnectStatus(true);
    //     } catch(error) {
    //         console.log("there was an error trying to connect to user", error);
    //     }
    // }
    // const handleDisconnect = async () => {
    //     try {
    //         if(!userId) {
    //             navigate("/login");
    //         }
    //         if(connectStatus == true) {
    //             const disconnect = await API.disconnecttoUser(userId, currentUserId);
    //             if(disconnect.success == false) {
    //                 console.log("failed to disconnect");
    //                 setconnectStatus(true);
    //             }
    //             setconnectStatus(false);
    //         }
    //     }catch(error) {
    //         console.log("there was an error trying to disconnect to user", error);
    //     }
    // }
    

    // const handleImageUpload = async (file: File) => {
    //         setImageUploading(true);
    
    //         try {
    //             // Upload to S3
    //             const formData = new FormData();
    //             formData.append('profileImage', file);
    
    //             const baseUrl =
    //                process.env.VITE_API_URL ||
    //                 'http://localhost:6969';
    //             const uploadResponse = await fetch(
    //                 `${baseUrl}/api/upload/profile-image`,
    //                 {
    //                     method: 'POST',
    //                     body: formData,
    //                 }
    //             );
    
    //             if (!uploadResponse.ok) {
    //                 throw new Error(`Upload failed: ${uploadResponse.status}`);
    //             }
    
    //             const uploadResult = await uploadResponse.json();
    
    //             if (!uploadResult.success) {
    //                 throw new Error('Upload to S3 failed');
    //             }
    
    //             // Validate returned URL to prevent SSRF
    //             if (!validateImageUrl(uploadResult.imageUrl)) {
    //                 throw new Error('Invalid image URL returned from server');
    //             }
    
    //             // Save URL to database
    //             const token = localStorage.getItem('session_token');
    //             if (!token) {
    //                 throw new Error('No authentication token found');
    //             }
    //             const saveResponse = await fetch(
    //                 `${baseUrl}/api/settings/profile-image`,
    //                 {
    //                     method: 'PUT',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                         Authorization: 'Bearer ' + token,
    //                     },
    //                     body: JSON.stringify({
    //                         imageUrl: uploadResult.imageUrl,
    //                     }),
    //                 }
    //             );
    
    //             if (!saveResponse.ok) {
    //                 throw new Error(`Database save failed: ${saveResponse.status}`);
    //             }
    
    //             let saveResult;
    //             try {
    //                 saveResult = await saveResponse.json();
    //             } catch (jsonError) {
    //                 throw new Error('Invalid response from server');
    //             }
    
    //             if (!saveResult || saveResult.error) {
    //                 throw new Error(saveResult?.error || 'Database save failed');
    //             }
    
    //             setCurrentProfileImage(uploadResult.imageUrl);
    //             console.log('Profile image saved to database!');
    //         } catch (error) {
    //             console.error('Upload failed:', error);
    //             alert('Failed to upload profile image. Please try again.');
    //         } finally {
    //             setImageUploading(false);
    //         }
    //     };
//  console.log("logged in userID", currentUserId);
//  console.log("other userS ID:", userId);

    useEffect(() => {
        if (isOwnProfile || !userId || !currentUserId) return;
        let active = true;
        const loadConnectionData = async () => {
            try {
                const [userConnections, connection] = await Promise.all([
                    API.getOtherUserConnections(publicId),
                    API.getrelevantconnection(userId, currentUserId),
                ]);
                if (!active) return;
                setOtherConnections(userConnections);
                setconnectStatus(connection.success === true);
            } catch (error) {
                console.error('Failed to load profile connections:', error);
            }
        };

        void loadConnectionData();
        return () => {
            active = false;
        };
    }, [userId, publicId, currentUserId, isOwnProfile, setconnectStatus]);

    useEffect(() => {
        if (isOwnProfile || !userId) {
            setBlockStatusLoading(false);
            return;
        }
        let active = true;
        setBlockStatusLoading(true);

        API.getBlockedUsers()
            .then((blockedUsers: { id: number }[]) => {
                if (active) {
                    setIsBlocked(
                        blockedUsers.some(
                            (blockedUser) => String(blockedUser.id) === userId,
                        ),
                    );
                }
            })
            .catch((error) => {
                console.error('Failed to check blocked profile status:', error);
                if (active) {
                    setConnectionActionError(
                        t('profile.userCard.blockStatusError'),
                    );
                }
            })
            .finally(() => {
                if (active) setBlockStatusLoading(false);
            });

        return () => {
            active = false;
        };
    }, [isOwnProfile, userId, t]);

    const handleConnectionAction = async () => {
        setIsUpdatingConnection(true);
        setConnectionActionError('');
        try {
            const succeeded = connectStatus
                ? await handleDisconnect(userId)
                : await handleConnect(userId);
            if (!succeeded) {
                setConnectionActionError(
                    t('profile.userCard.connectionUpdateError'),
                );
            }
        } finally {
            setIsUpdatingConnection(false);
        }
    };

    const handleBlockAction = async () => {
        setIsUpdatingBlock(true);
        setConnectionActionError('');
        try {
            if (isBlocked) {
                await API.unblockUser(Number(userId));
                setIsBlocked(false);
                setShowBlockConfirmation(false);
                return;
            }
            const succeeded = await handleBlockUser(userId);
            if (!succeeded) {
                throw new Error(t('profile.userCard.blockError'));
            }
            setIsBlocked(true);
            setconnectStatus(false);
            setShowBlockConfirmation(false);
        } catch (error) {
            console.error('Failed to update blocked profile status:', error);
            setConnectionActionError(
                error instanceof Error
                    ? error.message
                    : t('profile.userCard.blockUpdateError'),
            );
        } finally {
            setIsUpdatingBlock(false);
        }
    };

    return (
        <>
        <section className="mx-auto mb-5 mt-5 w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="h-32 overflow-hidden bg-slate-200 sm:h-44">
                <img
                    src={profileData.bannerImageUrl || assets.Banner}
                    alt=""
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="px-5 pb-7 sm:px-8 sm:pb-8">
                <div className="grid gap-4 sm:gap-0">
                    <div className="relative -mt-20 mb-2 flex justify-start sm:-mt-24">
                        <button
                            type="button"
                            onClick={() => isOwnProfile && onEditProfile()}
                            disabled={!isOwnProfile}
                            aria-label={
                                isOwnProfile ? t('profile.userCard.editPhoto') : undefined
                            }
                            className={`h-28 w-28 overflow-hidden rounded-full bg-slate-100 ring-4 ring-white shadow-md sm:h-36 sm:w-36 ${
                                isOwnProfile
                                    ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-blue-300'
                                    : 'cursor-default'
                            }`}
                        >
                            <img
                                src={profileData.pfp || assets.Profile}
                                alt={`${profileData.firstName} ${profileData.lastName}`}
                                onError={(event) => {
                                    event.currentTarget.src = assets.Profile;
                                }}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <h1 className="truncate text-2xl font-normal tracking-tight text-slate-900">
                                {profileData.firstName} {profileData.lastName}
                            </h1>
                            {isOwnProfile ? (
                                <button
                                    type="button"
                                    onClick={handleClick}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                    <Icon
                                        icon="mdi:pencil-outline"
                                        className="h-4 w-4"
                                    />
                                    {t('profile.userCard.editProfile')}
                                </button>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        disabled={
                                            isUpdatingConnection ||
                                            blockStatusLoading ||
                                            isBlocked
                                        }
                                        onClick={() =>
                                            void handleConnectionAction()
                                        }
                                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                            connectStatus
                                                ? 'bg-slate-700 hover:bg-slate-800'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        <Icon
                                            icon={
                                                connectStatus
                                                    ? 'mdi:account-check'
                                                    : 'mdi:account-plus'
                                            }
                                            className="h-4 w-4"
                                        />
                                        {blockStatusLoading
                                            ? t('profile.userCard.loading')
                                            : isUpdatingConnection
                                            ? t('profile.userCard.updating')
                                            : connectStatus
                                              ? t('profile.userCard.connected')
                                              : isBlocked
                                                ? t('profile.userCard.blocked')
                                                : t('profile.userCard.connect')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(`/messages?user=${userId}`)
                                        }
                                        disabled={blockStatusLoading || isBlocked}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Icon
                                            icon="mdi:message-outline"
                                            className="h-4 w-4"
                                        />
                                        {t('profile.userCard.message')}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={blockStatusLoading}
                                        onClick={() => {
                                            setConnectionActionError('');
                                            setShowBlockConfirmation(true);
                                        }}
                                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        aria-label={
                                            isBlocked ? t('profile.userCard.unblockUser') : t('profile.userCard.blockUser')
                                        }
                                    >
                                        <Icon
                                            icon="mdi:dots-horizontal"
                                            className="h-5 w-5"
                                        />
                                        {t('profile.userCard.more')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-y border-slate-100 py-4 text-sm text-slate-700">
                            <button
                                type="button"
                                onClick={() =>
                                    isOwnProfile
                                        ? navigate('/connections')
                                        : navigate(`/connections/${publicId}`)
                                }
                                className="rounded-sm hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                                <strong className="font-semibold text-slate-900">
                                    {isOwnProfile
                                        ? connections?.length ?? 0
                                        : otherConnections?.length ?? 0}
                                </strong>{' '}
                                {t('profile.userCard.connections')}
                            </button>
                            <span>
                                <strong className="font-semibold text-slate-900">
                                    {communityCount}
                                </strong>{' '}
                                {t('profile.userCard.communities')}
                            </span>
                        </div>

                    </div>
                </div>

                {showBlockConfirmation && !isOwnProfile && (
                    <div
                        className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4"
                        role="alertdialog"
                        aria-labelledby="profile-block-title"
                        aria-describedby="profile-block-description"
                    >
                        <p
                            id="profile-block-title"
                            className="font-semibold text-slate-900"
                        >
                            {isBlocked ? t('profile.userCard.unblockTitle') : t('profile.userCard.blockTitle')}
                        </p>
                        <p
                            id="profile-block-description"
                            className="mt-1 text-sm text-slate-600"
                        >
                            {isBlocked
                                ? t('profile.userCard.unblockDescription')
                                : t('profile.userCard.blockDescription')}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => void handleBlockAction()}
                                disabled={isUpdatingBlock}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {isUpdatingBlock
                                    ? t('profile.userCard.updating')
                                    : isBlocked
                                      ? t('profile.userCard.unblock')
                                      : t('profile.userCard.block')}
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setShowBlockConfirmation(false)
                                }
                                disabled={isUpdatingBlock}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                {t('profile.userCard.cancel')}
                            </button>
                        </div>
                    </div>
                )}

                {connectionActionError && (
                    <p
                        className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                        role="alert"
                    >
                        {connectionActionError}
                    </p>
                )}
            </div>
        </section>
        <section className="mx-auto mb-5 w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-5 sm:p-8">
                <h2 className="text-xl font-                semibold text-slate-900">{t('profile.userCard.about')}</h2>
                <p className="mt-3 font-semibold text-slate-900">
                                    {profileData.career || t('profile.userCard.defaultCareer')}
                                    {profileData.school ? ` ${t('profile.userCard.atSchool', { school: profileData.school })}` : ''}
                </p>
                {profileData.bio && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                        {profileData.bio}
                    </p>
                )}
                {!profileData.bio && (
                    <p className="mt-2 text-sm text-slate-500">
                        {t('profile.userCard.noIntro')}
                    </p>
                )}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                    {profileData.career && (
                        <span className="inline-flex items-center gap-1.5">
                            <Icon icon="mdi:code-braces" className="h-4 w-4" />
                            {profileData.career}
                        </span>
                    )}
                    {profileData.location && (
                        <span className="inline-flex items-center gap-1.5">
                            <Icon
                                icon="mdi:map-marker-outline"
                                className="h-4 w-4"
                            />
                            {profileData.location}
                        </span>
                    )}
                    {profileData.githubUrl && (
                        <a
                            href={profileData.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-700 hover:underline"
                        >
                            <Icon icon="mdi:github" className="h-4 w-4" />
                            {t('profile.userCard.github')}
                        </a>
                    )}
                </div>
            </div>
        </section>
        </>
    );
}

export default UserCard;
