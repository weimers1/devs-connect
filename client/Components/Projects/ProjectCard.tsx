import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useLanguage } from '../../src/i18n/LanguageContext';

export interface ProjectPerson {
    publicId: string;
    firstName: string;
    lastName: string;
    pfp: string;
}

export interface Project {
    id: number;
    title: string;
    description: string;
    githubUrl: string;
    demoUrl: string;
    tags: string[];
    status: string;
    createdAt: string;
    isOwner: boolean;
    owner: ProjectPerson | null;
    community: { id: string; name: string } | null;
    collaborators: ProjectPerson[];
}

const statusStyles: Record<string, string> = {
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    looking_for_contributors: 'bg-blue-50 text-blue-700 border-blue-200',
};

interface ProjectCardProps {
    project: Project;
    onEdit?: (project: Project) => void;
    onDelete?: (project: Project) => void;
    showFeedBadge?: boolean;
    hideCommunity?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, showFeedBadge, hideCommunity }) => {
    const { t, language } = useLanguage();

    const formattedDate = new Date(project.createdAt).toLocaleDateString(
        language === 'es' ? 'es-ES' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' }
    );

    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    {showFeedBadge && (
                        <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                            <Icon icon="mdi:rocket-launch-outline" className="h-3.5 w-3.5" />
                            {t('projects.feedBadge')}
                        </span>
                    )}
                    <h2 className="break-words text-xl font-semibold text-gray-900">{project.title}</h2>
                    {project.owner && (
                        <p className="mt-1 text-sm text-gray-500">
                            {t('projects.by')}{' '}
                            <Link
                                to={`/profile/${project.owner.publicId}`}
                                className="font-medium text-blue-700 hover:underline"
                            >
                                {project.owner.firstName} {project.owner.lastName}
                            </Link>{' '}
                            · {formattedDate}
                        </p>
                    )}
                </div>
                <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        statusStyles[project.status] || 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                >
                    {t(`projects.status.${project.status}`)}
                </span>
            </div>

            <p className="mt-3 whitespace-pre-wrap break-words text-gray-700">{project.description}</p>

            {project.community && !hideCommunity && (
                <p className="mt-3">
                    <Link
                        to={`/community/${project.community.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-100"
                    >
                        <Icon icon="mdi:account-group" className="h-4 w-4" />
                        {t('projects.inCommunity', { name: project.community.name })}
                    </Link>
                </p>
            )}
            {project.collaborators.length > 0 && (
                <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
                    <span>{t('projects.with')}</span>
                    {project.collaborators.map((person) => (
                        <Link
                            key={person.publicId}
                            to={`/profile/${person.publicId}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-0.5 pl-0.5 pr-2.5 font-medium text-blue-700 hover:bg-gray-200"
                        >
                            {person.pfp ? (
                                <img src={person.pfp} alt="" className="h-5 w-5 rounded-full object-cover" />
                            ) : (
                                <Icon icon="mdi:account-circle" className="h-5 w-5 text-gray-400" />
                            )}
                            {person.firstName} {person.lastName}
                        </Link>
                    ))}
                </p>
            )}

            {project.tags.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                        <li key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                            {tag}
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
                {project.githubUrl && (
                    <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                    >
                        <Icon icon="mdi:github" className="h-4 w-4" />
                        {t('projects.viewOnGithub')}
                    </a>
                )}
                {project.demoUrl && (
                    <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                        <Icon icon="mdi:open-in-new" className="h-4 w-4" />
                        {t('projects.liveDemo')}
                    </a>
                )}
                {project.isOwner && onEdit && onDelete && (
                    <div className="ml-auto flex gap-2">
                        <button
                            type="button"
                            onClick={() => onEdit(project)}
                            className="rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
                        >
                            {t('projects.edit')}
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(project)}
                            className="rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                        >
                            {t('projects.delete')}
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
};

export default ProjectCard;
