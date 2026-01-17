import { useState, useEffect, useContext } from "react";
import type { Route } from "../+types/root";
import { Download, Search, Trash2, Mail, Calendar, CheckSquare, Square, X, Loader2 } from "lucide-react";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import { api } from "~/services/api";
import { DeleteConfirmationModal } from "~/components/dashboard/delete-confirmation-modal";
import { useTranslation } from "react-i18next";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Leads | Portyo" },
    { name: "description", content: "Manage your email leads" },
  ];
}

interface Lead {
  id: string;
  email: string;
  createdAt: string;
}

export default function DashboardLeads() {
  const { user } = useContext(AuthContext);
  const { bio, updateBio } = useContext(BioContext);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  /* State Updates */
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    mode: 'single' | 'bulk';
    email: string | null;
    id: string | null;
    count?: number;
  }>({
    isOpen: false,
    mode: 'single',
    email: null,
    id: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (bio?.id) {
      setLoading(true);
      api.get(`/email/${bio.id}`)
        .then((response) => {
          setLeads(response.data);
        })
        .catch((error) => {
          console.error("Failed to fetch leads:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [bio?.id]);

  /* Handlers */
  const filteredLeads = leads.filter(
    (lead) =>
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (lead: Lead) => {
    setDeleteModal({ isOpen: true, mode: 'single', email: lead.email, id: lead.id });
  };

  const handleBulkDeleteClick = () => {
    if (selectedLeads.length === 0) return;
    setDeleteModal({
      isOpen: true,
      mode: 'bulk',
      email: null,
      id: null,
      count: selectedLeads.length
    });
  };

  const handleConfirmDelete = async () => {
    if (!bio?.id) return;
    setIsDeleting(true);

    try {
      if (deleteModal.mode === 'single' && deleteModal.email) {
        await api.delete(`/email/${bio.id}`, { data: { email: deleteModal.email } });
        setLeads(prev => prev.filter(l => l.email !== deleteModal.email));
        setSelectedLeads(prev => prev.filter(id => id !== deleteModal.id));
      } else if (deleteModal.mode === 'bulk') {
        const leadsToDelete = leads.filter(l => selectedLeads.includes(l.id));
        const emails = leadsToDelete.map(l => l.email);

        await api.delete(`/email/${bio.id}/bulk`, { data: { emails } });

        setLeads(prev => prev.filter(l => !selectedLeads.includes(l.id)));
        setSelectedLeads([]);
      }
      setDeleteModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error("Failed to delete lead(s):", error);
      alert(t("dashboard.leads.deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  /* Export Handlers */
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Email,Date\n"
      + leads.map(e => `${e.email},${new Date(e.createdAt).toLocaleDateString()}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkExport = () => {
    const selected = leads.filter(l => selectedLeads.includes(l.id));
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Email,Date\n"
      + selected.map(e => `${e.email},${new Date(e.createdAt).toLocaleDateString()}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "selected_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* Derived Stats */
  const totalLeads = leads.length;
  const newLeadsToday = leads.filter(l => {
    const date = new Date(l.createdAt);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }).length;
  // Mocking conversion rate for now as we don't have page view data in this context yet
  const conversionRate = totalLeads > 0 ? "2.4%" : "0%";

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const handleSendMessage = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleBulkSendMessage = () => {
    const selected = leads.filter(l => selectedLeads.includes(l.id));
    const emails = selected.map(l => l.email).join(',');
    window.location.href = `mailto:?bcc=${emails}`;
  };

  /* ... Handlers ... */

  return (
    <AuthorizationGuard minPlan="standard">
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          <DeleteConfirmationModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
            onConfirm={handleConfirmDelete}
            title={deleteModal.mode === 'single'
              ? t("dashboard.leads.removeSubscriber")
              : t("dashboard.leads.removeSubscribers")}
            description={
              deleteModal.mode === 'single'
                ? t("dashboard.leads.removeSingleDesc", { email: deleteModal.email })
                : t("dashboard.leads.removeBulkDesc", { count: deleteModal.count ?? 0 })
            }
            isDeleting={isDeleting}
          />

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("dashboard.leads.title")}</h1>
              <p className="text-gray-500 mt-2 text-lg">{t("dashboard.leads.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (bio) {
                    updateBio(bio.id, { enableSubscribeButton: !bio.enableSubscribeButton });
                  }
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${bio?.enableSubscribeButton
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <div className={`w-2 h-2 rounded-full ${bio?.enableSubscribeButton ? 'bg-primary' : 'bg-gray-400'}`} />
                {bio?.enableSubscribeButton ? t("dashboard.leads.acceptingLeads") : t("dashboard.leads.leadsDisabled")}
              </button>
              <button
                onClick={handleExport}
                disabled={leads.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {t("dashboard.leads.exportCsv")}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full flex items-center gap-1">
                  {t("dashboard.leads.active")}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{t("dashboard.leads.totalSubscribers")}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalLeads}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                  {t("dashboard.leads.today")}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{t("dashboard.leads.newSubscribers")}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">+{newLeadsToday}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <CheckSquare className="w-5 h-5" />
                </div>
                {/* Placeholder for future growth stat */}
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {t("dashboard.leads.avg")}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{t("dashboard.leads.conversionRate")}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{conversionRate}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("dashboard.leads.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
              {t("dashboard.leads.results", { count: filteredLeads.length })}
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/40 border-b border-gray-100">
                    <th className="px-6 py-5 text-left w-16">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                      >
                        {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("dashboard.leads.table.subscriber")}</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("dashboard.leads.table.status")}</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("dashboard.leads.table.joined")}</th>
                    <th className="px-6 py-5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("dashboard.leads.table.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="font-medium animate-pulse">{t("dashboard.leads.syncing")}</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                            <Mail className="w-8 h-8 text-gray-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{t("dashboard.leads.noSubscribers")}</p>
                            <p className="text-sm mt-1">
                              {searchTerm ? t("dashboard.leads.tryAdjustSearch") : t("dashboard.leads.shareBio")}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleSelectLead(lead.id)}
                            className="flex items-center justify-center text-gray-300 hover:text-primary transition-colors"
                          >
                            {selectedLeads.includes(lead.id) ? (
                              <CheckSquare className="w-5 h-5 text-primary" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm shadow-sm">
                              {lead.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="block text-sm font-semibold text-gray-900">{lead.email}</span>
                              <span className="block text-xs text-gray-500">{t("dashboard.leads.subscriberLabel")}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            {t("dashboard.leads.active")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {new Date(lead.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                              onClick={() => handleSendMessage(lead.email)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title={t("dashboard.leads.sendEmail")}
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(lead)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t("dashboard.leads.removeSubscriber")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Floating Bulk Actions Bar */}
        {selectedLeads.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white shadow-2xl rounded-2xl px-2 py-2 flex items-center gap-2 z-50 animate-in slide-in-from-bottom-6 fade-in duration-300 border border-gray-800">
            <div className="pl-4 pr-3 py-2 border-r border-gray-700 flex items-center gap-2">
              <span className="flex items-center justify-center bg-white text-gray-900 w-5 h-5 rounded-full text-xs font-bold">
                {selectedLeads.length}
              </span>
              <span className="text-sm font-medium">{t("dashboard.leads.selected")}</span>
            </div>

            <button
              onClick={handleBulkSendMessage}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
              title={t("dashboard.leads.sendSelected")}
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">{t("dashboard.leads.message")}</span>
            </button>

            <button
              onClick={handleBulkExport}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t("dashboard.leads.export")}</span>
            </button>

            <button
              onClick={handleBulkDeleteClick}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t("dashboard.leads.delete")}</span>
            </button>

            <button
              onClick={() => setSelectedLeads([])}
              className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </AuthorizationGuard>
  );
}
