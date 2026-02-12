import type { MetaFunction } from "react-router";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import { Loader2, CheckCircle, Upload, AlertCircle, Eye, ArrowRight, Sparkles, Image as ImageIcon, GripVertical, Plus, Trash2, Palette, Type, Minus, Tag, Share2, DollarSign, TrendingUp, Settings2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.paymentSuccess.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.paymentSuccess.description", { lng: lang }) },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        // Add Google Fonts
        { tagName: "link", rel: "preconnect", href: "https://fonts.googleapis.com" },
        { tagName: "link", rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { tagName: "link", rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&family=Montserrat:wght@700;900&family=Outfit:wght@600;800&display=swap" }
    ];
};

interface Block {
    id: string;
    type: 'headline' | 'text' | 'image' | 'button' | 'spacer' | 'divider' | 'badge' | 'social' | 'price';
    content?: string;
    props?: any;
    visible?: boolean;
    style?: {
        color?: string;
        backgroundColor?: string;
        alignment?: 'left' | 'center' | 'right';
    };
}

interface ProposalCreative {
    backgroundColor: string;
    textColor: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    buttonColor?: string;
    buttonTextColor?: string;
    alignment?: 'left' | 'center' | 'right';
    boxShadow?: string;
    padding?: number;
    gap?: number;
    fontFamily?: string;
    animation?: 'none' | 'pulse' | 'bounce';
    items: Block[];
}

interface Proposal {
    id: string;
    content: ProposalCreative;
    status: string;
}

// Draggable Item Component
function SortableItem(props: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="mb-3 group relative touch-none">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 p-2 cursor-grab text-muted-foreground hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10" {...listeners}>
                <GripVertical className="w-5 h-5" />
            </div>
            <div className="pl-8 sm:pl-10">
                {props.children}
            </div>
        </div>
    );
}

export default function PaymentSuccess() {
    const { t } = useTranslation("company");
    const [searchParams] = useSearchParams();
    const proposalId = searchParams.get("proposalId");

    const [step, setStep] = useState<'verification' | 'editor'>('verification');
    const [emailSent, setEmailSent] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [proposal, setProposal] = useState<Proposal | null>(null);

    // Editor State
    const [creative, setCreative] = useState<ProposalCreative>({
        backgroundColor: "#ffffff",
        textColor: "#000000",
        borderColor: "#e5e5e5",
        borderWidth: 0,
        borderRadius: 24,
        buttonColor: "#000000",
        buttonTextColor: "#ffffff",
        alignment: "center",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        padding: 24,
        gap: 16,
        fontFamily: "Inter, sans-serif",
        animation: "none",
        items: [
            { id: '1', type: 'image', content: '' },
            { id: '2', type: 'headline', content: t("paymentSuccess.defaults.headline") },
            { id: '3', type: 'text', content: t("paymentSuccess.defaults.description") },
            { id: '4', type: 'button', content: t("paymentSuccess.defaults.learnMore"), props: { url: 'https://' } }
        ]
    });

    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});
    const previewCardRef = useRef<HTMLDivElement | null>(null);
    const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
    const maxCardSize = { width: 526, height: 400 };
    const isCardOversize = cardSize.width > maxCardSize.width || cardSize.height > maxCardSize.height;
    const cardScale = Math.min(
        1,
        maxCardSize.width / (cardSize.width || 1),
        maxCardSize.height / (cardSize.height || 1)
    );
    const displayCardSize = {
        width: Math.round(cardSize.width * cardScale),
        height: Math.round(cardSize.height * cardScale)
    };

    const toggleExpand = (id: string) => {
        setExpandedBlocks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const storedToken = localStorage.getItem(`marketing_token_${proposalId}`);
        if (storedToken && proposalId) {
            setToken(storedToken);
            fetchProposal(storedToken);
        }
    }, [proposalId]);

    useEffect(() => {
        if (!proposalId) return;
        setError(null);
        setLoading(true);
        fetch(`${import.meta.env.VITE_API_URL}/api/public/marketing/proposals/${proposalId}/validate`)
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error("Invalid proposal");
                }
            })
            .catch(() => {
                setError("INVALID_PROPOSAL");
            })
            .finally(() => setLoading(false));
    }, [proposalId]);

    useEffect(() => {
        if (!previewCardRef.current) return;

        const element = previewCardRef.current;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setCardSize({ width: Math.round(width), height: Math.round(height) });
            }
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, [step, creative]);

    const fetchProposal = async (authToken: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/marketing/proposals/${proposalId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (!res.ok) throw new Error(t("paymentSuccess.errors.loadFailed"));
            const data = await res.json();
            setProposal(data);

            // Merge loaded content
            if (data.content && data.content.items) {
                setCreative(prev => ({ ...prev, ...data.content })); // Full replace for exact state
            } else if (data.content) {
                // Migration for legacy flat structure
                const newItems: Block[] = [];
                if (data.content.imageUrl) newItems.push({ id: 'img-1', type: 'image', content: data.content.imageUrl });
                if (data.content.title) newItems.push({ id: 'head-1', type: 'headline', content: data.content.title });
                if (data.content.description) newItems.push({ id: 'txt-1', type: 'text', content: data.content.description });
                if (data.content.buttonText) newItems.push({ id: 'btn-1', type: 'button', content: data.content.buttonText, props: { url: data.content.linkUrl } });

                if (newItems.length > 0) {
                    setCreative({
                        backgroundColor: data.content.backgroundColor || '#ffffff',
                        textColor: data.content.textColor || '#000000',
                        items: newItems
                    });
                }
            }

            setStep('editor');
        } catch (err) {
            console.error(err);
            localStorage.removeItem(`marketing_token_${proposalId}`);
            setToken(null);
            setStep('verification');
        } finally {
            setLoading(false);
        }
    };

    const handleSendCode = async () => {
        if (!proposalId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/marketing/proposals/${proposalId}/send-code`, {
                method: "POST"
            });
            if (!res.ok) throw new Error(t("paymentSuccess.errors.codeFailed"));
            setEmailSent(true);
        } catch (err: any) {
            setError(err.message || t("paymentSuccess.errors.codeFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!proposalId) return;
        const code = otp.join("");
        if (code.length !== 6) return;

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/marketing/proposals/${proposalId}/verify-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || t("paymentSuccess.errors.verificationFailed"));
            }

            const data = await res.json();
            setToken(data.token);
            localStorage.setItem(`marketing_token_${proposalId}`, data.token);

            if (data.proposal) {
                // Trigger migration logic if needed
                await fetchProposal(data.token);
            } else {
                await fetchProposal(data.token);
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    };

    // --- DND Handlers ---
    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setCreative((prev) => {
                const oldIndex = prev.items.findIndex((item) => item.id === active.id);
                const newIndex = prev.items.findIndex((item) => item.id === over.id);
                return {
                    ...prev,
                    items: arrayMove(prev.items, oldIndex, newIndex),
                };
            });
        }
        setActiveId(null);
    };

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    }

    const updateBlock = (id: string, updates: Partial<Block>) => {
        setCreative(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, ...updates } : item)
        }));
    };

    const updateBlockProp = (id: string, propKey: string, value: any) => {
        setCreative(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, props: { ...item.props || {}, [propKey]: value } } : item)
        }));
    }

    const updateBlockStyle = (id: string, styleUpdates: any) => {
        setCreative(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, style: { ...item.style, ...styleUpdates } } : item
            )
        }));
    };

    const addBlock = (type: Block['type']) => {
        const newBlock: Block = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: type === 'image' ? '' : type === 'button' ? t("paymentSuccess.defaults.clickMe") : type === 'headline' ? t("paymentSuccess.defaults.newHeadline") : type === 'text' ? t("paymentSuccess.defaults.newText") : type === 'badge' ? t("paymentSuccess.defaults.newBadge") : type === 'price' ? t("paymentSuccess.defaults.defaultPrice") : '',
            props: type === 'button' ? { url: '#' } : type === 'social' ? { twitter: '', instagram: '' } : {}
        };
        setCreative(prev => ({
            ...prev,
            items: [...prev.items, newBlock]
        }));
    };

    const removeBlock = (id: string) => {
        setCreative(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    const handleSave = async () => {
        if (!proposalId || !token) return;
        setSaving(true);
        setSaveSuccess(false);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/marketing/proposals/${proposalId}/creative`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(creative)
            });

            if (!res.ok) throw new Error(t("paymentSuccess.errors.saveFailed"));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError(t("paymentSuccess.errors.saveFailed"));
        } finally {
            setSaving(false);
        }
    };

    if (!proposalId) {
        return (
            <div className="min-h-screen bg-muted flex items-center justify-center p-4">
                <div className="bg-surface-card p-8 rounded-xl shadow-sm text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-foreground">{t("paymentSuccess.errors.invalidLink")}</h1>
                    <p className="text-muted-foreground mt-2">{t("paymentSuccess.errors.noProposal")}</p>
                </div>
            </div>
        );
    }

    if (error === "INVALID_PROPOSAL") {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-surface-card p-8 rounded-xl shadow-sm text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-foreground">{t("paymentSuccess.errors.invalidProposal")}</h1>
                    <p className="text-muted-foreground mt-2">{t("paymentSuccess.errors.proposalInvalid")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-foreground">{t("paymentSuccess.header.title")}</h1>
                    <p className="mt-2 text-muted-foreground">{t("paymentSuccess.header.subtitle")}</p>
                </div>

                {step === 'verification' && (
                    <div className="max-w-md mx-auto bg-surface-card rounded-2xl shadow-sm border border-border p-8">
                        {/* Verification steps */}
                        {!emailSent ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-8 h-8 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-semibold mb-2">{t("paymentSuccess.verification.title")}</h2>
                                <p className="text-muted-foreground mb-6">
                                    {t("paymentSuccess.verification.subtitle")}
                                </p>
                                <button
                                    onClick={handleSendCode}
                                    disabled={loading}
                                    className="w-full py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("paymentSuccess.verification.sendCode")}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-xl font-semibold mb-4">{t("paymentSuccess.verification.enterCode")}</h2>
                                <p className="text-muted-foreground mb-8 text-sm">
                                    {t("paymentSuccess.verification.codeSent")}
                                </p>

                                <div className="flex justify-center gap-2 mb-8">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            id={`otp-${i}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace" && !digit && i > 0) {
                                                    document.getElementById(`otp-${i - 1}`)?.focus();
                                                }
                                            }}
                                            className="w-12 h-14 border border-border rounded-lg text-center text-xl font-semibold focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition-colors"
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center justify-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleVerifyCode}
                                    disabled={loading || otp.join("").length !== 6}
                                    className="w-full py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("paymentSuccess.verification.verifyCode")}
                                </button>

                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="mt-4 text-sm text-muted-foreground hover:text-foreground underline"
                                >
                                    {t("paymentSuccess.verification.resendCode")}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {step === 'editor' && (
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        {/* Editor Controls (Left & Center) */}
                        <div className="lg:col-span-7 flex flex-col lg:flex-row gap-4 items-start">
                            {/* Tools Sidebar */}
                            <div className="w-full lg:w-14 flex-shrink-0 flex lg:flex-col flex-row gap-2 lg:gap-2 lg:sticky lg:top-8 bg-surface-card rounded-xl shadow-sm border border-border p-2 lg:p-1.5 lg:py-3 items-center overflow-x-auto lg:overflow-visible">

                                {['headline', 'text', 'price', 'image', 'button', 'badge', 'social', 'divider', 'spacer'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => addBlock(type as any)}
                                        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border group relative"
                                    >
                                        {type === 'headline' && <Type className="w-5 h-5" />}
                                        {type === 'text' && <Type className="w-4 h-4" />}
                                        {type === 'price' && <DollarSign className="w-5 h-5" />}
                                        {type === 'image' && <ImageIcon className="w-5 h-5" />}
                                        {type === 'button' && <span className="w-5 h-3 bg-current rounded-sm border-2 border-current"></span>}
                                        {type === 'spacer' && <div className="h-4 w-1 border-l-2 border-dashed border-current"></div>}
                                        {type === 'divider' && <Minus className="w-5 h-5" />}
                                        {type === 'badge' && <Tag className="w-5 h-5" />}
                                        {type === 'social' && <Share2 className="w-5 h-5" />}

                                        <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity hidden lg:block">
                                            {t(`paymentSuccess.blocks.${type}`)}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 space-y-6 min-w-0 w-full">
                                <div className="bg-surface-card rounded-2xl shadow-sm border border-border p-6">
                                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-yellow-500" />
                                        {t("paymentSuccess.editor.title")}
                                    </h2>

                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragStart={handleDragStart}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={creative.items.map(i => i.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="space-y-4">
                                                {creative.items.map((item) => (
                                                    <SortableItem key={item.id} id={item.id}>
                                                        <div className="bg-muted rounded-xl border border-border p-4 transition-colors hover:border-border">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                                    {item.type === 'image' && <ImageIcon className="w-3 h-3" />}
                                                                    {item.type === 'headline' && <Type className="w-3 h-3" />}
                                                                    {item.type === 'text' && <Type className="w-3 h-3" />}
                                                                    {item.type === 'price' && <DollarSign className="w-3 h-3" />}
                                                                    {item.type === 'button' && <span className="w-3 h-3 bg-neutral-400 rounded-sm"></span>}
                                                                    {item.type === 'divider' && <Minus className="w-3 h-3" />}
                                                                    {item.type === 'badge' && <Tag className="w-3 h-3" />}
                                                                    {item.type === 'social' && <Share2 className="w-3 h-3" />}
                                                                    {t(`paymentSuccess.blocks.${item.type}`)}
                                                                </span>
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => toggleExpand(item.id)}
                                                                        className={`p-1.5 rounded-md transition-colors ${expandedBlocks[item.id] ? 'bg-neutral-200 text-foreground' : 'text-muted-foreground hover:text-muted-foreground hover:bg-muted'}`}
                                                                    >
                                                                        <Settings2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => removeBlock(item.id)} className="text-muted-foreground hover:text-red-500 p-1.5 rounded hover:bg-muted transition-colors">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {expandedBlocks[item.id] && (
                                                                <div className="mb-4 p-3 bg-surface-card rounded-lg border border-border space-y-3 shadow-sm transition-all duration-200">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[10px] font-bold uppercase text-muted-foreground">{t("paymentSuccess.blocks.alignment")}</label>
                                                                        <div className="flex gap-1 bg-muted p-0.5 rounded-md border border-border">
                                                                            {['left', 'center', 'right'].map((align) => (
                                                                                <button
                                                                                    key={align}
                                                                                    onClick={() => updateBlockStyle(item.id, { alignment: align as any })}
                                                                                    className={`px-2 py-1 rounded text-[10px] capitalize transition-all ${(item.style?.alignment || creative.alignment) === align ? 'bg-neutral-900 text-white shadow-sm' : 'text-muted-foreground hover:text-muted-foreground'}`}
                                                                                >
                                                                                    {t(`paymentSuccess.blocks.align${align.charAt(0).toUpperCase() + align.slice(1)}`)}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {['headline', 'text', 'price', 'badge'].includes(item.type) && (
                                                                        <div className="flex items-center justify-between">
                                                                            <label className="text-[10px] font-bold uppercase text-muted-foreground">{t("paymentSuccess.blocks.textColor")}</label>
                                                                            <input
                                                                                type="color"
                                                                                value={item.style?.color || creative.textColor}
                                                                                onChange={e => updateBlockStyle(item.id, { color: e.target.value })}
                                                                                className="w-8 h-6 rounded cursor-pointer border border-border p-0.5"
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    {item.type === 'button' && (
                                                                        <>
                                                                            <div className="flex items-center justify-between">
                                                                                <label className="text-[10px] font-bold uppercase text-muted-foreground">{t("paymentSuccess.blocks.buttonColor")}</label>
                                                                                <input
                                                                                    type="color"
                                                                                    value={item.props?.buttonColor || creative.buttonColor || '#000000'}
                                                                                    onChange={e => updateBlockProp(item.id, 'buttonColor', e.target.value)}
                                                                                    className="w-8 h-6 rounded cursor-pointer border border-border p-0.5"
                                                                                />
                                                                            </div>
                                                                            <div className="flex items-center justify-between">
                                                                                <label className="text-[10px] font-bold uppercase text-muted-foreground">{t("paymentSuccess.blocks.labelColor")}</label>
                                                                                <input
                                                                                    type="color"
                                                                                    value={item.props?.buttonTextColor || creative.buttonTextColor || '#ffffff'}
                                                                                    onChange={e => updateBlockProp(item.id, 'buttonTextColor', e.target.value)}
                                                                                    className="w-8 h-6 rounded cursor-pointer border border-border p-0.5"
                                                                                />
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="space-y-3">
                                                                {item.type === 'image' && (
                                                                    <input
                                                                        type="url"
                                                                        value={item.content || ''}
                                                                        onChange={e => updateBlock(item.id, { content: e.target.value })}
                                                                        placeholder={t("paymentSuccess.blocks.imageUrlPlaceholder")}
                                                                        className="w-full p-2 text-sm border border-border rounded-lg bg-surface-card placeholder:text-muted-foreground"
                                                                    />
                                                                )}
                                                                {(item.type === 'headline' || item.type === 'text') && (
                                                                    <textarea
                                                                        value={item.content || ''}
                                                                        onChange={e => updateBlock(item.id, { content: e.target.value })}
                                                                        placeholder={t("paymentSuccess.blocks.enterText")}
                                                                        rows={item.type === 'headline' ? 1 : 2}
                                                                        className="w-full p-2 text-sm border border-border rounded-lg bg-surface-card resize-none placeholder:text-muted-foreground"
                                                                    />
                                                                )}
                                                                {item.type === 'price' && (
                                                                    <input
                                                                        type="text"
                                                                        value={item.content || ''}
                                                                        onChange={e => updateBlock(item.id, { content: e.target.value })}
                                                                        placeholder={t("paymentSuccess.blocks.pricePlaceholder")}
                                                                        className="w-full p-2 text-sm border border-border rounded-lg bg-surface-card placeholder:text-muted-foreground font-mono"
                                                                    />
                                                                )}
                                                                {item.type === 'button' && (
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <input
                                                                            type="text"
                                                                            value={item.content || ''}
                                                                            onChange={e => updateBlock(item.id, { content: e.target.value })}
                                                                            placeholder={t("paymentSuccess.blocks.labelPlaceholder")}
                                                                            className="w-full p-2 text-sm border border-border rounded-lg bg-surface-card placeholder:text-muted-foreground"
                                                                        />
                                                                        <input
                                                                            type="url"
                                                                            value={item.props?.url || ''}
                                                                            onChange={e => updateBlockProp(item.id, 'url', e.target.value)}
                                                                            placeholder={t("paymentSuccess.blocks.urlPlaceholder")}
                                                                            className="w-full p-2 text-sm border border-border rounded-lg bg-surface-card placeholder:text-muted-foreground"
                                                                        />
                                                                    </div>
                                                                )}
                                                                {item.type === 'badge' && (
                                                                    <input
                                                                        type="text"
                                                                        value={item.content || ''}
                                                                        onChange={e => updateBlock(item.id, { content: e.target.value })}
                                                                        placeholder={t("paymentSuccess.blocks.badgePlaceholder")}
                                                                        className="w-full p-2 text-sm border border-border rounded-lg bg-surface-card placeholder:text-muted-foreground"
                                                                    />
                                                                )}
                                                                {item.type === 'social' && (
                                                                    <div className="space-y-2">
                                                                        <input
                                                                            type="url"
                                                                            value={item.props?.twitter || ''}
                                                                            onChange={e => updateBlockProp(item.id, 'twitter', e.target.value)}
                                                                            placeholder={t("paymentSuccess.blocks.twitterPlaceholder")}
                                                                            className="w-full p-2 text-sm border border-border rounded-lg bg-surface-card placeholder:text-muted-foreground"
                                                                        />
                                                                        <input
                                                                            type="url"
                                                                            value={item.props?.instagram || ''}
                                                                            onChange={e => updateBlockProp(item.id, 'instagram', e.target.value)}
                                                                            placeholder={t("paymentSuccess.blocks.instagramPlaceholder")}
                                                                            className="w-full p-2 text-sm border border-border rounded-lg bg-surface-card placeholder:text-muted-foreground"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </SortableItem>
                                                ))}
                                            </div>
                                        </SortableContext>

                                        {/* Drag Overlay for UX */}
                                        <DragOverlay>
                                            {activeId ? (
                                                <div className="bg-surface-card p-4 rounded-xl shadow-xl border border-blue-500 opacity-90 cursor-grabbing">
                                                    {t("paymentSuccess.editor.dragOverlay")}
                                                </div>
                                            ) : null}
                                        </DragOverlay>
                                    </DndContext>
                                </div>

                                {/* Card Design (Global Settings) */}
                                <div className="bg-surface-card rounded-2xl shadow-sm border border-border p-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                        <Palette className="w-4 h-4" /> {t("paymentSuccess.cardDesign.title")}
                                    </h3>

                                    {/* Style Presets */}
                                    <div className="mb-6 p-4 bg-muted rounded-xl border border-border overflow-x-auto">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> {t("paymentSuccess.cardDesign.quickStyles")}
                                        </label>
                                        <div className="flex gap-2 min-w-max">
                                            {[
                                                { key: 'darkPro', bg: '#000000', text: '#ffffff', btn: '#ffffff', btnText: '#000000' },
                                                { key: 'minimal', bg: '#ffffff', text: '#000000', btn: '#000000', btnText: '#ffffff' },
                                                { key: 'radiant', bg: 'linear-gradient(135deg, #6366f1, #a855f7)', text: '#ffffff', btn: '#ffffff', btnText: '#000000' },
                                                { key: 'softGray', bg: '#f8fafc', text: '#1e293b', btn: '#1e293b', btnText: '#ffffff' }
                                            ].map((preset) => (
                                                <button
                                                    key={preset.key}
                                                    onClick={() => setCreative({
                                                        ...creative,
                                                        backgroundColor: preset.bg,
                                                        textColor: preset.text,
                                                        buttonColor: preset.btn,
                                                        buttonTextColor: preset.btnText
                                                    })}
                                                    className="flex items-center gap-2 p-2 rounded-lg bg-surface-card border border-border hover:border-primary transition-all group shrink-0"
                                                >
                                                    <div className="w-4 h-4 rounded-full border border-border" style={{ background: preset.bg }}></div>
                                                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">{t(`paymentSuccess.cardDesign.${preset.key}`)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Color & Font */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("paymentSuccess.cardDesign.cardBase")}</h4>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-2">{t("paymentSuccess.cardDesign.bgColor")}</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={creative.backgroundColor === 'transparent' ? '#000000' : creative.backgroundColor}
                                                    onChange={e => setCreative({ ...creative, backgroundColor: e.target.value })}
                                                    className="w-10 h-10 rounded cursor-pointer border border-border p-0.5"
                                                />
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => setCreative({ ...creative, backgroundColor: 'transparent' })}
                                                        className={`px-2 py-1 text-[10px] rounded ${creative.backgroundColor === 'transparent' ? 'bg-neutral-900 text-white' : 'bg-surface-card border border-border text-muted-foreground'}`}
                                                    >
                                                        {t("paymentSuccess.cardDesign.clear")}
                                                    </button>
                                                    <button
                                                        onClick={() => setCreative({ ...creative, backgroundColor: '#ffffff' })}
                                                        className={`px-2 py-1 text-[10px] rounded ${creative.backgroundColor === '#ffffff' ? 'bg-neutral-900 text-white' : 'bg-surface-card border border-border text-muted-foreground'}`}
                                                    >
                                                        {t("paymentSuccess.cardDesign.white")}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-2">{t("paymentSuccess.cardDesign.fontStyle")}</label>
                                            <select
                                                value={creative.fontFamily || 'Inter, sans-serif'}
                                                onChange={e => setCreative({ ...creative, fontFamily: e.target.value })}
                                                className="w-full p-2 text-sm border border-border rounded-lg bg-surface-card shadow-sm"
                                            >
                                                <option value="Inter, sans-serif">{t("paymentSuccess.cardDesign.fontModern")}</option>
                                                <option value="'Playfair Display', serif">{t("paymentSuccess.cardDesign.fontElegant")}</option>
                                                <option value="'Montserrat', sans-serif">{t("paymentSuccess.cardDesign.fontBold")}</option>
                                                <option value="'Outfit', sans-serif">{t("paymentSuccess.cardDesign.fontClean")}</option>
                                                <option value="monospace">{t("paymentSuccess.cardDesign.fontTechnical")}</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Borders & Shape */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("paymentSuccess.cardDesign.bordersShape")}</h4>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-medium text-muted-foreground mb-1">{t("paymentSuccess.cardDesign.color")}</label>
                                                <input
                                                    type="color"
                                                    value={creative.borderColor || '#e5e7eb'}
                                                    onChange={e => setCreative({ ...creative, borderColor: e.target.value })}
                                                    className="w-full h-8 rounded cursor-pointer border border-border p-0.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-muted-foreground mb-1">{t("paymentSuccess.cardDesign.width")}: {creative.borderWidth || 0}px</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    value={creative.borderWidth || 0}
                                                    onChange={e => setCreative({ ...creative, borderWidth: parseInt(e.target.value) })}
                                                    className="w-full h-8 accent-primary"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-medium text-muted-foreground mb-1">{t("paymentSuccess.cardDesign.radius")}: {creative.borderRadius || 24}px</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="48"
                                                value={creative.borderRadius || 24}
                                                onChange={e => setCreative({ ...creative, borderRadius: parseInt(e.target.value) })}
                                                className="w-full accent-primary"
                                            />
                                        </div>
                                    </div>

                                    {/* Spacing & Anim */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("paymentSuccess.cardDesign.layoutInteraction")}</h4>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-medium text-muted-foreground mb-1">{t("paymentSuccess.cardDesign.padding")}</label>
                                                <input
                                                    type="number"
                                                    value={creative.padding || 24}
                                                    onChange={e => setCreative({ ...creative, padding: parseInt(e.target.value) })}
                                                    className="w-full p-1.5 text-xs border border-border rounded-lg bg-surface-card"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-muted-foreground mb-1">{t("paymentSuccess.cardDesign.gap")}</label>
                                                <input
                                                    type="number"
                                                    value={creative.gap || 16}
                                                    onChange={e => setCreative({ ...creative, gap: parseInt(e.target.value) })}
                                                    className="w-full p-1.5 text-xs border border-border rounded-lg bg-surface-card"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-medium text-muted-foreground mb-1">{t("paymentSuccess.cardDesign.hoverAnimation")}</label>
                                            <div className="flex gap-1">
                                                {['none', 'pulse', 'bounce'].map((anim) => (
                                                    <button
                                                        key={anim}
                                                        onClick={() => setCreative({ ...creative, animation: anim as any })}
                                                        className={`flex-1 py-1 rounded text-[10px] capitalize transition-colors border ${creative.animation === anim ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-surface-card text-muted-foreground border-border hover:border-border'}`}
                                                    >
                                                        {t(`paymentSuccess.cardDesign.anim${anim.charAt(0).toUpperCase() + anim.slice(1)}`)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className={`text-sm font-medium transition-opacity ${saveSuccess ? 'text-emerald-600 opacity-100' : 'text-muted-foreground opacity-0'}`} aria-live="polite">
                                            {t("paymentSuccess.editor.savedIndicator")}
                                        </div>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className={`w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${saveSuccess ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500' : 'bg-surface-card text-foreground border-border hover:border-border hover:bg-muted focus-visible:ring-neutral-800'} disabled:opacity-60`}
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? t("paymentSuccess.editor.saved") : t("paymentSuccess.editor.save")}
                                        </button>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
    
                            <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-4 w-full">

                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-muted-foreground" />
                                    {t("paymentSuccess.editor.livePreview")}
                                </h2>
                                    <div className={`text-xs font-semibold px-2 py-1 rounded-full border ${isCardOversize ? 'border-destructive/20 text-destructive bg-destructive/10' : 'border-emerald-200 text-emerald-700 bg-emerald-50'}`}>
                                        {displayCardSize.width}×{displayCardSize.height}px
                                    </div>
                            </div>

                            <div className="border border-dashed border-border rounded-xl p-6 sm:p-8 bg-muted/50 flex items-center justify-center min-h-[360px] sm:min-h-[500px] overflow-hidden">
                                {/* Wrapper to simulate site context */}
                                <div className="w-full max-w-[526px] max-h-[400px] mx-auto flex items-start justify-center">

                                    {/* The Ad Card */}
                                    <div
                                        ref={previewCardRef}
                                        className={`w-full max-w-[526px] max-h-[400px] overflow-hidden shadow-xl relative aspect-auto flex flex-col p-6 transition-all duration-500 ${creative.animation === 'pulse' ? 'hover:animate-pulse' : creative.animation === 'bounce' ? 'hover:-translate-y-2' : ''}`}
                                        style={{
                                            backgroundColor: creative.backgroundColor === 'transparent' ? 'transparent' : creative.backgroundColor,
                                            color: creative.textColor,
                                            borderColor: creative.borderColor || (creative.backgroundColor === 'transparent' ? 'rgba(0,0,0,0.1)' : 'transparent'),
                                            borderWidth: `${creative.borderWidth || 0}px`,
                                            borderStyle: creative.borderWidth ? 'solid' : 'none',
                                            borderRadius: `${creative.borderRadius || 24}px`,
                                            textAlign: creative.alignment || 'center' as any,
                                            boxShadow: creative.boxShadow,
                                            padding: `${creative.padding || 24}px`,
                                            fontFamily: creative.fontFamily || 'Inter, sans-serif',
                                            maxWidth: `${maxCardSize.width}px`,
                                            maxHeight: `${maxCardSize.height}px`,
                                            transform: cardScale < 1 ? `scale(${cardScale})` : undefined,
                                            transformOrigin: 'top center'
                                        }}
                                    >
                                        <div className="flex flex-col" style={{ gap: `${creative.gap || 16}px` }}>
                                            {creative.items.map((item) => {
                                                const itemAlign = item.style?.alignment || creative.alignment || 'center';
                                                const itemColor = item.style?.color || creative.textColor;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`w-full flex flex-col ${itemAlign === 'left' ? 'items-start' : itemAlign === 'right' ? 'items-end' : 'items-center'}`}
                                                        style={{ textAlign: itemAlign as any }}
                                                    >
                                                        {item.type === 'image' && item.content && (
                                                            <img
                                                                src={item.content}
                                                                alt="Ad"
                                                                className="w-full h-48 object-cover shadow-sm"
                                                                style={{ borderRadius: `${Math.max(0, (creative.borderRadius || 16) - 8)}px` }}
                                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                            />
                                                        )}

                                                        {item.type === 'headline' && (
                                                            <h3 className="text-xl font-bold leading-tight" style={{ color: itemColor }}>
                                                                {item.content || t("paymentSuccess.defaults.headingFallback")}
                                                            </h3>
                                                        )}

                                                        {item.type === 'price' && (
                                                            <div
                                                                className="text-4xl font-bold tracking-tight my-2 py-2 px-4 rounded-xl inline-block"
                                                                style={{
                                                                    backgroundColor: itemColor + '0a',
                                                                    color: itemColor,
                                                                }}
                                                            >
                                                                {item.content}
                                                            </div>
                                                        )}

                                                        {item.type === 'text' && (
                                                            <p className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap" style={{ color: itemColor }}>
                                                                {item.content || t("paymentSuccess.defaults.textFallback")}
                                                            </p>
                                                        )}

                                                        {item.type === 'button' && (
                                                            <span
                                                                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-sm min-w-[140px] transition-transform"
                                                                style={{
                                                                    backgroundColor: item.props?.buttonColor || creative.buttonColor || itemColor,
                                                                    color: item.props?.buttonTextColor || creative.buttonTextColor || (creative.backgroundColor === 'transparent' ? '#ffffff' : creative.backgroundColor)
                                                                }}
                                                            >
                                                                {item.content || t("paymentSuccess.defaults.buttonFallback")}
                                                                <ArrowRight className="w-4 h-4 ml-2" />
                                                            </span>
                                                        )}
                                                        {item.type === 'divider' && (
                                                            <hr className="w-full my-4 border-current opacity-20" style={{ borderColor: itemColor }} />
                                                        )}

                                                        {item.type === 'badge' && (
                                                            <span
                                                                className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2"
                                                                style={{
                                                                    backgroundColor: itemColor,
                                                                    color: creative.backgroundColor === 'transparent' ? '#ffffff' : creative.backgroundColor,
                                                                    opacity: 0.8
                                                                }}
                                                            >
                                                                {item.content || t("paymentSuccess.defaults.badgeFallback")}
                                                            </span>
                                                        )}

                                                        {item.type === 'social' && (
                                                            <div className={`flex gap-3 mt-2 ${itemAlign === 'left' ? 'justify-start' : itemAlign === 'right' ? 'justify-end' : 'justify-center'}`} style={{ color: itemColor }}>
                                                                {item.props?.twitter && <Share2 className="w-5 h-5 opacity-60" />}
                                                                {item.props?.instagram && <Tag className="w-5 h-5 opacity-60" />}
                                                                {(!item.props?.twitter && !item.props?.instagram) && <span className="text-[10px] opacity-50 italic">{t("paymentSuccess.defaults.previewIcons")}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-30 border border-current px-1.5 py-0.5 rounded">
                                            {t("paymentSuccess.defaults.adLabel")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
