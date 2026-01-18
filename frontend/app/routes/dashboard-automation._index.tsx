

import { useState, useEffect } from "react";
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
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import { useTranslation } from "react-i18next";

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
    const [tourRun, setTourRun] = useState(false);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");

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

        const hasSeenTour = window.localStorage.getItem("portyo:automation-tour-done");
        if (!hasSeenTour) {
            setTourRun(true);
        }

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, []);

    const automationTourSteps: Step[] = [
        {
            target: "[data-tour=\"automation-header\"]",
            content: t("dashboard.tours.automation.steps.header"),
            placement: "bottom",
            disableBeacon: true,
        },
        {
            target: "[data-tour=\"automation-create\"]",
            content: t("dashboard.tours.automation.steps.create"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"automation-usage\"]",
            content: t("dashboard.tours.automation.steps.usage"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"automation-list\"]",
            content: t("dashboard.tours.automation.steps.list"),
            placement: "top",
        },
        {
            target: "[data-tour=\"automation-card\"]",
            content: t("dashboard.tours.automation.steps.card"),
            placement: "top",
        },
        {
            target: "[data-tour=\"automation-actions\"]",
            content: t("dashboard.tours.automation.steps.actions"),
            placement: "top",
        },
    ];

    const handleAutomationTourCallback = (data: CallBackProps) => {
        const { status, type, index, action } = data;

        if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
            const delta = action === ACTIONS.PREV ? -1 : 1;
            setTourStepIndex(index + delta);
            return;
        }

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setTourRun(false);
            setTourStepIndex(0);
            if (typeof window !== "undefined") {
                window.localStorage.setItem("portyo:automation-tour-done", "true");
            }
        }
    };

    const handleCreate = async () => {
        if (!bio?.id) return;
        setCreating(true);
        try {
            // Create a default "New Automation"
            const newAutomation = await createAutomation(
                bio.id,
                "Untitled Automation",
                [
                    { id: '1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'New Subscriber', eventType: 'newsletter_subscribe' } },
                    { id: '2', type: 'action', position: { x: 250, y: 250 }, data: { label: 'Welcome Email', subject: 'Welcome!', content: 'Thanks for subscribing!' } }
                ],
                [{ id: 'e1-2', source: '1', target: '2' }]
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
            <div className="flex-1 p-8 bg-surface-alt min-h-screen">
                <Joyride
                    steps={automationTourSteps}
                    run={tourRun}
                    stepIndex={tourStepIndex}
                    continuous
                    showSkipButton
                    spotlightClicks
                    scrollToFirstStep
                    callback={handleAutomationTourCallback}
                    locale={{
                        back: t("dashboard.tours.common.back"),
                        close: t("dashboard.tours.common.close"),
                        last: t("dashboard.tours.common.last"),
                        next: t("dashboard.tours.common.next"),
                        skip: t("dashboard.tours.common.skip"),
                    }}
                    styles={{
                        options: {
                            arrowColor: "#ffffff",
                            backgroundColor: "#ffffff",
                            overlayColor: "rgba(0, 0, 0, 0.45)",
                            primaryColor: tourPrimaryColor,
                            textColor: "#171717",
                            zIndex: 10000,
                        },
                        buttonNext: {
                            color: "#171717",
                            fontWeight: 700,
                        },
                        buttonBack: {
                            color: "#5b5b5b",
                        },
                        buttonSkip: {
                            color: "#5b5b5b",
                        },
                        tooltipContent: {
                            fontSize: "14px",
                            lineHeight: "1.4",
                        },
                    }}
                />
                <DeleteConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, id: null })}
                    onConfirm={handleConfirmDelete}
                    title="Delete Automation"
                    description="Are you sure you want to delete this automation? This action cannot be undone and the automation will stop running immediately."
                    isDeleting={isDeleting}
                />

                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0" data-tour="automation-header">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.automationList.title")}</h1>
                            <p className="text-gray-500 mt-1">{t("dashboard.automationList.subtitle")}</p>
                        </div>
                        <button
                            data-tour="automation-create"
                            onClick={handleCreate}
                            disabled={creating || (emailUsage ? automations.length >= getAutomationLimit(emailUsage.plan) : false)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {t("dashboard.automationList.create", { current: emailUsage ? automations.length : 0, limit: emailUsage ? getAutomationLimit(emailUsage.plan) : 0 })}
                        </button>
                    </div>

                    {/* Email Usage Card */}
                    {emailUsage && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" data-tour="automation-usage">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{t("dashboard.automationList.emailUsage.title")}</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">{t("dashboard.automationList.emailUsage.subtitle")}</p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {emailUsage.sent} <span className="text-base font-normal text-gray-400">/ {emailUsage.limit}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 uppercase font-semibold tracking-wider">
                                        {t("dashboard.automationList.emailUsage.plan", { plan: emailUsage.plan })}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4">
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${emailUsage.sent / emailUsage.limit >= 0.9
                                            ? 'bg-red-500'
                                            : emailUsage.sent / emailUsage.limit >= 0.7
                                                ? 'bg-yellow-500'
                                                : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${Math.min((emailUsage.sent / emailUsage.limit) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-2 text-sm">
                                    <span className="text-gray-600">
                                        {t("dashboard.automationList.emailUsage.remaining", { count: emailUsage.limit - emailUsage.sent })}
                                    </span>
                                    <span className="text-gray-500">
                                        {t("dashboard.automationList.emailUsage.used", { percent: ((emailUsage.sent / emailUsage.limit) * 100).toFixed(0) })}
                                    </span>
                                </div>
                            </div>

                            {/* Upgrade CTA if close to limit */}
                            {emailUsage.sent / emailUsage.limit >= 0.8 && emailUsage.plan !== 'pro' && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-blue-900 text-sm">{t("dashboard.automationList.emailUsage.lowTitle")}</h4>
                                            <p className="text-blue-700 text-sm mt-1">{t("dashboard.automationList.emailUsage.lowSubtitle", { plan: emailUsage.plan === 'free' ? t("dashboard.automationList.plan.standard") : t("dashboard.automationList.plan.pro") })}</p>
                                            <Link
                                                to="/pricing"
                                                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-2"
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
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                    ) : automations.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center" data-tour="automation-list">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{t("dashboard.automationList.emptyTitle")}</h3>
                            <p className="text-gray-500 max-w-sm mt-2 mb-6">{t("dashboard.automationList.emptySubtitle")}</p>
                            <button
                                onClick={handleCreate}
                                disabled={creating}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-200"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {t("dashboard.automationList.emptyCta")}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4" data-tour="automation-list">
                            {automations.map((automation, index) => (
                                <div
                                    key={automation.id}
                                    data-tour={index === 0 ? "automation-card" : undefined}
                                    className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
                                >
                                    {/* Icon & Info Wrapper */}
                                    <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${automation.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                                            }`}>
                                            <Zap className="w-6 h-6" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 pointer-events-none">
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-blue-600 transition-colors">
                                                    {automation.name}
                                                </h3>
                                                <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${automation.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {automation.isActive ? t("dashboard.automationList.status.active") : t("dashboard.automationList.status.inactive")}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Activity className="w-4 h-4" />
                                                    <span>{t("dashboard.automationList.runs", { count: automation.executionCount || 0 })}</span>
                                                </div>
                                                <span className="hidden xs:inline">•</span>
                                                <span>{t("dashboard.automationList.updated", { date: new Date(automation.updatedAt).toLocaleDateString() })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div
                                        className="flex items-center justify-end gap-2 w-full sm:w-auto border-t border-gray-50 pt-4 sm:border-0 sm:pt-0"
                                        data-tour={index === 0 ? "automation-actions" : undefined}
                                    >
                                        <button
                                            onClick={() => handleToggle(automation.id, automation.isActive)}
                                            disabled={togglingId === automation.id}
                                            className={`flex-1 sm:flex-none justify-center h-10 px-4 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors ${automation.isActive
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                        >
                                            {togglingId === automation.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : automation.isActive ? (
                                                <>
                                                    <Pause className="w-4 h-4" />
                                                    <span>{t("dashboard.automationList.pause")}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4" />
                                                    <span>{t("dashboard.automationList.activate")}</span>
                                                </>
                                            )}
                                        </button>

                                        <Link
                                            to={`/dashboard/automation/${automation.id}`}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                            title={t("dashboard.automationList.edit")}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>

                                        <button
                                            onClick={(e) => handleDeleteClick(automation.id, e)}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-gray-100 sm:border-0"
                                            title={t("dashboard.automationList.delete")}
                                        >
                                            <Trash2 className="w-4 h-4" />
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
