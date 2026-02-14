import { useContext, useEffect, useMemo, useState } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import {
  getInstagramAutoReplyConfig,
  getInstagramLastWebhookEvent,
  getInstagramWebhookConfig,
  publishInstagramAutoReplyConfig,
  saveInstagramAutoReplyConfig,
  type InstagramAutoReplyConfig,
  type InstagramLastWebhookEventResponse,
  type InstagramAutoReplyPayload,
  type InstagramAutoReplyResponse,
  type InstagramWebhookConfigResponse,
} from "~/services/instagram-tools.service";
import { Loader2, Instagram, Sparkles, Settings2, Plus, CheckCircle2, MessageCircle, Send, WandSparkles, Copy, RefreshCcw } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
  return [
    { title: "Instagram auto-reply | Portyo" },
    { name: "description", content: "Configure Instagram auto-reply flows in a simple and beautiful way." },
  ];
};

export default function DashboardInstagramAutoReply() {
  const { bio } = useContext(BioContext);
  const { user } = useContext(AuthContext);
  const { t } = useTranslation("dashboard");

  const defaultForm = useMemo<InstagramAutoReplyPayload>(() => ({
    ruleName: t("instagramAutoReply.defaults.ruleName"),
    triggerType: "instagram_comment_received",
    keywordMode: "all",
    keywords: [],
    dmMessage: t("instagramAutoReply.defaults.dmMessage"),
    publicReplyEnabled: false,
    publicReplyMessage: t("instagramAutoReply.defaults.publicReplyMessage"),
    fallbackDmMessage: "",
  }), [t]);

  const stepLabels = useMemo(
    () => [
      t("instagramAutoReply.steps.trigger"),
      t("instagramAutoReply.steps.keywords"),
      t("instagramAutoReply.steps.message"),
      t("instagramAutoReply.steps.review"),
    ],
    [t]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [step, setStep] = useState(1);

  const [responseData, setResponseData] = useState<InstagramAutoReplyResponse | null>(null);
  const [webhookConfig, setWebhookConfig] = useState<InstagramWebhookConfigResponse | null>(null);
  const [lastWebhookEvent, setLastWebhookEvent] = useState<InstagramLastWebhookEventResponse | null>(null);
  const [loadingLastWebhookEvent, setLoadingLastWebhookEvent] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [rules, setRules] = useState<InstagramAutoReplyConfig[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [form, setForm] = useState<InstagramAutoReplyPayload>(defaultForm);

  const selectedRule = useMemo(
    () => rules.find((item) => item.automationId === selectedRuleId) || null,
    [rules, selectedRuleId]
  );

  const limits = responseData?.limits || {
    maxKeywords: 1,
    maxRules: 1,
    canUsePublicReply: false,
    canUseFallbackDm: false,
  };

  const usage = responseData?.usage || {
    totalRules: 0,
    remainingRules: 0,
  };

  const load = async () => {
    if (!bio?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getInstagramAutoReplyConfig(bio.id);
      const webhook = await getInstagramWebhookConfig();
      const lastEvent = await getInstagramLastWebhookEvent(bio.id);
      setResponseData(response);
      setWebhookConfig(webhook);
      setLastWebhookEvent(lastEvent);
      setRules(response.configs || []);

      const firstRule = response.configs?.[0] || null;
      if (firstRule) {
        setSelectedRuleId(firstRule.automationId || null);
        setForm({
          automationId: firstRule.automationId || undefined,
          ruleName: firstRule.ruleName || t("instagramAutoReply.defaults.ruleName"),
          triggerType: firstRule.triggerType,
          keywordMode: firstRule.keywordMode,
          keywords: firstRule.keywords || [],
          dmMessage: firstRule.dmMessage || "",
          publicReplyEnabled: firstRule.publicReplyEnabled || false,
          publicReplyMessage: firstRule.publicReplyMessage || "",
          fallbackDmMessage: firstRule.fallbackDmMessage || "",
        });
      } else {
        setSelectedRuleId(null);
        setForm(defaultForm);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("instagramAutoReply.errors.load"));
    } finally {
      setLoading(false);
    }
  };

  const loadLastWebhookEvent = async () => {
    if (!bio?.id) return;
    setLoadingLastWebhookEvent(true);
    try {
      const data = await getInstagramLastWebhookEvent(bio.id);
      setLastWebhookEvent(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("instagramAutoReply.errors.loadWebhook"));
    } finally {
      setLoadingLastWebhookEvent(false);
    }
  };

  const handleCopyWebhookUrl = async () => {
    if (!webhookConfig?.callbackUrl) return;
    try {
      await navigator.clipboard.writeText(webhookConfig.callbackUrl);
      setCopiedWebhook(true);
      toast.success(t("instagramAutoReply.webhook.copied"));
      setTimeout(() => setCopiedWebhook(false), 1800);
    } catch {
      toast.error(t("instagramAutoReply.webhook.copyError"));
    }
  };

  useEffect(() => {
    load();
  }, [bio?.id]);

  const keywordText = useMemo(() => form.keywords.join(", "), [form.keywords]);

  const setKeywordText = (value: string) => {
    const parsed = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, limits.maxKeywords);

    setForm((prev) => ({ ...prev, keywords: parsed }));
  };

  const selectRule = (rule: InstagramAutoReplyConfig) => {
    setSelectedRuleId(rule.automationId || null);
    setForm({
      automationId: rule.automationId || undefined,
      ruleName: rule.ruleName || t("instagramAutoReply.defaults.ruleName"),
      triggerType: rule.triggerType,
      keywordMode: rule.keywordMode,
      keywords: rule.keywords || [],
      dmMessage: rule.dmMessage || "",
      publicReplyEnabled: rule.publicReplyEnabled || false,
      publicReplyMessage: rule.publicReplyMessage || "",
      fallbackDmMessage: rule.fallbackDmMessage || "",
    });
  };

  const createNewRule = () => {
    if (usage.totalRules >= limits.maxRules) {
      toast.error(t("instagramAutoReply.errors.planLimit", { maxRules: limits.maxRules }));
      return;
    }

    setSelectedRuleId(null);
    setStep(1);
    setForm({
      ...defaultForm,
      ruleName: t("instagramAutoReply.defaults.ruleNameIndexed", { index: usage.totalRules + 1 }),
    });
  };

  const saveDraft = async () => {
    if (!bio?.id) return;

    setSaving(true);
    try {
      const response = await saveInstagramAutoReplyConfig(bio.id, {
        ...form,
        automationId: selectedRuleId || undefined,
      });
      setSelectedRuleId(response.automationId);
      toast.success(t("instagramAutoReply.success.saved"));
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("instagramAutoReply.errors.save"));
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!bio?.id) return;

    setPublishing(true);
    try {
      const saved = await saveInstagramAutoReplyConfig(bio.id, {
        ...form,
        automationId: selectedRuleId || undefined,
      });
      await publishInstagramAutoReplyConfig(bio.id, saved.automationId);
      toast.success(t("instagramAutoReply.success.published"));
      setSelectedRuleId(saved.automationId);
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("instagramAutoReply.errors.publish"));
    } finally {
      setPublishing(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(4, prev + 1));
  const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

  return (
    <AuthorizationGuard>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <header className="bg-white rounded-[20px] border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black bg-[#F3F3F1] text-xs font-black uppercase tracking-wider">
                <Instagram className="w-3.5 h-3.5" />
                Instagram
              </div>
              <h1 className="mt-3 text-2xl sm:text-4xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: "var(--font-display)" }}>
                {t("instagramAutoReply.title")}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium mt-1">
                {t("instagramAutoReply.subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-2 py-1 rounded-full border border-black bg-white">{t("instagramAutoReply.chips.plan")}: {(user?.plan || "free").toUpperCase()}</span>
              <span className="px-2 py-1 rounded-full border border-black bg-white">{t("instagramAutoReply.chips.rules")}: {usage.totalRules}/{limits.maxRules}</span>
              <span className="px-2 py-1 rounded-full border border-black bg-white">{t("instagramAutoReply.chips.keywords", { maxKeywords: limits.maxKeywords })}</span>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <aside className="lg:col-span-4 bg-white rounded-[20px] border-2 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-fit">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-black">{t("instagramAutoReply.rules.title")}</h2>
              <button
                onClick={createNewRule}
                disabled={usage.totalRules >= limits.maxRules}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-black font-black text-xs bg-[#C6F035] disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("instagramAutoReply.actions.new")}
              </button>
            </div>

            {loading ? (
              <div className="py-10 text-center text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                {t("instagramAutoReply.loading.rules")}
              </div>
            ) : rules.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500">
                {t("instagramAutoReply.emptyRules")}
              </div>
            ) : (
              <div className="space-y-2">
                {rules.map((rule, index) => {
                  const isSelected = rule.automationId === selectedRuleId;
                  return (
                    <button
                      key={rule.automationId || `rule-${index}`}
                      onClick={() => selectRule(rule)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${isSelected ? "border-black bg-[#F8F9FA]" : "border-gray-200 bg-white hover:border-black"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black text-sm text-[#1A1A1A] truncate">{rule.ruleName || t("instagramAutoReply.rules.ruleFallback", { index: index + 1 })}</p>
                        {rule.active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-black text-[10px] font-black bg-[#C6F035]">
                            <CheckCircle2 className="w-3 h-3" />
                            {t("instagramAutoReply.status.active")}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full border border-gray-300 text-[10px] font-bold text-gray-500">{t("instagramAutoReply.status.draft")}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{rule.triggerType === "instagram_dm_received" ? t("instagramAutoReply.trigger.dm") : t("instagramAutoReply.trigger.comment")}</p>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 p-3 rounded-xl bg-[#F8F9FA] border border-gray-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{t("instagramAutoReply.planLimits.title")}</p>
              <p className="text-sm font-medium text-[#1A1A1A] mt-1">
                {t("instagramAutoReply.planLimits.body")}
              </p>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-[#F8F9FA] border border-gray-200 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{t("instagramAutoReply.webhook.title")}</p>
              <p className="text-xs text-gray-600">{t("instagramAutoReply.webhook.subtitle")}</p>
              <div className="p-2 rounded-lg bg-white border border-gray-300 text-xs break-all text-[#1A1A1A]">
                {webhookConfig?.callbackUrl || t("instagramAutoReply.loading.webhookUrl")}
              </div>
              <button
                onClick={handleCopyWebhookUrl}
                disabled={!webhookConfig?.callbackUrl}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black font-bold text-xs bg-white disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedWebhook ? t("instagramAutoReply.webhook.copiedShort") : t("instagramAutoReply.webhook.copyUrl")}
              </button>
              <div className="text-[11px] text-gray-500">
                {t("instagramAutoReply.webhook.requiredFields", { fields: webhookConfig?.requiredFields?.join(", ") || "messages, comments" })}
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-[#F8F9FA] border border-gray-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{t("instagramAutoReply.lastWebhook.title")}</p>
                <button
                  onClick={loadLastWebhookEvent}
                  disabled={loadingLastWebhookEvent || !bio?.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-black bg-white text-xs font-bold disabled:opacity-50"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${loadingLastWebhookEvent ? "animate-spin" : ""}`} />
                  {t("instagramAutoReply.actions.refresh")}
                </button>
              </div>

              {!lastWebhookEvent?.event ? (
                <p className="text-xs text-gray-600">{t("instagramAutoReply.lastWebhook.empty")}</p>
              ) : (
                <div className="space-y-2 text-xs text-[#1A1A1A]">
                  <div className="grid grid-cols-1 gap-1.5">
                    <div><span className="font-bold">{t("instagramAutoReply.lastWebhook.status")}:</span> {lastWebhookEvent.event.status}</div>
                    <div><span className="font-bold">{t("instagramAutoReply.lastWebhook.event")}:</span> {lastWebhookEvent.event.eventType}</div>
                    <div><span className="font-bold">{t("instagramAutoReply.lastWebhook.received")}:</span> {new Date(lastWebhookEvent.event.receivedAt).toLocaleString()}</div>
                    <div><span className="font-bold">{t("instagramAutoReply.lastWebhook.account")}:</span> {lastWebhookEvent.event.accountId}</div>
                    <div><span className="font-bold">{t("instagramAutoReply.lastWebhook.message")}:</span> {lastWebhookEvent.event.messagePreview || "-"}</div>
                    <div><span className="font-bold">{t("instagramAutoReply.lastWebhook.triggers")}:</span> {lastWebhookEvent.event.triggerCounts ? `${lastWebhookEvent.event.triggerCounts.eventExecutions} event / ${lastWebhookEvent.event.triggerCounts.webhookExecutions} webhook` : "0"}</div>
                  </div>
                  {lastWebhookEvent.event.status === "ignored_no_bio" && (
                    <p className="text-[11px] text-amber-700">{t("instagramAutoReply.lastWebhook.ignoredNoBio")}</p>
                  )}
                </div>
              )}
            </div>
          </aside>

          <div className="lg:col-span-8 bg-white rounded-[20px] border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                {t("instagramAutoReply.loading.editor")}
              </div>
            ) : !bio?.id ? (
              <div className="py-10 text-gray-500">{t("instagramAutoReply.errors.selectBio")}</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-[#FAFAFA] p-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{t("instagramAutoReply.fields.ruleName")}</label>
                    <input
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border-2 border-black font-bold"
                      value={form.ruleName || ""}
                      onChange={(event) => setForm((prev) => ({ ...prev, ruleName: event.target.value }))}
                      placeholder={t("instagramAutoReply.defaults.ruleName")}
                    />
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-[#111827] text-white p-4 flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-wider text-white/70 font-bold">{t("instagramAutoReply.currentStatus.title")}</p>
                    <p className="text-lg font-black mt-1">{selectedRule?.active ? t("instagramAutoReply.status.active") : t("instagramAutoReply.status.draft")}</p>
                    <p className="text-xs text-white/70">{t("instagramAutoReply.currentStatus.hint")}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wider">
                  {stepLabels.map((label, index) => {
                    const current = index + 1;
                    return (
                      <button
                        key={label}
                        onClick={() => setStep(current)}
                        className={`px-3 py-1.5 rounded-lg border ${current === step ? "border-black bg-black text-white" : "border-gray-300 bg-[#F8F9FA] text-gray-600"}`}
                      >
                        {current}. {label}
                      </button>
                    );
                  })}
                </div>

                {step === 1 && (
                  <div className="space-y-3 p-4 rounded-2xl border border-gray-200 bg-[#FAFAFA]">
                    <h3 className="text-lg font-black">{t("instagramAutoReply.trigger.title")}</h3>
                    <label className="flex items-center gap-2 font-medium">
                      <input
                        type="radio"
                        checked={form.triggerType === "instagram_comment_received"}
                        onChange={() => setForm((prev) => ({ ...prev, triggerType: "instagram_comment_received" }))}
                      />
                      {t("instagramAutoReply.trigger.commentReceived")}
                    </label>
                    <label className="flex items-center gap-2 font-medium">
                      <input
                        type="radio"
                        checked={form.triggerType === "instagram_dm_received"}
                        onChange={() => setForm((prev) => ({ ...prev, triggerType: "instagram_dm_received" }))}
                      />
                      {t("instagramAutoReply.trigger.dmReceived")}
                    </label>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3 p-4 rounded-2xl border border-gray-200 bg-[#FAFAFA]">
                    <h3 className="text-lg font-black">{t("instagramAutoReply.keywords.title")}</h3>
                    <label className="flex items-center gap-2 font-medium">
                      <input
                        type="radio"
                        checked={form.keywordMode === "all"}
                        onChange={() => setForm((prev) => ({ ...prev, keywordMode: "all", keywords: [] }))}
                      />
                      {t("instagramAutoReply.keywords.all")}
                    </label>
                    <label className="flex items-center gap-2 font-medium">
                      <input
                        type="radio"
                        checked={form.keywordMode === "specific"}
                        onChange={() => setForm((prev) => ({ ...prev, keywordMode: "specific" }))}
                      />
                      {t("instagramAutoReply.keywords.specific")}
                    </label>

                    {form.keywordMode === "specific" && (
                      <div>
                        <textarea
                          className="mt-1 w-full px-3 py-2.5 border-2 border-black rounded-xl font-medium min-h-[90px]"
                          value={keywordText}
                          onChange={(event) => setKeywordText(event.target.value)}
                          placeholder={t("instagramAutoReply.keywords.placeholder")}
                        />
                        <p className="text-xs text-gray-500 mt-1">{t("instagramAutoReply.keywords.limit", { maxKeywords: limits.maxKeywords })}</p>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 p-4 rounded-2xl border border-gray-200 bg-[#FAFAFA]">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("instagramAutoReply.messages.dm")}</label>
                      <textarea
                        className="mt-1 w-full px-3 py-2.5 border-2 border-black rounded-xl font-medium min-h-[120px]"
                        value={form.dmMessage}
                        onChange={(event) => setForm((prev) => ({ ...prev, dmMessage: event.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 font-medium">
                        <input
                          type="checkbox"
                          checked={form.publicReplyEnabled}
                          disabled={!limits.canUsePublicReply}
                          onChange={(event) => setForm((prev) => ({ ...prev, publicReplyEnabled: event.target.checked }))}
                        />
                        {t("instagramAutoReply.messages.publicReplyToggle")}
                      </label>
                      {form.publicReplyEnabled && limits.canUsePublicReply && (
                        <input
                          className="mt-2 w-full px-3 py-2.5 border-2 border-black rounded-xl font-medium"
                          value={form.publicReplyMessage || ""}
                          onChange={(event) => setForm((prev) => ({ ...prev, publicReplyMessage: event.target.value }))}
                          placeholder={t("instagramAutoReply.messages.publicReplyPlaceholder")}
                        />
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("instagramAutoReply.messages.fallbackTitle")}</label>
                      <textarea
                        className="mt-1 w-full px-3 py-2.5 border-2 border-black rounded-xl font-medium min-h-[80px] disabled:bg-gray-100"
                        value={form.fallbackDmMessage || ""}
                        disabled={!limits.canUseFallbackDm}
                        onChange={(event) => setForm((prev) => ({ ...prev, fallbackDmMessage: event.target.value }))}
                        placeholder={limits.canUseFallbackDm ? t("instagramAutoReply.messages.fallbackPlaceholder") : t("instagramAutoReply.messages.fallbackProOnly")}
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-3 p-4 rounded-2xl border border-gray-200 bg-[#FAFAFA]">
                    <h3 className="text-lg font-black">{t("instagramAutoReply.review.title")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-xl border border-gray-300 bg-white">
                        <p className="font-bold">{t("instagramAutoReply.review.ruleName")}</p>
                        <p>{form.ruleName || t("instagramAutoReply.defaults.ruleName")}</p>
                      </div>
                      <div className="p-3 rounded-xl border border-gray-300 bg-white">
                        <p className="font-bold">{t("instagramAutoReply.review.trigger")}</p>
                        <p>{form.triggerType === "instagram_dm_received" ? t("instagramAutoReply.trigger.dm") : t("instagramAutoReply.trigger.comment")}</p>
                      </div>
                      <div className="p-3 rounded-xl border border-gray-300 bg-white">
                        <p className="font-bold">{t("instagramAutoReply.review.keywordMode")}</p>
                        <p>{form.keywordMode} {form.keywords.length ? `(${form.keywords.join(", ")})` : ""}</p>
                      </div>
                      <div className="p-3 rounded-xl border border-gray-300 bg-white">
                        <p className="font-bold">{t("instagramAutoReply.review.publicReply")}</p>
                        <p>{form.publicReplyEnabled ? t("instagramAutoReply.review.enabled") : t("instagramAutoReply.review.disabled")}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-gray-300 bg-white text-sm">
                      {t("instagramAutoReply.review.advancedPrefix")} <Link to="/dashboard/automation" className="font-bold underline">{t("instagramAutoReply.review.automations")}</Link>.
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={prevStep}
                      disabled={step === 1}
                      className="px-4 py-2 rounded-xl border-2 border-black font-bold disabled:opacity-50"
                    >
                      {t("instagramAutoReply.actions.back")}
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={step === 4}
                      className="px-4 py-2 rounded-xl border-2 border-black font-bold bg-[#C6F035]"
                    >
                      {t("instagramAutoReply.actions.next")}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveDraft}
                      disabled={saving || publishing}
                      className="px-4 py-2 rounded-xl border-2 border-black font-bold bg-white"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t("instagramAutoReply.actions.saveDraft")}
                    </button>
                    <button
                      onClick={publish}
                      disabled={saving || publishing}
                      className="px-4 py-2 rounded-xl border-2 border-black font-bold bg-black text-white"
                    >
                      {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : t("instagramAutoReply.actions.publish")}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-gray-300 bg-white">
                    <div className="flex items-center gap-2 font-black text-sm"><MessageCircle className="w-4 h-4" /> {t("instagramAutoReply.tiers.free")}</div>
                    <p className="text-xs text-gray-500 mt-1">{t("instagramAutoReply.tiers.freeDesc")}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-gray-300 bg-white">
                    <div className="flex items-center gap-2 font-black text-sm"><Settings2 className="w-4 h-4" /> {t("instagramAutoReply.tiers.standard")}</div>
                    <p className="text-xs text-gray-500 mt-1">{t("instagramAutoReply.tiers.standardDesc")}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-gray-300 bg-white">
                    <div className="flex items-center gap-2 font-black text-sm"><WandSparkles className="w-4 h-4" /> {t("instagramAutoReply.tiers.pro")}</div>
                    <p className="text-xs text-gray-500 mt-1">{t("instagramAutoReply.tiers.proDesc")}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AuthorizationGuard>
  );
}
