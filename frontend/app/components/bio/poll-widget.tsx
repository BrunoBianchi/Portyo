import React, { useEffect, useMemo, useState } from "react";
import { api } from "~/services/api";

type PollOption = { id: string; label: string };

interface PublicPoll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  chartType?: "bar" | "pie" | "donut";
  chartColors?: string[];
  allowMultipleChoices: boolean;
  requireName: boolean;
  requireEmail: boolean;
  showResultsPublic: boolean;
  isActive: boolean;
}

interface PollResults {
  pollId: string;
  totalVotes: number;
  options: Array<{ id: string; label: string; votes: number; percentage: number }>;
}

const CHART_COLORS = ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#4b5563"];

function PollResultsChart({
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
      <>
        {options.map((option, index) => (
          <div key={option.id}>
            <div className="flex justify-between text-xs mb-1">
              <span>{option.label}</span>
              <span>{option.percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full" style={{ width: `${option.percentage}%`, backgroundColor: palette[index % palette.length] }} />
            </div>
          </div>
        ))}
      </>
    );
  }

  let cumulative = 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-3">
      <div className="w-[130px] h-[130px] mx-auto">
        <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
          <circle cx="65" cy="65" r={radius} stroke="#e5e7eb" strokeWidth={type === "donut" ? 20 : 104} fill={type === "donut" ? "none" : "#f3f4f6"} />
          {options.map((option, index) => {
            const segmentLength = (Math.max(option.percentage, 0) / 100) * circumference;
            const segment = (
              <circle
                key={option.id}
                cx="65"
                cy="65"
                r={radius}
                fill="none"
                stroke={palette[index % palette.length]}
                strokeWidth={type === "donut" ? 20 : 104}
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-cumulative}
              />
            );
            cumulative += segmentLength;
            return segment;
          })}
        </svg>
      </div>
      {options.map((option, index) => (
        <div key={option.id} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
            <span>{option.label}</span>
          </div>
          <span className="font-semibold">{option.percentage}%</span>
        </div>
      ))}
    </div>
  );
}

interface PollWidgetProps {
  pollId: string;
  backgroundColor?: string;
  textColor?: string;
}

export const PollWidget: React.FC<PollWidgetProps> = ({
  pollId,
  backgroundColor = "#ffffff",
  textColor = "#1f2937",
}) => {
  const [poll, setPoll] = useState<PublicPoll | null>(null);
  const [results, setResults] = useState<PollResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  useEffect(() => {
    if (!pollId) return;
    setLoading(true);
    setError("");

    api.get(`/public/polls/${pollId}`)
      .then((res) => setPoll(res.data))
      .catch((err) => {
        console.error("Failed to load poll", err);
        setError("Não foi possível carregar a enquete.");
      })
      .finally(() => setLoading(false));
  }, [pollId]);

  useEffect(() => {
    if (!poll?.showResultsPublic || !pollId) return;
    api.get(`/public/polls/${pollId}/results`)
      .then((res) => setResults(res.data))
      .catch(() => {
        setResults(null);
      });
  }, [poll?.showResultsPublic, pollId, success]);

  const selectedSet = useMemo(() => new Set(selectedOptionIds), [selectedOptionIds]);

  const toggleOption = (optionId: string) => {
    if (!poll) return;

    if (!poll.allowMultipleChoices) {
      setSelectedOptionIds([optionId]);
      return;
    }

    setSelectedOptionIds((prev) => (
      prev.includes(optionId) ? prev.filter((item) => item !== optionId) : [...prev, optionId]
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poll) return;
    if (selectedOptionIds.length === 0) {
      setError("Selecione pelo menos uma opção.");
      return;
    }
    if (poll.requireName && !name.trim()) {
      setError("Nome é obrigatório.");
      return;
    }
    if (poll.requireEmail && !email.trim()) {
      setError("Email é obrigatório.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post(`/public/polls/${pollId}/vote`, {
        optionIds: selectedOptionIds,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      });

      setSuccess(true);
      if (response.data?.results) {
        setResults(response.data.results);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Não foi possível enviar seu voto.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor }}>
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="p-6 rounded-2xl text-center" style={{ backgroundColor, color: textColor }}>
        Enquete não encontrada.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl shadow-sm border border-black/5" style={{ backgroundColor, color: textColor }}>
      <h3 className="text-xl font-bold mb-2">{poll.title}</h3>
      {poll.description ? <p className="mb-4 opacity-80 text-sm whitespace-pre-wrap">{poll.description}</p> : null}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {(poll.options || []).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleOption(option.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                  selectedSet.has(option.id) ? "border-black bg-black/5" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {poll.requireName && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted"
              required
            />
          )}

          {poll.requireEmail && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu email"
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted"
              required
            />
          )}

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-black hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Votar"}
          </button>
        </form>
      )}

      {success ? <p className="text-sm font-semibold mt-2">Voto registrado com sucesso.</p> : null}

      {poll.showResultsPublic && results && (
        <div className="mt-5 space-y-3">
          <p className="text-sm font-semibold">Resultados ({results.totalVotes} votos)</p>
          <PollResultsChart type={poll.chartType || "bar"} options={results.options} colors={poll.chartColors} />
        </div>
      )}

      <a href={`/poll/${poll.id}`} className="inline-block mt-5 text-sm font-semibold underline">
        Abrir página da enquete
      </a>
    </div>
  );
};
