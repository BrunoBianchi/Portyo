import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Download, Search, FileText, Calendar, Clock, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "~/contexts/auth.context";
import { useTranslation } from "react-i18next";
import { api } from "~/services/api";

interface FormAnswer {
    id: string;
    createdAt: string;
    answers: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

interface FormDefinition {
    id: string;
    title: string;
    fields: any[];
}

export default function DashboardFormsAnswers() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();

    const [answers, setAnswers] = useState<FormAnswer[]>([]);
    const [form, setForm] = useState<FormDefinition | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [formRes, answersRes] = await Promise.all([
                api.get(`/form/forms/${id}`),
                api.get(`/form/forms/${id}/answers`)
            ]);
            setForm(formRes.data);
            setAnswers(answersRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadCSV = () => {
        if (!form || !answers.length) return;

        // Headers
        const headers = [t("dashboard.formsAnswers.submittedAt"), t("dashboard.formsAnswers.ipAddress"), ...form.fields.map(f => f.label)];

        // Rows
        const rows = answers.map(answer => {
            const fieldValues = form.fields.map(f => {
                const val = answer.answers[f.id];
                const normalized = Array.isArray(val) ? val.join("; ") : val;
                return normalized ? `"${String(normalized).replace(/"/g, '""')}"` : "";
            });
            return [
                new Date(answer.createdAt).toLocaleString(),
                answer.ipAddress || t("dashboard.formsAnswers.unknown"),
                ...fieldValues
            ];
        });

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${form.title}_submissions.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredAnswers = answers.filter(a => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return Object.values(a.answers).some(val =>
            String(val).toLowerCase().includes(searchLower)
        );
    });

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
                <div className="bg-white rounded-[24px] border-4 border-black p-8 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!form) return null;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <Link
                        to="/dashboard/forms"
                        className="w-12 h-12 flex items-center justify-center rounded-[12px] bg-white border-2 border-black text-black hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0"
                    >
                        <ArrowLeft className="w-6 h-6 stroke-[3px]" />
                    </Link>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-gray-500 mb-1">
                            <span className="hover:text-black transition-colors">Forms</span>
                            <span className="text-gray-300">/</span>
                            <span className="hover:text-black transition-colors max-w-[150px] truncate text-black">{form.title}</span>
                            <span className="text-gray-300">/</span>
                            <span className="font-black text-black bg-[#C6F035] px-2 py-0.5 rounded border border-black text-xs uppercase tracking-wider">{t("dashboard.formsAnswers.submissions")}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
                            {answers.length} <span className="text-xl font-bold text-gray-400 font-sans">{answers.length === 1 ? t("dashboard.formsAnswers.submission") : t("dashboard.formsAnswers.submissions")}</span>
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-none h-[52px]">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={t("dashboard.formsAnswers.searchPlaceholder")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 h-full rounded-[14px] border-2 border-black bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 outline-none text-base font-bold w-full sm:w-72 transition-all placeholder:font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-3 h-[52px]">
                        <button
                            onClick={downloadCSV}
                            disabled={answers.length === 0}
                            className="flex-1 sm:flex-none h-full px-6 bg-white border-2 border-black text-black hover:bg-gray-50 rounded-[14px] font-black text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                        >
                            <Download className="w-5 h-5 stroke-[2.5px]" />
                            <span className="whitespace-nowrap hidden sm:inline">{t("dashboard.formsAnswers.exportCsv")}</span>
                        </button>
                        <Link
                            to={`/dashboard/forms/${id}`}
                            className="flex-1 sm:flex-none h-full px-6 bg-[#1A1A1A] text-white hover:bg-black rounded-[14px] font-black text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[1px] flex items-center justify-center gap-2 border-2 border-black"
                        >
                            <FileText className="w-5 h-5 stroke-[2.5px]" />
                            <span className="whitespace-nowrap">{t("dashboard.formsAnswers.editForm")}</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            {answers.length === 0 ? (
                <div className="bg-white rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-24 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-[#F3F3F1] rounded-full flex items-center justify-center border-4 border-black border-dashed mb-6">
                        <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.formsAnswers.emptyTitle")}</h3>
                    <p className="text-gray-500 font-medium max-w-sm">{t("dashboard.formsAnswers.emptySubtitle")}</p>
                </div>
            ) : (
                <div className="bg-white border-4 border-black rounded-[24px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-black text-xs uppercase tracking-widest text-gray-500 font-black">
                                    <th className="px-8 py-5 w-64 min-w-[200px]">{t("dashboard.formsAnswers.submissionInfo")}</th>
                                    {form.fields.map(field => (
                                        <th key={field.id} className="px-8 py-5 min-w-[200px]">
                                            {field.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-gray-100">
                                {filteredAnswers.map((answer) => (
                                    <tr key={answer.id} className="hover:bg-[#F3F3F1] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {new Date(answer.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(answer.createdAt).toLocaleTimeString()}
                                                </div>
                                                {answer.ipAddress && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 font-mono bg-gray-100 px-2 py-0.5 rounded-lg w-fit border border-gray-200">
                                                        <Globe className="w-3 h-3" />
                                                        {answer.ipAddress}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        {form.fields.map(field => (
                                            <td key={field.id} className="px-8 py-6 text-sm font-medium text-gray-700 align-top">
                                                <div className="max-h-32 overflow-y-auto custom-scrollbar">
                                                    {answer.answers[field.id] !== undefined ? (
                                                        Array.isArray(answer.answers[field.id])
                                                            ? answer.answers[field.id].join(", ")
                                                            : String(answer.answers[field.id])
                                                    ) : (
                                                        <span className="text-gray-300 italic">{t("dashboard.formsAnswers.emptyValue")}</span>
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
