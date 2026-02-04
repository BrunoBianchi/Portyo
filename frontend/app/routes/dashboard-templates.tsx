import { useState, useEffect, useContext, useMemo } from "react";
import type { Route } from "../+types/root";
import { Plus, Search, Trash2, Edit2, LayoutTemplate, Loader2 } from "lucide-react";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import { api } from "~/services/api";
import { Link, useNavigate } from "react-router";
import { DeleteConfirmationModal } from "~/components/dashboard/delete-confirmation-modal";
import AuthContext from "~/contexts/auth.context";
import { PLAN_LIMITS, type PlanType } from "~/constants/plan-limits";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";

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
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const isMobile = useIsMobile();
    const { startTour } = useDriverTour({ primaryColor: tourPrimaryColor, storageKey: "portyo:templates-tour-done" });

    useEffect(() => {
        if (bio?.id) {
            fetchTemplates();
        }
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

        const hasSeenTour = window.localStorage.getItem("portyo:templates-tour-done");
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                startTour(templatesTourSteps);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isMobile, startTour]);

    const templatesTourSteps: DriveStep[] = useMemo(() => [
        {
            element: "[data-tour=\"templates-header\"]",
            popover: { title: t("dashboard.tours.templates.steps.header"), description: t("dashboard.tours.templates.steps.header"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"templates-create\"]",
            popover: { title: t("dashboard.tours.templates.steps.create"), description: t("dashboard.tours.templates.steps.create"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"templates-search\"]",
            popover: { title: t("dashboard.tours.templates.steps.search"), description: t("dashboard.tours.templates.steps.search"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"templates-grid\"]",
            popover: { title: t("dashboard.tours.templates.steps.grid"), description: t("dashboard.tours.templates.steps.grid"), side: "top", align: "start" },
        },
        {
            element: "[data-tour=\"templates-card\"]",
            popover: { title: t("dashboard.tours.templates.steps.card"), description: t("dashboard.tours.templates.steps.card"), side: "top", align: "start" },
        },
    ], [t]);


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
            <div className="min-h-screen bg-[#F3F3F1] p-6 md:p-8">

                <div className="max-w-7xl mx-auto space-y-12">

                    <DeleteConfirmationModal
                        isOpen={deleteModal.isOpen}
                        onClose={() => setDeleteModal({ isOpen: false, id: null, name: null })}
                        onConfirm={handleDelete}
                        title={t("dashboard.templates.deleteTitle")}
                        description={t("dashboard.templates.deleteDescription", { name: deleteModal.name })}
                        isDeleting={isDeleting}
                    />

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-tour="templates-header">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E94E77] border border-black text-white text-xs font-black uppercase tracking-wider mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <LayoutTemplate className="w-3 h-3" />
                                {t("dashboard.templates.sectionTitle")}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                                {t("dashboard.templates.title")}
                            </h1>
                            <p className="text-lg text-gray-500 font-bold max-w-2xl">{t("dashboard.templates.subtitle")}</p>
                        </div>
                        <button
                            data-tour="templates-create"
                            onClick={handleCreate}
                            disabled={templates.length >= templateLimit}
                            className="bg-[#C6F035] text-black px-8 py-4 rounded-[16px] font-black text-base border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shrink-0"
                        >
                            <Plus className="w-6 h-6 stroke-[3px]" />
                            {t("dashboard.templates.createWithCount", { current: templates.length, limit: templateLimit })}
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md" data-tour="templates-search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 stroke-[3px]" />
                        <input
                            type="text"
                            placeholder={t("dashboard.templates.searchPlaceholder")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-black rounded-[14px] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-[#1A1A1A] placeholder:text-gray-400"
                        />
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-[#C6F035] stroke-black stroke-[3px]" />
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" data-tour="templates-grid">
                            <div className="w-24 h-24 bg-[#F3F3F1] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-dashed border-black">
                                <LayoutTemplate className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-black text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.templates.emptyTitle")}</h3>
                            <p className="text-gray-500 font-medium max-w-md mx-auto">{t("dashboard.templates.emptySubtitle")}</p>
                            <button
                                onClick={handleCreate}
                                className="mt-8 text-black font-black underline hover:text-[#0047FF] hover:no-underline transition-colors"
                            >
                                {t("dashboard.templates.emptyCta")}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" data-tour="templates-grid">
                            {filteredTemplates.map((template, index) => (
                                <div
                                    key={template.id}
                                    data-tour={index === 0 ? "templates-card" : undefined}
                                    className="group bg-white rounded-[24px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                                >
                                    {/* Preview Placeholder */}
                                    <div className="h-48 bg-[#F3F3F1] flex items-center justify-center border-b-4 border-black relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.05]"></div>
                                        <LayoutTemplate className="w-16 h-16 text-gray-300 group-hover:scale-110 group-hover:text-black transition-all duration-500 relative z-10" />

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20 backdrop-blur-sm">
                                            <Link
                                                to={`/dashboard/templates/${template.id}`}
                                                className="p-3 bg-white text-black border-2 border-black rounded-[12px] hover:bg-[#C6F035] hover:scale-110 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                title={t("dashboard.templates.edit")}
                                            >
                                                <Edit2 className="w-6 h-6 stroke-[2.5px]" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-xl font-black text-[#1A1A1A] truncate pr-4" style={{ fontFamily: 'var(--font-display)' }}>{template.name}</h3>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, id: template.id, name: template.name })}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5 stroke-[2.5px]" />
                                            </button>
                                        </div>
                                        <div className="mt-auto pt-4 border-t-2 border-gray-100 flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                {t("dashboard.templates.lastUpdatedLabel")}
                                            </span>
                                            <p className="text-xs font-bold text-[#1A1A1A]">
                                                {new Date(template.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
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
