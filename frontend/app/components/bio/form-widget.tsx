
import React, { useState, useEffect } from "react";
import { api } from "~/services/api";

interface FormField {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
}

interface FormWidgetProps {
    formId: string;
    bioId: string;
    backgroundColor?: string;
    textColor?: string;
}

export const FormWidget: React.FC<FormWidgetProps> = ({ formId, bioId, backgroundColor = "#ffffff", textColor = "#1f2937" }) => {
    const [form, setForm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState<Record<string, any>>({});

    // Convert options string array to { label: string, value: string }[] for select
    const getOptions = (optionsArr?: any[]) => {
        if (!optionsArr) return [];
        return optionsArr.map(opt => {
            if (typeof opt === 'string') return { label: opt, value: opt };
            return opt;
        });
    };

    useEffect(() => {
        if (!formId) return;
        setLoading(true);
        // Use public endpoint if available, otherwise reuse the authenticated one but this component is for public view
        // Ideally we should have a public endpoint for fetching form definition or embed it in the page load
        // For now, let's assume we can fetch it via a public route we'll create or just use the existing one if auth is not required for GET /forms/:id (it is required)
        // Wait, the plan said "Fetch form definition from /api/public/form/:id". I need to create that route probably or make the existing one public?
        // Actually, for now let's query the specific form.

        // TODO: Create public endpoint for form definition or ensure this works publicly
        // Assuming we will rely on a new public endpoint as planned:
        api.get(`/public/forms/${formId}`)
            .then(res => setForm(res.data))
            .catch(err => {
                console.error("Failed to load form", err);
                setError("Failed to load form.");
            })
            .finally(() => setLoading(false));
    }, [formId]);

    const handleChange = (fieldId: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const toggleMultiChoice = (fieldId: string, option: string) => {
        setFormData(prev => {
            const current = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
            if (current.includes(option)) {
                return { ...prev, [fieldId]: current.filter((item: string) => item !== option) };
            }
            return { ...prev, [fieldId]: [...current, option] };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const requiredMultiChoiceMissing = (form.fields || []).some((field: FormField) => {
            if (field.type !== 'multichoice' || !field.required) return false;
            const value = formData[field.id];
            return !Array.isArray(value) || value.length === 0;
        });

        if (requiredMultiChoiceMissing) {
            setError("Please select at least one option for required fields.");
            setSubmitting(false);
            return;
        }

        try {
            await api.post(`/public/forms/${formId}/submit`, {
                answers: formData
            });
            setSuccess(true);
            setFormData({});
        } catch (err: any) {
            console.error("Form submission failed", err);
            setError(err.response?.data?.message || "Failed to submit form. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor }}>
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!form) {
        return null;
    }

    if (success) {
        return (
            <div className="p-8 rounded-2xl text-center" style={{ backgroundColor, color: textColor }}>
                <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">{form.successMessage || "Thank you!"}</h3>
                <p className="opacity-80">Your submission has been received.</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 text-sm font-semibold underline opacity-70 hover:opacity-100"
                >
                    Submit another response
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl shadow-sm border border-black/5" style={{ backgroundColor, color: textColor }}>
            <h3 className="text-xl font-bold mb-2">{form.title}</h3>
            {form.description && <p className="mb-6 opacity-80 whitespace-pre-wrap text-sm">{form.description}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {form.fields && form.fields.map((field: FormField) => (
                    <div key={field.id} className="space-y-1.5">
                        <label className="block text-sm font-semibold opacity-90 mb-1.5 ml-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'text' && (
                            <input
                                type="text"
                                required={field.required}
                                placeholder={field.placeholder}
                                value={formData[field.id] || ''}
                                onChange={e => handleChange(field.id, e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted hover:bg-surface-card focus:bg-surface-card focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-200 placeholder:text-muted-foreground text-foreground"
                            />
                        )}

                        {field.type === 'textarea' && (
                            <textarea
                                required={field.required}
                                placeholder={field.placeholder}
                                value={formData[field.id] || ''}
                                onChange={e => handleChange(field.id, e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted hover:bg-surface-card focus:bg-surface-card focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-200 placeholder:text-muted-foreground text-foreground resize-y"
                            />
                        )}

                        {field.type === 'email' && (
                            <input
                                type="email"
                                required={field.required}
                                placeholder={field.placeholder}
                                value={formData[field.id] || ''}
                                onChange={e => handleChange(field.id, e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted hover:bg-surface-card focus:bg-surface-card focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-200 placeholder:text-muted-foreground text-foreground"
                            />
                        )}

                        {field.type === 'number' && (
                            <input
                                type="number"
                                required={field.required}
                                placeholder={field.placeholder}
                                value={formData[field.id] || ''}
                                onChange={e => handleChange(field.id, e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted hover:bg-surface-card focus:bg-surface-card focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-200 placeholder:text-muted-foreground text-foreground"
                            />
                        )}

                        {field.type === 'select' && (
                            <div className="relative">
                                <select
                                    required={field.required}
                                    value={formData[field.id] || ''}
                                    onChange={e => handleChange(field.id, e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-muted hover:bg-surface-card focus:bg-surface-card focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-200 text-foreground appearance-none"
                                >
                                    <option value="" disabled>Select an option</option>
                                    {getOptions(field.options).map((opt: any, i: number) => (
                                        <option key={i} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        )}

                        {(field.type === 'tel' || field.type === 'phone' || field.type === 'whatsapp') && (
                            <input
                                type="tel"
                                required={field.required}
                                placeholder={field.placeholder}
                                value={formData[field.id] || ''}
                                onChange={e => handleChange(field.id, e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted hover:bg-surface-card focus:bg-surface-card focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-200 placeholder:text-muted-foreground text-foreground"
                            />
                        )}

                        {field.type === 'checkbox' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    required={field.required}
                                    checked={!!formData[field.id]}
                                    onChange={e => handleChange(field.id, e.target.checked)}
                                    className="w-5 h-5 rounded-md border-gray-300 text-black focus:ring-black focus:ring-offset-2 transition-all cursor-pointer"
                                />
                                <span className="text-sm opacity-70">Tick to confirm</span>
                            </div>
                        )}

                        {field.type === 'multichoice' && (
                            <div className="space-y-2">
                                {getOptions(field.options).map((opt: any, i: number) => (
                                    <label key={i} className="flex items-center gap-2 text-sm opacity-80 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(formData[field.id]) && formData[field.id].includes(opt.value)}
                                            onChange={() => toggleMultiChoice(field.id, opt.value)}
                                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black focus:ring-offset-2 transition-all cursor-pointer"
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Add more field types as needed */}
                    </div>
                ))}

                {error && (
                    <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-xl border border-border">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-black hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 mt-6 shadow-lg hover:shadow-xl"
                    style={{
                        backgroundColor: textColor === '#ffffff' ? '#ffffff' : '#111827',
                        color: textColor === '#ffffff' ? '#111827' : '#ffffff'
                    }}
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Submitting...
                        </span>
                    ) : (
                        form.submitButtonText || "Submit"
                    )}
                </button>

                <a
                    href={`/form/${encodeURIComponent(formId)}`}
                    className="inline-flex items-center justify-center w-full text-sm font-semibold underline opacity-70 hover:opacity-100 mt-2"
                >
                    Abrir página do formulário
                </a>
            </form>
        </div>
    );
};
