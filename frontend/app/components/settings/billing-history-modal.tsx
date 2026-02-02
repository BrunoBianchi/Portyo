import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, ArrowLeft, ArrowRight, Receipt, Loader2, Download } from "lucide-react";
import { BillingService } from "~/services/api";

interface BillingHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BillingHistoryModal({ isOpen, onClose }: BillingHistoryModalProps) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    useEffect(() => {
        if (isOpen) {
            loadHistory(1);
        }
    }, [isOpen]);

    const loadHistory = async (p: number) => {
        setLoading(true);
        try {
            // @ts-ignore
            const res = await BillingService.getHistory(p, LIMIT);
            // Handle both new paginated response { data: [], ... } and old array response []
            const historyData = res.data && Array.isArray(res.data.data)
                ? res.data.data
                : Array.isArray(res.data)
                    ? res.data
                    : [];

            setHistory(historyData);
            setTotalPages(res.data.totalPages || 1);
            setPage(p);
        } catch (err) {
            console.error("Failed to load billing history", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-xl text-muted-foreground">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Billing History</h2>
                            <p className="text-sm text-muted-foreground">View all your invoices and payments</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto min-h-0">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p className="text-sm">Loading invoices...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Receipt className="w-8 h-8 opacity-50" />
                            </div>
                            <p>No billing history found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((bill) => (
                                <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-border hover:bg-muted/50 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${bill.status === 'canceled'
                                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                                            : 'bg-green-500/10 text-green-400 border-green-500/20'
                                            }`}>
                                            {bill.status === 'canceled' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold text-foreground text-sm">
                                                    {new Date(bill.startDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                                {bill.status === 'canceled' && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">Canceled</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground capitalize">{bill.plan} Plan • {bill.status === 'canceled' ? 'Terminated' : 'Paid'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-foreground text-sm">${Number(bill.price).toFixed(2)}</span>
                                        <button className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors" title="Download Invoice">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-muted flex items-center justify-between shrink-0">
                    <button
                        disabled={page === 1 || loading}
                        onClick={() => loadHistory(page - 1)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-card rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Previous
                    </button>

                    <span className="text-xs font-medium text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page >= totalPages || loading}
                        onClick={() => loadHistory(page + 1)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-card rounded-lg transition-colors"
                    >
                        Next <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
