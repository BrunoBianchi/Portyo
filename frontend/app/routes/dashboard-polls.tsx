import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Plus, Loader2, Vote, Trash2, BarChart3, Pencil } from "lucide-react";
import BioContext from "~/contexts/bio.context";
import { api } from "~/services/api";
import { useTranslation } from "react-i18next";

interface Poll {
  id: string;
  title: string;
  description?: string | null;
  options: Array<{ id: string; label: string }>;
  isActive: boolean;
  votes: number;
  createdAt: string;
}

export default function DashboardPollsList() {
  const { bio } = useContext(BioContext);
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const location = useLocation();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const activeCount = polls.filter((poll) => poll.isActive).length;
  const totalVotes = polls.reduce((sum, poll) => sum + (poll.votes || 0), 0);

  const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1];
  const withLang = (to: string) => (currentLang ? `/${currentLang}${to}` : to);

  useEffect(() => {
    if (!bio?.id) return;
    setLoading(true);
    api.get(`/poll/bios/${bio.id}/polls`)
      .then((response) => setPolls(Array.isArray(response.data) ? response.data : []))
      .catch((error) => console.error("Failed to fetch polls", error))
      .finally(() => setLoading(false));
  }, [bio?.id]);

  const createPoll = async () => {
    if (!bio?.id) return;
    setCreating(true);
    try {
      const response = await api.post(`/poll/bios/${bio.id}/polls`, {
        title: t("dashboard.polls.newTitle", { defaultValue: "New poll" }),
        description: "",
        options: [
          { id: crypto.randomUUID(), label: t("dashboard.polls.optionA", { defaultValue: "Option 1" }) },
          { id: crypto.randomUUID(), label: t("dashboard.polls.optionB", { defaultValue: "Option 2" }) },
        ],
        isActive: true,
        allowMultipleChoices: false,
        requireName: false,
        requireEmail: false,
        showResultsPublic: true,
      });

      navigate(withLang(`/dashboard/polls/${response.data.id}`));
    } catch (error) {
      console.error("Failed to create poll", error);
      alert(t("dashboard.polls.createError", { defaultValue: "Failed to create poll" }));
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (poll: Poll) => {
    try {
      const response = await api.patch(`/poll/polls/${poll.id}`, { isActive: !poll.isActive });
      setPolls((prev) => prev.map((item) => (item.id === poll.id ? response.data : item)));
    } catch (error) {
      console.error("Failed to toggle poll", error);
    }
  };

  const removePoll = async (pollId: string) => {
    if (!confirm(t("dashboard.polls.deleteConfirm", { defaultValue: "Delete this poll?" }))) return;
    try {
      await api.delete(`/poll/polls/${pollId}`);
      setPolls((prev) => prev.filter((poll) => poll.id !== pollId));
    } catch (error) {
      console.error("Failed to delete poll", error);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen space-y-6">
      <div className="bg-white border-2 border-black rounded-3xl p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1A1A1A]" style={{ fontFamily: "var(--font-display)" }}>
              {t("dashboard.polls.title", { defaultValue: "Polls" })}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("dashboard.polls.subtitle", { defaultValue: "Create and manage your audience polls" })}
            </p>
          </div>

          <button
            onClick={createPoll}
            disabled={creating}
            className="bg-[#C6F035] text-black px-5 py-3 rounded-[14px] font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 min-w-[170px] disabled:opacity-70"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {t("dashboard.polls.create", { defaultValue: "Create poll" })}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{t("dashboard.polls.statsTotal", { defaultValue: "Total polls" })}</p>
            <p className="text-2xl font-black text-[#1A1A1A]">{polls.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{t("dashboard.polls.statsActive", { defaultValue: "Active polls" })}</p>
            <p className="text-2xl font-black text-[#1A1A1A]">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{t("dashboard.polls.statsVotes", { defaultValue: "Total votes" })}</p>
            <p className="text-2xl font-black text-[#1A1A1A]">{totalVotes}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-7 h-7 animate-spin" /></div>
      ) : polls.length === 0 ? (
        <div className="text-center py-14 border-2 border-dashed border-gray-300 rounded-3xl bg-white">
          <Vote className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="font-black text-lg text-[#1A1A1A]">{t("dashboard.polls.empty", { defaultValue: "No polls yet" })}</p>
          <p className="text-sm text-gray-500 mt-1">{t("dashboard.polls.emptyHint", { defaultValue: "Create your first poll to collect quick feedback from your audience." })}</p>
          <button
            onClick={createPoll}
            disabled={creating}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-black font-bold bg-white"
          >
            <Plus className="w-4 h-4" /> {t("dashboard.polls.createFirst", { defaultValue: "Create first poll" })}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {polls.map((poll) => (
            <div key={poll.id} className="bg-white border-2 border-black rounded-2xl p-4 md:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-xl text-[#1A1A1A] truncate">{poll.title}</h3>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${poll.isActive ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-300 bg-gray-100 text-gray-600"}`}>
                      {poll.isActive ? t("dashboard.polls.active", { defaultValue: "Active" }) : t("dashboard.polls.inactive", { defaultValue: "Paused" })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                    <span>
                      {(poll.options || []).length} {t("dashboard.polls.options", { defaultValue: "options" })}
                    </span>
                    <span>•</span>
                    <span>
                      {poll.votes || 0} {t("dashboard.polls.votes", { defaultValue: "votes" })}
                    </span>
                    <span>•</span>
                    <span>
                      {t("dashboard.polls.createdAt", { defaultValue: "Created" })}: {new Date(poll.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => toggleActive(poll)}
                    className="px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold inline-flex items-center gap-1.5"
                  >
                    <Vote className="w-4 h-4" />
                    {poll.isActive ? t("dashboard.polls.pause", { defaultValue: "Pause" }) : t("dashboard.polls.activate", { defaultValue: "Activate" })}
                  </button>

                  <Link to={withLang(`/dashboard/polls/${poll.id}`)} className="px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold inline-flex items-center gap-1.5">
                    <Pencil className="w-4 h-4" /> {t("dashboard.polls.edit", { defaultValue: "Edit" })}
                  </Link>
                  <Link to={withLang(`/dashboard/polls/${poll.id}/results`)} className="px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold inline-flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" /> {t("dashboard.polls.results", { defaultValue: "Results" })}
                  </Link>
                  <button onClick={() => removePoll(poll.id)} className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold inline-flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4" /> {t("dashboard.polls.delete", { defaultValue: "Delete" })}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
