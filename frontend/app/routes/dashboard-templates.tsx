import { useState, useEffect, useContext } from "react";
import type { Route } from "../+types/root";
import { Plus, Search, Trash2, Edit2, LayoutTemplate, Loader2 } from "lucide-react";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import { api } from "~/services/api";
import { Link, useNavigate } from "react-router";
import { DeleteConfirmationModal } from "~/components/dashboard/delete-confirmation-modal";
import AuthContext from "~/contexts/auth.context";
import { PLAN_LIMITS, type PlanType } from "~/constants/plan-limits";
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import { useTranslation } from "react-i18next";
import { useJoyrideSettings } from "~/utils/joyride";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Email Templates | Portyo" },
        { name: "description", content: "Manage your email templates" },
    ];
}

interface Template {
    id: string;
    name: string;
    updatedAt: string;
}

export default function DashboardTemplates() {
    const { bio } = useContext(BioContext);
    const { user } = useContext(AuthContext);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; name: string | null }>({
        isOpen: false,
        id: null,
        name: null
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [tourRun, setTourRun] = useState(false);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const { isMobile, styles: joyrideStyles, joyrideProps } = useJoyrideSettings(tourPrimaryColor);

    useEffect(() => {
        if (bio?.id) {
            fetchTemplates();
        }
    }, [bio?.id]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isMobile) return;

        const hasSeenTour = window.localStorage.getItem("portyo:templates-tour-done");
        if (!hasSeenTour) {
            setTourRun(true);
        }

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, [isMobile]);

    const templatesTourSteps: Step[] = [
        {
            target: "[data-tour=\"templates-header\"]",
            content: t("dashboard.tours.templates.steps.header"),
            placement: "bottom",
            disableBeacon: true,
        },
        {
            target: "[data-tour=\"templates-create\"]",
            content: t("dashboard.tours.templates.steps.create"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"templates-search\"]",
            content: t("dashboard.tours.templates.steps.search"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"templates-grid\"]",
            content: t("dashboard.tours.templates.steps.grid"),
            placement: "top",
        },
        {
            target: "[data-tour=\"templates-card\"]",
            content: t("dashboard.tours.templates.steps.card"),
            placement: "top",
        },
    ];

    const handleTemplatesTourCallback = (data: CallBackProps) => {
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
                window.localStorage.setItem("portyo:templates-tour-done", "true");
            }
        }
    };

    const fetchTemplates = () => {
        setLoading(true);
        api.get(`/templates/${bio?.id}`)
            .then((res) => setTemplates(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    const templateLimit = PLAN_LIMITS[(user?.plan as PlanType) || 'free'].emailTemplatesPerBio;

    const handleCreate = () => {
        if (templates.length >= templateLimit) {
            alert(t("dashboard.templates.limitReached", { limit: templateLimit }));
            return;
        }
        // Create a default empty template and redirect to editor
        api.post(`/templates/${bio?.id}`, {
            name: t("dashboard.templates.defaultName"),
            content: [], // Empty blocks
            html: ""
        })
            .then((res) => {
                navigate(`/dashboard/templates/${res.data.id}`);
            })
            .catch((err) => {
                alert(err.response?.data?.message || t("dashboard.templates.createError"));
            });
    };

    const handleDelete = async () => {
        if (!bio?.id || !deleteModal.id) return;
        setIsDeleting(true);
        try {
            await api.delete(`/templates/${bio.id}/${deleteModal.id}`);
            setTemplates(prev => prev.filter(t => t.id !== deleteModal.id));
            setDeleteModal({ isOpen: false, id: null, name: null });
        } catch (error) {
            alert(t("dashboard.templates.deleteError"));
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthorizationGuard minPlan="pro">
            <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
                <Joyride
                    steps={templatesTourSteps}
                    run={tourRun && !isMobile}
                    stepIndex={tourStepIndex}
                    continuous
                    showSkipButton
                    spotlightClicks
                    scrollToFirstStep
                    callback={handleTemplatesTourCallback}
                    scrollOffset={joyrideProps.scrollOffset}
                    spotlightPadding={joyrideProps.spotlightPadding}
                    disableScrollParentFix={joyrideProps.disableScrollParentFix}
                    locale={{
                        back: t("dashboard.tours.common.back"),
                        close: t("dashboard.tours.common.close"),
                        last: t("dashboard.tours.common.last"),
                        next: t("dashboard.tours.common.next"),
                        skip: t("dashboard.tours.common.skip"),
                    }}
                    styles={joyrideStyles}
                />
                <div className="max-w-7xl mx-auto space-y-8">

                    <DeleteConfirmationModal
                        isOpen={deleteModal.isOpen}
                        onClose={() => setDeleteModal({ isOpen: false, id: null, name: null })}
                        onConfirm={handleDelete}
                        title={t("dashboard.templates.deleteTitle")}
                        description={t("dashboard.templates.deleteDescription", { name: deleteModal.name })}
                        isDeleting={isDeleting}
                    />

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-tour="templates-header">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("dashboard.templates.title")}</h1>
                            <p className="text-gray-500 mt-2 text-lg">{t("dashboard.templates.subtitle")}</p>
                        </div>
                        <button
                            data-tour="templates-create"
                            onClick={handleCreate}
                            disabled={templates.length >= templateLimit}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-5 h-5" />
                            {t("dashboard.templates.createWithCount", { current: templates.length, limit: templateLimit })}
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md" data-tour="templates-search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("dashboard.templates.searchPlaceholder")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        />
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm" data-tour="templates-grid">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LayoutTemplate className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">{t("dashboard.templates.emptyTitle")}</h3>
                            <p className="text-gray-500 mt-1">{t("dashboard.templates.emptySubtitle")}</p>
                            <button
                                onClick={handleCreate}
                                className="mt-6 text-primary font-medium hover:underline"
                            >
                                {t("dashboard.templates.emptyCta")}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-tour="templates-grid">
                            {filteredTemplates.map((template, index) => (
                                <div
                                    key={template.id}
                                    data-tour={index === 0 ? "templates-card" : undefined}
                                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                                >
                                    {/* Preview Placeholder */}
                                    <div className="h-40 bg-gray-50 flex items-center justify-center border-b border-gray-100 relative overflow-hidden">
                                        <LayoutTemplate className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <Link
                                                to={`/dashboard/templates/${template.id}`}
                                                className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                                                title={t("dashboard.templates.edit")}
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 truncate pr-4">{template.name}</h3>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, id: template.id, name: template.name })}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-auto pt-4 border-t border-gray-50">
                                            {t("dashboard.templates.lastUpdated", { date: new Date(template.updatedAt).toLocaleDateString() })}
                                        </p>
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
