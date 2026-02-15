import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { PlusIcon, XIcon, Pipette } from "lucide-react";

interface ColorPickerProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [savedPalette, setSavedPalette] = useState<string[]>([]);
    const [pickerColor, setPickerColor] = useState("#000000");
    const [coords, setCoords] = useState({ top: 0, left: 0, openUp: false, width: 272, maxHeight: 520 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const recent = JSON.parse(localStorage.getItem('portyo_recent_colors') || '[]');
            const palette = JSON.parse(localStorage.getItem('portyo_saved_palette') || '[]');
            setRecentColors(recent);
            setSavedPalette(palette);
        } catch (e) {
            console.error("Failed to load colors", e);
        }
    }, []);

    const isTransparentValue = (color: string) => {
        const normalized = (color || "").trim().toLowerCase();
        return normalized === "transparent" || normalized === "#00000000" || normalized === "rgba(0,0,0,0)" || normalized === "rgba(0, 0, 0, 0)";
    };

    const normalizeHex = (color: string) => {
        const raw = (color || "").trim();
        if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
        if (/^#[0-9a-f]{3}$/i.test(raw)) {
            const c = raw.slice(1);
            return `#${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`;
        }
        return null;
    };

    useEffect(() => {
        const normalizedHex = normalizeHex(value);
        if (normalizedHex) {
            setPickerColor(normalizedHex);
        }
    }, [value]);

    const handleColorSelect = (color: string) => {
        setPickerColor(color);
        onChange(color);
    };

    const handleTransparentSelect = () => {
        onChange("transparent");
        addToRecent("transparent");
    };

    const handleInteractionEnd = () => {
        addToRecent(value);
    };

    const addToRecent = (color: string) => {
        if (!color) return;
        setRecentColors(prev => {
            const filtered = prev.filter(c => c !== color);
            const next = [color, ...filtered].slice(0, 10);
            localStorage.setItem('portyo_recent_colors', JSON.stringify(next));
            return next;
        });
    };

    const addToPalette = () => {
        if (!value || savedPalette.includes(value)) return;
        setSavedPalette(prev => {
            const next = [...prev, value];
            localStorage.setItem('portyo_saved_palette', JSON.stringify(next));
            return next;
        });
    };

    const removeFromPalette = (colorToRemove: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedPalette(prev => {
            const next = prev.filter(c => c !== colorToRemove);
            localStorage.setItem('portyo_saved_palette', JSON.stringify(next));
            return next;
        });
    };

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const viewportW = window.innerWidth;
        const isMobile = viewportW < 640;
        const popupWidth = isMobile ? Math.min(viewportW - 16, 360) : 272;
        const popupHeight = 520;
        const maxHeight = Math.min(viewportH - 24, popupHeight);

        if (isMobile) {
            const left = Math.max(8, (viewportW - popupWidth) / 2);
            const top = Math.max(12, (viewportH - maxHeight) / 2);
            setCoords({ top, left, openUp: false, width: popupWidth, maxHeight });
            return;
        }

        const spaceBelow = viewportH - rect.bottom;
        const openUp = spaceBelow < popupHeight && rect.top > spaceBelow;

        let top = openUp ? rect.top - popupHeight - 8 : rect.bottom + 8;
        let left = rect.left;

        // Keep within viewport
        if (left + popupWidth > viewportW - 12) left = viewportW - popupWidth - 12;
        if (left < 12) left = 12;
        if (top < 12) top = 12;
        if (top + popupHeight > viewportH - 12) top = viewportH - popupHeight - 12;

        setCoords({ top, left, openUp, width: popupWidth, maxHeight });
    }, []);

    const togglePicker = () => {
        if (!isOpen) updatePosition();
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (!isOpen) return;
        const handle = () => requestAnimationFrame(updatePosition);
        window.addEventListener('scroll', handle, true);
        window.addEventListener('resize', handle);
        updatePosition();
        return () => {
            window.removeEventListener('scroll', handle, true);
            window.removeEventListener('resize', handle);
        };
    }, [isOpen, updatePosition]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current && !popupRef.current.contains(event.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Determine if color is light to pick contrasting check
    const isLightColor = (hex: string) => {
        try {
            if (isTransparentValue(hex)) return true;
            const c = hex.replace('#', '');
            if (c.length < 6) return true;
            const r = parseInt(c.substring(0, 2), 16);
            const g = parseInt(c.substring(2, 4), 16);
            const b = parseInt(c.substring(4, 6), 16);
            if ([r, g, b].some((v) => Number.isNaN(v))) return true;
            return (r * 299 + g * 587 + b * 114) / 1000 > 150;
        } catch { return true; }
    };

    const getSwatchStyle = (color: string): React.CSSProperties => {
        if (isTransparentValue(color)) {
            return {
                backgroundColor: "#ffffff",
                backgroundImage:
                    "linear-gradient(45deg, #d1d5db 25%, transparent 25%), linear-gradient(-45deg, #d1d5db 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d1d5db 75%), linear-gradient(-45deg, transparent 75%, #d1d5db 75%)",
                backgroundSize: "10px 10px",
                backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
            };
        }
        return { backgroundColor: color };
    };

    const selectedColorLabel = isTransparentValue(value)
        ? "TRANSPARENTE"
        : (value || "#000000").toUpperCase();

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="text-[10px] font-black uppercase tracking-wider mb-1.5 block text-black/40">
                    {label}
                </label>
            )}

            <div className="flex items-center h-10 w-full rounded-xl border-2 border-gray-200 bg-white overflow-hidden transition-all focus-within:border-black hover:border-gray-300">
                {/* Swatch trigger */}
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={togglePicker}
                    className="h-full w-11 border-r-2 border-gray-200 p-0 cursor-pointer transition-opacity flex items-center justify-center relative group shrink-0"
                    style={getSwatchStyle(value)}
                >
                    <Pipette className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-80 transition-opacity ${isLightColor(value) ? 'text-black/60' : 'text-white/80'}`} />
                </button>

                {/* Text input */}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => addToRecent(value)}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 w-full h-full px-3 text-xs font-mono uppercase text-gray-700 border-0 focus:ring-0 outline-none bg-transparent placeholder:text-gray-300"
                    placeholder="#000000"
                    maxLength={24}
                />
            </div>

            {/* Popup Portal */}
            {isOpen && typeof document !== 'undefined' && createPortal(
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />

                    <div
                        ref={popupRef}
                        className={`fixed z-[9999] bg-white rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)] p-0 overflow-y-auto overscroll-contain ${
                            coords.openUp
                                ? 'animate-in fade-in slide-in-from-bottom-2'
                                : 'animate-in fade-in slide-in-from-top-2'
                        } duration-200`}
                        style={{ top: coords.top, left: coords.left, width: coords.width, maxHeight: coords.maxHeight }}
                    >
                        {/* Header with current color preview */}
                        <div className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-2.5">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-xl border-2 border-gray-200 shadow-inner shrink-0"
                                    style={getSwatchStyle(value)}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-0.5">Cor selecionada</p>
                                    <p className="text-sm font-bold font-mono text-gray-800 uppercase truncate">{selectedColorLabel}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleTransparentSelect}
                                className={`w-full h-8 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors flex items-center justify-center gap-2 ${
                                    isTransparentValue(value)
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <span className="w-3.5 h-3.5 rounded border border-gray-300" style={getSwatchStyle("transparent")} />
                                Usar transparente
                            </button>
                        </div>

                        {/* Color picker */}
                        <div
                            className="px-4 pb-3"
                            onMouseUp={handleInteractionEnd}
                            onTouchEnd={handleInteractionEnd}
                        >
                            <HexColorPicker
                                color={pickerColor}
                                onChange={handleColorSelect}
                                style={{ width: '100%', height: coords.width < 320 ? '136px' : '152px' }}
                            />
                        </div>

                        {/* Recent Colors */}
                        {recentColors.length > 0 && (
                            <div className="px-4 pb-3">
                                <p className="text-[9px] font-black uppercase tracking-wider text-gray-300 mb-2">Recentes</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {recentColors.map((c, i) => (
                                        <button
                                            key={`${c}-${i}`}
                                            type="button"
                                            onClick={() => { handleColorSelect(c); addToRecent(c); }}
                                            className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                                                value === c ? 'border-black shadow-sm scale-110' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            style={getSwatchStyle(c)}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Saved Palette */}
                        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2 mt-2">
                                <p className="text-[9px] font-black uppercase tracking-wider text-gray-300">Minha paleta</p>
                                <button
                                    type="button"
                                    onClick={addToPalette}
                                    className="text-[10px] flex items-center gap-1 text-gray-500 hover:text-black font-bold hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
                                >
                                    <PlusIcon className="w-3 h-3" /> Salvar
                                </button>
                            </div>

                            {savedPalette.length === 0 ? (
                                <div className="text-center py-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <span className="text-[10px] text-gray-300 font-medium">Nenhuma cor salva</span>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {savedPalette.map((c, i) => (
                                        <button
                                            key={`${c}-${i}-p`}
                                            type="button"
                                            onClick={() => { handleColorSelect(c); addToRecent(c); }}
                                            className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 relative group ${
                                                value === c ? 'border-black shadow-sm scale-110' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            style={getSwatchStyle(c)}
                                            title={c}
                                        >
                                            <div
                                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                onClick={(e) => removeFromPalette(c, e)}
                                            >
                                                <XIcon className="w-2.5 h-2.5" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};
