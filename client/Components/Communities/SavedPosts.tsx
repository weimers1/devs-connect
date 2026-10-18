import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../Layout';
import API from '../../Service/service';
import { useLanguage } from '../../src/i18n/LanguageContext';
import PostCard from './PostTypes';
import type { Post } from './PostTypes';

const SavedPosts: React.FC = () => {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadSavedPosts = useCallback(async () => {
        try {
            setError(false);
            setPosts(await API.getSavedPosts());
        } catch (loadError) {
            console.error('Failed to load saved posts:', loadError);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSavedPosts();
    }, [loadSavedPosts]);

    return (
        <Layout>
            <section className="mx-auto mt-16 max-w-3xl px-4 py-8">
                <h1 className="mb-6 text-2xl font-bold text-gray-900">{t('communities.saved.title')}</h1>
                {loading ? (
                    <p className="py-8 text-center text-gray-500">{t('communities.saved.loading')}</p>
                ) : error ? (
                    <p className="rounded-lg border border-red-200 bg-white p-6 text-center text-red-600" role="alert">
                        {t('communities.saved.loadError')}
                    </p>
                ) : posts.length ? (
                    <div className="space-y-5">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onPostUpdate={loadSavedPosts}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                        <p className="text-gray-600">{t('communities.saved.empty')}</p>
                        <p className="mt-2 text-sm text-gray-500">
                            {t('communities.saved.emptyHint')}
                        </p>
                    </div>
                )}
            </section>
        </Layout>
    );
};

export default SavedPosts;
