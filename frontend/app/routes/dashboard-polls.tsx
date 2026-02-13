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
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1A1A1A]" style={{ fontFamily: "var(--font-display)" }}>
            {t("dashboard.polls.title", { defaultValue: "Polls" })}
          </h1>
          <p className="text-gray-600">
            {t("dashboard.polls.subtitle", { defaultValue: "Create and manage your audience polls" })}
          </p>
        </div>

        <button
          onClick={createPoll}
          disabled={creating}
          className="bg-[#C6F035] text-black px-5 py-3 rounded-[14px] font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {t("dashboard.polls.create", { defaultValue: "Create poll" })}
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-7 h-7 animate-spin" /></div>
      ) : polls.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-white">
          <Vote className="w-9 h-9 mx-auto mb-3 text-gray-400" />
          <p className="font-semibold text-gray-700">{t("dashboard.polls.empty", { defaultValue: "No polls yet" })}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {polls.map((poll) => (
            <div key={poll.id} className="bg-white border-2 border-black rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-black text-lg text-[#1A1A1A]">{poll.title}</h3>
                <p className="text-sm text-gray-500">
                  {(poll.options || []).length} {t("dashboard.polls.options", { defaultValue: "options" })} • {poll.votes || 0} {t("dashboard.polls.votes", { defaultValue: "votes" })}
                </p>
                <button
                  onClick={() => toggleActive(poll)}
                  className={`mt-2 text-xs px-2.5 py-1 rounded-full border ${poll.isActive ? "border-green-700 text-green-700" : "border-gray-400 text-gray-500"}`}
                >
                  {poll.isActive ? t("dashboard.polls.active", { defaultValue: "Active" }) : t("dashboard.polls.inactive", { defaultValue: "Paused" })}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link to={withLang(`/dashboard/polls/${poll.id}`)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold inline-flex items-center gap-1.5">
                  <Pencil className="w-4 h-4" /> {t("dashboard.polls.edit", { defaultValue: "Edit" })}
                </Link>
                <Link to={withLang(`/dashboard/polls/${poll.id}/results`)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold inline-flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" /> {t("dashboard.polls.results", { defaultValue: "Results" })}
                </Link>
                <button onClick={() => removePoll(poll.id)} className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold inline-flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" /> {t("dashboard.polls.delete", { defaultValue: "Delete" })}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
