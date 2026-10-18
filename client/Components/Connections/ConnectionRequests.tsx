import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Service/service.ts";
import { useLanguage } from "../../src/i18n/LanguageContext";

type IncomingRequest = Awaited<ReturnType<typeof API.getIncomingConnectionRequests>>[number];

interface ConnectionRequestsProps {
  onAccepted?: () => void;
}

function ConnectionRequests({ onAccepted }: ConnectionRequestsProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setRequests(await API.getIncomingConnectionRequests());
    } catch (loadError) {
      console.error("Failed to load connection requests:", loadError);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const respond = async (id: number, action: "accept" | "decline") => {
    setBusyId(id);
    setError("");
    try {
      await API.respondToConnectionRequest(id, action);
      setRequests((current) => current.filter((request) => request.id !== id));
      if (action === "accept") onAccepted?.();
    } catch (respondError) {
      setError(respondError instanceof Error ? respondError.message : "");
    } finally {
      setBusyId(null);
    }
  };

  if (requests.length === 0) return null;

  return (
    <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">
        {t("social.connections.requests.title")} ({requests.length})
      </h2>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <ul className="mt-4 space-y-3">
        {requests.map((request) => (
          <li
            key={request.id}
            className="flex flex-col gap-3 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <button
              type="button"
              onClick={() => navigate(`/profile/${request.publicId}`)}
              className="flex items-center gap-3 text-left"
            >
              <img
                src={
                  request.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(request.name)}&background=random`
                }
                alt={request.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900">{request.name}</span>
                {request.career && <span className="block text-xs text-slate-500">{request.career}</span>}
              </span>
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busyId === request.id}
                onClick={() => respond(request.id, "accept")}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {t("social.connections.requests.accept")}
              </button>
              <button
                type="button"
                disabled={busyId === request.id}
                onClick={() => respond(request.id, "decline")}
                className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                {t("social.connections.requests.decline")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ConnectionRequests;
