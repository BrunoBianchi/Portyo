import { useState, useEffect, useContext, useMemo } from "react";
import type { Route } from "../+types/root";
import { Download, Search, Trash2, Mail, Calendar, CheckSquare, Square, X, Loader2, Sparkles } from "lucide-react";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import { api } from "~/services/api";
import { DeleteConfirmationModal } from "~/components/dashboard/delete-confirmation-modal";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";

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
  const { t } = useTranslation("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
  const isMobile = useIsMobile();
  const { startTour } = useDriverTour({ primaryColor: tourPrimaryColor, storageKey: "portyo:leads-tour-done" });

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isMobile) return;

    const hasSeenTour = window.localStorage.getItem("portyo:leads-tour-done");
    if (!hasSeenTour) {
      setTourRun(true);
    }

    const rootStyles = getComputedStyle(document.documentElement);
    const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
    if (primaryFromTheme) {
      setTourPrimaryColor(primaryFromTheme);
    }
  }, [isMobile]);

  const leadsTourSteps: Step[] = [
    {
      target: "[data-tour=\"leads-header\"]",
      content: t("dashboard.tours.leads.steps.header"),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: "[data-tour=\"leads-toggle\"]",
      content: t("dashboard.tours.leads.steps.toggle"),
      placement: "bottom",
    },
    {
      target: "[data-tour=\"leads-export\"]",
      content: t("dashboard.tours.leads.steps.export"),
      placement: "bottom",
    },
    {
      target: "[data-tour=\"leads-stats\"]",
      content: t("dashboard.tours.leads.steps.stats"),
      placement: "bottom",
    },
    {
      target: "[data-tour=\"leads-search\"]",
      content: t("dashboard.tours.leads.steps.search"),
      placement: "bottom",
    },
    {
      target: "[data-tour=\"leads-table\"]",
      content: t("dashboard.tours.leads.steps.table"),
      placement: "top",
    },
    {
      target: "[data-tour=\"leads-bulk-actions\"]",
      content: t("dashboard.tours.leads.steps.bulk"),
      placement: "top",
    },
  ];

  const handleLeadsTourCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type as any)) {
      const delta = action === ACTIONS.PREV ? -1 : 1;
      setTourStepIndex(index + delta);
      return;
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setTourRun(false);
      setTourStepIndex(0);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("portyo:leads-tour-done", "true");
      }
    }
  };

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
    <AuthorizationGuard minPlan="standard" fallback={
      <div className="p-6 max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-[#C6F035] rounded-full flex items-center justify-center mb-6 mx-auto border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Sparkles className="w-10 h-10 text-black" />
        </div>
        <h1 className="text-3xl font-black text-[#1A1A1A] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.leads.locked.title", "Leads are Locked")}</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto text-base font-medium">{t("dashboard.leads.locked.subtitle", "Upgrade to standard to collect and view leads.")}</p>
        <button className="px-8 py-3 bg-[#C6F035] text-black rounded-[14px] font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          {t("dashboard.leads.locked.cta", "Upgrade Now")}
        </button>
      </div>
    }>
      <div className="min-h-screen p-4 md:p-8">

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-tour="leads-header">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.leads.title")}</h1>
              <p className="text-gray-600 mt-2 text-lg font-medium">{t("dashboard.leads.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                data-tour="leads-toggle"
                onClick={() => {
                  if (bio) {
                    updateBio(bio.id, { enableSubscribeButton: !bio.enableSubscribeButton });
                  }
                }}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] ${bio?.enableSubscribeButton
                  ? 'bg-[#022C22] text-[#C6F035]'
                  : 'bg-white text-gray-500'
                  }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${bio?.enableSubscribeButton ? 'bg-[#C6F035]' : 'bg-gray-400'}`} />
                {bio?.enableSubscribeButton ? t("dashboard.leads.acceptingLeads") : t("dashboard.leads.leadsDisabled")}
              </button>
              <button
                data-tour="leads-export"
                onClick={handleExport}
                disabled={leads.length === 0}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 disabled:shadow-none disabled:transform-none"
              >
                <Download className="w-4 h-4" />
                {t("dashboard.leads.exportCsv")}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-tour="leads-stats">
            <div className="bg-white p-6 rounded-[24px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#E0EAFF] text-blue-600 rounded-xl border-2 border-black">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase px-3 py-1.5 bg-[#C6F035] text-black rounded-lg border-2 border-black">
                  {t("dashboard.leads.active")}
                </span>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide">{t("dashboard.leads.totalSubscribers")}</h3>
                <p className="text-4xl font-black text-[#1A1A1A] mt-1">{totalLeads}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#fce7f3] text-pink-600 rounded-xl border-2 border-black">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase px-3 py-1.5 bg-black text-white rounded-lg border-2 border-black">
                  {t("dashboard.leads.today")}
                </span>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide">{t("dashboard.leads.newSubscribers")}</h3>
                <p className="text-4xl font-black text-[#1A1A1A] mt-1">+{newLeadsToday}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#ffedd5] text-orange-600 rounded-xl border-2 border-black">
                  <CheckSquare className="w-6 h-6" />
                </div>
                {/* Placeholder for future growth stat */}
                <span className="text-xs font-black uppercase px-3 py-1.5 bg-[#F3F3F1] text-gray-500 rounded-lg border-2 border-black">
                  {t("dashboard.leads.avg")}
                </span>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide">{t("dashboard.leads.conversionRate")}</h3>
                <p className="text-4xl font-black text-[#1A1A1A] mt-1">{conversionRate}</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative" data-tour="leads-search">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("dashboard.leads.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border-2 border-black rounded-[20px] text-lg font-medium text-[#1A1A1A] focus:outline-none focus:ring-4 focus:ring-black/10 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-400"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-bold bg-[#F3F3F1] px-3 py-1 rounded-lg border-2 border-black/10">
              {t("dashboard.leads.results", { count: filteredLeads.length })}
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white border-4 border-black rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden" data-tour="leads-table">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F3F3F1] border-b-4 border-black">
                    <th className="px-8 py-6 text-left w-20">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                      >
                        {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? (
                          <div className="w-6 h-6 bg-[#C6F035] border-2 border-black rounded flex items-center justify-center text-black">
                            <CheckSquare className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-white border-2 border-black rounded shadow-sm"></div>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-6 text-left text-xs font-black text-gray-500 uppercase tracking-widest">{t("dashboard.leads.table.subscriber")}</th>
                    <th className="px-6 py-6 text-left text-xs font-black text-gray-500 uppercase tracking-widest">{t("dashboard.leads.table.status")}</th>
                    <th className="px-6 py-6 text-left text-xs font-black text-gray-500 uppercase tracking-widest">{t("dashboard.leads.table.joined")}</th>
                    <th className="px-8 py-6 text-right text-xs font-black text-gray-500 uppercase tracking-widest">{t("dashboard.leads.table.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <Loader2 className="w-10 h-10 animate-spin text-[#C6F035] stroke-black stroke-[3px]" />
                          <p className="font-bold text-gray-500 animate-pulse">{t("dashboard.leads.syncing")}</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-6">
                          <div className="w-20 h-20 rounded-full bg-[#F3F3F1] flex items-center justify-center border-2 border-black border-dashed">
                            <Mail className="w-10 h-10 text-gray-300" />
                          </div>
                          <div>
                            <p className="font-black text-[#1A1A1A] text-xl mb-2">{t("dashboard.leads.noSubscribers")}</p>
                            <p className="text-base text-gray-500 font-medium">
                              {searchTerm ? t("dashboard.leads.tryAdjustSearch") : t("dashboard.leads.shareBio")}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="group hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-8 py-5">
                          <button
                            onClick={() => toggleSelectLead(lead.id)}
                            className="flex items-center justify-center"
                          >
                            {selectedLeads.includes(lead.id) ? (
                              <div className="w-6 h-6 bg-[#C6F035] border-2 border-black rounded flex items-center justify-center text-black">
                                <CheckSquare className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded group-hover:border-black transition-colors"></div>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#E0EAFF] flex items-center justify-center text-blue-600 font-black text-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              {lead.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="block text-base font-bold text-[#1A1A1A]">{lead.email}</span>
                              <span className="block text-xs font-semibold text-gray-400">{t("dashboard.leads.subscriberLabel")}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-[#dcfce7] text-[#166534] border-2 border-[#166534]">
                            <span className="w-2 h-2 rounded-full bg-[#166534]"></span>
                            {t("dashboard.leads.active")}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                            {new Date(lead.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                              onClick={() => handleSendMessage(lead.email)}
                              className="p-2.5 text-gray-500 hover:text-black hover:bg-white border-2 border-transparent hover:border-black rounded-xl transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              title={t("dashboard.leads.sendEmail")}
                            >
                              <Mail className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(lead)}
                              className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-600 rounded-xl transition-all hover:shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]"
                              title={t("dashboard.leads.removeSubscriber")}
                            >
                              <Trash2 className="w-5 h-5" />
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
          <div
            data-tour="leads-bulk-actions"
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white shadow-[8px_8px_0px_0px_rgba(198,240,53,1)] rounded-[20px] px-3 py-2.5 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-6 fade-in duration-300 border-4 border-[#C6F035]"
          >
            <div className="pl-4 pr-4 py-2 border-r border-white/20 flex items-center gap-3">
              <span className="flex items-center justify-center bg-[#C6F035] text-black w-7 h-7 rounded-lg text-sm font-black border border-black">
                {selectedLeads.length}
              </span>
              <span className="text-base font-bold">{t("dashboard.leads.selected")}</span>
            </div>

            <button
              onClick={handleBulkSendMessage}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/20 transition-all"
              title={t("dashboard.leads.sendSelected")}
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">{t("dashboard.leads.message")}</span>
            </button>

            <button
              onClick={handleBulkExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t("dashboard.leads.export")}</span>
            </button>

            <button
              onClick={handleBulkDeleteClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#ff99ac] hover:text-[#ffcdd8] hover:bg-red-900/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t("dashboard.leads.delete")}</span>
            </button>

            <button
              onClick={() => setSelectedLeads([])}
              className="p-2.5 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </AuthorizationGuard>
  );
}
