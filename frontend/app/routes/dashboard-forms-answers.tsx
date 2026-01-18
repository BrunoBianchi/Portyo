
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Download, Search, FileText, Calendar, Clock, Monitor, Globe } from "lucide-react";
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
                    <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-8 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!form) return null;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        to="/dashboard/forms"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-1">
                            <span className="hover:text-gray-900 transition-colors">Forms</span>
                            <span className="text-gray-300">/</span>
                            <span className="hover:text-gray-900 transition-colors max-w-[150px] truncate">{form.title}</span>
                            <span className="text-gray-300">/</span>
                            <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded text-xs uppercase tracking-wider">{t("dashboard.formsAnswers.submissions")}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            {answers.length} <span className="text-lg md:text-xl font-medium text-gray-400 font-sans">{answers.length === 1 ? t("dashboard.formsAnswers.submission") : t("dashboard.formsAnswers.submissions")}</span>
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={t("dashboard.formsAnswers.searchPlaceholder")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm w-full sm:w-64 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={downloadCSV}
                            disabled={answers.length === 0}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            <span className="whitespace-nowrap">{t("dashboard.formsAnswers.exportCsv")}</span>
                        </button>
                        <Link
                            to={`/dashboard/forms/${id}`}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-900 text-white hover:bg-black hover:shadow-lg hover:shadow-gray-900/20 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                        >
                            <FileText className="w-4 h-4" />
                            <span className="whitespace-nowrap">{t("dashboard.formsAnswers.editForm")}</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            {answers.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t("dashboard.formsAnswers.emptyTitle")}</h3>
                    <p className="text-gray-500 max-w-sm">{t("dashboard.formsAnswers.emptySubtitle")}</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                    <th className="px-6 py-4 w-64 min-w-[200px]">{t("dashboard.formsAnswers.submissionInfo")}</th>
                                    {form.fields.map(field => (
                                        <th key={field.id} className="px-6 py-4 min-w-[200px]">
                                            {field.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAnswers.map((answer) => (
                                    <tr key={answer.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {new Date(answer.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(answer.createdAt).toLocaleTimeString()}
                                                </div>
                                                {answer.ipAddress && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 font-mono">
                                                        <Globe className="w-3 h-3" />
                                                        {answer.ipAddress}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        {form.fields.map(field => (
                                            <td key={field.id} className="px-6 py-4 text-sm text-gray-700 align-top">
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
