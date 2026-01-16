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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-xl text-gray-600">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Billing History</h2>
                            <p className="text-sm text-gray-500">View all your invoices and payments</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto min-h-0">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p className="text-sm">Loading invoices...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Receipt className="w-8 h-8 opacity-50" />
                            </div>
                            <p>No billing history found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((bill) => (
                                <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${bill.status === 'canceled'
                                            ? 'bg-red-50 text-red-600 border-red-100'
                                            : 'bg-green-50 text-green-600 border-green-100'
                                            }`}>
                                            {bill.status === 'canceled' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold text-gray-900 text-sm">
                                                    {new Date(bill.startDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                                {bill.status === 'canceled' && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Canceled</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 capitalize">{bill.plan} Plan • {bill.status === 'canceled' ? 'Terminated' : 'Paid'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-900 text-sm">${Number(bill.price).toFixed(2)}</span>
                                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download Invoice">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                    <button
                        disabled={page === 1 || loading}
                        onClick={() => loadHistory(page - 1)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Previous
                    </button>

                    <span className="text-xs font-medium text-gray-500">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page >= totalPages || loading}
                        onClick={() => loadHistory(page + 1)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white rounded-lg transition-colors"
                    >
                        Next <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
