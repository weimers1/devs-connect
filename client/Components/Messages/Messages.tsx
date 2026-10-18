import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../Layout';
import API from '../../Service/service';
import type { Message } from './types';
import MessageSidebar from './MessageSidebar';
import MessagesContent from './MessagesContent';
import { useChat, useMessages } from './hooks';
import { useLanguage } from '../../src/i18n/LanguageContext';

const Messages = () => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const targetUserId = searchParams.get('user');
    const navigate = useNavigate();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const {
        messages,
        isLoading,
        error,
        searchMessages,
        refreshMessages,
        setActiveChatUserId,
        socket: messagesSocket,
    } = useMessages();

    useEffect(() => {
        let active = true;
        void API.getCurrentUser()
            .then((user) => {
                if (active && user?.userId) setCurrentUserId(String(user.userId));
            })
            .catch((userError) => {
                console.error('Failed to identify the current user:', userError);
            });
        return () => {
            active = false;
        };
    }, []);

    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    useEffect(() => {
        if (!targetUserId || !currentUserId) return;
        const isUuid = UUID_PATTERN.test(targetUserId);
        // Old links used the numeric ID; they are upgraded to the UUID below.
        if (!isUuid && !/^\d+$/.test(targetUserId)) return;

        const matchesTarget = (message: Message) =>
            isUuid
                ? message.publicId?.toLowerCase() === targetUserId.toLowerCase()
                : message.userId === targetUserId;
        const setUrlUser = (publicId?: string) =>
            setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (publicId) next.set('user', publicId);
                else next.delete('user');
                return next;
            }, { replace: true });

        if (selectedMessage && matchesTarget(selectedMessage)) return;

        const existingConversation = messages.find(matchesTarget);
        if (existingConversation) {
            if (existingConversation.userId === currentUserId) {
                setUrlUser();
                return;
            }
            setSelectedMessage(existingConversation);
            if (!isUuid) setUrlUser(existingConversation.publicId);
            return;
        }

        let active = true;
        const createConversation = async () => {
            try {
                const profile = isUuid
                    ? await API.getUserProfile(targetUserId)
                    : await API.getUserProfileByInternalId(targetUserId);
                if (!active) return;
                const otherUserId = isUuid ? String(profile.id) : targetUserId;
                if (!profile.publicId || otherUserId === currentUserId) {
                    setUrlUser();
                    return;
                }
                const conversationId = [Number(currentUserId), Number(otherUserId)]
                    .sort((a, b) => a - b)
                    .join('-');
                setSelectedMessage({
                    id: conversationId,
                    userId: otherUserId,
                    publicId: profile.publicId,
                    name: `${profile.firstName} ${profile.lastName}`.trim(),
                    lastMessage: '',
                    timestamp: new Date(),
                    avatar: profile.pfp || '',
                });
                if (!isUuid) setUrlUser(profile.publicId);
            } catch (profileError) {
                console.error('Failed to load conversation profile:', profileError);
                if (active) setUrlUser();
            }
        };
        void createConversation();
        return () => {
            active = false;
        };
    }, [
        currentUserId,
        messages,
        selectedMessage,
        setSearchParams,
        targetUserId,
    ]);

    const selectedUserId = useMemo(
        () => selectedMessage?.userId || null,
        [selectedMessage],
    );
    const {
        chatMessages,
        sendMessage,
        isLoading: isChatLoading,
        error: chatError,
        isOtherTyping,
        notifyTyping,
    } = useChat(selectedUserId, messagesSocket);

    useEffect(() => {
        setActiveChatUserId(selectedUserId);
        return () => setActiveChatUserId(null);
    }, [selectedUserId, setActiveChatUserId]);

    useEffect(() => {
        if (!messagesSocket) return;
        const handleUserBlocked = (payload: { userId?: number | string }) => {
            if (!payload?.userId || String(payload.userId) !== selectedUserId) return;
            setSelectedMessage(null);
            setSearchParams((current) => {
                const next = new URLSearchParams(current);
                next.delete('user');
                return next;
            }, { replace: true });
        };
        messagesSocket.on('user-blocked', handleUserBlocked);
        return () => {
            messagesSocket.off('user-blocked', handleUserBlocked);
        };
    }, [messagesSocket, selectedUserId, setSearchParams]);

    const handleMessageSelect = useCallback((message: Message) => {
        setSelectedMessage(message);
        if (message.publicId) {
            setSearchParams({ user: message.publicId });
        }
    }, [setSearchParams]);

    const handleBackToList = useCallback(() => {
        setSelectedMessage(null);
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.delete('user');
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const handleSendMessage = useCallback(
        async (content: string) => {
            await sendMessage(content);
            await refreshMessages();
        },
        [refreshMessages, sendMessage],
    );
    const startConversation = useCallback(
        () => navigate('/connections'),
        [navigate],
    );

    return (
        <Layout>
            <main className="mx-auto w-full min-w-0 max-w-7xl px-2 py-3 sm:px-5 sm:py-4 lg:px-8">
                <div className="mb-3 flex items-end justify-between gap-4 sm:mb-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                            {t('social.messages.brand')}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {t('social.messages.yourMessages')}
                        </h1>
                        <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                            {t('social.messages.subtitle')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => void refreshMessages()}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <span className={isLoading ? 'animate-spin' : ''} aria-hidden="true">↻</span>
                        <span className="hidden sm:inline">{t('social.messages.refresh')}</span>
                    </button>
                </div>
                <div className="flex h-[calc(100dvh-11rem)] min-h-[22rem] min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 sm:h-[calc(100dvh-10rem)] sm:min-h-[28rem] sm:rounded-2xl">
                    <MessageSidebar
                        onMessageSelect={handleMessageSelect}
                        selectedMessage={selectedMessage}
                        onSearch={searchMessages}
                        onRefresh={() => void refreshMessages()}
                        onStartConversation={startConversation}
                        messages={messages}
                        isLoading={isLoading}
                        error={error}
                        className={`${selectedMessage ? 'hidden lg:flex' : 'flex'} min-w-0 border-r border-slate-200`}
                    />
                    <MessagesContent
                        selectedMessage={selectedMessage}
                        onBackToList={handleBackToList}
                        messages={chatMessages}
                        onSendMessage={handleSendMessage}
                        isTyping={isOtherTyping}
                        onTyping={notifyTyping}
                        isLoading={isChatLoading}
                        error={chatError}
                        onStartConversation={startConversation}
                        className={`${selectedMessage ? 'flex' : 'hidden lg:flex'} min-w-0 flex-1`}
                    />
                </div>
            </main>
        </Layout>
    );
};

export default Messages;
