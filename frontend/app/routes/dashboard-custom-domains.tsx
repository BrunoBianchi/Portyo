import { useState, useEffect, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";
import { api } from "~/services/api";
import BioContext from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import {
    Globe,
    Plus,
    Trash2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    ExternalLink,
    Lock,
    Loader2,
    Copy,
    Check
} from "lucide-react";
import { toast } from "react-hot-toast";

interface CustomDomain {
    id: string;
    domain: string;
    status: "pending" | "verifying_dns" | "dns_verified" | "generating_ssl" | "active" | "failed" | "expired" | "suspended";
    sslActive: boolean;
    sslExpiresAt?: string;
    dnsVerifiedAt?: string;
    activatedAt?: string;
    errorMessage?: string;
    isHealthy: boolean;
}

export default function DashboardCustomDomains() {
    const { t } = useTranslation("dashboard");
    const { bio } = useContext(BioContext);
    const { user } = useContext(AuthContext);
    const isMobile = useIsMobile();
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const [domains, setDomains] = useState<CustomDomain[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newDomain, setNewDomain] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [checkingDomain, setCheckingDomain] = useState<string | null>(null);
    const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

    const { startTour } = useDriverTour({
        primaryColor: tourPrimaryColor,
        storageKey: "portyo:custom-domains-tour-done",
    });

    // Tour steps
    const tourSteps: DriveStep[] = useMemo(() => [
        {
            element: "[data-tour='custom-domains-header']",
            popover: {
                title: t("customDomains.tour.headerTitle", "Domínios Personalizados"),
                description: t("customDomains.tour.header", "Conecte seu próprio domínio ao seu Portyo"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "[data-tour='custom-domains-add']",
            popover: {
                title: t("customDomains.tour.addTitle", "Adicionar Domínio"),
                description: t("customDomains.tour.add", "Digite seu domínio personalizado aqui"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "[data-tour='custom-domains-list']",
            popover: {
                title: t("customDomains.tour.listTitle", "Seus Domínios"),
                description: t("customDomains.tour.list", "Acompanhe o status de todos os seus domínios"),
                side: "top",
                align: "start",
            },
        },
    ], [t]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, []);

    // Auto-start tour
    useEffect(() => {
        if (isMobile) return;
        if (typeof window === "undefined") return;

        const hasSeenTour = window.localStorage.getItem("portyo:custom-domains-tour-done");
        if (hasSeenTour) return;

        const timer = setTimeout(() => {
            startTour(tourSteps);
        }, 1500);

        return () => clearTimeout(timer);
    }, [isMobile, startTour, tourSteps]);

    // Fetch domains
    const fetchDomains = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/custom-domains");
            if (response.data.success) {
                setDomains(response.data.domains || []);
            }
        } catch (error) {
            console.error("Failed to fetch domains:", error);
            toast.error(t("customDomains.errors.fetchFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    // Add domain
    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomain.trim() || !bio?.id) return;

        setIsAdding(true);
        try {
            const response = await api.post("/custom-domains", {
                domain: newDomain.trim(),
                bioId: bio.id,
            });

            if (response.data.success) {
                toast.success(t("customDomains.success.added"));
                setNewDomain("");
                fetchDomains();
            } else {
                toast.error(response.data.message || t("customDomains.errors.addFailed"));
            }
        } catch (error: any) {
            console.error("Failed to add domain:", error);
            toast.error(error.response?.data?.message || t("customDomains.errors.addFailed"));
        } finally {
            setIsAdding(false);
        }
    };

    // Remove domain
    const handleRemoveDomain = async (domainId: string) => {
        if (!confirm(t("customDomains.confirmRemove"))) return;

        try {
            const response = await api.delete(`/custom-domains/${domainId}`);
            if (response.data.success) {
                toast.success(t("customDomains.success.removed"));
                fetchDomains();
            }
        } catch (error) {
            console.error("Failed to remove domain:", error);
            toast.error(t("customDomains.errors.removeFailed"));
        }
    };

    // Verify domain
    const handleVerifyDomain = async (domainId: string) => {
        setCheckingDomain(domainId);
        try {
            const response = await api.post(`/custom-domains/${domainId}/verify`);
            if (response.data.success) {
                toast.success(t("customDomains.success.verificationStarted"));
                // Poll for updates
                setTimeout(fetchDomains, 3000);
            }
        } catch (error) {
            console.error("Failed to verify domain:", error);
            toast.error(t("customDomains.errors.verifyFailed"));
        } finally {
            setCheckingDomain(null);
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedDomain(text);
        setTimeout(() => setCopiedDomain(null), 2000);
    };

    // Get status icon and color
    const getStatusConfig = (status: CustomDomain["status"], sslActive: boolean, isHealthy: boolean) => {
        if (status === "active" && isHealthy) {
            return {
                icon: CheckCircle2,
                color: "text-green-500",
                bg: "bg-green-50",
                label: t("customDomains.status.active")
            };
        }
        if (status === "pending" || status === "verifying_dns" || status === "generating_ssl") {
            return {
                icon: Loader2,
                color: "text-amber-500",
                bg: "bg-amber-50",
                label: t("customDomains.status.pending"),
                spin: true
            };
        }
        if (status === "dns_verified") {
            return {
                icon: CheckCircle2,
                color: "text-blue-500",
                bg: "bg-blue-50",
                label: t("customDomains.status.dnsVerified")
            };
        }
        return {
            icon: XCircle,
            color: "text-red-500",
            bg: "bg-red-50",
            label: t("customDomains.status.failed")
        };
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString();
    };

    if (!user) return null;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <header className="mb-10" data-tour="custom-domains-header">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0EAFF] text-blue-600 text-xs font-black uppercase tracking-wider mb-4">
                            <Globe className="w-3 h-3" />
                            {t("customDomains.badge", "Pro Feature")}
                        </div>
                        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight mb-2">
                            {t("customDomains.title", "Domínios Personalizados")}
                        </h1>
                        <p className="text-gray-600 text-lg font-medium">
                            {t("customDomains.subtitle", "Conecte seu próprio domínio ao seu Portyo para uma marca mais profissional")}
                        </p>
                    </div>
                </div>
            </header>

            {/* Add Domain Form */}
            <section
                className="bg-white p-6 md:p-8 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black mb-8"
                data-tour="custom-domains-add"
            >
                <div className="flex items-center gap-4 border-b-4 border-black/5 pb-6 mb-6">
                    <div className="p-3 bg-[#C6F035] rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Plus className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
                            {t("customDomains.addTitle", "Adicionar Novo Domínio")}
                        </h2>
                        <p className="text-gray-500 font-bold">
                            {t("customDomains.addSubtitle", "Digite o domínio que você deseja conectar")}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleAddDomain} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                                https://
                            </div>
                            <input
                                type="text"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                                placeholder={t("customDomains.placeholder", "seudominio.com")}
                                className="w-full pl-20 pr-4 py-4 rounded-[16px] border-2 border-black bg-[#F3F3F1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/10 transition-all font-bold placeholder:text-gray-400"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAdding || !newDomain.trim()}
                            className="px-8 py-4 bg-[#C6F035] text-black rounded-[16px] font-black text-base border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 flex items-center justify-center gap-2"
                        >
                            {isAdding ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Plus className="w-5 h-5" />
                            )}
                            {t("customDomains.addButton", "Adicionar Domínio")}
                        </button>
                    </div>

                    <div className="bg-[#F3F3F1] rounded-[20px] p-5 border-2 border-black/10">
                        <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            {t("customDomains.instructions.title")}
                        </h3>
                        <ol className="space-y-2 text-sm text-gray-600 font-medium">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-black">1.</span>
                                {t("customDomains.instructions.step1")}
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-black">2.</span>
                                {t("customDomains.instructions.step2")}
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-black">3.</span>
                                {t("customDomains.instructions.step3")}
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-black">4.</span>
                                {t("customDomains.instructions.step4")}
                            </li>
                        </ol>

                        {/* DNS Record Example */}
                        <div className="mt-4 bg-white rounded-xl p-4 border-2 border-black/10">
                            <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                    <span className="block font-black text-gray-500 uppercase tracking-wider mb-1">Type</span>
                                    <span className="font-mono bg-[#C6F035]/30 px-2 py-1 rounded border border-black/10 text-black font-bold">CNAME / A</span>
                                </div>
                                <div>
                                    <span className="block font-black text-gray-500 uppercase tracking-wider mb-1">Host</span>
                                    <span className="font-mono bg-[#C6F035]/30 px-2 py-1 rounded border border-black/10 text-black font-bold">@ ou www</span>
                                </div>
                                <div>
                                    <span className="block font-black text-gray-500 uppercase tracking-wider mb-1">Target</span>
                                    <span className="font-mono bg-[#C6F035]/30 px-2 py-1 rounded border border-black/10 text-black font-bold">cname.portyo.me</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </section>

            {/* Domains List */}
            <section data-tour="custom-domains-list">
                <h2 className="text-2xl font-black text-[#1A1A1A] mb-6 flex items-center gap-3">
                    <Globe className="w-6 h-6" />
                    {t("customDomains.yourDomains", "Seus Domínios")}
                </h2>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#C6F035]" />
                    </div>
                ) : domains.length === 0 ? (
                    <div className="bg-white p-12 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-center">
                        <div className="w-20 h-20 bg-[#F3F3F1] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Globe className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-black text-[#1A1A1A] mb-2">
                            {t("customDomains.empty.title", "Nenhum domínio configurado")}
                        </h3>
                        <p className="text-gray-500 font-medium">
                            {t("customDomains.empty.subtitle", "Adicione seu primeiro domínio personalizado acima")}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {domains.map((domain) => {
                            const statusConfig = getStatusConfig(domain.status, domain.sslActive, domain.isHealthy);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={domain.id}
                                    className="bg-white p-6 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Domain Info */}
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-xl ${statusConfig.bg} border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                                                <StatusIcon className={`w-7 h-7 ${statusConfig.color} ${statusConfig.spin ? 'animate-spin' : ''}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xl font-black text-[#1A1A1A]">
                                                        {domain.domain}
                                                    </h3>
                                                    <button
                                                        onClick={() => copyToClipboard(domain.domain)}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title={t("customDomains.copy", "Copiar")}
                                                    >
                                                        {copiedDomain === domain.domain ? (
                                                            <Check className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                    {domain.sslActive && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">
                                                            <Lock className="w-3 h-3" />
                                                            SSL
                                                        </span>
                                                    )}
                                                </div>
                                                {domain.errorMessage && (
                                                    <p className="text-sm text-red-500 mt-2 font-medium">
                                                        {domain.errorMessage}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {!(domain.status === "active" && domain.isHealthy && !domain.errorMessage) && (
                                                <button
                                                    onClick={() => handleVerifyDomain(domain.id)}
                                                    disabled={checkingDomain === domain.id}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-[#F3F3F1] text-gray-700 rounded-xl font-bold text-sm border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50"
                                                >
                                                    {checkingDomain === domain.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="w-4 h-4" />
                                                    )}
                                                    <span className="hidden sm:inline">
                                                        {t("customDomains.verify", "Verificar")}
                                                    </span>
                                                </button>
                                            )}

                                            {domain.status === "active" && domain.isHealthy && !domain.errorMessage && (
                                                <a
                                                    href={`${domain.sslActive ? "https" : "http"}://${domain.domain}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-[#C6F035] text-black rounded-xl font-bold text-sm border-2 border-black hover:bg-[#b8e830] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    <span className="hidden sm:inline">
                                                        {t("customDomains.visit", "Visitar")}
                                                    </span>
                                                </a>
                                            )}

                                            <button
                                                onClick={() => handleRemoveDomain(domain.id)}
                                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                title={t("dashboard.customDomains.remove", "Remover")}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                {t("dashboard.customDomains.details.status", "Status")}
                                            </p>
                                            <p className={`font-bold ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                {t("dashboard.customDomains.details.ssl", "SSL")}
                                            </p>
                                            <p className={`font-bold ${domain.sslActive ? 'text-green-600' : 'text-gray-400'}`}>
                                                {domain.sslActive ? t("dashboard.customDomains.active") : t("dashboard.customDomains.inactive")}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                {t("dashboard.customDomains.details.expires", "SSL Expira")}
                                            </p>
                                            <p className="font-bold text-gray-700">
                                                {formatDate(domain.sslExpiresAt)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                {t("dashboard.customDomains.details.added", "Adicionado")}
                                            </p>
                                            <p className="font-bold text-gray-700">
                                                {formatDate(domain.activatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
