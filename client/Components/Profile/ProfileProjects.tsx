import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../Service/service';
import { useLanguage } from '../../src/i18n/LanguageContext';
import ProjectCard from '../Projects/ProjectCard';
import type { Project } from '../Projects/ProjectCard';

interface ProfileProjectsProps {
    publicId: string;
    isOwnProfile: boolean;
}

const ProfileProjects: React.FC<ProfileProjectsProps> = ({ publicId, isOwnProfile }) => {
    const { t } = useLanguage();
    const [projects, setProjects] = useState<Project[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = useCallback(
        async (pageToLoad: number, replace: boolean) => {
            setLoading(true);
            setError(false);
            try {
                const result = await API.getProjects({ owner: publicId, page: pageToLoad });
                setProjects((current) =>
                    replace ? result.projects : [...current, ...result.projects]
                );
                setHasMore(!!result.hasMore);
                setPage(pageToLoad);
            } catch (loadError) {
                console.error('Failed to load profile projects:', loadError);
                setError(true);
            } finally {
                setLoading(false);
            }
        },
        [publicId]
    );

    useEffect(() => {
        if (!publicId) return;
        void load(1, true);
    }, [publicId, load]);

    return (
        <section className="mx-auto mb-2 mt-2 w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <h2 className="text-xl font-bold text-gray-800">{t('projects.title')}</h2>
                {isOwnProfile && (
                    <Link
                        to="/projects"
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        {t('profile.projects.manage')}
                    </Link>
                )}
            </div>

            <div className="space-y-4 p-4">
                {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                        {t('profile.projects.loadError')}
                    </p>
                )}

                {!loading && !error && projects.length === 0 && (
                    <p className="py-6 text-center text-gray-500">
                        {t(isOwnProfile ? 'profile.projects.emptyOwn' : 'profile.projects.empty')}
                    </p>
                )}

                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}

                {loading && (
                    <p className="py-2 text-center text-gray-500" role="status">
                        {t('common.loading')}
                    </p>
                )}

                {hasMore && !loading && (
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => void load(page + 1, false)}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            {t('projects.loadMore')}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProfileProjects;
