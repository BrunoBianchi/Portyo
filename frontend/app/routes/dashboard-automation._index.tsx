
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
    Zap,
    Plus,
    MoreHorizontal,
    Play,
    Pause,
    Edit,
    Trash2,
    Loader2,
    BarChart2,
    Activity,
    Mail
} from "lucide-react";
import { useBio } from "~/contexts/bio.context";
import { AuthorizationGuard } from "~/contexts/guard.context";
import {
    getAutomationsByBio,
    createAutomation,
    activateAutomation,
    deactivateAutomation,
    deleteAutomation,
    type Automation
} from "~/services/automation.service";
import type { Route } from "../+types/root";
import { DeleteConfirmationModal } from "~/components/dashboard/delete-confirmation-modal";
import { EmailUsageService, type EmailUsage } from "~/services/email-usage.service";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Automations | Portyo" },
        { name: "description", content: "Manage your email automation workflows" },
    ];
}

// Helper function to get automation limit based on plan
function getAutomationLimit(plan: string): number {
    const planLimits: { [key: string]: number } = {
        'free': 0,
        'standard': 2,
        'pro': 4
    };
    return planLimits[plan.toLowerCase()] || 0;
}

export default function DashboardAutomationList() {
    const { bio } = useBio();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
        isOpen: false,
        id: null
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [emailUsage, setEmailUsage] = useState<EmailUsage | null>(null);
    const [loadingUsage, setLoadingUsage] = useState(true);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const isMobile = useIsMobile();
    const { startTour } = useDriverTour({ primaryColor: tourPrimaryColor, storageKey: "portyo:automation-tour-done" });

    // Load automations
    const loadAutomations = async () => {
        if (!bio?.id) return;
        try {
            setLoading(true);
            const data = await getAutomationsByBio(bio.id);
            setAutomations(data);
        } catch (error) {
            console.error("Failed to load automations:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load email usage
    const loadEmailUsage = async () => {
        try {
            setLoadingUsage(true);
            const usage = await EmailUsageService.getEmailUsage();
            setEmailUsage(usage);
        } catch (error) {
            console.error("Failed to load email usage:", error);
        } finally {
            setLoadingUsage(false);
        }
    };

    useEffect(() => {
        loadAutomations();
        loadEmailUsage();
    }, [bio?.id]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isMobile) return;

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, [isMobile]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isMobile) return;

        const hasSeenTour = window.localStorage.getItem("portyo:automation-tour-done");
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                startTour(automationTourSteps);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isMobile, startTour]);

    const automationTourSteps: DriveStep[] = useMemo(() => [
        {
            element: "[data-tour=\"automation-header\"]",
            popover: { title: t("dashboard.tours.automation.steps.header"), description: t("dashboard.tours.automation.steps.header"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"automation-create\"]",
            popover: { title: t("dashboard.tours.automation.steps.create"), description: t("dashboard.tours.automation.steps.create"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"automation-usage\"]",
            popover: { title: t("dashboard.tours.automation.steps.usage"), description: t("dashboard.tours.automation.steps.usage"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"automation-list\"]",
            popover: { title: t("dashboard.tours.automation.steps.list"), description: t("dashboard.tours.automation.steps.list"), side: "top", align: "start" },
        },
        {
            element: "[data-tour=\"automation-card\"]",
            popover: { title: t("dashboard.tours.automation.steps.card"), description: t("dashboard.tours.automation.steps.card"), side: "top", align: "start" },
        },
        {
            element: "[data-tour=\"automation-actions\"]",
            popover: { title: t("dashboard.tours.automation.steps.actions"), description: t("dashboard.tours.automation.steps.actions"), side: "top", align: "start" },
        },
    ], [t]);


    const handleCreate = async (template: "welcome" | "discord" | "webhook" = "welcome") => {
        if (!bio?.id) return;
        setCreating(true);
        try {
            const templates = {
                welcome: {
                    name: "Welcome Subscriber",
                    nodes: [
                        { id: '1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'New Subscriber', eventType: 'newsletter_subscribe' } },
                        { id: '2', type: 'action', position: { x: 250, y: 250 }, data: { label: 'Welcome Email', subject: 'Welcome!', content: 'Thanks for subscribing!' } }
                    ],
                    edges: [{ id: 'e1-2', source: '1', target: '2' }]
                },
                discord: {
                    name: "Discord Alert Flow",
                    nodes: [
                        { id: '1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'New Subscriber', eventType: 'newsletter_subscribe' } },
                        { id: '2', type: 'discord', position: { x: 250, y: 250 }, data: { label: 'Discord Alert', discordMessage: 'Novo inscrito: {{email}}' } }
                    ],
                    edges: [{ id: 'e1-2', source: '1', target: '2' }]
                },
                webhook: {
                    name: "Webhook Bridge",
                    nodes: [
                        { id: '1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'Link Clicked', eventType: 'link_click' } },
                        { id: '2', type: 'webhook', position: { x: 250, y: 250 }, data: { label: 'Send Webhook', webhookMethod: 'POST' } }
                    ],
                    edges: [{ id: 'e1-2', source: '1', target: '2' }]
                }
            } as const;

            const selectedTemplate = templates[template];

            const newAutomation = await createAutomation(
                bio.id,
                selectedTemplate.name,
                selectedTemplate.nodes as any,
                selectedTemplate.edges as any
            );
            navigate(`/dashboard/automation/${newAutomation.id}`);
        } catch (error) {
            console.error("Failed to create automation:", error);
        } finally {
            setCreating(false);
        }
    };

    const handleToggle = async (id: string, currentState: boolean) => {
        setTogglingId(id);
        try {
            if (currentState) {
                await deactivateAutomation(id);
            } else {
                await activateAutomation(id);
            }
            // Refresh list to get updated state
            await loadAutomations();
        } catch (error) {
            console.error("Failed to toggle automation:", error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteModal({ isOpen: true, id });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.id) return;

        setIsDeleting(true);
        try {
            await deleteAutomation(deleteModal.id);
            setAutomations(prev => prev.filter(a => a.id !== deleteModal.id));
            setDeleteModal({ isOpen: false, id: null });
        } catch (error) {
            console.error("Failed to delete automation:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AuthorizationGuard minPlan="standard">
            <div className="flex-1 p-6 md:p-8 bg-[#F3F3F1] min-h-screen">

                <DeleteConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, id: null })}
                    onConfirm={handleConfirmDelete}
                    title={t("dashboard.automationList.deleteTitle")}
                    description={t("dashboard.automationList.deleteDescription")}
                    isDeleting={isDeleting}
                />

                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-tour="automation-header">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E94E77] border border-black text-white text-xs font-black uppercase tracking-wider mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Zap className="w-3 h-3 fill-current" />
                                {t("dashboard.automationList.sectionTitle")}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                                {t("dashboard.automationList.title")}
                            </h1>
                            <p className="text-lg text-gray-500 font-bold max-w-2xl">{t("dashboard.automationList.subtitle")}</p>
                        </div>
                        <button
                            data-tour="automation-create"
                            onClick={handleCreate}
                            disabled={creating || (emailUsage ? automations.length >= getAutomationLimit(emailUsage.plan) : false)}
                            className="bg-[#C6F035] text-black px-8 py-4 rounded-[16px] font-black text-base border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shrink-0"
                        >
                            {creating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6 stroke-[3px]" />}
                            {t("dashboard.automationList.createWithCount", { current: emailUsage ? automations.length : 0, limit: emailUsage ? getAutomationLimit(emailUsage.plan) : 0 })}
                        </button>
                    </div>

                    {/* Quick Start Templates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => handleCreate("welcome")}
                            disabled={creating || (emailUsage ? automations.length >= getAutomationLimit(emailUsage.plan) : false)}
                            className="text-left p-4 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                        >
                            <p className="font-black text-[#1A1A1A]">Welcome Email</p>
                            <p className="text-xs text-gray-500 mt-1">Trigger + email pronto para assinantes.</p>
                        </button>
                        <button
                            onClick={() => handleCreate("discord")}
                            disabled={creating || (emailUsage ? automations.length >= getAutomationLimit(emailUsage.plan) : false)}
                            className="text-left p-4 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                        >
                            <p className="font-black text-[#1A1A1A]">Discord Alert</p>
                            <p className="text-xs text-gray-500 mt-1">Notificação de evento direto no Discord.</p>
                        </button>
                        <button
                            onClick={() => handleCreate("webhook")}
                            disabled={creating || (emailUsage ? automations.length >= getAutomationLimit(emailUsage.plan) : false)}
                            className="text-left p-4 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                        >
                            <p className="font-black text-[#1A1A1A]">Webhook Bridge</p>
                            <p className="text-xs text-gray-500 mt-1">Envia dados para sistemas externos.</p>
                        </button>
                    </div>

                    {/* Email Usage Card */}
                    {emailUsage && (
                        <div className="bg-white rounded-[24px] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" data-tour="automation-usage">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-[#F3F3F1] border-2 border-black rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <Mail className="w-7 h-7 stroke-[2.5px]" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[#1A1A1A] text-xl" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.automationList.emailUsage.title")}</h3>
                                        <p className="text-gray-500 font-bold">{t("dashboard.automationList.emailUsage.subtitle")}</p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="text-3xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>
                                        {emailUsage.sent} <span className="text-xl text-gray-400">/ {emailUsage.limit}</span>
                                    </div>
                                    <div className="inline-flex mt-2 px-3 py-1 bg-[#d2e823] border border-black rounded-full text-xs font-black uppercase tracking-wider">
                                        {t("dashboard.automationList.emailUsage.plan", { plan: emailUsage.plan })}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative pt-2">
                                <div className="w-full bg-[#F3F3F1] rounded-full h-4 border-2 border-black overflow-hidden relative">
                                    <div
                                        className={`h-full border-r-2 border-black transition-all duration-500 relative ${emailUsage.sent / emailUsage.limit >= 0.9
                                            ? 'bg-red-500'
                                            : emailUsage.sent / emailUsage.limit >= 0.7
                                                ? 'bg-yellow-400'
                                                : 'bg-[#d2e823]'
                                            }`}
                                        style={{ width: `${Math.min((emailUsage.sent / emailUsage.limit) * 100, 100)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] [background-size:1rem_1rem] opacity-50 block w-full h-full" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 text-sm font-bold">
                                    <span className="text-gray-500">
                                        {t("dashboard.automationList.emailUsage.remaining", { count: emailUsage.limit - emailUsage.sent })}
                                    </span>
                                    <span className="text-[#1A1A1A]">
                                        {t("dashboard.automationList.emailUsage.used", { percent: ((emailUsage.sent / emailUsage.limit) * 100).toFixed(0) })}
                                    </span>
                                </div>
                            </div>

                            {/* Upgrade CTA if close to limit */}
                            {emailUsage.sent / emailUsage.limit >= 0.8 && emailUsage.plan !== 'pro' && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-500 border-dashed">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-black text-blue-900 text-sm uppercase tracking-wider">{t("dashboard.automationList.emailUsage.lowTitle")}</h4>
                                            <p className="text-blue-700 font-medium text-sm mt-1">{t("dashboard.automationList.emailUsage.lowSubtitle", { plan: emailUsage.plan === 'free' ? t("dashboard.automationList.plan.standard") : t("dashboard.automationList.plan.pro") })}</p>
                                            <Link
                                                to="/pricing"
                                                className="inline-flex items-center gap-1 text-sm font-black text-blue-600 hover:text-blue-800 hover:underline mt-2"
                                            >
                                                {t("dashboard.automationList.emailUsage.viewPlans")}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* List */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-[#C6F035] stroke-black stroke-[3px]" />
                        </div>
                    ) : automations.length === 0 ? (
                        <div className="bg-white rounded-[32px] p-12 text-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center" data-tour="automation-list">
                            <div className="w-24 h-24 bg-[#F3F3F1] rounded-full border-4 border-dashed border-black flex items-center justify-center mb-6">
                                <Zap className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-black text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.automationList.emptyTitle")}</h3>
                            <p className="text-gray-500 font-medium max-w-md mt-2 mb-8">{t("dashboard.automationList.emptySubtitle")}</p>
                            <button
                                onClick={handleCreate}
                                disabled={creating}
                                className="bg-[#C6F035] text-black px-8 py-3 rounded-xl font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-3"
                            >
                                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 stroke-[3px]" />}
                                {t("dashboard.automationList.emptyCta")}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6" data-tour="automation-list">
                            {automations.map((automation, index) => (
                                <div
                                    key={automation.id}
                                    data-tour={index === 0 ? "automation-card" : undefined}
                                    className="group bg-white rounded-[24px] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all flex flex-col sm:flex-row sm:items-center gap-6"
                                >
                                    {/* Icon & Info Wrapper */}
                                    <div className="flex items-center gap-6 w-full sm:w-auto flex-1">
                                        {/* Icon */}
                                        <div className={`w-16 h-16 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors ${automation.isActive ? 'bg-[#d2e823] text-black' : 'bg-[#F3F3F1] text-gray-400'
                                            }`}>
                                            <Zap className="w-8 h-8 stroke-[2.5px] fill-current" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h3 className="font-black text-[#1A1A1A] truncate text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                                                    {automation.name}
                                                </h3>
                                                <div className={`px-3 py-1 rounded-full border-2 border-black text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${automation.isActive ? 'bg-[#C6F035] text-black' : 'bg-gray-200 text-gray-500'
                                                    }`}>
                                                    {automation.isActive ? t("dashboard.automationList.status.active") : t("dashboard.automationList.status.inactive")}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-4 h-4 stroke-[2.5px]" />
                                                    <span>{t("dashboard.automationList.runs", { count: automation.executionCount || 0 })}</span>
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
                                                <span>{t("dashboard.automationList.updated", { date: new Date(automation.updatedAt).toLocaleDateString() })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div
                                        className="flex items-center justify-end gap-3 w-full sm:w-auto border-t-2 border-gray-100 pt-6 sm:border-0 sm:pt-0"
                                        data-tour={index === 0 ? "automation-actions" : undefined}
                                    >
                                        <button
                                            onClick={() => handleToggle(automation.id, automation.isActive)}
                                            disabled={togglingId === automation.id}
                                            className={`flex-1 sm:flex-none justify-center h-12 px-6 rounded-xl font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] text-sm flex items-center gap-2 transition-all ${automation.isActive
                                                ? 'bg-white text-black hover:bg-gray-50'
                                                : 'bg-black text-white hover:bg-gray-800'
                                                }`}
                                        >
                                            {togglingId === automation.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : automation.isActive ? (
                                                <>
                                                    <Pause className="w-4 h-4 stroke-[3px]" />
                                                    <span>{t("dashboard.automationList.pause")}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4 stroke-[3px]" />
                                                    <span>{t("dashboard.automationList.activate")}</span>
                                                </>
                                            )}
                                        </button>

                                        <Link
                                            to={`/dashboard/automation/${automation.id}`}
                                            className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border-2 border-black text-black hover:bg-[#d2e823] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                            title={t("dashboard.automationList.edit")}
                                        >
                                            <Edit className="w-5 h-5 stroke-[2.5px]" />
                                        </Link>

                                        <button
                                            onClick={(e) => handleDeleteClick(automation.id, e)}
                                            className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border-2 border-black text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                            title={t("dashboard.automationList.delete")}
                                        >
                                            <Trash2 className="w-5 h-5 stroke-[2.5px]" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthorizationGuard>
    );
}
