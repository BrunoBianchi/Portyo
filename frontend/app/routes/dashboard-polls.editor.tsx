import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, CalendarClock, Copy, Eye, Loader2, Plus, Save, Settings2, Trash2, Vote } from "lucide-react";
import { api } from "~/services/api";
import { useTranslation } from "react-i18next";

type PollOption = { id: string; label: string };

const normalizeHexColor = (input: string, fallback = "#000000") => {
  const value = String(input || "").trim();
  if (/^#([0-9A-Fa-f]{6})$/.test(value)) return value;
  if (/^#([0-9A-Fa-f]{3})$/.test(value)) {
    const short = value.slice(1);
    return `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`;
  }
  return fallback;
};

interface PollEditorState {
  title: string;
  description: string;
  options: PollOption[];
  chartType: "bar" | "pie" | "donut";
  chartColors: string[];
  isActive: boolean;
  allowMultipleChoices: boolean;
  requireName: boolean;
  requireEmail: boolean;
  showResultsPublic: boolean;
  startsAt: string;
  endsAt: string;
}

export default function DashboardPollEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("dashboard");
  const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1];
  const withLang = (to: string) => (currentLang ? `/${currentLang}${to}` : to);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const defaultChartColors = ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#4b5563"];
  const [state, setState] = useState<PollEditorState>({
    title: "",
    description: "",
    options: [],
    chartType: "bar",
    chartColors: defaultChartColors,
    isActive: true,
    allowMultipleChoices: false,
    requireName: false,
    requireEmail: false,
    showResultsPublic: true,
    startsAt: "",
    endsAt: "",
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/poll/polls/${id}`)
      .then((response) => {
        const poll = response.data;
        setState({
          title: poll.title || "",
          description: poll.description || "",
          options: Array.isArray(poll.options) ? poll.options : [],
          chartType: poll.chartType || "bar",
          chartColors: Array.isArray(poll.chartColors) && poll.chartColors.length > 0 ? poll.chartColors : defaultChartColors,
          isActive: Boolean(poll.isActive),
          allowMultipleChoices: Boolean(poll.allowMultipleChoices),
          requireName: Boolean(poll.requireName),
          requireEmail: Boolean(poll.requireEmail),
          showResultsPublic: Boolean(poll.showResultsPublic),
          startsAt: poll.startsAt ? new Date(poll.startsAt).toISOString().slice(0, 16) : "",
          endsAt: poll.endsAt ? new Date(poll.endsAt).toISOString().slice(0, 16) : "",
        });
      })
      .catch((error) => {
        console.error("Failed to load poll", error);
        navigate(withLang("/dashboard/polls"));
      })
      .finally(() => setLoading(false));
  }, [id, navigate, currentLang]);

  const validOptions = useMemo(
    () => state.options.filter((option) => option.label.trim()),
    [state.options]
  );

  const hasDuplicateOptions = useMemo(() => {
    const normalized = validOptions.map((option) => option.label.trim().toLowerCase());
    return new Set(normalized).size !== normalized.length;
  }, [validOptions]);

  const hasInvalidDateRange = useMemo(() => {
    if (!state.startsAt || !state.endsAt) return false;
    return new Date(state.startsAt).getTime() > new Date(state.endsAt).getTime();
  }, [state.startsAt, state.endsAt]);

  const pollTimingStatus = useMemo(() => {
    const now = Date.now();
    const startsAtMs = state.startsAt ? new Date(state.startsAt).getTime() : null;
    const endsAtMs = state.endsAt ? new Date(state.endsAt).getTime() : null;

    if (endsAtMs && now > endsAtMs) return t("dashboard.polls.statusEnded", { defaultValue: "Ended" });
    if (startsAtMs && now < startsAtMs) return t("dashboard.polls.statusScheduled", { defaultValue: "Scheduled" });
    return t("dashboard.polls.statusLive", { defaultValue: "Live" });
  }, [state.startsAt, state.endsAt, t]);

  const canSave = useMemo(
    () =>
      state.title.trim().length > 0 &&
      validOptions.length >= 2 &&
      !hasDuplicateOptions &&
      !hasInvalidDateRange,
    [state.title, validOptions.length, hasDuplicateOptions, hasInvalidDateRange]
  );

  const updateOption = (optionId: string, label: string) => {
    setState((prev) => ({
      ...prev,
      options: prev.options.map((option) => (option.id === optionId ? { ...option, label } : option)),
    }));
  };

  const addOption = () => {
    setState((prev) => ({
      ...prev,
      options: [...prev.options, { id: crypto.randomUUID(), label: `${t("dashboard.polls.optionLabel", { defaultValue: "Option" })} ${prev.options.length + 1}` }],
    }));
  };

  const duplicateOption = (optionId: string) => {
    setState((prev) => {
      const source = prev.options.find((option) => option.id === optionId);
      if (!source) return prev;
      return {
        ...prev,
        options: [...prev.options, { id: crypto.randomUUID(), label: source.label }],
      };
    });
  };

  const removeOption = (optionId: string) => {
    setState((prev) => ({
      ...prev,
      options: prev.options.filter((option) => option.id !== optionId),
    }));
  };

  const savePoll = async () => {
    if (!id || !canSave) return;
    setSaving(true);
    try {
      await api.patch(`/poll/polls/${id}`, {
        title: state.title,
        description: state.description,
        options: validOptions,
        isActive: state.isActive,
        allowMultipleChoices: state.allowMultipleChoices,
        requireName: state.requireName,
        requireEmail: state.requireEmail,
        showResultsPublic: state.showResultsPublic,
        chartType: state.chartType,
        chartColors: state.chartColors,
        startsAt: state.startsAt ? new Date(state.startsAt).toISOString() : null,
        endsAt: state.endsAt ? new Date(state.endsAt).toISOString() : null,
      });
      navigate(withLang("/dashboard/polls"));
    } catch (error) {
      console.error("Failed to save poll", error);
      alert(t("dashboard.polls.saveError", { defaultValue: "Failed to save poll" }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const copyPublicLink = async () => {
    if (!id) return;
    const langPrefix = currentLang ? `/${currentLang}` : "";
    const url = `${window.location.origin}${langPrefix}/poll/${id}`;
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen space-y-6">
      <div className="bg-white border-2 border-black rounded-3xl p-4 md:p-6 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <button onClick={() => navigate(withLang("/dashboard/polls"))} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black transition-colors">
              <ArrowLeft className="w-4 h-4" /> {t("dashboard.polls.back", { defaultValue: "Back" })}
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#1A1A1A]">{state.title || t("dashboard.polls.newTitle", { defaultValue: "New poll" })}</h1>
              <p className="text-sm text-gray-500">{t("dashboard.polls.editorSubtitle", { defaultValue: "Customize details, options and visibility settings for your poll." })}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black text-xs font-bold bg-white">
                <Vote className="w-3.5 h-3.5" />
                {state.isActive
                  ? t("dashboard.polls.active", { defaultValue: "Active" })
                  : t("dashboard.polls.inactive", { defaultValue: "Paused" })}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black text-xs font-bold bg-white">
                <CalendarClock className="w-3.5 h-3.5" />
                {pollTimingStatus}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button
              type="button"
              onClick={copyPublicLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-black rounded-xl bg-white font-semibold"
            >
              <Copy className="w-4 h-4" /> {t("dashboard.polls.copyLink", { defaultValue: "Copy public link" })}
            </button>
            <button
              type="button"
              onClick={() => window.open(withLang(`/poll/${id}`), "_blank", "noopener,noreferrer")}
              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-black rounded-xl bg-white font-semibold"
            >
              <Eye className="w-4 h-4" /> {t("dashboard.polls.preview", { defaultValue: "Preview" })}
            </button>
            <button onClick={savePoll} disabled={!canSave || saving} className="inline-flex items-center gap-2 px-5 py-3 bg-[#C6F035] border-2 border-black rounded-xl font-black disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t("dashboard.polls.save", { defaultValue: "Save" })}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5 bg-white border-2 border-black rounded-3xl p-5 md:p-6">
        <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Settings2 className="w-4 h-4 text-gray-600" />
          <h2 className="text-base font-black text-[#1A1A1A]">{t("dashboard.polls.basic", { defaultValue: "Basic info" })}</h2>
        </div>

        <div>
          <label className="text-sm font-semibold">{t("dashboard.polls.titleField", { defaultValue: "Title" })}</label>
          <input className="w-full mt-1 px-3 py-2 border rounded-lg" value={state.title} maxLength={100} onChange={(e) => setState((p) => ({ ...p, title: e.target.value }))} />
          <p className="text-xs text-gray-500 mt-1">{state.title.length}/100</p>
        </div>

        <div>
          <label className="text-sm font-semibold">{t("dashboard.polls.descriptionField", { defaultValue: "Description" })}</label>
          <textarea className="w-full mt-1 px-3 py-2 border rounded-lg" rows={3} maxLength={400} value={state.description} onChange={(e) => setState((p) => ({ ...p, description: e.target.value }))} />
          <p className="text-xs text-gray-500 mt-1">{state.description.length}/400</p>
        </div>

        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold">{t("dashboard.polls.optionsField", { defaultValue: "Options" })}</label>
            <button onClick={addOption} className="text-sm font-semibold inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white"><Plus className="w-4 h-4" /> {t("dashboard.polls.addOption", { defaultValue: "Add option" })}</button>
          </div>
          <div className="space-y-2">
            {state.options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-gray-50">
                <span className="w-7 h-7 rounded-full bg-white border border-gray-300 text-xs font-bold flex items-center justify-center text-gray-600 shrink-0">{index + 1}</span>
                <input
                  className="flex-1 px-3 py-2 border bg-white rounded-lg"
                  value={option.label}
                  placeholder={`${t("dashboard.polls.optionLabel", { defaultValue: "Option" })} ${index + 1}`}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                />
                <button type="button" onClick={() => duplicateOption(option.id)} className="p-2 text-gray-600 rounded-lg hover:bg-white" title={t("dashboard.polls.duplicate", { defaultValue: "Duplicate" })}>
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => removeOption(option.id)} className="p-2 text-red-600 rounded-lg hover:bg-white"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          {validOptions.length < 2 && (
            <p className="text-xs text-red-600 mt-2">{t("dashboard.polls.minOptions", { defaultValue: "Add at least 2 options." })}</p>
          )}
          {hasDuplicateOptions && (
            <p className="text-xs text-red-600 mt-1">{t("dashboard.polls.duplicateOptions", { defaultValue: "Options cannot be duplicated." })}</p>
          )}
        </div>

        <div className="pt-3 border-t">
          <h2 className="text-base font-black text-[#1A1A1A] mb-3">{t("dashboard.polls.settings", { defaultValue: "Settings" })}</h2>

          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm bg-gray-50 border rounded-xl px-3 py-2"><input type="checkbox" checked={state.isActive} onChange={(e) => setState((p) => ({ ...p, isActive: e.target.checked }))} /> {t("dashboard.polls.active", { defaultValue: "Active" })}</label>
            <label className="flex items-center gap-2 text-sm bg-gray-50 border rounded-xl px-3 py-2"><input type="checkbox" checked={state.allowMultipleChoices} onChange={(e) => setState((p) => ({ ...p, allowMultipleChoices: e.target.checked }))} /> {t("dashboard.polls.multi", { defaultValue: "Allow multiple choices" })}</label>
            <label className="flex items-center gap-2 text-sm bg-gray-50 border rounded-xl px-3 py-2"><input type="checkbox" checked={state.requireName} onChange={(e) => setState((p) => ({ ...p, requireName: e.target.checked }))} /> {t("dashboard.polls.requireName", { defaultValue: "Require name" })}</label>
            <label className="flex items-center gap-2 text-sm bg-gray-50 border rounded-xl px-3 py-2"><input type="checkbox" checked={state.requireEmail} onChange={(e) => setState((p) => ({ ...p, requireEmail: e.target.checked }))} /> {t("dashboard.polls.requireEmail", { defaultValue: "Require email" })}</label>
            <label className="flex items-center gap-2 text-sm bg-gray-50 border rounded-xl px-3 py-2 md:col-span-2"><input type="checkbox" checked={state.showResultsPublic} onChange={(e) => setState((p) => ({ ...p, showResultsPublic: e.target.checked }))} /> {t("dashboard.polls.showResults", { defaultValue: "Show public results" })}</label>
          </div>

          <div className="pt-3">
            <label className="text-sm font-semibold">{t("dashboard.polls.chartType", { defaultValue: "Result chart type" })}</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { value: "bar", label: t("dashboard.polls.chartBar", { defaultValue: "Bar" }) },
                { value: "pie", label: t("dashboard.polls.chartPie", { defaultValue: "Pie" }) },
                { value: "donut", label: t("dashboard.polls.chartDonut", { defaultValue: "Donut" }) },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setState((p) => ({ ...p, chartType: item.value as "bar" | "pie" | "donut" }))}
                  className={`px-3 py-2 rounded-xl border text-sm font-semibold ${state.chartType === item.value ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">{t("dashboard.polls.chartColors", { defaultValue: "Chart colors" })}</label>
              <button
                type="button"
                onClick={() => setState((p) => ({ ...p, chartColors: [...p.chartColors, "#000000"].slice(0, 12) }))}
                className="text-xs font-semibold text-gray-700"
                disabled={state.chartColors.length >= 12}
              >
                + {t("dashboard.polls.addColor", { defaultValue: "Add color" })}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {state.chartColors.map((color, index) => {
                const optionLabel = state.options[index]?.label?.trim();

                return (
                  <div key={`chart-color-${index}`} className="border rounded-lg p-2 bg-white">
                    <div className="mb-2 text-xs font-bold text-gray-600 uppercase tracking-wide">
                      {t("dashboard.polls.colorLabel", { defaultValue: "Color" })} {index + 1}
                      {optionLabel ? ` • ${optionLabel}` : ""}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                        <input
                          type="color"
                          value={normalizeHexColor(color)}
                          onChange={(e) => {
                            const next = [...state.chartColors];
                            next[index] = normalizeHexColor(e.target.value, color || "#000000");
                            setState((p) => ({ ...p, chartColors: next }));
                          }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={normalizeHexColor(color).toUpperCase()}
                        onChange={(e) => {
                          const next = [...state.chartColors];
                          next[index] = e.target.value;
                          setState((p) => ({ ...p, chartColors: next }));
                        }}
                        onBlur={(e) => {
                          const next = [...state.chartColors];
                          next[index] = normalizeHexColor(e.target.value, "#000000");
                          setState((p) => ({ ...p, chartColors: next }));
                        }}
                        className="flex-1 bg-gray-50 border-2 border-black rounded-lg pl-3 pr-3 py-2 text-sm font-mono font-bold uppercase focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                        placeholder="#000000"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={state.chartColors.length <= 1}
                      onClick={() => setState((p) => ({ ...p, chartColors: p.chartColors.filter((_, i) => i !== index) }))}
                      className="text-xs mt-2 text-red-600 font-semibold"
                    >
                      {t("dashboard.polls.removeColor", { defaultValue: "Remove" })}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 pt-1 border-t border-gray-200">
          <div>
            <label className="text-sm font-semibold">{t("dashboard.polls.startsAt", { defaultValue: "Start date" })}</label>
            <input type="datetime-local" className="w-full mt-1 px-3 py-2 border rounded-lg" value={state.startsAt} onChange={(e) => setState((p) => ({ ...p, startsAt: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-semibold">{t("dashboard.polls.endsAt", { defaultValue: "End date" })}</label>
            <input type="datetime-local" className="w-full mt-1 px-3 py-2 border rounded-lg" min={state.startsAt || undefined} value={state.endsAt} onChange={(e) => setState((p) => ({ ...p, endsAt: e.target.value }))} />
          </div>
        </div>

        {hasInvalidDateRange && (
          <p className="text-xs text-red-600">{t("dashboard.polls.invalidDateRange", { defaultValue: "End date must be after start date." })}</p>
        )}

        {!canSave && (
          <p className="text-xs text-gray-600 pt-1">
            {t("dashboard.polls.saveHint", { defaultValue: "To save: add title, keep at least 2 valid options, and fix validation issues." })}
          </p>
        )}
      </div>
    </div>
    </div>
  );
}
