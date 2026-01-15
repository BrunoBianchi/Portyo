import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { PlusIcon, TrashIcon, XIcon, CheckIcon } from "lucide-react";

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
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    // Load from LS
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

    // Save to Recent on change (debounced or on selection)
    const handleColorSelect = (color: string) => {
        onChange(color);
        // Do NOT add to recent immediately while dragging
    };

    const handleInteractionEnd = () => {
        addToRecent(value);
    };

    const addToRecent = (color: string) => {
        if (!color) return;
        setRecentColors(prev => {
            const filtered = prev.filter(c => c !== color);
            const next = [color, ...filtered].slice(0, 10); // Limit 10
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

    // Handle toggle and positioning
    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const top = rect.bottom + 8; // rect.bottom is already viewport relative for fixed
            const left = rect.left; // rect.left is already viewport relative
            setCoords({ top, left });
        }
    };

    const togglePicker = () => {
        if (!isOpen) {
            updatePosition();
        }
        setIsOpen(!isOpen);
    };

    // Update position on scroll/resize to keep attached
    useEffect(() => {
        if (!isOpen) return;

        const handleScrollOrResize = () => {
            requestAnimationFrame(updatePosition);
        };

        window.addEventListener('scroll', handleScrollOrResize, true); // Capture is important for nested scrolls
        window.addEventListener('resize', handleScrollOrResize);

        // Initial update in case of layout shifts
        updatePosition();

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                    {label}
                </label>
            )}

            <div className="flex items-center h-11 w-full rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 hover:border-gray-300 relative">

                {/* Visual Swatch Trigger */}
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={togglePicker}
                    className="h-full w-12 border-r border-gray-100 p-0 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center relative group"
                    style={{ backgroundColor: value }}
                >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </button>

                {/* Text Input */}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                    }}
                    onBlur={() => addToRecent(value)}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 w-full h-full px-3 text-xs font-mono uppercase text-gray-700 border-0 focus:ring-0 outline-none bg-transparent"
                    placeholder="#000000"
                    maxLength={9}
                />
            </div>

            {/* Popup Portal */}
            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={popupRef}
                    className="fixed z-[9999] w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-left"
                    style={{
                        top: coords.top - window.scrollY, // Fixed position needs viewport relative coords
                        left: coords.left - window.scrollX
                    }}
                >

                    {/* Native Picker Wrapper */}
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Pick Custom Color</label>
                        <div
                            className="w-full"
                            onMouseUp={handleInteractionEnd}
                            onTouchEnd={handleInteractionEnd}
                        >
                            <HexColorPicker
                                color={value}
                                onChange={handleColorSelect}
                                style={{ width: '100%', height: '160px' }}
                            />
                        </div>
                    </div>

                    {/* Recent Colors */}
                    {recentColors.length > 0 && (
                        <div className="mb-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Recent</label>
                            <div className="grid grid-cols-5 gap-2">
                                {recentColors.map((c, i) => (
                                    <button
                                        key={`${c}-${i}`}
                                        onClick={() => handleColorSelect(c)}
                                        className="w-8 h-8 rounded-full border border-gray-100 shadow-sm hover:scale-110 transition-transform relative group"
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    >
                                        {value === c && <div className="absolute inset-0 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" /></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Saved Palette */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">My Palette</label>
                            <button onClick={addToPalette} className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full transition-colors">
                                <PlusIcon size={10} /> Add Current
                            </button>
                        </div>

                        {savedPalette.length === 0 ? (
                            <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <span className="text-[10px] text-gray-400">No saved colors</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-5 gap-2">
                                {savedPalette.map((c, i) => (
                                    <button
                                        key={`${c}-${i}-p`}
                                        onClick={() => handleColorSelect(c)}
                                        className="w-8 h-8 rounded-full border border-gray-100 shadow-sm hover:scale-110 transition-transform relative group"
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    >
                                        <div
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={(e) => removeFromPalette(c, e)}
                                        >
                                            <XIcon size={8} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                </div>,
                document.body
            )}
        </div>
    );
};
