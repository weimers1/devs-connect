import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import type { MessagesContentProps } from './types';
import { useLanguage } from '../../src/i18n/LanguageContext';

const formatTime = (date: Date, locale: string) => {
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
};

const formatDay = (
    date: Date,
    locale: string,
    labels: { today: string; yesterday: string },
) => {
    if (Number.isNaN(date.getTime())) return '';
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return labels.today;
    if (date.toDateString() === yesterday.toDateString()) return labels.yesterday;
    return date.toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
    });
};

const MessagesContent: React.FC<MessagesContentProps> = ({
    selectedMessage,
    onBackToList,
    messages = [],
    onSendMessage,
    onTyping,
    isTyping = false,
    isLoading = false,
    error = null,
    onStartConversation,
    className = '',
}) => {
    const { t, language } = useLanguage();
    const locale = language === 'es' ? 'es-ES' : 'en-US';
    const [newMessage, setNewMessage] = useState('');
    const [sendError, setSendError] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setNewMessage('');
        setSendError('');
    }, [selectedMessage?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
    }, [messages.length, isTyping]);

    const handleSendMessage = useCallback(async () => {
        const content = newMessage.trim();
        if (!content || !selectedMessage || !onSendMessage || isSending) return;
        setIsSending(true);
        setSendError('');
        try {
            await onSendMessage(content);
            onTyping?.(false);
            setNewMessage('');
            if (inputRef.current) inputRef.current.style.height = 'auto';
            inputRef.current?.focus();
        } catch (sendFailure) {
            setSendError(
                sendFailure instanceof Error
                    ? sendFailure.message
                    : t('social.messages.sendFailed'),
            );
        } finally {
            setIsSending(false);
        }
    }, [isSending, newMessage, onSendMessage, selectedMessage, t]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSendMessage();
            }
        },
        [handleSendMessage],
    );

    if (!selectedMessage) {
        return (
            <section className={`flex flex-1 items-center justify-center bg-slate-50 px-6 ${className}`}>
                <div className="max-w-sm text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                        <Icon icon="mdi:message-text-outline" className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                        {t('social.messages.emptyTitle')}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {t('social.messages.emptyDesc')}
                    </p>
                    <button
                        type="button"
                        onClick={onStartConversation}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Icon icon="mdi:account-search-outline" className="h-5 w-5" />
                        {t('social.messages.findPeople')}
                    </button>
                </div>
            </section>
        );
    }

    const initials = selectedMessage.name
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <section className={`flex min-h-0 min-w-0 flex-1 flex-col bg-slate-50 ${className}`}>
            <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
                <button
                    type="button"
                    onClick={onBackToList}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                    aria-label={t('social.messages.backToConversations')}
                >
                    <Icon icon="mdi:arrow-left" className="h-5 w-5" />
                </button>
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
                    {selectedMessage.avatar ? (
                        <img
                            src={selectedMessage.avatar}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                    {selectedMessage.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold text-slate-900">
                        {selectedMessage.name}
                    </h2>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <span className={`h-1.5 w-1.5 rounded-full ${selectedMessage.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {selectedMessage.isOnline ? t('social.messages.activeNow') : t('social.messages.directConversation')}
                    </p>
                </div>
                <div className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                    <Icon icon="mdi:lock-outline" className="h-4 w-4" />
                    {t('social.messages.private')}                </div>
            </header>

            {error && !sendError && (
                <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:mx-6" role="alert">
                    {error}
                </div>
            )}

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-6">
                {isLoading ? (
                    <div className="space-y-5" role="status" aria-label={t('social.messages.loadingMessages')}>
                        <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-white shadow-sm" />
                        <div className="ml-auto h-16 w-3/4 animate-pulse rounded-2xl bg-blue-100" />
                        <div className="h-14 w-1/2 animate-pulse rounded-2xl bg-white shadow-sm" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full min-h-56 flex-col items-center justify-center text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                            <Icon icon="mdi:hand-wave-outline" className="h-6 w-6" />
                        </div>
                        <p className="font-medium text-slate-800">                        {t('social.messages.sayHello', { name: selectedMessage.name.split(' ')[0] })}</p>
                                                <p className="mt-1 text-sm text-slate-500">{t('social.messages.startOfConversation')}</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center">
                            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
                                {formatDay(messages[0].timestamp, locale, { today: t('social.messages.today'), yesterday: t('social.messages.yesterday') })}
                            </span>
                        </div>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[72%] ${
                                    message.isOwn
                                        ? 'rounded-br-md bg-blue-600 text-white'
                                        : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                                }`}>
                                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                        {message.content}
                                    </p>
                                    <div className={`mt-1 flex items-center justify-end gap-1.5 ${
                                        message.isOwn ? 'text-blue-100' : 'text-slate-400'
                                    }`}>
                                        <span className="text-[10px]">{formatTime(message.timestamp, locale)}</span>
                                        {message.isOwn && (
                                            <Icon
                                                icon={message.status === 'read' ? 'mdi:check-all' : 'mdi:check'}
                                                className="h-3.5 w-3.5"
                                                aria-label={t(`social.messages.status.${message.status || 'sent'}`)}
                                            />
                                        )}
                                        {message.status === 'failed' && (
                                            <span className="text-[10px] font-medium text-red-600">{t('social.messages.notSent')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm" aria-label={t('social.messages.typing')}>
                            {[0, 1, 2].map((dot) => (
                                <span
                                    key={dot}
                                    className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                                    style={{ animationDelay: `${dot * 0.12}s` }}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
                {sendError && (
                    <p className="mb-2 text-xs text-red-600" role="alert">
                        {sendError}
                    </p>
                )}
                <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-500/10">
                    <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={(event) => {
                            setNewMessage(event.target.value);
                            onTyping?.(event.target.value.trim().length > 0);
                            event.currentTarget.style.height = 'auto';
                            event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 120)}px`;
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={t('social.messages.typeMessagePlaceholder')}
                        aria-label={t('social.messages.typeMessage')}
                        maxLength={1000}
                        rows={1}
                        className="max-h-[120px] min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-base leading-6 text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
                    />
                    <button
                        data-testid="send-button"
                        type="button"
                        onClick={() => void handleSendMessage()}
                        disabled={!newMessage.trim() || isSending}
                        aria-label={t('social.messages.sendMessage')}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                        <Icon icon={isSending ? 'mdi:loading' : 'mdi:send'} className={`h-5 w-5 ${isSending ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <p className="mt-2 hidden text-center text-[11px] text-slate-400 sm:block">
                    {t('social.messages.sendHint')}
                </p>
            </footer>
        </section>
    );
};

export default MessagesContent;
