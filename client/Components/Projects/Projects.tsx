import React, { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Icon } from '@iconify/react';
import Layout from '../Layout';
import API from '../../Service/service';
import { useAuthRedirect } from '../Auth/useAuthRedirect';
import { useLanguage } from '../../src/i18n/LanguageContext';
import ProjectCard from './ProjectCard';
import type { Project, ProjectPerson } from './ProjectCard';

interface ProjectForm {
    title: string;
    description: string;
    githubUrl: string;
    demoUrl: string;
    tags: string;
    status: string;
    collaborators: ProjectPerson[];
    communityId: string;
}

interface UserSearchResult {
    publicId: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string | null;
}

const STATUSES = ['in_progress', 'completed', 'looking_for_contributors'];
const MAX_COLLABORATORS = 10;
const EMPTY_FORM: ProjectForm = {
    title: '',
    description: '',
    githubUrl: '',
    demoUrl: '',
    tags: '',
    status: 'in_progress',
    collaborators: [],
    communityId: '',
};
const GITHUB_REPO_PATTERN = /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\/?$/;

const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';

const Projects: React.FC = () => {
    const { t } = useLanguage();
    const { requireAuth } = useAuthRedirect();
    const [tab, setTab] = useState<'all' | 'mine'>('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [status, setStatus] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [actionError, setActionError] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);
    const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [tagQuery, setTagQuery] = useState('');
    const [tagResults, setTagResults] = useState<UserSearchResult[]>([]);
    const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        if (!formOpen) return;
        let active = true;
        API.getProjectCommunities()
            .then((list) => {
                if (active) setCommunities(Array.isArray(list) ? list : []);
            })
            .catch((error) => console.error('Failed to load communities:', error));
        return () => {
            active = false;
        };
    }, [formOpen]);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
        return () => window.clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const query = tagQuery.trim();
        if (!formOpen || query.length < 2) {
            setTagResults([]);
            return;
        }
        let active = true;
        const timer = window.setTimeout(async () => {
            try {
                const results = await API.searchUsers(query);
                if (active) setTagResults(Array.isArray(results) ? results : []);
            } catch (error) {
                console.error('Failed to search people:', error);
                if (active) setTagResults([]);
            }
        }, 250);
        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [tagQuery, formOpen]);

    const loadProjects = useCallback(
        async (pageToLoad: number, replace: boolean) => {
            setLoading(true);
            setLoadError(false);
            try {
                const result = await API.getProjects({
                    mine: tab === 'mine',
                    q: debouncedSearch,
                    status,
                    page: pageToLoad,
                });
                setProjects((current) =>
                    replace ? result.projects : [...current, ...result.projects]
                );
                setHasMore(!!result.hasMore);
                setPage(pageToLoad);
            } catch (error) {
                console.error('Failed to load projects:', error);
                setLoadError(true);
            } finally {
                setLoading(false);
            }
        },
        [tab, debouncedSearch, status]
    );

    useEffect(() => {
        void loadProjects(1, true);
    }, [loadProjects]);

    const openCreate = () => {
        if (!requireAuth()) return;
        setEditing(null);
        setForm(EMPTY_FORM);
        setFormError('');
        setTagQuery('');
        setFormOpen(true);
    };

    const openEdit = (project: Project) => {
        setEditing(project);
        setForm({
            title: project.title,
            description: project.description,
            githubUrl: project.githubUrl,
            demoUrl: project.demoUrl,
            tags: project.tags.join(', '),
            status: project.status,
            collaborators: project.collaborators,
            communityId: project.community?.id || '',
        });
        setFormError('');
        setTagQuery('');
        setFormOpen(true);
    };

    const closeForm = () => {
        if (saving) return;
        setFormOpen(false);
    };

    const addCollaborator = (person: UserSearchResult) => {
        setForm((current) => {
            if (
                current.collaborators.length >= MAX_COLLABORATORS ||
                current.collaborators.some((existing) => existing.publicId === person.publicId)
            ) {
                return current;
            }
            return {
                ...current,
                collaborators: [
                    ...current.collaborators,
                    {
                        publicId: person.publicId,
                        firstName: person.firstName,
                        lastName: person.lastName,
                        pfp: person.profileImageUrl || '',
                    },
                ],
            };
        });
        setTagQuery('');
        setTagResults([]);
    };

    const removeCollaborator = (publicId: string) =>
        setForm((current) => ({
            ...current,
            collaborators: current.collaborators.filter((person) => person.publicId !== publicId),
        }));

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const githubUrl = form.githubUrl.trim();
        if (githubUrl && !GITHUB_REPO_PATTERN.test(githubUrl)) {
            setFormError(t('projects.form.githubInvalid'));
            return;
        }
        setSaving(true);
        setFormError('');
        try {
            await API.saveProject(
                {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    githubUrl,
                    demoUrl: form.demoUrl.trim(),
                    tags: form.tags
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    status: form.status,
                    collaborators: form.collaborators.map((person) => person.publicId),
                    communityId: form.communityId || null,
                },
                editing?.id
            );
            setFormOpen(false);
            await loadProjects(1, true);
        } catch (error) {
            setFormError(
                error instanceof Error && error.message !== 'Failed to save project'
                    ? error.message
                    : t('projects.form.saveError')
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (project: Project) => {
        if (!window.confirm(t('projects.deleteConfirm', { title: project.title }))) return;
        setActionError('');
        try {
            await API.deleteProject(project.id);
            setProjects((current) => current.filter((item) => item.id !== project.id));
        } catch (error) {
            console.error('Failed to delete project:', error);
            setActionError(t('projects.deleteError'));
        }
    };

    const updateForm = (field: keyof Omit<ProjectForm, 'collaborators'>, value: string) =>
        setForm((current) => ({ ...current, [field]: value }));

    const selectableResults = tagResults.filter(
        (person) => !form.collaborators.some((existing) => existing.publicId === person.publicId)
    );

    return (
        <Layout>
            <main className="mx-auto mt-16 max-w-4xl px-4 py-10">
                <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-3">
                            <Icon icon="mdi:rocket-launch-outline" className="h-9 w-9" />
                            <h1 className="text-3xl font-bold">{t('projects.title')}</h1>
                        </div>
                        <p className="max-w-xl text-blue-100">{t('projects.subtitle')}</p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 font-medium text-blue-700 transition hover:bg-blue-50"
                    >
                        <Icon icon="mdi:plus" className="h-5 w-5" />
                        {t('projects.new')}
                    </button>
                </header>

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1" role="tablist">
                        {(['all', 'mine'] as const).map((value) => (
                            <button
                                key={value}
                                type="button"
                                role="tab"
                                aria-selected={tab === value}
                                onClick={() => setTab(value)}
                                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                                    tab === value
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {t(`projects.tab.${value}`)}
                            </button>
                        ))}
                    </div>
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t('projects.search')}
                        aria-label={t('projects.search')}
                        className={`${inputClass} bg-white sm:flex-1`}
                    />
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        aria-label={t('projects.form.status')}
                        className={`${inputClass} bg-white sm:w-56`}
                    >
                        <option value="">{t('projects.filter.allStatuses')}</option>
                        {STATUSES.map((value) => (
                            <option key={value} value={value}>
                                {t(`projects.status.${value}`)}
                            </option>
                        ))}
                    </select>
                </div>

                {actionError && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                        {actionError}
                    </p>
                )}

                {loadError && (
                    <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700" role="alert">
                        {t('projects.loadError')}
                    </p>
                )}

                {!loadError && !loading && projects.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                        <p className="text-lg font-medium text-gray-700">
                            {tab === 'mine' ? t('projects.emptyMine') : t('projects.empty')}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">{t('projects.emptyHint')}</p>
                    </div>
                )}

                <ul className="space-y-4">
                    {projects.map((project) => (
                        <li key={project.id}>
                            <ProjectCard
                                project={project}
                                onEdit={openEdit}
                                onDelete={(item) => void handleDelete(item)}
                            />
                        </li>
                    ))}
                </ul>

                {loading && (
                    <p className="py-6 text-center text-gray-500" role="status">
                        {t('common.loading')}
                    </p>
                )}

                {hasMore && !loading && (
                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => void loadProjects(page + 1, false)}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            {t('projects.loadMore')}
                        </button>
                    </div>
                )}

                {formOpen && (
                    <div
                        className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-24 sm:pt-28"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="project-form-title"
                    >
                        <form
                            onSubmit={handleSubmit}
                            className="mb-10 w-full max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-2xl"
                        >
                            <h2 id="project-form-title" className="text-xl font-semibold text-gray-900">
                                {editing ? t('projects.form.editTitle') : t('projects.form.createTitle')}
                            </h2>

                            {formError && (
                                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                                    {formError}
                                </p>
                            )}

                            <div>
                                <label htmlFor="project-title" className="mb-1 block text-sm font-medium text-gray-700">
                                    {t('projects.form.name')}
                                </label>
                                <input
                                    id="project-title"
                                    value={form.title}
                                    onChange={(event) => updateForm('title', event.target.value)}
                                    required
                                    minLength={3}
                                    maxLength={120}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="project-description" className="mb-1 block text-sm font-medium text-gray-700">
                                    {t('projects.form.description')}
                                </label>
                                <textarea
                                    id="project-description"
                                    value={form.description}
                                    onChange={(event) => updateForm('description', event.target.value)}
                                    required
                                    minLength={10}
                                    maxLength={5000}
                                    rows={6}
                                    placeholder={t('projects.form.descriptionPlaceholder')}
                                    className={`${inputClass} resize-y`}
                                />
                            </div>

                            <div>
                                <label htmlFor="project-github" className="mb-1 block text-sm font-medium text-gray-700">
                                    {t('projects.form.github')}
                                </label>
                                <input
                                    id="project-github"
                                    type="url"
                                    value={form.githubUrl}
                                    onChange={(event) => updateForm('githubUrl', event.target.value)}
                                    placeholder={t('projects.form.githubPlaceholder')}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="project-demo" className="mb-1 block text-sm font-medium text-gray-700">
                                    {t('projects.form.demo')}
                                </label>
                                <input
                                    id="project-demo"
                                    type="url"
                                    value={form.demoUrl}
                                    onChange={(event) => updateForm('demoUrl', event.target.value)}
                                    placeholder={t('projects.form.demoPlaceholder')}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="project-tags" className="mb-1 block text-sm font-medium text-gray-700">
                                    {t('projects.form.tags')}
                                </label>
                                <input
                                    id="project-tags"
                                    value={form.tags}
                                    onChange={(event) => updateForm('tags', event.target.value)}
                                    placeholder={t('projects.form.tagsPlaceholder')}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="project-people" className="mb-1 block text-sm font-medium text-gray-700">
                                    {t('projects.form.tagPeople')}
                                </label>
                                {form.collaborators.length > 0 && (
                                    <ul className="mb-2 flex flex-wrap gap-2">
                                        {form.collaborators.map((person) => {
                                            const name = `${person.firstName} ${person.lastName}`;
                                            return (
                                                <li
                                                    key={person.publicId}
                                                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 py-1 pl-3 pr-1 text-sm text-blue-800"
                                                >
                                                    {name}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCollaborator(person.publicId)}
                                                        aria-label={t('projects.form.removeTag', { name })}
                                                        className="rounded-full p-1 hover:bg-blue-100"
                                                    >
                                                        <Icon icon="mdi:close" className="h-4 w-4" />
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                                <input
                                    id="project-people"
                                    type="search"
                                    value={tagQuery}
                                    onChange={(event) => setTagQuery(event.target.value)}
                                    placeholder={t('projects.form.tagSearch')}
                                    disabled={form.collaborators.length >= MAX_COLLABORATORS}
                                    autoComplete="off"
                                    className={inputClass}
                                />
                                {selectableResults.length > 0 && (
                                    <ul className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
                                        {selectableResults.map((person) => (
                                            <li key={person.publicId}>
                                                <button
                                                    type="button"
                                                    onClick={() => addCollaborator(person)}
                                                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50"
                                                >
                                                    {person.profileImageUrl ? (
                                                        <img
                                                            src={person.profileImageUrl}
                                                            alt=""
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <Icon icon="mdi:account-circle" className="h-8 w-8 text-gray-400" />
                                                    )}
                                                    <span className="text-sm text-gray-900">
                                                        {person.firstName} {person.lastName}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <p className="mt-1 text-xs text-gray-500">{t('projects.form.tagHint')}</p>
                            </div>

                            <div>
                                <label htmlFor="project-community" className="mb-1 block text-sm font-medium text-gray-700">
                                    {t('projects.form.community')}
                                </label>
                                <select
                                    id="project-community"
                                    value={form.communityId}
                                    onChange={(event) => updateForm('communityId', event.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">{t('projects.form.communityNone')}</option>
                                    {communities.map((community) => (
                                        <option key={community.id} value={community.id}>
                                            {community.name}
                                        </option>
                                    ))}
                                    {form.communityId &&
                                        !communities.some((community) => community.id === form.communityId) &&
                                        editing?.community && (
                                            <option value={form.communityId}>{editing.community.name}</option>
                                        )}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">{t('projects.form.communityHint')}</p>
                            </div>

                            <div>
                                <label htmlFor="project-status" className="mb-1 block text-sm font-medium text-gray-700">
                                    {t('projects.form.status')}
                                </label>
                                <select
                                    id="project-status"
                                    value={form.status}
                                    onChange={(event) => updateForm('status', event.target.value)}
                                    className={inputClass}
                                >
                                    {STATUSES.map((value) => (
                                        <option key={value} value={value}>
                                            {t(`projects.status.${value}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="rounded-lg px-4 py-2.5 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                                >
                                    {t('projects.form.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? t('projects.form.saving')
                                        : editing
                                          ? t('projects.form.save')
                                          : t('projects.form.submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </Layout>
    );
};

export default Projects;
