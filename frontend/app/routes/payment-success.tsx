import type { MetaFunction } from "react-router";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { Loader2, CheckCircle, Upload, AlertCircle, Eye, ArrowRight, Sparkles, Image as ImageIcon, GripVertical, Plus, Trash2, Palette, Type, Minus, Tag, Share2, DollarSign, TrendingUp, Settings2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const meta: MetaFunction = () => {
    return [
        { title: "Setup Your Ad | Portyo" },
        { name: "description", content: "Customize your advertisement." },
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
            <div className="absolute left-0 top-1/2 -translate-y-1/2 p-2 cursor-grab text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity z-10" {...listeners}>
                <GripVertical className="w-5 h-5" />
            </div>
            <div className="pl-8 sm:pl-10">
                {props.children}
            </div>
        </div>
    );
}

export default function PaymentSuccess() {
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
            { id: '2', type: 'headline', content: 'Your Headline Here' },
            { id: '3', type: 'text', content: 'Short description of your offer...' },
            { id: '4', type: 'button', content: 'Learn More', props: { url: 'https://' } }
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
                setError("Invalid proposal ID or not accepted yet.");
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
            if (!res.ok) throw new Error("Failed to load proposal");
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
            if (!res.ok) throw new Error("Failed to send code");
            setEmailSent(true);
        } catch (err: any) {
            setError(err.message || "Could not send verification code");
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
                throw new Error(errData.error || "Verification failed");
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
            content: type === 'image' ? '' : type === 'button' ? 'Click Me' : type === 'headline' ? 'New Headline' : type === 'text' ? 'New Text' : type === 'badge' ? 'New' : type === 'price' ? '$19.99' : '',
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

            if (!res.ok) throw new Error("Failed to save");
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    if (!proposalId) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-neutral-900">Invalid Link</h1>
                    <p className="text-neutral-600 mt-2">No proposal ID found in the URL.</p>
                </div>
            </div>
        );
    }

    if (error === "Invalid proposal ID or not accepted yet.") {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-neutral-900">Invalid Proposal</h1>
                    <p className="text-neutral-600 mt-2">This proposal ID is invalid or not accepted yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-neutral-900">Setup Your Advertisement</h1>
                    <p className="mt-2 text-neutral-600">Drag and drop items to build your banner.</p>
                </div>

                {step === 'verification' && (
                    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
                        {/* Verification steps */}
                        {!emailSent ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-8 h-8 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
                                <p className="text-neutral-600 mb-6">
                                    To verify your identity and access the ad editor, we need to send a code to your email.
                                </p>
                                <button
                                    onClick={handleSendCode}
                                    disabled={loading}
                                    className="w-full py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Access Code"}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-xl font-semibold mb-4">Enter Verification Code</h2>
                                <p className="text-neutral-600 mb-8 text-sm">
                                    We sent a 6-digit code to your email. Enter it below to continue.
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
                                            className="w-12 h-14 border border-neutral-200 rounded-lg text-center text-xl font-semibold focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition-colors"
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center justify-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleVerifyCode}
                                    disabled={loading || otp.join("").length !== 6}
                                    className="w-full py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                                </button>

                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="mt-4 text-sm text-neutral-500 hover:text-neutral-900 underline"
                                >
                                    Resend Code
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
                            <div className="w-full lg:w-14 flex-shrink-0 flex lg:flex-col flex-row gap-2 lg:gap-2 lg:sticky lg:top-8 bg-white rounded-xl shadow-sm border border-neutral-100 p-2 lg:p-1.5 lg:py-3 items-center overflow-x-auto lg:overflow-visible">

                                {['headline', 'text', 'price', 'image', 'button', 'badge', 'social', 'divider', 'spacer'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => addBlock(type as any)}
                                        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition-colors border border-transparent hover:border-neutral-200 group relative"
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
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 space-y-6 min-w-0 w-full">
                                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-yellow-500" />
                                        Configure Your Ad
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
                                                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 transition-colors hover:border-neutral-300">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                                                                    {item.type === 'image' && <ImageIcon className="w-3 h-3" />}
                                                                    {item.type === 'headline' && <Type className="w-3 h-3" />}
                                                                    {item.type === 'text' && <Type className="w-3 h-3" />}
                                                                    {item.type === 'price' && <DollarSign className="w-3 h-3" />}
                                                                    {item.type === 'button' && <span className="w-3 h-3 bg-neutral-400 rounded-sm"></span>}
                                                                    {item.type === 'divider' && <Minus className="w-3 h-3" />}
                                                                    {item.type === 'badge' && <Tag className="w-3 h-3" />}
                                                                    {item.type === 'social' && <Share2 className="w-3 h-3" />}
                                                                    {item.type}
                                                                </span>
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => toggleExpand(item.id)}
                                                                        className={`p-1.5 rounded-md transition-colors ${expandedBlocks[item.id] ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'}`}
                                                                    >
                                                                        <Settings2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => removeBlock(item.id)} className="text-neutral-400 hover:text-red-500 p-1.5 rounded hover:bg-neutral-100 transition-colors">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {expandedBlocks[item.id] && (
                                                                <div className="mb-4 p-3 bg-white rounded-lg border border-neutral-200 space-y-3 shadow-sm transition-all duration-200">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[10px] font-bold uppercase text-neutral-400">Alignment</label>
                                                                        <div className="flex gap-1 bg-neutral-50 p-0.5 rounded-md border border-neutral-100">
                                                                            {['left', 'center', 'right'].map((align) => (
                                                                                <button
                                                                                    key={align}
                                                                                    onClick={() => updateBlockStyle(item.id, { alignment: align as any })}
                                                                                    className={`px-2 py-1 rounded text-[10px] capitalize transition-all ${(item.style?.alignment || creative.alignment) === align ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                                                                                >
                                                                                    {align}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {['headline', 'text', 'price', 'badge'].includes(item.type) && (
                                                                        <div className="flex items-center justify-between">
                                                                            <label className="text-[10px] font-bold uppercase text-neutral-400">Text Color</label>
                                                                            <input
                                                                                type="color"
                                                                                value={item.style?.color || creative.textColor}
                                                                                onChange={e => updateBlockStyle(item.id, { color: e.target.value })}
                                                                                className="w-8 h-6 rounded cursor-pointer border border-neutral-200 p-0.5"
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    {item.type === 'button' && (
                                                                        <>
                                                                            <div className="flex items-center justify-between">
                                                                                <label className="text-[10px] font-bold uppercase text-neutral-400">Button Color</label>
                                                                                <input
                                                                                    type="color"
                                                                                    value={item.props?.buttonColor || creative.buttonColor || '#000000'}
                                                                                    onChange={e => updateBlockProp(item.id, 'buttonColor', e.target.value)}
                                                                                    className="w-8 h-6 rounded cursor-pointer border border-neutral-200 p-0.5"
                                                                                />
                                                                            </div>
                                                                            <div className="flex items-center justify-between">
                                                                                <label className="text-[10px] font-bold uppercase text-neutral-400">Label Color</label>
                                                                                <input
                                                                                    type="color"
                                                                                    value={item.props?.buttonTextColor || creative.buttonTextColor || '#ffffff'}
                                                                                    onChange={e => updateBlockProp(item.id, 'buttonTextColor', e.target.value)}
                                                                                    className="w-8 h-6 rounded cursor-pointer border border-neutral-200 p-0.5"
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
                                                                        placeholder="Image URL (https://...)"
                                                                        className="w-full p-2 text-sm border border-neutral-200 rounded-lg bg-white placeholder:text-neutral-400"
                                                                    />
                                                                )}
                                                                {(item.type === 'headline' || item.type === 'text') && (
                                                                    <textarea
                                                                        value={item.content || ''}
                                                                        onChange={e => updateBlock(item.id, { content: e.target.value })}
                                                                        placeholder="Enter text..."
                                                                        rows={item.type === 'headline' ? 1 : 2}
                                                                        className="w-full p-2 text-sm border border-neutral-200 rounded-lg bg-white resize-none placeholder:text-neutral-400"
                                                                    />
                                                                )}
                                                                {item.type === 'price' && (
                                                                    <input
                                                                        type="text"
                                                                        value={item.content || ''}
                                                                        onChange={e => updateBlock(item.id, { content: e.target.value })}
                                                                        placeholder="Price (e.g. $19.99)"
                                                                        className="w-full p-2 text-sm border border-neutral-200 rounded-lg bg-white placeholder:text-neutral-400 font-mono"
                                                                    />
                                                                )}
                                                                {item.type === 'button' && (
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <input
                                                                            type="text"
                                                                            value={item.content || ''}
                                                                            onChange={e => updateBlock(item.id, { content: e.target.value })}
                                                                            placeholder="Label"
                                                                            className="w-full p-2 text-sm border border-neutral-200 rounded-lg bg-white placeholder:text-neutral-400"
                                                                        />
                                                                        <input
                                                                            type="url"
                                                                            value={item.props?.url || ''}
                                                                            onChange={e => updateBlockProp(item.id, 'url', e.target.value)}
                                                                            placeholder="URL"
                                                                            className="w-full p-2 text-sm border border-neutral-200 rounded-lg bg-white placeholder:text-neutral-400"
                                                                        />
                                                                    </div>
                                                                )}
                                                                {item.type === 'badge' && (
                                                                    <input
                                                                        type="text"
                                                                        value={item.content || ''}
                                                                        onChange={e => updateBlock(item.id, { content: e.target.value })}
                                                                        placeholder="Badge Text (e.g. NEW)"
                                                                        className="w-full p-2 text-sm border border-neutral-200 rounded-lg bg-white placeholder:text-neutral-400"
                                                                    />
                                                                )}
                                                                {item.type === 'social' && (
                                                                    <div className="space-y-2">
                                                                        <input
                                                                            type="url"
                                                                            value={item.props?.twitter || ''}
                                                                            onChange={e => updateBlockProp(item.id, 'twitter', e.target.value)}
                                                                            placeholder="X (Twitter) URL"
                                                                            className="w-full p-2 text-sm border border-neutral-200 rounded-lg bg-white placeholder:text-neutral-400"
                                                                        />
                                                                        <input
                                                                            type="url"
                                                                            value={item.props?.instagram || ''}
                                                                            onChange={e => updateBlockProp(item.id, 'instagram', e.target.value)}
                                                                            placeholder="Instagram URL"
                                                                            className="w-full p-2 text-sm border border-neutral-200 rounded-lg bg-white placeholder:text-neutral-400"
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
                                                <div className="bg-white p-4 rounded-xl shadow-xl border border-blue-500 opacity-90 cursor-grabbing">
                                                    Following item
                                                </div>
                                            ) : null}
                                        </DragOverlay>
                                    </DndContext>
                                </div>

                                {/* Card Design (Global Settings) */}
                                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-2">
                                        <Palette className="w-4 h-4" /> Card Design
                                    </h3>

                                    {/* Style Presets */}
                                    <div className="mb-6 p-4 bg-neutral-50 rounded-xl border border-neutral-100 overflow-x-auto">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> Quick Styles
                                        </label>
                                        <div className="flex gap-2 min-w-max">
                                            {[
                                                { name: 'Dark Pro', bg: '#000000', text: '#ffffff', btn: '#ffffff', btnText: '#000000' },
                                                { name: 'Minimal', bg: '#ffffff', text: '#000000', btn: '#000000', btnText: '#ffffff' },
                                                { name: 'Radiant', bg: 'linear-gradient(135deg, #6366f1, #a855f7)', text: '#ffffff', btn: '#ffffff', btnText: '#000000' },
                                                { name: 'Soft Gray', bg: '#f8fafc', text: '#1e293b', btn: '#1e293b', btnText: '#ffffff' }
                                            ].map((preset) => (
                                                <button
                                                    key={preset.name}
                                                    onClick={() => setCreative({
                                                        ...creative,
                                                        backgroundColor: preset.bg,
                                                        textColor: preset.text,
                                                        buttonColor: preset.btn,
                                                        buttonTextColor: preset.btnText
                                                    })}
                                                    className="flex items-center gap-2 p-2 rounded-lg bg-white border border-neutral-200 hover:border-neutral-900 transition-all group shrink-0"
                                                >
                                                    <div className="w-4 h-4 rounded-full border border-neutral-100" style={{ background: preset.bg }}></div>
                                                    <span className="text-xs font-semibold text-neutral-700 group-hover:text-neutral-900">{preset.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Color & Font */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Card Base</h4>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">Background Color</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={creative.backgroundColor === 'transparent' ? '#000000' : creative.backgroundColor}
                                                    onChange={e => setCreative({ ...creative, backgroundColor: e.target.value })}
                                                    className="w-10 h-10 rounded cursor-pointer border border-neutral-200 p-0.5"
                                                />
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => setCreative({ ...creative, backgroundColor: 'transparent' })}
                                                        className={`px-2 py-1 text-[10px] rounded ${creative.backgroundColor === 'transparent' ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600'}`}
                                                    >
                                                        Clear
                                                    </button>
                                                    <button
                                                        onClick={() => setCreative({ ...creative, backgroundColor: '#ffffff' })}
                                                        className={`px-2 py-1 text-[10px] rounded ${creative.backgroundColor === '#ffffff' ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600'}`}
                                                    >
                                                        White
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">Font Style</label>
                                            <select
                                                value={creative.fontFamily || 'Inter, sans-serif'}
                                                onChange={e => setCreative({ ...creative, fontFamily: e.target.value })}
                                                className="w-full p-2 text-sm border border-neutral-200 rounded-lg bg-white shadow-sm"
                                            >
                                                <option value="Inter, sans-serif">Modern (Inter)</option>
                                                <option value="'Playfair Display', serif">Elegant (Playfair)</option>
                                                <option value="'Montserrat', sans-serif">Bold (Montserrat)</option>
                                                <option value="'Outfit', sans-serif">Clean (Outfit)</option>
                                                <option value="monospace">Technical (Monospace)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Borders & Shape */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Borders & Shape</h4>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-medium text-neutral-500 mb-1">Color</label>
                                                <input
                                                    type="color"
                                                    value={creative.borderColor || '#e5e7eb'}
                                                    onChange={e => setCreative({ ...creative, borderColor: e.target.value })}
                                                    className="w-full h-8 rounded cursor-pointer border border-neutral-200 p-0.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-neutral-500 mb-1">Width: {creative.borderWidth || 0}px</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    value={creative.borderWidth || 0}
                                                    onChange={e => setCreative({ ...creative, borderWidth: parseInt(e.target.value) })}
                                                    className="w-full h-8 accent-neutral-900"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-medium text-neutral-500 mb-1">Radius: {creative.borderRadius || 24}px</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="48"
                                                value={creative.borderRadius || 24}
                                                onChange={e => setCreative({ ...creative, borderRadius: parseInt(e.target.value) })}
                                                className="w-full accent-neutral-900"
                                            />
                                        </div>
                                    </div>

                                    {/* Spacing & Anim */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Layout & Interaction</h4>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-medium text-neutral-500 mb-1">Padding</label>
                                                <input
                                                    type="number"
                                                    value={creative.padding || 24}
                                                    onChange={e => setCreative({ ...creative, padding: parseInt(e.target.value) })}
                                                    className="w-full p-1.5 text-xs border border-neutral-200 rounded-lg bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-neutral-500 mb-1">Gap</label>
                                                <input
                                                    type="number"
                                                    value={creative.gap || 16}
                                                    onChange={e => setCreative({ ...creative, gap: parseInt(e.target.value) })}
                                                    className="w-full p-1.5 text-xs border border-neutral-200 rounded-lg bg-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-medium text-neutral-500 mb-1">Hover Animation</label>
                                            <div className="flex gap-1">
                                                {['none', 'pulse', 'bounce'].map((anim) => (
                                                    <button
                                                        key={anim}
                                                        onClick={() => setCreative({ ...creative, animation: anim as any })}
                                                        className={`flex-1 py-1 rounded text-[10px] capitalize transition-colors border ${creative.animation === anim ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'}`}
                                                    >
                                                        {anim}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className={`text-sm font-medium transition-opacity ${saveSuccess ? 'text-emerald-600 opacity-100' : 'text-neutral-400 opacity-0'}`} aria-live="polite">
                                            ✓ Saved
                                        </div>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className={`w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${saveSuccess ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500' : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 focus-visible:ring-neutral-800'} disabled:opacity-60`}
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? "Saved" : "Save Changes"}
                                        </button>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
    
                            <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-4 w-full">

                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-neutral-500" />
                                    Live Preview
                                </h2>
                                    <div className={`text-xs font-semibold px-2 py-1 rounded-full border ${isCardOversize ? 'border-red-200 text-red-600 bg-red-50' : 'border-emerald-200 text-emerald-700 bg-emerald-50'}`}>
                                        {displayCardSize.width}×{displayCardSize.height}px
                                    </div>
                            </div>

                            <div className="border border-dashed border-neutral-200 rounded-xl p-6 sm:p-8 bg-neutral-100/50 flex items-center justify-center min-h-[360px] sm:min-h-[500px] overflow-hidden">
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
                                                                {item.content || "Heading"}
                                                            </h3>
                                                        )}

                                                        {item.type === 'price' && (
                                                            <div
                                                                className="text-4xl font-black tracking-tighter my-2 py-2 px-4 rounded-xl inline-block"
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
                                                                {item.content || "Text block content..."}
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
                                                                {item.content || "Button"}
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
                                                                {item.content || "NEW"}
                                                            </span>
                                                        )}

                                                        {item.type === 'social' && (
                                                            <div className={`flex gap-3 mt-2 ${itemAlign === 'left' ? 'justify-start' : itemAlign === 'right' ? 'justify-end' : 'justify-center'}`} style={{ color: itemColor }}>
                                                                {item.props?.twitter && <Share2 className="w-5 h-5 opacity-60" />}
                                                                {item.props?.instagram && <Tag className="w-5 h-5 opacity-60" />}
                                                                {(!item.props?.twitter && !item.props?.instagram) && <span className="text-[10px] opacity-50 italic">Preview icons</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-30 border border-current px-1.5 py-0.5 rounded">
                                            Ad
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
