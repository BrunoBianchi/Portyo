import { useContext, useEffect, useState } from "react";
import BioContext from "~/contexts/bio.context";
import { AuthorizationGuard } from "~/contexts/guard.context";
import { QrCode as QrCodeIcon, Download, Plus, Link as LinkIcon, Loader2, Copy, Check, RotateCcw, Palette } from "lucide-react";
import type { MetaFunction } from "react-router";
import QRCode from "react-qr-code";
import { createQrCode, getQrCodes, type QrCode } from "~/services/qrcode.service";

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
    const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
    const [selectedQrCode, setSelectedQrCode] = useState<QrCode | null>(null);
    const [newValue, setNewValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#FFFFFF");

    useEffect(() => {
        if (bio?.id) {
            loadQrCodes();
        }
    }, [bio?.id]);

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

    // Default bio QR code if list is empty or to show as default option
    const defaultBioUrl = bio ? `https://${bio.sufix}.portyo.me` : "";

    // Determine what to show - use frontend redirect URL for tracking
    const FRONTEND_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://portyo.me';
    const currentQrValue = selectedQrCode
        ? `${FRONTEND_BASE_URL}/redirect-qrcode/${selectedQrCode.id}`
        : defaultBioUrl;
    const downloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(currentQrValue)}&color=${fgColor.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}`;

    return (
        <AuthorizationGuard>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-bold uppercase tracking-wider mb-3">
                            <QrCodeIcon className="w-3 h-3" />
                            Share
                        </div>
                        <h1 className="text-4xl font-extrabold text-text-main tracking-tight mb-2">QR Codes</h1>
                        <p className="text-lg text-text-muted">Manage and track your QR codes.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: List & Create */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Create New */}
                        <div className="card p-6">
                            <h3 className="text-lg font-bold text-text-main mb-4">Create New QR Code</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Destination URL</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            type="url"
                                            value={newValue}
                                            onChange={(e) => setNewValue(e.target.value)}
                                            placeholder="https://example.com"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isCreating || !newValue}
                                    className="btn btn-primary w-full justify-center"
                                >
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    <span>Generate QR Code</span>
                                </button>
                            </form>
                        </div>

                        {/* List */}
                        <div className="card overflow-hidden flex flex-col max-h-[600px]">
                            <div className="p-4 border-b border-border bg-surface-alt/30">
                                <h3 className="font-bold text-text-main text-sm">Your QR Codes</h3>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                                {/* Default Bio Link Option */}
                                <button
                                    onClick={() => setSelectedQrCode(null)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${!selectedQrCode ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-surface-alt'}`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                                        <QrCodeIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-text-main text-sm truncate">Main Profile</p>
                                        <p className="text-xs text-text-muted truncate">{defaultBioUrl}</p>
                                    </div>
                                    {!selectedQrCode && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                                </button>

                                {isLoading ? (
                                    <div className="p-8 text-center text-text-muted">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        <p className="text-xs">Loading...</p>
                                    </div>
                                ) : qrCodes.map((qr) => (
                                    <button
                                        key={qr.id}
                                        onClick={() => setSelectedQrCode(qr)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selectedQrCode?.id === qr.id ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-surface-alt'}`}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                                            <QRCode value={qr.value} size={24} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-text-main text-sm truncate">{qr.value}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[10px] text-text-muted bg-surface-alt px-1.5 py-0.5 rounded border border-border">
                                                    {new Date(qr.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-text-muted">
                                                    {qr.views} views
                                                </span>
                                            </div>
                                        </div>
                                        {selectedQrCode?.id === qr.id && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="lg:col-span-2">
                        <div className="card h-full flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

                            <div className="p-6 md:p-8 relative z-10 flex flex-col xl:flex-row gap-8 h-full">
                                {/* Left Side: Preview */}
                                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                    <div className="text-center space-y-2 w-full">
                                        <h2 className="text-2xl font-bold text-text-main">
                                            {selectedQrCode ? "Custom QR Code" : "Profile QR Code"}
                                        </h2>
                                        <div className="flex items-center justify-center gap-2 text-text-muted bg-surface-alt/50 py-1 px-3 rounded-full inline-flex max-w-full mx-auto border border-border/50">
                                            <span className="truncate text-xs max-w-[180px] xl:max-w-[240px]">{currentQrValue}</span>
                                            <button
                                                onClick={() => handleCopy(currentQrValue)}
                                                className="p-0.5 hover:text-primary transition-colors"
                                                title="Copy URL"
                                            >
                                                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm transition-colors duration-300 w-full max-w-[300px]" style={{ backgroundColor: bgColor }}>
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
                                                <p className="text-2xl font-bold text-text-main">{selectedQrCode.views}</p>
                                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Scans</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-text-main">{selectedQrCode.clicks}</p>
                                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Clicks</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Controls */}
                                <div className="w-full xl:w-80 shrink-0 border-t xl:border-t-0 xl:border-l border-border pt-6 xl:pt-0 xl:pl-8 flex flex-col gap-6">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-text-main font-bold text-sm uppercase tracking-wider">
                                                <Palette className="w-4 h-4" />
                                                <span>Appearance</span>
                                            </div>
                                            <button
                                                onClick={handleResetColors}
                                                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                Reset
                                            </button>
                                        </div>

                                        {/* Presets */}
                                        <div>
                                            <label className="text-xs font-medium text-text-muted mb-3 block">Color Presets</label>
                                            <div className="grid grid-cols-6 gap-2">
                                                {PRESET_COLORS.map((preset) => (
                                                    <button
                                                        key={preset.name}
                                                        onClick={() => { setFgColor(preset.fg); setBgColor(preset.bg); }}
                                                        className="w-9 h-9 rounded-full border border-border shadow-sm flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                        style={{ backgroundColor: preset.bg }}
                                                        title={preset.name}
                                                    >
                                                        <div className="w-4 h-4 rounded-full ring-1 ring-black/5" style={{ backgroundColor: preset.fg }}></div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Custom Pickers */}
                                        <div className="space-y-4 pt-2 border-t border-border/50">
                                            <div>
                                                <label className="text-xs font-medium text-text-muted mb-2 block">Foreground Color</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border shadow-sm shrink-0">
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
                                                            className="w-full bg-surface-alt border border-border rounded-lg pl-3 pr-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-primary transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-text-muted mb-2 block">Background Color</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border shadow-sm shrink-0">
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
                                                            className="w-full bg-surface-alt border border-border rounded-lg pl-3 pr-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-primary transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-8">
                                        <a
                                            href={downloadUrl}
                                            download={`qrcode-${selectedQrCode ? 'custom' : bio?.sufix}.png`}
                                            className="btn btn-primary w-full justify-center py-3 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Download className="w-5 h-5" />
                                            <span className="ml-2">Download PNG</span>
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