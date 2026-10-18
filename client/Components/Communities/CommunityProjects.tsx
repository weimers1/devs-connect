import React, { useCallback, useEffect, useState } from 'react';
import API from '../../Service/service';
import { useLanguage } from '../../src/i18n/LanguageContext';
import ProjectCard from '../Projects/ProjectCard';
import type { Project } from '../Projects/ProjectCard';

interface CommunityProjectsProps {
    communityId: string;
}

const CommunityProjects: React.FC<CommunityProjectsProps> = ({ communityId }) => {
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
                const result = await API.getProjects({ community: communityId, page: pageToLoad });
                setProjects((current) =>
                    replace ? result.projects : [...current, ...result.projects]
                );
                setHasMore(!!result.hasMore);
                setPage(pageToLoad);
            } catch (loadError) {
                console.error('Failed to load community projects:', loadError);
                setError(true);
            } finally {
                setLoading(false);
            }
        },
        [communityId]
    );

    useEffect(() => {
        void load(1, true);
    }, [load]);

    if (error) {
        return (
            <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700" role="alert">
                {t('projects.community.loadError')}
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {!loading && projects.length === 0 && (
                <p className="py-10 text-center text-gray-500">{t('projects.community.empty')}</p>
            )}

            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} hideCommunity />
            ))}

            {loading && (
                <p className="py-4 text-center text-gray-500" role="status">
                    {t('common.loading')}
                </p>
            )}

            {hasMore && !loading && (
                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => void load(page + 1, false)}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        {t('projects.loadMore')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommunityProjects;
