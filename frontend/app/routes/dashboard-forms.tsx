import { Link, useNavigate } from "react-router";
import { Plus, FileText, Trash2, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useBio } from "~/contexts/bio.context";
import { useAuth } from "~/contexts/auth.context";
import { api } from "~/services/api";
import { PLAN_LIMITS, type PlanType } from "~/constants/plan-limits";
import { UpgradePopup } from "~/components/shared/upgrade-popup";
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import { useTranslation } from "react-i18next";
import { useJoyrideSettings } from "~/utils/joyride";

interface Form {
    id: string;
    title: string;
    updatedAt: string;
    fields: any[];
    submissions: number;
    views: number;
}

export default function DashboardFormsList() {
    const navigate = useNavigate();
    const { bio } = useBio();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUpgradePopupOpen, setIsUpgradePopupOpen] = useState(false);
    const [deletingForm, setDeletingForm] = useState<Form | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [tourRun, setTourRun] = useState(false);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const { isMobile, styles: joyrideStyles, joyrideProps } = useJoyrideSettings(tourPrimaryColor);

    useEffect(() => {
        if (bio?.id) {
            fetchForms();
        }
    }, [bio?.id]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isMobile) return;

        const hasSeenTour = window.localStorage.getItem("portyo:forms-tour-done");
        if (!hasSeenTour) {
            setTourRun(true);
        }

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, [isMobile]);

    const formsTourSteps: Step[] = [
        {
            target: "[data-tour=\"forms-header\"]",
            content: t("dashboard.tours.forms.steps.header"),
            placement: "bottom",
            disableBeacon: true,
        },
        {
            target: "[data-tour=\"forms-create\"]",
            content: t("dashboard.tours.forms.steps.create"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"forms-grid\"]",
            content: t("dashboard.tours.forms.steps.grid"),
            placement: "top",
        },
        {
            target: "[data-tour=\"forms-card\"]",
            content: t("dashboard.tours.forms.steps.card"),
            placement: "top",
        },
        {
            target: "[data-tour=\"forms-answers\"]",
            content: t("dashboard.tours.forms.steps.answers"),
            placement: "top",
        },
    ];

    const handleFormsTourCallback = (data: CallBackProps) => {
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
                window.localStorage.setItem("portyo:forms-tour-done", "true");
            }
        }
    };

    const fetchForms = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/form/bios/${bio!.id}/forms`);
            setForms(response.data);
        } catch (err) {
            console.error("Failed to fetch forms", err);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewForm = async () => {
        if (!bio?.id) return;

        const plan = (user?.plan || 'free') as PlanType;
        const limit = PLAN_LIMITS[plan]?.formsPerBio || 1;

        if (forms.length >= limit) {
            setIsUpgradePopupOpen(true);
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.post(`/form/bios/${bio.id}/forms`, {
                title: t("dashboard.forms.defaultName"),
                fields: []
            });
            navigate(`/dashboard/forms/${response.data.id}`);
        } catch (err: any) {
            console.error("Failed to create form", err);
            setError(err.response?.data?.error || t("dashboard.forms.createError"));
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteForm = (form: Form, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeletingForm(form);
    };

    const handleConfirmDelete = async () => {
        if (!deletingForm) return;
        try {
            setIsDeleting(true);
            await api.delete(`/form/forms/${deletingForm.id}`);
            setForms(prev => prev.filter(f => f.id !== deletingForm.id));
            setDeletingForm(null);
        } catch (err) {
            console.error("Failed to delete form", err);
            alert(t("dashboard.forms.deleteError"));
        } finally {
            setIsDeleting(false);
        }
    };

    if (!bio) return null;

    return (
        <div className="p-8 max-w-6xl mx-auto">
                <Joyride
                steps={formsTourSteps}
                    run={tourRun && !isMobile}
                stepIndex={tourStepIndex}
                continuous
                showSkipButton
                spotlightClicks
                scrollToFirstStep
                callback={handleFormsTourCallback}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10" data-tour="forms-header">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t("dashboard.forms.title")}</h1>
                    <p className="text-gray-500 text-medium">{t("dashboard.forms.subtitle")}</p>
                </div>
                <button
                    data-tour="forms-create"
                    onClick={createNewForm}
                    className="group bg-gray-900 text-white pl-4 pr-5 py-3 rounded-full font-bold shadow-lg hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-3 w-fit"
                    disabled={isLoading}
                >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className="text-sm">{t("dashboard.forms.create")}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                            {forms.length} / {
                                (() => {
                                    const plan = (user?.plan || 'free') as PlanType;
                                    return PLAN_LIMITS[plan]?.formsPerBio || 1;
                                })()
                            } used
                        </span>
                    </div>
                </button>
            </div>

            <UpgradePopup
                isOpen={isUpgradePopupOpen}
                onClose={() => setIsUpgradePopupOpen(false)}
            />

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
                    {error}
                </div>
            )}

            {isLoading && forms.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-50 h-48 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : forms.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center" data-tour="forms-grid">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t("dashboard.forms.emptyTitle")}</h3>
                    <p className="text-gray-500 mb-6 max-w-sm">{t("dashboard.forms.emptySubtitle")}</p>
                    <button
                        onClick={createNewForm}
                        className="btn btn-primary"
                    >
                        {t("dashboard.forms.emptyCta")}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour="forms-grid">
                    {forms.map((form, index) => (
                        <Link
                            key={form.id}
                            data-tour={index === 0 ? "forms-card" : undefined}
                            to={`/dashboard/forms/${form.id}`}
                            className="group bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="relative">
                                    <button
                                        className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                                        onClick={(e) => deleteForm(form, e)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{form.title || t("dashboard.forms.defaultName")}</h3>
                            <p className="text-sm text-gray-500 mb-6">{t("dashboard.forms.lastUpdated", { date: new Date(form.updatedAt).toLocaleDateString() })}</p>

                            <div className="mt-auto flex items-center justify-between text-sm font-medium text-gray-600">
                                <div className="flex items-center gap-4">
                                    <span>{t("dashboard.forms.fieldsCount", { count: form.fields.length })}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <span>{t("dashboard.forms.submissionsCount", { count: form.submissions })}</span>
                                </div>
                                <button
                                    data-tour={index === 0 ? "forms-answers" : undefined}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate(`/dashboard/forms/${form.id}/answers`);
                                    }}
                                    className="text-primary hover:underline font-bold"
                                >
                                    {t("dashboard.forms.viewAnswers")}
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deletingForm && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{t("dashboard.forms.deleteTitle")}</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            {t("dashboard.forms.deleteDescription", { title: deletingForm.title || t("dashboard.forms.defaultName") })}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingForm(null)}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                {t("dashboard.forms.cancel")}
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("dashboard.forms.delete")}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
