import { useContext, useEffect, useMemo, useState } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import {
  getInstagramAutoReplyConfig,
  getInstagramWebhookConfig,
  publishInstagramAutoReplyConfig,
  saveInstagramAutoReplyConfig,
  type InstagramAutoReplyConfig,
  type InstagramAutoReplyPayload,
  type InstagramAutoReplyResponse,
  type InstagramWebhookConfigResponse,
} from "~/services/instagram-tools.service";
import { Loader2, Instagram, Sparkles, Settings2, Plus, CheckCircle2, MessageCircle, Send, WandSparkles, Copy } from "lucide-react";
import { toast } from "react-hot-toast";

export const meta: MetaFunction = () => {
  return [
    { title: "Instagram auto-reply | Portyo" },
    { name: "description", content: "Configure Instagram auto-reply flows in a simple and beautiful way." },
  ];
};

const DEFAULT_FORM: InstagramAutoReplyPayload = {
  ruleName: "Instagram Auto Reply",
  triggerType: "instagram_comment_received",
  keywordMode: "all",
  keywords: [],
  dmMessage: "Hey, thanks for reaching out! 💜 Check this out 👇",
  publicReplyEnabled: false,
  publicReplyMessage: "I sent you a DM ✨",
  fallbackDmMessage: "",
};

const STEPS = ["Trigger", "Keywords", "Message", "Review"];

export default function DashboardInstagramAutoReply() {
  const { bio } = useContext(BioContext);
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [step, setStep] = useState(1);

  const [responseData, setResponseData] = useState<InstagramAutoReplyResponse | null>(null);
  const [webhookConfig, setWebhookConfig] = useState<InstagramWebhookConfigResponse | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [rules, setRules] = useState<InstagramAutoReplyConfig[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [form, setForm] = useState<InstagramAutoReplyPayload>(DEFAULT_FORM);

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
      setResponseData(response);
      setWebhookConfig(webhook);
      setRules(response.configs || []);

      const firstRule = response.configs?.[0] || null;
      if (firstRule) {
        setSelectedRuleId(firstRule.automationId || null);
        setForm({
          automationId: firstRule.automationId || undefined,
          ruleName: firstRule.ruleName || "Instagram Auto Reply",
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
        setForm(DEFAULT_FORM);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load auto-reply settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWebhookUrl = async () => {
    if (!webhookConfig?.callbackUrl) return;
    try {
      await navigator.clipboard.writeText(webhookConfig.callbackUrl);
      setCopiedWebhook(true);
      toast.success("Webhook URL copied.");
      setTimeout(() => setCopiedWebhook(false), 1800);
    } catch {
      toast.error("Could not copy webhook URL.");
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
      ruleName: rule.ruleName || "Instagram Auto Reply",
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
      toast.error(`Your plan allows up to ${limits.maxRules} auto-reply rule(s).`);
      return;
    }

    setSelectedRuleId(null);
    setStep(1);
    setForm({
      ...DEFAULT_FORM,
      ruleName: `Instagram Auto Reply ${usage.totalRules + 1}`,
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
      toast.success("Auto-reply rule saved.");
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save auto-reply rule.");
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
      toast.success("Auto-reply rule published.");
      setSelectedRuleId(saved.automationId);
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to publish auto-reply rule.");
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
                Auto-reply studio
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium mt-1">
                Setup simples, rápido e visual para responder comentários e DMs automaticamente.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-2 py-1 rounded-full border border-black bg-white">Plan: {(user?.plan || "free").toUpperCase()}</span>
              <span className="px-2 py-1 rounded-full border border-black bg-white">Rules: {usage.totalRules}/{limits.maxRules}</span>
              <span className="px-2 py-1 rounded-full border border-black bg-white">Keywords: up to {limits.maxKeywords}</span>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <aside className="lg:col-span-4 bg-white rounded-[20px] border-2 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-fit">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-black">Your rules</h2>
              <button
                onClick={createNewRule}
                disabled={usage.totalRules >= limits.maxRules}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-black font-black text-xs bg-[#C6F035] disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </button>
            </div>

            {loading ? (
              <div className="py-10 text-center text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                Loading rules...
              </div>
            ) : rules.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500">
                No rules yet. Create your first auto-reply rule.
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
                        <p className="font-black text-sm text-[#1A1A1A] truncate">{rule.ruleName || `Rule ${index + 1}`}</p>
                        {rule.active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-black text-[10px] font-black bg-[#C6F035]">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full border border-gray-300 text-[10px] font-bold text-gray-500">Draft</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{rule.triggerType === "instagram_dm_received" ? "Trigger: DM" : "Trigger: Comment"}</p>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 p-3 rounded-xl bg-[#F8F9FA] border border-gray-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Plan limits</p>
              <p className="text-sm font-medium text-[#1A1A1A] mt-1">
                Free: 1 rule • Standard: 3 rules • Pro: 5 rules
              </p>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-[#F8F9FA] border border-gray-200 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Webhook setup</p>
              <p className="text-xs text-gray-600">Use this callback URL in Meta App Webhooks (object: instagram).</p>
              <div className="p-2 rounded-lg bg-white border border-gray-300 text-xs break-all text-[#1A1A1A]">
                {webhookConfig?.callbackUrl || "Loading webhook URL..."}
              </div>
              <button
                onClick={handleCopyWebhookUrl}
                disabled={!webhookConfig?.callbackUrl}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black font-bold text-xs bg-white disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedWebhook ? "Copied" : "Copy URL"}
              </button>
              <div className="text-[11px] text-gray-500">
                Required fields: {webhookConfig?.requiredFields?.join(", ") || "messages, comments"}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 bg-white rounded-[20px] border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading editor...
              </div>
            ) : !bio?.id ? (
              <div className="py-10 text-gray-500">Select a bio first to configure Instagram auto-reply.</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-[#FAFAFA] p-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Rule name</label>
                    <input
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border-2 border-black font-bold"
                      value={form.ruleName || ""}
                      onChange={(event) => setForm((prev) => ({ ...prev, ruleName: event.target.value }))}
                      placeholder="Instagram Auto Reply"
                    />
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-[#111827] text-white p-4 flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-wider text-white/70 font-bold">Current status</p>
                    <p className="text-lg font-black mt-1">{selectedRule?.active ? "Active" : "Draft"}</p>
                    <p className="text-xs text-white/70">Publish to start responding automatically.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wider">
                  {STEPS.map((label, index) => {
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
                    <h3 className="text-lg font-black">What should trigger this rule?</h3>
                    <label className="flex items-center gap-2 font-medium">
                      <input
                        type="radio"
                        checked={form.triggerType === "instagram_comment_received"}
                        onChange={() => setForm((prev) => ({ ...prev, triggerType: "instagram_comment_received" }))}
                      />
                      Instagram comment received
                    </label>
                    <label className="flex items-center gap-2 font-medium">
                      <input
                        type="radio"
                        checked={form.triggerType === "instagram_dm_received"}
                        onChange={() => setForm((prev) => ({ ...prev, triggerType: "instagram_dm_received" }))}
                      />
                      Instagram DM received
                    </label>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3 p-4 rounded-2xl border border-gray-200 bg-[#FAFAFA]">
                    <h3 className="text-lg font-black">Keyword targeting</h3>
                    <label className="flex items-center gap-2 font-medium">
                      <input
                        type="radio"
                        checked={form.keywordMode === "all"}
                        onChange={() => setForm((prev) => ({ ...prev, keywordMode: "all", keywords: [] }))}
                      />
                      Reply to all incoming comments/messages
                    </label>
                    <label className="flex items-center gap-2 font-medium">
                      <input
                        type="radio"
                        checked={form.keywordMode === "specific"}
                        onChange={() => setForm((prev) => ({ ...prev, keywordMode: "specific" }))}
                      />
                      Reply only when keywords match
                    </label>

                    {form.keywordMode === "specific" && (
                      <div>
                        <textarea
                          className="mt-1 w-full px-3 py-2.5 border-2 border-black rounded-xl font-medium min-h-[90px]"
                          value={keywordText}
                          onChange={(event) => setKeywordText(event.target.value)}
                          placeholder="price, details, link"
                        />
                        <p className="text-xs text-gray-500 mt-1">Plan limit: {limits.maxKeywords} keyword(s).</p>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 p-4 rounded-2xl border border-gray-200 bg-[#FAFAFA]">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">DM message</label>
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
                        Enable public comment reply (Standard+)
                      </label>
                      {form.publicReplyEnabled && limits.canUsePublicReply && (
                        <input
                          className="mt-2 w-full px-3 py-2.5 border-2 border-black rounded-xl font-medium"
                          value={form.publicReplyMessage || ""}
                          onChange={(event) => setForm((prev) => ({ ...prev, publicReplyMessage: event.target.value }))}
                          placeholder="Public reply message"
                        />
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fallback DM (Pro)</label>
                      <textarea
                        className="mt-1 w-full px-3 py-2.5 border-2 border-black rounded-xl font-medium min-h-[80px] disabled:bg-gray-100"
                        value={form.fallbackDmMessage || ""}
                        disabled={!limits.canUseFallbackDm}
                        onChange={(event) => setForm((prev) => ({ ...prev, fallbackDmMessage: event.target.value }))}
                        placeholder={limits.canUseFallbackDm ? "Optional fallback message" : "Available on Pro"}
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-3 p-4 rounded-2xl border border-gray-200 bg-[#FAFAFA]">
                    <h3 className="text-lg font-black">Review rule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-xl border border-gray-300 bg-white">
                        <p className="font-bold">Rule name</p>
                        <p>{form.ruleName || "Instagram Auto Reply"}</p>
                      </div>
                      <div className="p-3 rounded-xl border border-gray-300 bg-white">
                        <p className="font-bold">Trigger</p>
                        <p>{form.triggerType === "instagram_dm_received" ? "Instagram DM" : "Instagram Comment"}</p>
                      </div>
                      <div className="p-3 rounded-xl border border-gray-300 bg-white">
                        <p className="font-bold">Keyword mode</p>
                        <p>{form.keywordMode} {form.keywords.length ? `(${form.keywords.join(", ")})` : ""}</p>
                      </div>
                      <div className="p-3 rounded-xl border border-gray-300 bg-white">
                        <p className="font-bold">Public reply</p>
                        <p>{form.publicReplyEnabled ? "Enabled" : "Disabled"}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-gray-300 bg-white text-sm">
                      Need advanced flows? Use <Link to="/dashboard/automation" className="font-bold underline">Automations</Link>.
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
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={step === 4}
                      className="px-4 py-2 rounded-xl border-2 border-black font-bold bg-[#C6F035]"
                    >
                      Next
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveDraft}
                      disabled={saving || publishing}
                      className="px-4 py-2 rounded-xl border-2 border-black font-bold bg-white"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save draft"}
                    </button>
                    <button
                      onClick={publish}
                      disabled={saving || publishing}
                      className="px-4 py-2 rounded-xl border-2 border-black font-bold bg-black text-white"
                    >
                      {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-gray-300 bg-white">
                    <div className="flex items-center gap-2 font-black text-sm"><MessageCircle className="w-4 h-4" /> Free</div>
                    <p className="text-xs text-gray-500 mt-1">Create up to 1 auto-reply rule.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-gray-300 bg-white">
                    <div className="flex items-center gap-2 font-black text-sm"><Settings2 className="w-4 h-4" /> Standard</div>
                    <p className="text-xs text-gray-500 mt-1">Create up to 3 rules + public replies.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-gray-300 bg-white">
                    <div className="flex items-center gap-2 font-black text-sm"><WandSparkles className="w-4 h-4" /> Pro</div>
                    <p className="text-xs text-gray-500 mt-1">Create up to 5 rules + fallback DM.</p>
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
