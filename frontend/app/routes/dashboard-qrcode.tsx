import { useContext, useEffect, useState, useMemo } from "react";
import BioContext from "~/contexts/bio.context";
import { AuthorizationGuard } from "~/contexts/guard.context";
import { QrCode as QrCodeIcon, Download, Plus, Link as LinkIcon, Loader2, Copy, Check, RotateCcw, Palette } from "lucide-react";
import type { MetaFunction } from "react-router";
import QRCode from "react-qr-code";
import { createQrCode, getQrCodes, type QrCode } from "~/services/qrcode.service";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";

const PRESET_COLORS = [
    { name: "Classic", fg: "#000000", bg: "#FFFFFF" },
    { name: "Brand", fg: "#84cc16", bg: "#FFFFFF" },
    { name: "Dark", fg: "#FFFFFF", bg: "#18181b" },
    { name: "Ocean", fg: "#0ea5e9", bg: "#f0f9ff" },
    { name: "Sunset", fg: "#f97316", bg: "#fff7ed" },
    { name: "Berry", fg: "#d946ef", bg: "#fdf4ff" },
];

export const meta: MetaFunction = () => {
    return [
        { title: "QR Code | Portyo" },
        { name: "description", content: "Generate and manage your QR Code." },
    ];
};

export default function DashboardQrCode() {
    const { bio } = useContext(BioContext);
    const { t } = useTranslation("dashboard");
    const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
    const [selectedQrCode, setSelectedQrCode] = useState<QrCode | null>(null);
    const [newValue, setNewValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#FFFFFF");
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const isMobile = useIsMobile();
    const { startTour } = useDriverTour({ primaryColor: tourPrimaryColor, storageKey: "portyo:qrcode-tour-done" });

    useEffect(() => {
        if (bio?.id) {
            loadQrCodes();
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

        const hasSeenTour = window.localStorage.getItem("portyo:qrcode-tour-done");
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                startTour(qrTourSteps);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isMobile, startTour]);

    const qrTourSteps: DriveStep[] = useMemo(() => [
        {
            element: "[data-tour=\"qrcode-header\"]",
            popover: { title: t("dashboard.tours.qrcode.steps.header"), description: t("dashboard.tours.qrcode.steps.header"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"qrcode-create\"]",
            popover: { title: t("dashboard.tours.qrcode.steps.create"), description: t("dashboard.tours.qrcode.steps.create"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"qrcode-list\"]",
            popover: { title: t("dashboard.tours.qrcode.steps.list"), description: t("dashboard.tours.qrcode.steps.list"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"qrcode-preview\"]",
            popover: { title: t("dashboard.tours.qrcode.steps.preview"), description: t("dashboard.tours.qrcode.steps.preview"), side: "left", align: "start" },
        },
        {
            element: "[data-tour=\"qrcode-appearance\"]",
            popover: { title: t("dashboard.tours.qrcode.steps.appearance"), description: t("dashboard.tours.qrcode.steps.appearance"), side: "left", align: "start" },
        },
        {
            element: "[data-tour=\"qrcode-download\"]",
            popover: { title: t("dashboard.tours.qrcode.steps.download"), description: t("dashboard.tours.qrcode.steps.download"), side: "left", align: "start" },
        },
    ], [t]);


    const loadQrCodes = async () => {
        if (!bio?.id) return;
        setIsLoading(true);
        try {
            const data = await getQrCodes(bio.id);
            setQrCodes(data);
            // Select the first one by default if none selected, or if list was empty
            if (data.length > 0 && !selectedQrCode) {
                setSelectedQrCode(data[0]);
            }
        } catch (error) {
            console.error("Failed to load QR codes", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bio?.id || !newValue) return;

        setIsCreating(true);
        try {
            const newQr = await createQrCode(bio.id, newValue);
            setQrCodes([...qrCodes, newQr]);
            setSelectedQrCode(newQr);
            setNewValue("");
        } catch (error) {
            console.error("Failed to create QR code", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleResetColors = () => {
        setFgColor("#000000");
        setBgColor("#FFFFFF");
    };

    // Default bio QR code - use custom domain if configured & active, otherwise portyo.me path
    const defaultBioUrl = bio
        ? (bio.customDomain ? `https://${bio.customDomain}` : `https://portyo.me/p/${bio.sufix}`)
        : "";

    // Determine what to show - use frontend redirect URL for tracking
    const FRONTEND_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://portyo.me';
    const currentQrValue = selectedQrCode
        ? `${FRONTEND_BASE_URL}/redirect-qrcode/${selectedQrCode.id}`
        : defaultBioUrl;
    const downloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(currentQrValue)}&color=${fgColor.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}`;

    return (
        <AuthorizationGuard>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-tour="qrcode-header">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6F035] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-wider mb-3">
                            <QrCodeIcon className="w-3.5 h-3.5" />
                            {t("dashboard.qrcode.share")}
                        </div>
                        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tighter mb-2 uppercase" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.qrcode.title")}</h1>
                        <p className="text-lg text-gray-600 font-medium">{t("dashboard.qrcode.subtitle")}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: List & Create */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Create New */}
                        {/* Create New */}
                        <div className="bg-white rounded-[20px] border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" data-tour="qrcode-create">
                            <h3 className="text-lg font-black text-[#1A1A1A] mb-4 uppercase" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.qrcode.createTitle")}</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">{t("dashboard.qrcode.destinationUrl")}</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="url"
                                            value={newValue}
                                            onChange={(e) => setNewValue(e.target.value)}
                                            placeholder={t("dashboard.qrcode.urlPlaceholder")}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-sm font-bold placeholder-gray-400 text-[#1A1A1A]"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isCreating || !newValue}
                                    className="w-full py-3 bg-[#C6F035] border-2 border-black rounded-xl text-black font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3px]" />}
                                    <span>{t("dashboard.qrcode.generate")}</span>
                                </button>
                            </form>
                        </div>

                        {/* List */}
                        <div className="bg-white rounded-[20px] border-4 border-black overflow-hidden flex flex-col max-h-[600px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" data-tour="qrcode-list">
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-black text-[#1A1A1A] text-sm uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.qrcode.yourCodes")}</h3>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                                {/* Default Bio Link Option */}
                                <button
                                    onClick={() => setSelectedQrCode(null)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border-2 ${!selectedQrCode ? 'bg-[#C6F035]/20 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 text-black">
                                        <QrCodeIcon className="w-5 h-5 stroke-[2.5px]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-[#1A1A1A] text-sm truncate">{t("dashboard.qrcode.mainProfile")}</p>
                                        <p className="text-xs text-gray-500 truncate font-medium">{defaultBioUrl}</p>
                                    </div>
                                    {!selectedQrCode && <div className="w-3 h-3 rounded-full bg-black"></div>}
                                </button>

                                {isLoading ? (
                                    <div className="p-8 text-center text-text-muted">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        <p className="text-xs">{t("dashboard.qrcode.loading")}</p>
                                    </div>
                                ) : qrCodes.map((qr) => (
                                    <button
                                        key={qr.id}
                                        onClick={() => setSelectedQrCode(qr)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border-2 ${selectedQrCode?.id === qr.id ? 'bg-[#C6F035]/20 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0">
                                            <QRCode value={qr.value} size={24} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-[#1A1A1A] text-sm truncate">{qr.value}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300">
                                                    {new Date(qr.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-bold">
                                                    {t("dashboard.qrcode.views", { count: qr.views })}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedQrCode?.id === qr.id && <div className="w-3 h-3 rounded-full bg-black"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[20px] border-4 border-black h-full flex flex-col relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" data-tour="qrcode-preview">
                            <div className="absolute top-0 left-0 w-full h-32 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

                            <div className="p-6 md:p-8 relative z-10 flex flex-col xl:flex-row gap-8 h-full">
                                {/* Left Side: Preview */}
                                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                    <div className="text-center space-y-2 w-full">
                                        <h2 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                                            {selectedQrCode ? t("dashboard.qrcode.custom") : t("dashboard.qrcode.profile")}
                                        </h2>
                                        <div className="flex items-center justify-center gap-2 text-gray-500 bg-gray-100 py-1.5 px-4 rounded-full inline-flex max-w-full mx-auto border-2 border-gray-200">
                                            <span className="truncate text-xs font-mono font-bold max-w-[180px] xl:max-w-[240px]">{currentQrValue}</span>
                                            <button
                                                onClick={() => handleCopy(currentQrValue)}
                                                className="p-0.5 hover:text-black transition-colors"
                                                title={t("dashboard.qrcode.copyUrl")}
                                            >
                                                {copied ? <Check className="w-3.5 h-3.5 text-green-600 stroke-[3px]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5px]" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors duration-300 w-full max-w-[300px]" style={{ backgroundColor: bgColor }}>
                                        <QRCode
                                            value={currentQrValue}
                                            size={256}
                                            fgColor={fgColor}
                                            bgColor={bgColor}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>

                                    {selectedQrCode && (
                                        <div className="grid grid-cols-2 gap-8 pt-2 w-full max-w-xs">
                                            <div className="text-center">
                                                <p className="text-3xl font-black text-[#1A1A1A]">{selectedQrCode.views}</p>
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("dashboard.qrcode.scans")}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-3xl font-black text-[#1A1A1A]">{selectedQrCode.clicks}</p>
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("dashboard.qrcode.clicks")}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Controls */}
                                <div className="w-full xl:w-80 shrink-0 border-t-2 xl:border-t-0 xl:border-l-2 border-black pt-6 xl:pt-0 xl:pl-8 flex flex-col gap-6" data-tour="qrcode-appearance">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[#1A1A1A] font-black text-sm uppercase tracking-wider">
                                                <Palette className="w-4 h-4 stroke-[2.5px]" />
                                                <span>{t("dashboard.qrcode.appearance")}</span>
                                            </div>
                                            <button
                                                onClick={handleResetColors}
                                                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black transition-colors"
                                            >
                                                <RotateCcw className="w-3 h-3 stroke-[2.5px]" />
                                                {t("dashboard.qrcode.reset")}
                                            </button>
                                        </div>

                                        {/* Presets */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">{t("dashboard.qrcode.colorPresets")}</label>
                                            <div className="grid grid-cols-6 gap-2">
                                                {PRESET_COLORS.map((preset) => (
                                                    <button
                                                        key={preset.name}
                                                        onClick={() => { setFgColor(preset.fg); setBgColor(preset.bg); }}
                                                        className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-black shadow-sm flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-black/20 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                        style={{ backgroundColor: preset.bg }}
                                                        title={preset.name}
                                                    >
                                                        <div className="w-4 h-4 rounded-full ring-1 ring-black/5" style={{ backgroundColor: preset.fg }}></div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Custom Pickers */}
                                        <div className="space-y-4 pt-4 border-t-2 border-gray-100">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t("dashboard.qrcode.foreground")}</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                                                        <input
                                                            type="color"
                                                            value={fgColor}
                                                            onChange={(e) => setFgColor(e.target.value)}
                                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            value={fgColor}
                                                            onChange={(e) => setFgColor(e.target.value)}
                                                            className="w-full bg-gray-50 border-2 border-black rounded-lg pl-3 pr-3 py-2 text-sm font-mono font-bold uppercase focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t("dashboard.qrcode.background")}</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                                                        <input
                                                            type="color"
                                                            value={bgColor}
                                                            onChange={(e) => setBgColor(e.target.value)}
                                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            value={bgColor}
                                                            onChange={(e) => setBgColor(e.target.value)}
                                                            className="w-full bg-gray-50 border-2 border-black rounded-lg pl-3 pr-3 py-2 text-sm font-mono font-bold uppercase focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-8" data-tour="qrcode-download">
                                        <a
                                            href={downloadUrl}
                                            download={`qrcode-${selectedQrCode ? 'custom' : bio?.sufix}.png`}
                                            className="w-full py-3 bg-black text-white rounded-xl font-bold uppercase tracking-wide flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-900 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Download className="w-4 h-4 stroke-[3px]" />
                                            <span className="ml-2">{t("dashboard.qrcode.downloadPng")}</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthorizationGuard>
    );
}