import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router-dom';
import API from '../../Service/service';
import { useLanguage } from '../../src/i18n/LanguageContext';


export interface Community {
    id: string;
    name:  string;
    description?: string;
    memberCount: number;
    image?: string;
    color?: string;
    icon?: string;
    isPrivate: boolean;
}

const CommunityExplore = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<'load' | 'loadMore' | null>(null);
    const loadMoreInProgress = useRef(false);
    const loadMoreController = useRef<AbortController | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        loadMoreController.current?.abort();
        loadMoreController.current = null;
        loadMoreInProgress.current = false;
        setLoadingMore(false);
        setHasMore(false);
        setPage(1);
        setSearch(e.target.value);
    };

    useEffect(() => {
        const controller = new AbortController();
        const timeout = window.setTimeout(async () => {
            setLoading(true);
            setError(null);
            setPage(1);
            try {
                const result = await API.getCommunityPage({
                    page: 1,
                    search: search.trim(),
                    signal: controller.signal,
                });
                setCommunities(result.communities);
                setHasMore(result.hasMore);
                setTotal(result.total);
            } catch (fetchError) {
                if (controller.signal.aborted) return;
                console.error('Failed to fetch communities:', fetchError);
                setError('load');
                setCommunities([]);
                setHasMore(false);
                setTotal(0);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 250);

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
            loadMoreController.current?.abort();
            loadMoreController.current = null;
            loadMoreInProgress.current = false;
        };
    }, [search]);

    const handleLoadMore = async () => {
        if (loadMoreInProgress.current || !hasMore) return;
        loadMoreInProgress.current = true;
        const controller = new AbortController();
        loadMoreController.current = controller;
        setLoadingMore(true);
        setError(null);
        try {
            const nextPage = page + 1;
            const result = await API.getCommunityPage({
                page: nextPage,
                search: search.trim(),
                signal: controller.signal,
            });
            setCommunities((current) => [...current, ...result.communities]);
            setPage(nextPage);
            setHasMore(result.hasMore);
            setTotal(result.total);
        } catch (fetchError) {
            if (controller.signal.aborted) return;
            console.error('Failed to load more communities:', fetchError);
            setError('loadMore');
        } finally {
            if (loadMoreController.current === controller) {
                loadMoreController.current = null;
                loadMoreInProgress.current = false;
                setLoadingMore(false);
            }
        }
    };

    const errorMessage = error === 'load' ? t('communities.explore.loadError') : error === 'loadMore' ? t('communities.explore.loadMoreError') : '';
    const handleCommunityClick = (communityId: string) => {
        navigate(`/community/${communityId}`);
    };
    return (
        <div className="py-6">
            {/* Modern Header */}
            <div className="mb-8 lg:mb-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                    <Icon
                        icon="mdi:compass"
                        className="w-8 h-8 text-white"
                    />
                </div>
                <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                    {t('communities.explore.title')}
                </h1>
                <p className="text-gray-600 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                    {t('communities.explore.subtitle')}
                </p>
            </div>

            {/* Modern Search Bar */}
            <div className="mb-8 lg:mb-12 relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Icon
                        icon="mdi:magnify"
                        className="w-6 h-6 text-gray-400"
                    />
                </div>
                <input
                    onChange={handleChange}
                    type="text"
                    placeholder={t('communities.explore.searchPlaceholder')}
                    className="w-full pl-14 pr-6 py-4 lg:py-5 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 text-base lg:text-lg placeholder-gray-400"
                />
                <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Section Header */}
            <div className="mb-8 lg:mb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                            {t('communities.explore.sectionTitle')}
                        </h2>
                        <p className="text-gray-600">
                            {t('communities.explore.sectionSubtitle')}
                        </p>
                    </div>
                    {/* <div className="hidden lg:flex items-center space-x-4">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Filter
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Sort by
                        </button>
                    </div> */}
                </div>
            </div>

            {/*  Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <Icon icon="mdi:loading" className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                        <p className="text-gray-600">{t('communities.explore.loading')}</p>
                    </div>
                ) : error ? (
                    <div className="col-span-full text-center py-12" role="alert">
                        <p className="text-red-600">{errorMessage}</p>
                    </div>
                ) : communities.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Icon icon="mdi:account-group-outline" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">{t('communities.explore.empty')}</p>
                    </div>
                ) : communities.map((community) => (
                    <div
                        key={community.id}
                        onClick={() => handleCommunityClick(community.id)}
                        className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-blue-300 hover:-translate-y-3 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleCommunityClick(community.id);
                            }
                        }}
                        role="button"
                        aria-label={t('communities.explore.navigateTo', { name: community.name })}
                    >
                        {/* Enhanced Image Header */}
                        <div
                            className={`h-48 ${community.color || 'bg-gradient-to-r from-blue-400 to-cyan-500'} relative overflow-hidden`}
                            style={community.image ? {
                                backgroundImage: `url(${community.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            } : {}}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

                            {/* Large Topic Icon */}
                            {!community.image && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
                                    <Icon
                                        icon={community.icon || 'mdi:account-group'}
                                        className="w-24 h-24 text-white"
                                    />
                                </div>
                            )}

                            {/* Community Title with Icon */}
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3">
                                        <Icon
                                            icon={community.icon || 'mdi:account-group'}
                                            className="w-5 h-5 text-white"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-xl leading-tight drop-shadow-lg">
                                            {community.name}
                                        </h3>
                                        <p className="text-white/90 text-sm font-medium">
                                            {t('communities.explore.members', { count: community.memberCount })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Content */}
                        <div className="p-6">
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                {community.description || t('communities.explore.defaultDescription')}
                            </p>

                            {/* Enhanced Stats */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center text-gray-600 text-sm font-medium">
                                        <Icon
                                            icon="mdi:account-group"
                                            className="w-4 h-4 mr-1.5 text-blue-500"
                                        />
                                        {community.memberCount}
                                    </span>
                                </div>
                            </div>

                            {/* Enhanced Join Button */}
                         
                        </div>
                    </div>
                ))}
            </div>

            {error && !loading && communities.length > 0 && (
                <p className="mt-4 text-center text-red-600" role="alert">{errorMessage}</p>
            )}
            {hasMore && (
                <div className="mt-12 lg:mt-16 text-center">
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 rounded-2xl transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl border border-gray-200 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Icon
                            icon={loadingMore ? 'mdi:loading' : 'mdi:chevron-down'}
                            className={`w-5 h-5 mr-2 ${loadingMore ? 'animate-spin' : ''}`}
                        />
                        {loadingMore ? t('communities.explore.loadingMore') : t('communities.explore.loadMore')}
                    </button>
                    <p className="text-gray-500 text-sm mt-4">
                        {t('communities.explore.showing', { shown: communities.length, total })}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CommunityExplore;
