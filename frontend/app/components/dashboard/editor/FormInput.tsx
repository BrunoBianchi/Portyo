import React from "react";

interface FormInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: "text" | "url" | "email";
    className?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    value,
    onChange,
    placeholder = "",
    type = "text",
    className = ""
}) => {
    return (
        <div className={className}>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-11 rounded-xl border border-border px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-muted focus:bg-surface-card"
                placeholder={placeholder}
            />
        </div>
    );
};

interface FormTextareaProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
    label,
    value,
    onChange,
    placeholder = "",
    rows = 3,
    className = ""
}) => {
    return (
        <div className={className}>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {label}
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-muted focus:bg-surface-card resize-none"
                placeholder={placeholder}
                rows={rows}
            />
        </div>
    );
};
