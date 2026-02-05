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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 font-['Manrope']">
            <div className="bg-white rounded-[32px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 md:p-8 border-b-2 border-black shrink-0 bg-white z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Billing History</h2>
                            <p className="text-sm text-gray-500 font-bold">All invoices and payments</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black text-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 md:p-8 flex-1 overflow-y-auto min-h-0 bg-[#F8F9FA] custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                            <Loader2 className="w-10 h-10 animate-spin mb-3 text-black" />
                            <p className="text-sm font-bold uppercase tracking-wide">Loading invoices...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-full border-2 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <Receipt className="w-8 h-8 opacity-50 text-black" />
                            </div>
                            <p className="font-bold text-gray-500">No billing history found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((bill) => (
                                <div key={bill.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-black shrink-0 ${bill.status === 'canceled'
                                            ? 'bg-red-100 text-red-600'
                                            : 'bg-[#C6F035] text-black'
                                            }`}>
                                            {bill.status === 'canceled' ? <X className="w-5 h-5 stroke-[3]" /> : <Check className="w-5 h-5 stroke-[3]" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-black text-[#1A1A1A] text-lg uppercase tracking-tight">
                                                    {new Date(bill.startDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </p>
                                                {bill.status === 'canceled' && (
                                                    <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded border border-black">Canceled</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide flex items-center gap-2">
                                                <span>{bill.plan} Plan</span>
                                                <span className="w-1 h-1 rounded-full bg-black/20"></span>
                                                <span>{bill.status === 'canceled' ? 'Terminated' : 'Paid'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0">
                                        <span className="font-black text-[#1A1A1A] text-xl">${Number(bill.price).toFixed(2)}</span>
                                        <button className="p-2 text-black bg-gray-50 hover:bg-black hover:text-white rounded-lg border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]" title="Download Invoice">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t-2 border-black bg-white flex items-center justify-between shrink-0 rounded-b-[30px]">
                    <button
                        disabled={page === 1 || loading}
                        onClick={() => loadHistory(page - 1)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-black text-black bg-white border-2 border-black rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] disabled:shadow-none disabled:translate-x-0 active:shadow-none active:translate-y-[2px]"
                    >
                        <ArrowLeft className="w-4 h-4" /> Previous
                    </button>

                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg border-2 border-black/10">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page >= totalPages || loading}
                        onClick={() => loadHistory(page + 1)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-black text-black bg-white border-2 border-black rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] disabled:shadow-none disabled:translate-x-0 active:shadow-none active:translate-y-[2px]"
                    >
                        Next <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
