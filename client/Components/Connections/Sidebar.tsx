import { Icon } from '@iconify/react/dist/iconify.js';
import { useEffect, useState } from 'react';
import { useDropdown } from '../DropDown/DropDownContext';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import {useUserConnections} from "./UserConnectionContext.tsx";
import API from '../../Service/service';
import { useLanguage } from '../../src/i18n/LanguageContext';

 export interface connectionData  {
    career: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
    userId: string;
    publicId: string;
}

interface CommunityRecommendation {
    id: string;
    name: string;
    description?: string | null;
    image?: string | null;
    icon?: string | null;
    memberCount?: number | null;
    recommendationReason?: string | null;
}

function Sidebar() {
    const { t } = useLanguage();
    const {
        connections,
        handleConnect,
        suggestionData,
        currentUser,
        isLoadingConnections,
        isLoadingSuggestions,
        connectionError,
        suggestionsError,
        connectingUserId,
    } = useUserConnections();
    const { isSidebarOpen, toggleSidebar } = useDropdown();
    // const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
    const [dismissedUsers, setDismissedUsers] = useState<Set<string>>(new Set());
    const [communitySuggestions, setCommunitySuggestions] = useState<CommunityRecommendation[]>([]);
    const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);
    const [communitySuggestionsError, setCommunitySuggestionsError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            setCommunitySuggestions([]);
            setIsLoadingCommunities(false);
            setCommunitySuggestionsError(null);
            return;
        }

        let active = true;
        setIsLoadingCommunities(true);
        setCommunitySuggestionsError(null);
        API.getSidebarCommunityRecommendations()
            .then((response) => {
                const recommendations = response?.CommunityRecommendations;
                if (!Array.isArray(recommendations)) {
                    throw new Error('Invalid community recommendations response');
                }
                if (active) setCommunitySuggestions(recommendations);
            })
            .catch((error: unknown) => {
                console.error('Failed to load community recommendations:', error);
                if (active) {
                    setCommunitySuggestionsError(
                        t('social.sidebar.communitiesUnavailable'),
                    );
                }
            })
            .finally(() => {
                if (active) setIsLoadingCommunities(false);
            });

        return () => {
            active = false;
        };
    }, [currentUser, t]);

    const navigateFromSidebar = (path: string) => {
        if (isSidebarOpen) toggleSidebar();
        navigate(path);
    };

    // const handleConnect = async (userId: string) => {
    //     try {
    //         if (!currentUser) {
    //             navigate('/login');
    //             return;
    //         }
    //         const connect = await API.connectToUser(userId, currentUser);
    //         if (connect.success !== false) {
    //             setConnectedUsers(prev => new Set([...prev, userId]));
    //         }
    //     } catch (error) {
    //         console.log("Error connecting to user", error);
    //     }
    // };

    // const handleDisconnect = async (userId: string) => {
    //     try {
    //         if (!currentUser) {
    //             navigate('/login');
    //             return;
    //         }
    //         const disconnect = await API.disconnecttoUser(userId, currentUser);
    //         if (disconnect.success !== false) {
    //             setConnectedUsers(prev => {
    //                 const newSet = new Set(prev);
    //                 newSet.delete(userId);
    //                 return newSet;
    //             });
    //         }
    //     } catch (error) {
    //         console.log("Error disconnecting from user", error);
    //     }
    // };

    const handleDismiss = (userId: string) => {
        setDismissedUsers(prev => new Set([...prev, userId]));
    };

    const filteredSuggestions = suggestionData.filter(person =>
        !dismissedUsers.has(person.userId)
    );
   
    return (
        <section>
            {!isSidebarOpen && (
                <div className="fixed right-0 top-[42%] z-30 -translate-y-1/2">
                <button
                    type="button"
                    aria-label={t('social.sidebar.open')}
                    className="flex cursor-pointer items-center rounded-s-lg border border-gray-200 bg-white px-2 py-3 opacity-90 shadow-md transition-opacity hover:opacity-100 lg:px-3 lg:py-4"
                    onClick={toggleSidebar}
                >
                    <Icon
                        icon="mdi:arrow-left"
                        className="h-3 w-3 text-blue-700 lg:h-4 lg:w-4"
                    />
                    <Icon
                        icon="mdi:account-group-outline"
                        className="h-6 w-6 text-blue-700 lg:w-8"
                    />
                </button>
                </div>
            )}
            {isSidebarOpen && (
                <button
                    type="button"
                    aria-label={t('social.sidebar.close')}
                    className="fixed inset-0 z-40 bg-black/40 lg:bg-black/20"
                    onClick={toggleSidebar}
                />
            )}

            <div
                aria-hidden={!isSidebarOpen}
                inert={!isSidebarOpen}
                className={`fixed bottom-0 right-0 top-16 z-50 flex w-full max-w-full flex-col overflow-hidden border-l border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-in sm:top-20 sm:w-96 lg:w-[25rem] ${
                    isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
                    <span className="font-semibold                     text-gray-900">{t('social.sidebar.yourNetwork')}</span>
                    <button
                        type="button"
                                            aria-label={t('social.sidebar.close')}
                        className="rounded-full p-2 text-blue-700 hover:bg-blue-50"
                        onClick={toggleSidebar}
                    >
                        <Icon icon="mdi:close" className="h-6 w-6" />
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden pb-[env(safe-area-inset-bottom)]">

                {/* Your Network Section */}
                <div className="border-b border-gray-100 px-4 py-2">
                    <h3 className="flex items-center text-sm font-semibold text-gray-900">
                        <Icon
                            icon="mdi:account-group"
                            className="me-2 h-5 w-5 text-blue-700"
                        />
                        {t('social.sidebar.yourConnections')}
                    </h3>
                </div>

                <div className="border-b border-gray-100 px-4 py-2">
                    <div className="space-y-1">
                        {isLoadingConnections && (
                            <p className="text-sm text-gray-500" role="status">
                                {t('social.sidebar.loadingNetwork')}
                            </p>
                        )}
                        {!isLoadingConnections && connections.length === 0 && (
                            <p className="text-sm text-gray-500">
                                {t('social.sidebar.noConnections')}
                            </p>
                        )}
                        {connections.slice(0, 2).map((connection, index) => (
                            <div
                                key={connection.userId}
                                className={`flex items-center space-x-2 rounded-lg p-1 transition-colors hover:bg-gray-50 ${index > 0 ? 'hidden sm:flex' : ''}`}
                            >
                                <div className="relative">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-semibold text-white">
                               <button
                               onClick={() => navigateFromSidebar(`/profile/${connection.publicId}`)}
                               >
                                    {connection.profileImageUrl ? (
                                        <img
                                className="w-12 h-12 rounded-full object-cover"
                                src={connection.profileImageUrl}
                                alt={`${connection.firstName} ${connection.lastName}`}
                                ></img>
                                    ) : (
                                        <span>{connection.firstName.charAt(0) + connection.lastName.charAt(0)}</span>
                                    )}
                               </button>
                                    </div>
                                    {/* {connection.isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    )} */}
                                </div>
                                        
                                <div className="min-w-0 flex-1">
                                    <button
                                     onClick={() => navigateFromSidebar(`/profile/${connection.publicId}`)}
                                    >
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-medium text-gray-900 text-sm truncate">
                                            {connection.firstName + ' ' + connection.lastName.slice(0,15)}
                                        </h4>
                                        {/* <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {connection.connectionType}
                                        </span> */}
                                    </div>
                                    <p className="truncate text-xs text-gray-500">
                                {connection.career || t('social.connections.developer')}
                                    </p>
                                    </button>
                                    {/* <p className="text-xs text-gray-500 mt-1">
                                        {connection.isOnline
                                            ? ''
                                            : 'Last seen: ' +
                                              connection.lastOnline}
                                    </p> */}
                                </div>
                             
                                <button className="shrink-0 rounded p-1 text-xs text-blue-600 hover:bg-blue-50"
                                  onClick={() => navigateFromSidebar(`/messages?user=${connection.userId}`)}
                                >
                                    {t('social.connections.message')}
                                </button>
                            </div>
                        ))}
                        {(connections?.length != null && connections?.length > 5) ? (
                            <button 
                             onClick={() => navigateFromSidebar('/connections')}
                            className="w-full text-center text-blue-600 hover:bg-blue-50 py-1 rounded-lg text-xs font-medium"
                            >
                                {t('social.sidebar.viewAllConnections')}
                            </button>
                        ) : (
                            <div></div>
                        )}
                        </div>
                    {connectionError && (
                        <p className="mt-3 text-xs text-red-600" role="alert">
                            {connectionError}
                        </p>
                    )}
                </div>

                {/* People You May Know Section */}
                {/*@TODO create a separate component for Each Of The Cards */}
                <div className="border-b border-gray-100 px-4 py-2">
                    <h3 className="mb-1 flex items-center text-sm font-semibold text-gray-900">
                        <Icon icon="mdi:handshake-outline" className="mr-2 h-5 w-5 text-blue-700" />
                        {t('social.sidebar.fellowCollaborators')}
                    </h3>
                    <p className="mb-2 text-xs text-gray-500">
                        {t('social.sidebar.careerMatches')}
                    </p>

                    <div className="space-y-1">
                        {connectionError && (
                            <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700" role="alert">
                                {connectionError}
                            </p>
                        )}
                        {isLoadingSuggestions && (
                            <p className="text-sm text-gray-500" role="status">
                                {t('social.sidebar.findingDevelopers')}
                            </p>
                        )}
                        {suggestionsError && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                                {suggestionsError}
                            </div>
                        )}
                        {!isLoadingSuggestions && !suggestionsError && filteredSuggestions.length === 0 && (
                            <p className="text-sm text-gray-500">
                                {t('social.sidebar.noSuggestions')}
                            </p>
                        )}
                        {filteredSuggestions.slice(0, 2).map((person, index) => (
                            <div
                                key={person.userId}
                                className={`rounded-lg border border-gray-100 p-2 transition-shadow hover:shadow-sm ${index > 0 ? 'hidden sm:block' : ''}`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-sm font-semibold text-white">
                                        <button
                                            type="button"
                                            aria-label={t('social.connections.viewProfileOf', { name: person.author })}
                                            onClick={() => navigateFromSidebar(`/profile/${person.publicId}`)}
                                        >
                                    {person.profileImageUrl ? (
                                        <img
                                className="w-12 h-12 rounded-full object-cover"
                                src={person.profileImageUrl}
                                alt={person.author}
                                ></img>
                                    ) : (
                                        <span>{`${person.author.charAt(0)}${person.author.charAt(person.author.length-1).toUpperCase()}`}</span>
                                    )}
                               </button>                 
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 text-sm">
                                            {person.author}
                                        </h4>

                                        <p className="truncate text-xs text-gray-600">
                                            {person.career}
                                        </p>
                                        {person.recommendationReason && (
                                            <p className="mt-1 text-xs font-medium text-blue-700">
                                                {person.recommendationReason}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-2 flex gap-2">
                                    <button
                                        type="button"
                                        disabled={connectingUserId === person.userId}
                                        className="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                                        onClick={() => void handleConnect(person.userId)}
                                    >
                                        {connectingUserId === person.userId ? t('social.connections.connecting') : t('social.connections.connect')}
                                    </button>
                                   
                                    <button type="button" className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                        onClick={() => handleDismiss(person.userId)}
                                    >
                                        {t('social.sidebar.dismiss')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => navigateFromSidebar('/connections')}
                        className="w-full rounded-lg py-1 text-center text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                        {t('social.sidebar.viewYourNetwork')}
                    </button>
                </div>
                <div className="border-b border-gray-100 px-4 py-2">
                    <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                        <Icon icon="mdi:account-multiple-plus-outline" className="mr-2 h-5 w-5 text-blue-700" />
                        {t('social.sidebar.recommendedCommunities')}
                    </h3>
                    <div className="space-y-1">
                        {isLoadingCommunities && (
                            <p className="text-sm text-gray-500" role="status">
                                {t('social.sidebar.findingCommunities')}
                            </p>
                        )}
                        {communitySuggestionsError && (
                            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                                {communitySuggestionsError}
                            </p>
                        )}
                        {!isLoadingCommunities && !communitySuggestionsError && communitySuggestions.length === 0 && (
                            <p className="text-sm text-gray-500">
                                {t('social.sidebar.noCommunities')}
                            </p>
                        )}
                        {communitySuggestions.slice(0, 2).map((community, index) => (
                            <article
                                key={community.id}
                                className={`flex items-center gap-2 rounded-lg border border-gray-100 p-2 transition-colors hover:bg-gray-50 ${index > 0 ? 'hidden sm:flex' : ''}`}
                            >
                                {community.image ? (
                                    <img
                                        src={community.image}
                                        alt=""
                                        className="h-9 w-9 shrink-0 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                        <Icon icon={community.icon || 'mdi:account-group-outline'} className="h-5 w-5" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <button
                                        type="button"
                                        className="block max-w-full truncate text-left text-sm font-semibold text-gray-900 hover:text-blue-700"
                                        onClick={() => navigateFromSidebar(`/community/${community.id}`)}
                                    >
                                        {community.name}
                                    </button>
                                    <p className="truncate text-xs text-gray-500">
                                        {community.description || t('social.sidebar.memberCount', { count: Number(community.memberCount) || 0 })}
                                    </p>
                                    {community.recommendationReason && (
                                        <p className="mt-1 text-xs font-medium text-blue-700">
                                            {community.recommendationReason}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                                    onClick={() => navigateFromSidebar(`/community/${community.id}`)}
                                >
                                    {t('social.sidebar.view')}
                                </button>
                            </article>
                        ))}
                        <button
                            type="button"
                            onClick={() => navigateFromSidebar('/communities')}
                            className="w-full rounded-lg py-1 text-center text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                            {t('social.sidebar.exploreCommunities')}
                        </button>
                    </div>
                </div>
                </div>
            </div>
        </section>
    );
}

export default Sidebar;
