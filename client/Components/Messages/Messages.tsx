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

    useEffect(() => {
        if (!targetUserId || !/^\d+$/.test(targetUserId) || !currentUserId) return;
        if (targetUserId === currentUserId) {
            setSearchParams((current) => {
                const next = new URLSearchParams(current);
                next.delete('user');
                return next;
            }, { replace: true });
            return;
        }
        if (selectedMessage?.userId === targetUserId) return;

        const existingConversation = messages.find(
            (message) => message.userId === targetUserId,
        );
        if (existingConversation) {
            setSelectedMessage(existingConversation);
            return;
        }

        let active = true;
        const createConversation = async () => {
            try {
                const profile = await API.getUserProfileByInternalId(targetUserId);
                if (!active) return;
                const conversationId = [Number(currentUserId), Number(targetUserId)]
                    .sort((a, b) => a - b)
                    .join('-');
                setSelectedMessage({
                    id: conversationId,
                    userId: targetUserId,
                    name: `${profile.firstName} ${profile.lastName}`.trim(),
                    lastMessage: '',
                    timestamp: new Date(),
                    avatar: profile.pfp || '',
                });
            } catch (profileError) {
                console.error('Failed to load conversation profile:', profileError);
                if (!active) return;
                setSelectedMessage({
                    id: [Number(currentUserId), Number(targetUserId)]
                        .sort((a, b) => a - b)
                        .join('-'),
                    userId: targetUserId,
                    name: t('social.messages.newConversation'),
                    lastMessage: '',
                    timestamp: new Date(),
                    avatar: '',
                });
            }
        };
        void createConversation();
        return () => {
            active = false;
        };
    }, [
        currentUserId,
        messages,
        selectedMessage?.userId,
        setSearchParams,
        t,
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
    } = useChat(selectedUserId, messagesSocket);

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
        if (message.userId) {
            setSearchParams({ user: message.userId });
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
