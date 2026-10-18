import React, { useCallback, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import type { MessageSidebarProps, Message } from './types';
import { useLanguage } from '../../src/i18n/LanguageContext';

const formatConversationTime = (timestamp: Date, locale: string) => {
    if (Number.isNaN(timestamp.getTime())) return '';
    const sameDay = timestamp.toDateString() === new Date().toDateString();
    return sameDay
        ? timestamp.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
        : timestamp.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
};

const MessageSidebar: React.FC<MessageSidebarProps> = ({
    onMessageSelect,
    selectedMessage,
    onSearch,
    onRefresh,
    onStartConversation,
    className = '',
    messages = [],
    isLoading = false,
    error = null,
}) => {
    const { t, language } = useLanguage();
    const locale = language === 'es' ? 'es-ES' : 'en-US';
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const query = event.target.value;
            setSearchQuery(query);
            onSearch?.(query);
        },
        [onSearch],
    );

    const handleMessageClick = useCallback(
        (message: Message) => {
            onMessageSelect(message);
        },
        [onMessageSelect],
    );

    return (
        <aside className={`flex min-h-0 w-full min-w-0 flex-col bg-white lg:w-[21rem] lg:shrink-0 ${className}`}>
            <div className="border-b border-slate-200 px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                            {t('social.messages.yourInbox')}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            {t('social.messages.title')}
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={onStartConversation}
                        aria-label={t('social.messages.findPeopleToMessage')}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Icon icon="mdi:account-plus-outline" className="h-5 w-5" />
                    </button>
                </div>

                <label className="relative block">
                    <span className="sr-only">{t('social.messages.searchConversations')}</span>
                    <Icon
                        icon="mdi:magnify"
                        className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder={t('social.messages.searchConversations')}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3">
                {isLoading ? (
                    <div className="space-y-2 p-2" role="status" aria-label={t('social.messages.loadingConversations')}>
                        {[0, 1, 2, 3].map((item) => (
                            <div key={item} className="flex animate-pulse items-center gap-3 rounded-xl p-3">
                                <div className="h-12 w-12 rounded-full bg-slate-200" />
                                <div className="flex-1">
                                    <div className="mb-2 h-3 w-2/3 rounded bg-slate-200" />
                                    <div className="h-3 w-full rounded bg-slate-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="m-2 rounded-xl border border-red-100 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">
                            {t('social.messages.loadError')}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
                        <button
                            type="button"
                            onClick={onRefresh}
                            className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-2"
                        >
                            {t('social.messages.tryAgain')}
                        </button>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <Icon icon="mdi:message-text-outline" className="h-7 w-7" />
                        </div>
                        <h2 className="font-semibold text-slate-900">
                            {searchQuery ? t('social.messages.noMatches') : t('social.messages.startConversation')}
                        </h2>
                        <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
                            {searchQuery
                                ? t('social.messages.tryAnother')
                                : t('social.messages.startConversationDesc')}
                        </p>
                        {!searchQuery && (
                            <button
                                type="button"
                                onClick={onStartConversation}
                                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {t('social.messages.findPeople')}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {messages.map((message) => (
                            <button
                                key={message.id}
                                type="button"
                                onClick={() => handleMessageClick(message)}
                                aria-current={selectedMessage?.id === message.id ? 'true' : undefined}
                                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                    selectedMessage?.id === message.id
                                        ? 'bg-blue-50 ring-1 ring-blue-100'
                                        : 'hover:bg-slate-50'
                                }`}
                            >
                                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
                                    {message.avatar ? (
                                        <img
                                            src={message.avatar}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        message.name
                                            .split(/\s+/)
                                            .map((part) => part[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase()
                                    )}
                                    {message.isOnline && (
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                                    )}
                                </div>

                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="truncate text-sm font-semibold text-slate-900">
                                            {message.name}
                                        </span>
                                        <span className="shrink-0 text-[11px] text-slate-400">
                                            {formatConversationTime(message.timestamp, locale)}
                                        </span>
                                    </span>
                                    <span className="mt-1 flex items-center justify-between gap-2">
                                        <span className="truncate text-xs text-slate-500">
                                            {message.lastMessage}
                                        </span>
                                        {!!message.unreadCount && message.unreadCount > 0 && (
                                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
                                                {message.unreadCount}
                                            </span>
                                        )}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default MessageSidebar;
