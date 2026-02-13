import { useState, useEffect, useContext, useMemo } from "react";
import type { Route } from "../+types/root";
import { Plus, Trash2, FileText, Loader2, Sparkles, AlertCircle, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import { api } from "~/services/api";
import { DeleteConfirmationModal } from "~/components/dashboard/delete-confirmation-modal";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";
import i18n from "~/i18n";

export function meta({ params }: Route.MetaArgs) {
    const lang = params?.lang === "pt" ? "pt" : "en";
    const title = i18n.t("meta.dashboard.forms.title", { lng: lang, defaultValue: "Forms | Portyo" });
    const description = i18n.t("meta.dashboard.forms.description", { lng: lang, defaultValue: "Manage your custom forms" });

    return [
        { title },
        { name: "description", content: description },
    ];
}

interface Form {
    id: string;
    title: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    submissions?: number;
    _count?: {
        answers?: number;
    };
}

export default function DashboardFormsList() {
    const { bio, updateBio } = useContext(BioContext);
    const { t } = useTranslation("dashboard");
    const navigate = useNavigate();
    const location = useLocation();
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);
    const [createError, setCreateError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const isMobile = useIsMobile();
    const { startTour } = useDriverTour({ primaryColor: tourPrimaryColor, storageKey: "portyo:forms-tour-done" });

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        title: string | null;
        id: string | null;
    }>({
        isOpen: false,
        title: null,
        id: null
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1];
    const withLang = (to: string) => (currentLang ? `/${currentLang}${to}` : to);
    const dateLocale = currentLang === "pt" ? "pt-BR" : "en-US";

    // Upgrade Popup State
    const [showUpgradePopup, setShowUpgradePopup] = useState(false);


    useEffect(() => {
        if (bio?.id) {
            setLoading(true);
            api.get(`/form/bios/${bio.id}/forms`)
                .then((response) => {
                    setForms(response.data);
                })
                .catch((error) => {
                    console.error("Failed to fetch forms:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
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

        const hasSeenTour = window.localStorage.getItem("portyo:forms-tour-done");
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                startTour(formsTourSteps);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isMobile, startTour]);

    const formsTourSteps: DriveStep[] = useMemo(() => [
        {
            element: "[data-tour=\"forms-header\"]",
            popover: { title: t("dashboard.tours.forms.steps.header"), description: t("dashboard.tours.forms.steps.header"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"forms-create\"]",
            popover: { title: t("dashboard.tours.forms.steps.create"), description: t("dashboard.tours.forms.steps.create"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"forms-grid\"]",
            popover: { title: t("dashboard.tours.forms.steps.grid"), description: t("dashboard.tours.forms.steps.grid"), side: "top", align: "start" },
        },
        ...(forms.length > 0 ? [{
            element: "[data-tour=\"forms-card\"]",
            popover: { title: t("dashboard.tours.forms.steps.card"), description: t("dashboard.tours.forms.steps.card"), side: "bottom", align: "start" },
        }] : []),
    ], [t, forms.length]);



    const createNewForm = async () => {
        if (!bio?.id) return;
        setIsCreating(true);
        setCreateError(null);

        try {
            const response = await api.post(`/form/bios/${bio.id}/forms`, {
                title: t("dashboard.forms.newFormTitle"),
                description: t("dashboard.forms.newFormDesc"),
                fields: []
            });
            navigate(withLang(`/dashboard/forms/${response.data.id}`));
        } catch (error: any) {
            console.error("Failed to create form:", error);
            if (error.response?.status === 403) {
                setShowUpgradePopup(true);
            } else {
                setCreateError(t("dashboard.forms.createError"));
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, form: Form) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteModal({ isOpen: true, title: form.title, id: form.id });
    };

    const handleConfirmDelete = async () => {
        if (!bio?.id || !deleteModal.id) return;
        setIsDeleting(true);

        try {
            await api.delete(`/form/forms/${deleteModal.id}`);
            setForms(prev => prev.filter(f => f.id !== deleteModal.id));
            setDeleteModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error("Failed to delete form:", error);
            alert(t("dashboard.forms.deleteError"));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AuthorizationGuard minPlan="standard" fallback={
            <div className="p-6 max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-20 h-20 bg-[#C6F035] rounded-full flex items-center justify-center mb-6 mx-auto border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Sparkles className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-3xl font-black text-[#1A1A1A] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.forms.locked.title")}</h1>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-base font-medium">{t("dashboard.forms.locked.subtitle")}</p>
                <button className="px-8 py-3 bg-[#C6F035] text-black rounded-[14px] font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                    {t("dashboard.forms.locked.cta")}
                </button>
            </div>
        }>
            <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12" data-tour="forms-header">
                    <div>
                        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.forms.title")}</h1>
                        <p className="text-gray-600 text-lg font-medium">{t("dashboard.forms.subtitle")}</p>
                    </div>
                    <button
                        data-tour="forms-create"
                        onClick={createNewForm}
                        disabled={isCreating}
                        className="group bg-[#C6F035] text-black px-6 py-4 rounded-[16px] font-black text-base border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex items-center gap-3"
                    >
                        {isCreating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Plus className="w-6 h-6 stroke-[3px]" />
                        )}
                        {isCreating ? t("dashboard.forms.creating") : t("dashboard.forms.create")}
                    </button>
                </div>

                {/* Upgrade Popup */}
                {showUpgradePopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowUpgradePopup(false)} />
                        <div className="relative bg-white rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8 max-w-md w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                            <div className="w-16 h-16 bg-[#C6F035] rounded-full flex items-center justify-center mb-6 mx-auto border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <Sparkles className="w-8 h-8 text-black" />
                            </div>
                            <h3 className="text-2xl font-black text-center text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                                {t("dashboard.forms.upgrade.title")}
                            </h3>
                            <p className="text-center text-gray-600 font-medium mb-8">
                                {t("dashboard.forms.upgrade.subtitle")}
                            </p>

                            <div className="flex flex-col gap-3">
                                <Link
                                    to={withLang("/pricing")}
                                    className="w-full py-4 bg-[#1A1A1A] text-white rounded-[14px] font-black text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-y-[2px] transition-all"
                                >
                                    {t("dashboard.forms.upgrade.cta")}
                                </Link>
                                <button
                                    onClick={() => setShowUpgradePopup(false)}
                                    className="w-full py-4 bg-transparent text-gray-500 font-bold hover:text-black transition-colors"
                                >
                                    {t("common.cancel")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {createError && (
                    <div className="mb-8 p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-center gap-3 text-red-600 font-bold animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {createError}
                    </div>
                )}


                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-[#C6F035] stroke-black stroke-[3px]" />
                        <p className="text-gray-500 font-bold animate-pulse">{t("common.loading")}</p>
                    </div>
                ) : forms.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-[#F3F3F1] rounded-full flex items-center justify-center mb-6 border-4 border-black border-dashed">
                            <FileText className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-black text-[#1A1A1A] mb-2">{t("dashboard.forms.empty.title")}</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">{t("dashboard.forms.empty.subtitle")}</p>
                        <button
                            onClick={createNewForm}
                            className="bg-[#C6F035] text-black px-8 py-4 rounded-[16px] font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5 stroke-[3px]" />
                            {t("dashboard.forms.createFirst")}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-tour="forms-grid">
                        {forms.map((form, index) => (
                            <div
                                key={form.id}
                                data-tour={index === 0 ? "forms-card" : undefined}
                                className="group bg-white p-6 rounded-[24px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all flex flex-col h-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-[#C6F035] border-b-2 border-black" />

                                <div className="flex justify-between items-start mb-4 mt-2">
                                    <Link to={withLang(`/dashboard/forms/${form.id}`)} className="min-w-0">
                                        <h3 className="text-xl font-black text-[#1A1A1A] line-clamp-1 group-hover:underline decoration-2 underline-offset-2 decoration-[#C6F035]">
                                            {form.title}
                                        </h3>
                                    </Link>
                                    <button
                                        onClick={(e) => handleDeleteClick(e, form)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title={t("common.delete")}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-gray-500 text-sm line-clamp-2 mb-8 font-medium flex-1">
                                    {form.description || t("dashboard.forms.noDescription")}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
                                        <div className="w-8 h-8 rounded-lg bg-[#E0EAFF] border-2 border-black flex items-center justify-center text-blue-600">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        {form._count?.answers ?? form.submissions ?? 0} {t("dashboard.forms.answersCount")}
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                                        {new Date(form.updatedAt).toLocaleDateString(dateLocale)}
                                    </span>
                                </div>

                                <div className="mt-4 flex items-center gap-3">
                                    <Link
                                        to={withLang(`/dashboard/forms/${form.id}`)}
                                        className="flex-1 py-2.5 px-3 rounded-[12px] border-2 border-black text-center font-black text-sm bg-[#C6F035] text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    >
                                        {t("common.edit")}
                                    </Link>
                                    <Link
                                        to={withLang(`/dashboard/forms/${form.id}/answers`)}
                                        className="flex-1 py-2.5 px-3 rounded-[12px] border-2 border-black text-center font-black text-sm bg-white text-[#1A1A1A] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    >
                                        {t("dashboard.forms.viewAnswers")}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <DeleteConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={handleConfirmDelete}
                    title={t("dashboard.forms.deleteTitle")}
                    description={t("dashboard.forms.deleteDesc", { title: deleteModal.title })}
                    isDeleting={isDeleting}
                />
            </div>
        </AuthorizationGuard>
    );
}
