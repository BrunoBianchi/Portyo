import React from "react";

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, className = "" }) => {
    return (
        <div className={className}>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                {label}
            </label>
            <div className="flex items-center h-11 w-full rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 hover:border-gray-300">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-full w-12 border-0 p-0 cursor-pointer hover:opacity-90 transition-opacity"
                    title="Click to pick a color"
                />
                <div className="w-[1px] h-full bg-gray-100"></div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 w-full h-full px-3 text-xs font-mono uppercase text-gray-700 border-0 focus:ring-0 outline-none bg-transparent"
                    placeholder="#000000"
                    maxLength={7}
                />
            </div>
        </div>
    );
};
