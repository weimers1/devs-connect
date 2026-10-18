import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLanguage } from '../../src/i18n/LanguageContext';
import React from "react";
import API from '../../Service/service';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../Auth/AuthContext';

export interface ConnectionData {
    career: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
    userId: string;
    publicId: string;
}

export interface SuggestionData {
    author: string;
    userId: string;
    age: string;
    profileImageUrl: string;
    career: string;
    school: string;
    recommendationReason?: string | null;
    publicId: string;
}

interface UserConnectionsContextType {
    connections: ConnectionData[];
    setConnections: React.Dispatch<
        React.SetStateAction<ConnectionData[]>
    >;
    handleConnect: (targetUserId: string) => Promise<boolean>;
    handleDisconnect: (targetUserId: string) => Promise<boolean>;
    handleBlockUser: (targetUserId: string) => Promise<boolean>;
    currentUser: string | null;
    suggestionData: SuggestionData[];
    isLoadingConnections: boolean;
    isLoadingSuggestions: boolean;
    connectionError: string | null;
    suggestionsError: string | null;
    connectingUserId: string | null;
    connectStatus: boolean;
    setconnectStatus: React.Dispatch<React.SetStateAction<boolean>>;
    refreshConnections: () => Promise<void>;
}

export const UserConnectionContext = createContext<UserConnectionsContextType | undefined>(
    undefined
);

export const UserConnectionContextProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [connectStatus, setconnectStatus] = useState(false);
    const [connections, setConnections] = useState<ConnectionData[]>([]);
    const [suggestionData, setsuggestionData] = useState<SuggestionData[]>([]);
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [isLoadingConnections, setIsLoadingConnections] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
    const [connectingUserId, setConnectingUserId] = useState<string | null>(null);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const tRef = useRef(t);
    tRef.current = t;

    const refreshConnections = useCallback(async () => {
        if (!currentUser) return;
        const response = await API.getUserConnections(currentUser);
        if (!Array.isArray(response)) {
            throw new Error(tRef.current('social.context.invalidConnections'));
        }
        setConnections(
            response.map((connection: ConnectionData) => ({
                ...connection,
                userId: String(connection.userId),
            })),
        );
    }, [currentUser]);

    useEffect(() => {
        if (!isAuthenticated) {
            setCurrentUser(null);
            setConnections([]);
            setsuggestionData([]);
            setIsLoadingConnections(false);
            setIsLoadingSuggestions(false);
            setConnectionError(null);
            setSuggestionsError(null);
            return;
        }

        let active = true;
        setIsLoadingConnections(true);
        setIsLoadingSuggestions(true);
        setConnectionError(null);
        setSuggestionsError(null);

        const loadNetwork = async () => {
            let userId: string;
            try {
                const user = await API.getCurrentUser();
                if (!user?.userId) {
                    throw new Error(tRef.current('social.context.accountUnidentified'));
                }
                userId = String(user.userId);
                if (active) setCurrentUser(userId);
            } catch {
                if (active) {
                    setConnectionError(tRef.current('social.context.signInConnections'));
                    setSuggestionsError(tRef.current('social.context.signInPeople'));
                    setIsLoadingConnections(false);
                    setIsLoadingSuggestions(false);
                }
                return;
            }

            const [connectionResult, suggestionResult] = await Promise.allSettled([
                API.getUserConnections(userId),
                API.getUserSuggestions(),
            ]);

            if (!active) return;
            if (
                connectionResult.status === 'fulfilled' &&
                Array.isArray(connectionResult.value)
            ) {
                setConnections(
                    connectionResult.value.map((connection: ConnectionData) => ({
                        ...connection,
                        userId: String(connection.userId),
                    })),
                );
            } else {
                console.error(
                    'Failed to load connections:',
                    connectionResult.status === 'rejected'
                        ? connectionResult.reason
                        : 'Invalid connections response',
                );
                setConnectionError(
                    tRef.current('social.context.connectionsLoadError'),
                );
            }

            if (suggestionResult.status === 'fulfilled') {
                const recommendations = suggestionResult.value?.UserRecommendations;
                if (Array.isArray(recommendations)) {
                    setsuggestionData(
                        recommendations.map((person: SuggestionData) => ({
                            ...person,
                            userId: String(person.userId),
                        })),
                    );
                } else {
                    console.error(
                        'Invalid people recommendations response:',
                        suggestionResult.value,
                    );
                    setSuggestionsError(
                        tRef.current('social.context.peopleUnavailable'),
                    );
                }
            } else {
                console.error(
                    'Failed to load people recommendations:',
                    suggestionResult.reason,
                );
                setSuggestionsError(
                    tRef.current('social.context.peopleUnavailable'),
                );
            }
            setIsLoadingConnections(false);
            setIsLoadingSuggestions(false);
        };

        void loadNetwork();
        return () => {
            active = false;
        };
    }, [isAuthenticated]);

    const handleConnect = useCallback(async (targetUserId: string) => {
        if (!currentUser) {
            navigate('/login');
            return false;
        }

        setConnectingUserId(targetUserId);
        setConnectionError(null);
        try {
            const response = await API.connectToUser(targetUserId);
            if (response?.success !== true) {
                throw new Error(tRef.current('social.context.connectNotConfirmed'));
            }
            setconnectStatus(true);
            const recommendation = suggestionData.find(
                (person) => person.userId === String(targetUserId),
            );
            if (recommendation) {
                const [firstName = tRef.current('social.context.newFirstName'), ...lastNameParts] = recommendation.author.split(' ');
                setConnections((previous) => {
                    if (previous.some((connection) => connection.userId === String(targetUserId))) {
                        return previous;
                    }
                    return [
                        ...previous,
                        {
                            userId: String(targetUserId),
                            publicId: recommendation.publicId,
                            firstName,
                            lastName: lastNameParts.join(' '),
                            career: recommendation.career || '',
                            profileImageUrl: recommendation.profileImageUrl || '',
                        },
                    ];
                });
            }
            setsuggestionData((previous) =>
                previous.filter((person) => person.userId !== String(targetUserId)),
            );
            try {
                await refreshConnections();
            } catch (refreshError) {
                console.error('Connection was created but refresh failed:', refreshError);
                setConnectionError(
                    tRef.current('social.context.refreshFailed'),
                );
            }
            return true;
        } catch (error) {
            console.error('Failed to connect to user:', error);
            setConnectionError(
                error instanceof Error
                    ? error.message
                    : tRef.current('social.context.connectFailed'),
            );
            return false;
        } finally {
            setConnectingUserId(null);
        }
    }, [currentUser, navigate, refreshConnections, setconnectStatus, suggestionData]);

    const handleDisconnect = useCallback(async (targetUserId: string) => {
        if (!currentUser) {
            navigate('/login');
            return false;
        }

        setConnectionError(null);
        try {
            const response = await API.disconnecttoUser(targetUserId, currentUser);
            if (response?.success !== true) {
                throw new Error(tRef.current('social.context.removeNotConfirmed'));
            }
            setConnections((previous) =>
                previous.filter(
                    (connection) => connection.userId !== String(targetUserId),
                ),
            );
            setconnectStatus(false);
            return true;
        } catch (error) {
            console.error('Failed to disconnect from user:', error);
            setConnectionError(
                error instanceof Error
                    ? error.message
                    : tRef.current('social.context.removeFailed'),
            );
            return false;
        }
    }, [currentUser, navigate, setconnectStatus]);

    const handleBlockUser = useCallback(async (targetUserId: string) => {
        if (!currentUser) {
            navigate('/login');
            return false;
        }

        setConnectionError(null);
        try {
            const response = await API.blockUser(Number(targetUserId));
            if (response?.success !== true) {
                throw new Error(tRef.current('social.context.blockNotConfirmed'));
            }
            setConnections((previous) =>
                previous.filter(
                    (connection) => connection.userId !== String(targetUserId),
                ),
            );
            setsuggestionData((previous) =>
                previous.filter((person) => person.userId !== String(targetUserId)),
            );
            setconnectStatus(false);
            return true;
        } catch (error) {
            console.error('Failed to block user:', error);
            setConnectionError(
                error instanceof Error
                    ? error.message
                    : tRef.current('social.context.blockFailed'),
            );
            return false;
        }
    }, [currentUser, navigate, setconnectStatus]);

    const value = useMemo(() => ({
        connections,
        currentUser,
        suggestionData,
        handleConnect,
        handleDisconnect,
        handleBlockUser,
        setConnections,
        connectStatus,
        setconnectStatus,
        isLoadingConnections,
        isLoadingSuggestions,
        connectionError,
        suggestionsError,
        connectingUserId,
        refreshConnections,
    }), [
        connections,
        currentUser,
        suggestionData,
        handleConnect,
        handleDisconnect,
        handleBlockUser,
        connectStatus,
        isLoadingConnections,
        isLoadingSuggestions,
        connectionError,
        suggestionsError,
        connectingUserId,
        refreshConnections,
    ]);

    return (
        <UserConnectionContext.Provider value={value}>
            {children}
        </UserConnectionContext.Provider>
    );
};

export const useUserConnections = () => {
    const context = React.useContext(UserConnectionContext);
    if (context === undefined) {
        throw new Error(
            'useUserConnections must be used within a UserConnectionsContextProvider',
        );
    }
    return context;
};