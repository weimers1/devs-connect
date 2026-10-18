import React, { useEffect, useMemo, useState } from "react";
import Layout from "../Layout";
import { useUserConnections } from "./UserConnectionContext.tsx";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../Service/service.ts";
import { useAuthRedirect } from "../Auth/useAuthRedirect";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { ConnectionData } from "./UserConnectionContext";
import { useLanguage } from "../../src/i18n/LanguageContext";
import ConnectionRequests from "./ConnectionRequests";

function Connections() {
  const { t } = useLanguage();
  const {
    connections,
    currentUser,
    handleConnect,
    handleDisconnect,
    handleBlockUser,
    suggestionData,
    isLoadingConnections,
    isLoadingSuggestions,
    suggestionsError,
    connectingUserId,
    connectionError,
    refreshConnections,
  } = useUserConnections();
  const { requireAuth } = useAuthRedirect();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [editUsers, setEditUsers] = useState(false);
  const [areyousure, setareyousure] = useState(false);
  const [name, setName] = useState("");
  const [confirmAction, setConfirmAction] = useState<"remove" | "block">("remove");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [otherConnections, setOtherConnections] = useState<ConnectionData[] | null>(null);
  const [otherConnectionsError, setOtherConnectionsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Determine whose profile is being viewed
  const profileUserId = userId || currentUser;
  const isOwnProfile = profileUserId === currentUser;

  // Decide which connections to display
  const data = isOwnProfile ? connections : otherConnections;
  const filteredConnections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data || [];
    return (data || []).filter((connection) =>
      `${connection.firstName} ${connection.lastName} ${connection.career}`
        .toLowerCase()
        .includes(query),
    );
  }, [data, searchQuery]);


  const handleProfileClick = (userId: string) => {
    requireAuth(() => {
      if (userId === currentUser) {
        navigate("/profile");
      } else {
        const connection = data?.find((person) => person.userId === userId);
        const recommendation = suggestionData.find((person) => person.userId === userId);
        const publicId = connection?.publicId || recommendation?.publicId;
        if (publicId) navigate(`/profile/${publicId}`);
      }
    });
  };

  const handleClick = (userId: string) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setEditUsers(false);
    } else {
      setSelectedUserId(userId);
      setEditUsers(true);
    }
  };

  const areyousureCall = (
    value: boolean,
    firstName: string,
    action: "remove" | "block" = "remove",
  ) => {
    if (!areyousure && firstName) {
      setEditUsers(false);
      setareyousure(value);
      setName(firstName);
      setConfirmAction(action);
    } else {
      setareyousure(false);
      setName("");
    }
  };
  const confirmConnectionAction = async (targetId: string) => {
    const succeeded = confirmAction === "block"
      ? await handleBlockUser(targetId)
      : await handleDisconnect(targetId);
    if (succeeded) areyousureCall(false, "");
  };
  useEffect(() => {
    if (isOwnProfile) return;

    const getOtherUserConnections = async () => {
      if (!profileUserId) return;

      try {
        const result = await API.getOtherUserConnections(profileUserId);
        setOtherConnections(result);
      } catch (error) {
        console.error("Failed to load this user's connections:", error);
        setOtherConnectionsError(t("social.connections.loadOtherError"));
      }
    };

    getOtherUserConnections();
  }, [profileUserId, isOwnProfile]);

  // const handleRemoveConnection = async (userId: string) => {
  //   try {
  //     setIsLoading(true);

  //     if (!userId || !currentUser) {
  //       navigate("/login");
  //       return;
  //     }
  //   const removedConnection = connections?.find(c => c.userId === userId);

  //     setConnections(prev => 
  //     prev?.filter(conn => conn.userId !== userId) || null
  //   );
  //   setareyousure(false);

  //     const disconnect = await API.disconnecttoUser(userId, currentUser);

  //      if (!disconnect.success) {
  //     // Restore the removed connection
  //     if (removedConnection) {
  //       setConnections(prev => [...(prev || []), removedConnection]);
  //     }
  //     alert("Failed to remove connection");
  //   }

    
  //   } catch (error) {
  //     console.log("error removing connection", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Fetch other user's connections only if viewing another profile


  const recommendationsSection = isOwnProfile ? (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
          {t("social.connections.growNetwork")}
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          {t("social.connections.peopleYouMayKnow")}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {t("social.connections.peopleYouMayKnowDesc")}
        </p>
      </div>
      {isLoadingSuggestions ? (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500" role="status">
          {t("social.connections.findingPeople")}
        </p>
      ) : suggestionsError ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">
          {suggestionsError}
        </p>
      ) : suggestionData.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          {t("social.connections.noRecommendations")}
        </p>
      ) : (
        <div className="grid gap-3">
          {suggestionData.slice(0, 8).map((person) => (
            <article
              key={person.userId}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <button
                type="button"
                onClick={() => navigate(`/profile/${person.publicId}`)}
                className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-semibold text-blue-700"
                aria-label={t("social.connections.viewProfileOf", { name: person.author })}
              >
                {person.profileImageUrl ? (
                  <img src={person.profileImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  person.author.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()
                )}
              </button>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${person.publicId}`)}
                  className="block max-w-full truncate text-left text-sm font-semibold text-slate-900 hover:text-blue-700"
                >
                  {person.author}
                </button>
                <p className="truncate text-xs text-slate-500">
                  {person.career || t("social.connections.developer")}
                </p>
              </div>
              <button
                type="button"
                disabled={connectingUserId === person.userId}
                onClick={() => void handleConnect(person.userId)}
                className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
              >
                {connectingUserId === person.userId ? t("social.connections.connecting") : t("social.connections.connect")}
              </button>
            </article>
          ))}
        </div>
      )}
      {connectionError && (
        <p className="mt-3 text-sm text-red-600" role="alert">{connectionError}</p>
      )}
    </section>
  ) : null;

  return (
    <Layout>
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-8 text-white shadow-xl shadow-slate-900/10 sm:px-9 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            {t("social.connections.yourCommunity")}
          </p>
          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {isOwnProfile ? t("social.connections.yourNetwork") : t("social.connections.title")}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                {isOwnProfile
                  ? t("social.connections.ownSubtitle")
                  : t("social.connections.otherSubtitle")}
              </p>
            </div>
            <div className="flex items-center gap-3 self-start rounded-2xl border border-white/10 bg-white/10 px-4 py-3 sm:self-auto">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-200" aria-hidden="true">
                <Icon icon="mdi:account-multiple-outline" className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-2xl font-bold leading-none">{data?.length ?? "—"}</span>
                <span className="mt-1 block text-xs text-slate-300">{t("social.connections.countLabel")}</span>
              </span>
            </div>
          </div>
        </header>

        {isOwnProfile && <ConnectionRequests onAccepted={() => void refreshConnections()} />}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {isOwnProfile ? t("social.connections.yourConnections") : t("social.connections.network")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                                    {isOwnProfile ? t("social.connections.ownListDesc") : t("social.connections.otherListDesc")}
                </p>
              </div>
              {data && data.length > 0 && (
                <label className="relative block w-full sm:max-w-xs">
                  <span className="sr-only">{t("social.connections.searchLabel")}</span>
                  <Icon icon="mdi:magnify" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t("social.connections.searchPlaceholder")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              )}
            </div>

            {isOwnProfile && isLoadingConnections ? (
              <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500" role="status">
                {t("social.connections.loadingOwn")}
              </p>
            ) : !isOwnProfile && otherConnectionsError ? (
              <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">
                {otherConnectionsError}
              </p>
            ) : !isOwnProfile && data === null ? (
              <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500" role="status">
                {t("social.connections.loadingOther")}
              </p>
            ) : filteredConnections.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {filteredConnections.map((connection) => (
                <li
                  key={connection.userId}
                  className="flex min-w-0 items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <button
                    type="button"
                    onClick={() => handleProfileClick(connection.userId)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-bold text-blue-800 ring-1 ring-blue-200"
                    aria-label={t("social.connections.viewProfileOf", { name: `${connection.firstName} ${connection.lastName}` })}
                  >
                    {connection.profileImageUrl ? (
                      <img src={connection.profileImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      `${connection.firstName.charAt(0)}${connection.lastName.charAt(0)}`.toUpperCase()
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProfileClick(connection.userId)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-700">
                      {connection.firstName} {connection.lastName}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {connection.career || t("social.connections.developer")}
                    </span>
                  </button>

                  {/* Only allow editing if viewing your own profile */}
                  {isOwnProfile && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() =>
                          navigate(`/messages?user=${connection.publicId}`)
                        }
                      >
                        {t("social.connections.message")}
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          aria-label={t("social.connections.moreOptionsFor", { name: `${connection.firstName} ${connection.lastName}` })}
                          aria-expanded={editUsers && selectedUserId === connection.userId}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          onClick={() => handleClick(connection.userId)}
                        >
                          <Icon
                            icon="uil:ellipsis-h"
                            width="22"
                            height="22"
                          />
                        </button>

                        {editUsers &&
                          selectedUserId === connection.userId && (
                            <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                                onClick={() =>
                                  areyousureCall(
                                    true,
                                    connection.firstName,
                                    "remove",
                                  )
                                }
                              >
                                {t("social.connections.remove")}
                                <Icon icon="mdi:trash-can-outline" width="18" height="18" />
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  areyousureCall(
                                    true,
                                    connection.firstName,
                                    "block",
                                  )
                                }
                              >
                                {t("social.connections.block")}
                                <Icon icon="fa-solid:user-lock" width="16" height="16" />
                              </button>
                            </div>
                          )}
                      </div>

                    </div>
                  )}

                  {areyousure &&
                    selectedUserId === connection.userId && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <div role="dialog" aria-modal="true" aria-labelledby="connection-action-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                          <Icon
                            icon="streamline-plump-color:sad-face-flat"
                            className="mx-auto mb-3 text-blue-600"
                            width="48"
                            height="48"
                          />
                          <h2 id="connection-action-title" className="mb-3 text-center text-xl font-bold text-slate-900">
                            {confirmAction === "block"
                              ? t("social.connections.blockTitle", { name })
                              : t("social.connections.removeTitle", { name })}
                          </h2>
                          {confirmAction === "block" && (
                            <p className="mb-5 text-center text-sm leading-6 text-slate-600">
                              {t("social.connections.blockWarning")}
                            </p>
                          )}
                          {connectionError && (
                            <p className="mb-3 text-center text-sm text-red-600" role="alert">
                              {connectionError}
                            </p>
                          )}

                          <div className="flex flex-col gap-3">
                            <button
                              type="button"
                              className="rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
                              onClick={() => void confirmConnectionAction(connection.userId)}
                            >
                              {confirmAction === "block" ? t("social.connections.blockUser") : t("social.connections.removeConnection")}
                            </button>

                            <button
                              type="button"
                              className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                              onClick={() =>
                                areyousureCall(false, "")
                              }
                            >
                              {t("social.connections.deny")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl bg-slate-50 px-5 py-10 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm" aria-hidden="true">
                  <Icon icon="mdi:account-multiple-outline" className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  {searchQuery.trim() ? t("social.connections.noMatches") : t("social.connections.emptyTitle")}
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                  {searchQuery.trim()
                                      ? t("social.connections.tryAnother")
                    : isOwnProfile
                                        ? t("social.connections.emptyOwn")
                                        : t("social.connections.emptyOther")}
                </p>
              </div>
            )}
          </section>
          {recommendationsSection}
        </div>
      </div>
    </Layout>
  );
}

export default Connections;