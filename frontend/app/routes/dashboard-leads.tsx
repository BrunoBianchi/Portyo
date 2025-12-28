import { useState, useEffect, useContext } from "react";
import type { Route } from "../+types/root";
import { Download, Search, Trash2, Mail, User, Calendar, CheckSquare, Square, X, Loader2 } from "lucide-react";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import { api } from "~/services/api";

export function meta({}: Route.MetaArgs) {
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
  const { bio } = useContext(BioContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

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

  const filteredLeads = leads.filter(
    (lead) =>
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      // TODO: Implement delete API
      setLeads(leads.filter((lead) => lead.id !== id));
      setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
      // TODO: Implement bulk delete API
      setLeads(leads.filter((lead) => !selectedLeads.includes(lead.id)));
      setSelectedLeads([]);
    }
  };

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

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((lead) => lead.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  return (
    <AuthorizationGuard minPlan="pro">
    <div className="p-6 max-w-7xl mx-auto w-full relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Leads</h1>
          <p className="text-gray-500 mt-1">Manage and view your captured email subscribers.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={leads.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="text-sm text-gray-500 ml-auto">
          {filteredLeads.length} leads found
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <span className="text-sm font-medium text-gray-700 border-r border-gray-200 pr-4">
            {selectedLeads.length} selected
          </span>
          <button 
            onClick={handleBulkExport}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={handleBulkDelete}
            className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button 
            onClick={() => setSelectedLeads([])}
            className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left w-12">
                  <button 
                    onClick={toggleSelectAll}
                    className="flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Subscribed</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                      <p>Loading leads...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-900">No leads found</p>
                      <p className="text-sm">
                        {searchTerm ? "Try adjusting your search terms" : "Share your bio link to start collecting emails"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleSelectLead(lead.id)}
                        className="flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {selectedLeads.includes(lead.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                          {lead.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{lead.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(lead.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </AuthorizationGuard>
  );
}
