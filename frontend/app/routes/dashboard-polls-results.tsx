import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "~/services/api";
import { useTranslation } from "react-i18next";

interface Poll {
  id: string;
  title: string;
  chartType?: "bar" | "pie" | "donut";
  chartColors?: string[];
  options: Array<{ id: string; label: string }>;
  pollVotes?: Array<{
    id: string;
    voterName?: string | null;
    voterEmail?: string | null;
    selectedOptionIds: string[];
    createdAt: string;
  }>;
}

interface PollResults {
  pollId: string;
  totalVotes: number;
  options: Array<{ id: string; label: string; votes: number; percentage: number }>;
}

const CHART_COLORS = ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#4b5563"];

function ResultsChart({
  type,
  options,
  colors,
}: {
  type: "bar" | "pie" | "donut";
  options: PollResults["options"];
  colors?: string[];
}) {
  const palette = Array.isArray(colors) && colors.length > 0 ? colors : CHART_COLORS;
  if (type === "bar") {
    return (
      <div className="mt-4 space-y-3">
        {options.map((option, index) => (
          <div key={option.id}>
            <div className="flex justify-between text-sm mb-1">
              <span>{option.label}</span>
              <span>{option.votes} ({option.percentage}%)</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full" style={{ width: `${option.percentage}%`, backgroundColor: palette[index % palette.length] }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  let cumulative = 0;
  const radius = 72;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="mt-5 flex flex-col md:flex-row md:items-center gap-6">
      <div className="w-[180px] h-[180px] mx-auto md:mx-0">
        <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
          <circle cx="90" cy="90" r={radius} stroke="#e5e7eb" strokeWidth={type === "donut" ? 26 : 144} fill={type === "donut" ? "none" : "#f3f4f6"} />
          {options.map((option, index) => {
            const segmentLength = (Math.max(option.percentage, 0) / 100) * circumference;
            const segment = (
              <circle
                key={option.id}
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={palette[index % palette.length]}
                strokeWidth={type === "donut" ? 26 : 144}
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-cumulative}
              />
            );
            cumulative += segmentLength;
            return segment;
          })}
        </svg>
      </div>

      <div className="flex-1 space-y-2">
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
              <span>{option.label}</span>
            </div>
            <span className="font-semibold">{option.votes} ({option.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPollResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<PollResults | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      api.get(`/poll/polls/${id}`),
      api.get(`/poll/polls/${id}/results`),
    ])
      .then(([pollRes, resultsRes]) => {
        setPoll(pollRes.data);
        setResults(resultsRes.data);
      })
      .catch((error) => {
        console.error("Failed to load poll results", error);
        navigate("/dashboard/polls");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const optionMap = useMemo(() => new Map((poll?.options || []).map((option) => [option.id, option.label])), [poll?.options]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen space-y-6">
      <button onClick={() => navigate("/dashboard/polls")} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
        <ArrowLeft className="w-4 h-4" /> {t("dashboard.polls.back", { defaultValue: "Back" })}
      </button>

      <div className="bg-white border-2 border-black rounded-2xl p-5">
        <h1 className="text-2xl font-black mb-1">{poll?.title || t("dashboard.polls.results", { defaultValue: "Results" })}</h1>
        <p className="text-sm text-gray-500">{results?.totalVotes || 0} {t("dashboard.polls.votes", { defaultValue: "votes" })}</p>
        <ResultsChart type={poll?.chartType || "bar"} options={results?.options || []} colors={poll?.chartColors} />
      </div>

      <div className="bg-white border-2 border-black rounded-2xl p-5">
        <h2 className="text-lg font-black mb-3">{t("dashboard.polls.latestVotes", { defaultValue: "Latest votes" })}</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">{t("dashboard.polls.name", { defaultValue: "Name" })}</th>
                <th className="py-2">{t("dashboard.polls.email", { defaultValue: "Email" })}</th>
                <th className="py-2">{t("dashboard.polls.choice", { defaultValue: "Choice" })}</th>
                <th className="py-2">{t("dashboard.polls.date", { defaultValue: "Date" })}</th>
              </tr>
            </thead>
            <tbody>
              {(poll?.pollVotes || []).slice(0, 50).map((vote) => (
                <tr key={vote.id} className="border-b last:border-0">
                  <td className="py-2">{vote.voterName || "-"}</td>
                  <td className="py-2">{vote.voterEmail || "-"}</td>
                  <td className="py-2">{(vote.selectedOptionIds || []).map((id) => optionMap.get(id) || id).join(", ")}</td>
                  <td className="py-2">{new Date(vote.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
