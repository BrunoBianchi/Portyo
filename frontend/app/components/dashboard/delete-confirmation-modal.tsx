
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isDeleting?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isDeleting = false
}: DeleteConfirmationModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            if (typeof document !== "undefined") {
                document.body.style.overflow = "hidden";
            }
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200);
            return () => clearTimeout(timer);
        }
        return () => {
            if (typeof document !== "undefined") {
                document.body.style.overflow = "";
            }
        };
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center ${isOpen ? "opacity-100" : "opacity-0"}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative bg-surface-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-0"}`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-6">
                        <Trash2 className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-8">
                        {description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 bg-surface-card border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        typeof document !== 'undefined' ? document.body : (globalThis as any)?.document?.body ?? null
    );
}
