import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';
import API from '../../../Service/service';
import { useLanguage } from '../../../src/i18n/LanguageContext';

type VisibilityField =
    | 'profileVisibility'
    | 'connectionsVisibility'
    | 'communitiesVisibility';
type VisibilityValue = 'Everyone' | 'ConnectionsOnly' | 'OnlyMe';
type VisibilitySettings = Record<VisibilityField, VisibilityValue>;
type SearchUser = {
    userId: number;
    firstName: string;
    lastName: string;
    profileImageUrl?: string | null;
    career?: string | null;
};
type BlockedUser = {
    id: number;
    firstName: string;
    lastName: string;
};

const INITIAL_SETTINGS: VisibilitySettings = {
    profileVisibility: 'Everyone',
    connectionsVisibility: 'Everyone',
    communitiesVisibility: 'Everyone',
};

const VISIBILITY_OPTIONS: {
    field: VisibilityField;
    title: string;
    description: string;
}[] = [
    {
        field: 'profileVisibility',
        title: 'settings.visibility.profile.title',
        description: 'settings.visibility.profile.description',
    },
    {
        field: 'communitiesVisibility',
        title: 'settings.visibility.communities.title',
        description: 'settings.visibility.communities.description',
    },
    {
        field: 'connectionsVisibility',
        title: 'settings.visibility.connections.title',
        description: 'settings.visibility.connections.description',
    },
];

const VISIBILITY_CHOICES: {
    value: VisibilityValue;
    label: string;
    description: string;
    icon: string;
}[] = [
    {
        value: 'Everyone',
        label: 'settings.visibility.choice.everyone.label',
        description: 'settings.visibility.choice.everyone.description',
        icon: 'mdi:earth',
    },
    {
        value: 'ConnectionsOnly',
        label: 'settings.visibility.choice.connections.label',
        description: 'settings.visibility.choice.connections.description',
        icon: 'mdi:account-group',
    },
    {
        value: 'OnlyMe',
        label: 'settings.visibility.choice.onlyMe.label',
        description: 'settings.visibility.choice.onlyMe.description',
        icon: 'mdi:lock',
    },
];

export default function Visibility() {
    const { t } = useLanguage();
    const [settings, setSettings] =
        useState<VisibilitySettings>(INITIAL_SETTINGS);
    const [openSetting, setOpenSetting] = useState<VisibilityField | null>(null);
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingField, setSavingField] = useState<VisibilityField | null>(null);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        let active = true;
        const loadSettings = async () => {
            try {
                const [visibility, blocked] = await Promise.all([
                    API.getVisibilitySettings(),
                    API.getBlockedUsers(),
                ]);
                if (!active) return;
                setSettings({
                    profileVisibility:
                        visibility.profileVisibility || 'Everyone',
                    connectionsVisibility:
                        visibility.connectionsVisibility || 'Everyone',
                    communitiesVisibility:
                        visibility.communitiesVisibility || 'Everyone',
                });
                setBlockedUsers(blocked);
            } catch (loadError) {
                console.error('Failed to load visibility settings:', loadError);
                if (active) setError(t('settings.visibility.error.load'));
            } finally {
                if (active) setLoading(false);
            }
        };
        void loadSettings();
        return () => {
            active = false;
        };
    }, []);

    const saveVisibility = async (
        field: VisibilityField,
        value: VisibilityValue,
    ) => {
        const previousValue = settings[field];
        setSettings((previous) => ({ ...previous, [field]: value }));
        setSavingField(field);
        setError('');
        setStatus('');
        try {
            const updated = await API.updateVisibilitySettings({
                [field]: value,
            });
            setSettings((previous) => ({ ...previous, ...updated }));
            setStatus(t('settings.visibility.status.saved'));
        } catch (saveError) {
            console.error('Failed to save visibility preference:', saveError);
            setSettings((previous) => ({ ...previous, [field]: previousValue }));
            setError(t('settings.visibility.error.save'));
        } finally {
            setSavingField(null);
        }
    };

    const searchPeople = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = searchTerm.trim();
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setError('');
        try {
            setSearchResults(await API.searchUsers(query));
        } catch (searchError) {
            console.error('Failed to search people for blocking:', searchError);
            setError(t('settings.visibility.error.search'));
        }
    };

    const handleBlock = async (user: SearchUser) => {
        setError('');
        try {
            await API.blockUser(user.userId);
            setSearchResults((results) =>
                results.filter((result) => result.userId !== user.userId),
            );
            setBlockedUsers((current) => [
                {
                    id: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                ...current.filter((blocked) => blocked.id !== user.userId),
            ]);
            setStatus(
                t('settings.visibility.status.blocked', {
                    name: `${user.firstName} ${user.lastName}`,
                }),
            );
        } catch (blockError) {
            console.error('Failed to block user:', blockError);
            setError(t('settings.visibility.error.block'));
        }
    };

    const handleUnblock = async (user: BlockedUser) => {
        setError('');
        try {
            await API.unblockUser(user.id);
            setBlockedUsers((current) =>
                current.filter((blocked) => blocked.id !== user.id),
            );
            setStatus(
                t('settings.visibility.status.unblocked', {
                    name: `${user.firstName} ${user.lastName}`,
                }),
            );
        } catch (unblockError) {
            console.error('Failed to unblock user:', unblockError);
            setError(t('settings.visibility.error.unblock'));
        }
    };

    if (loading) {
        return (
            <div
                id="Visibility"
                className="md:w-200 w-full rounded-xl col-start-1 row-start-1 overflow-hidden border border-gray-200 bg-white shadow-sm"
            >
                <div className="border-b border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {t('settings.visibility.title')}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {t('settings.visibility.subtitle')}
                    </p>
                </div>
                <div className="px-6 py-4 text-sm text-gray-500" role="status">
                    {t('settings.visibility.loading')}
                </div>
            </div>
        );
    }

    return (
        <section
            id="Visibility"
            className="md:w-200 w-full rounded-xl col-start-1 row-start-1 overflow-hidden border border-gray-200 bg-white shadow-sm"
        >
            <div className="border-b border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    {t('settings.visibility.title')}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    {t('settings.visibility.subtitle')}
                </p>
            </div>

            {error && (
                <p
                    className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    role="alert"
                >
                    {error}
                </p>
            )}
            {status && (
                <p
                    className="mx-6 mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                    role="status"
                >
                    {status}
                </p>
            )}

            <div>
                {VISIBILITY_OPTIONS.map((option, index) => {
                    const isOpen = openSetting === option.field;
                    const panelId = `visibility-options-${option.field}`;
                    return (
                        <div key={option.field}>
                            <button
                                type="button"
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() =>
                                    setOpenSetting((current) =>
                                        current === option.field
                                            ? null
                                            : option.field,
                                    )
                                }
                                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                            >
                                <span>
                                    <span className="block font-medium text-gray-900">
                                        {t(option.title)}
                                    </span>
                                    <span className="block text-sm text-gray-500">
                                        {t(option.description)}
                                    </span>
                                </span>
                                <Icon
                                    icon={
                                        isOpen
                                            ? 'mdi:chevron-up'
                                            : 'mdi:chevron-down'
                                    }
                                    className="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200"
                                />
                            </button>
                            {isOpen && (
                                <div
                                    id={panelId}
                                    className="mx-4 mb-4 rounded-lg border border-gray-100 bg-gray-50/70 p-4"
                                >
                                    <div className="space-y-2">
                                        {VISIBILITY_CHOICES.map((choice) => {
                                            const isSelected =
                                                settings[option.field] ===
                                                choice.value;
                                            return (
                                                <label
                                                    key={choice.value}
                                                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                                        isSelected
                                                            ? 'border-blue-300 bg-blue-50'
                                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={option.field}
                                                        value={choice.value}
                                                        checked={isSelected}
                                                        disabled={
                                                            savingField ===
                                                            option.field
                                                        }
                                                        onChange={() =>
                                                            void saveVisibility(
                                                                option.field,
                                                                choice.value,
                                                            )
                                                        }
                                                        className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                                                    />
                                                    <Icon
                                                        icon={choice.icon}
                                                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                                                            isSelected
                                                                ? 'text-blue-600'
                                                                : 'text-gray-500'
                                                        }`}
                                                    />
                                                    <span className="min-w-0">
                                                        <span className="block font-medium text-gray-900">
                                                            {t(choice.label)}
                                                        </span>
                                                        <span className="block text-sm text-gray-600">
                                                            {t(choice.description)}
                                                        </span>
                                                    </span>
                                                    {savingField ===
                                                        option.field &&
                                                        isSelected && (
                                                            <span className="ml-auto shrink-0 text-xs text-blue-700">
                                                                {t('settings.visibility.saving')}
                                                            </span>
                                                        )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {index < VISIBILITY_OPTIONS.length - 1 && (
                                <hr className="border-gray-100" />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    {t('settings.visibility.blocked.title')}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                    {t('settings.visibility.blocked.description')}
                </p>
                <form className="mt-4 flex gap-2" onSubmit={searchPeople}>
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder={t('settings.visibility.search.placeholder')}
                        aria-label={t('settings.visibility.search.ariaLabel')}
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        {t('settings.visibility.search.button')}
                    </button>
                </form>
                {searchResults.length > 0 && (
                    <ul className="mt-3 divide-y rounded-lg border">
                        {searchResults.map((user) => (
                            <li
                                key={user.userId}
                                className="flex items-center justify-between gap-4 p-3"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-medium text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    {user.career && (
                                        <p className="truncate text-sm text-gray-500">
                                            {user.career}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => void handleBlock(user)}
                                    className="shrink-0 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                                >
                                    {t('settings.visibility.block')}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {searchTerm.trim().length >= 2 &&
                    searchResults.length === 0 &&
                    !error && (
                        <p className="mt-3 text-sm text-gray-500">
                            {t('settings.visibility.search.noResults')}
                        </p>
                    )}

                <h4 className="mt-6 font-medium text-gray-900">
                    {t('settings.visibility.blocked.listTitle')}
                </h4>
                {blockedUsers.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500">
                        {t('settings.visibility.blocked.empty')}
                    </p>
                ) : (
                    <ul className="mt-2 divide-y rounded-lg border">
                        {blockedUsers.map((user) => (
                            <li
                                key={user.id}
                                className="flex items-center justify-between gap-4 p-3"
                            >
                                <span className="font-medium text-gray-800">
                                    {user.firstName} {user.lastName}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => void handleUnblock(user)}
                                    className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    {t('settings.visibility.unblock')}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
