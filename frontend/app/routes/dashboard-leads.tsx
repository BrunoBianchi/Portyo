import { useState } from "react";
import type { Route } from "../+types/root";
import { Download, Search, Trash2, Mail, User, Calendar, CheckSquare, Square, X } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Leads | Portyo" },
    { name: "description", content: "Manage your email leads" },
  ];
}

// Mock data for leads
const MOCK_LEADS = [
  { id: 1, email: "alice@example.com", name: "Alice Johnson", date: "2023-10-25", status: "Active" },
  { id: 2, email: "bob@company.com", name: "Bob Smith", date: "2023-10-24", status: "Active" },
  { id: 3, email: "charlie@domain.net", name: "Charlie Brown", date: "2023-10-23", status: "Unsubscribed" },
  { id: 4, email: "david@service.org", name: "David Wilson", date: "2023-10-22", status: "Active" },
  { id: 5, email: "eve@platform.io", name: "Eve Davis", date: "2023-10-21", status: "Active" },
];

export default function DashboardLeads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);

  const filteredLeads = leads.filter(
    (lead) =>
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      setLeads(leads.filter((lead) => lead.id !== id));
      setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
      setLeads(leads.filter((lead) => !selectedLeads.includes(lead.id)));
      setSelectedLeads([]);
    }
  };

  const handleExport = () => {
    alert("Exporting leads to CSV...");
  };

  const handleBulkExport = () => {
    alert(`Exporting ${selectedLeads.length} selected leads to CSV...`);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((lead) => lead.id));
    }
  };

  const toggleSelectLead = (id: number) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Leads</h1>
          <p className="text-gray-500 mt-1">Manage and view your captured email subscribers.</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
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
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="text-sm text-gray-500 ml-auto">
          Showing <span className="font-bold text-gray-900">{filteredLeads.length}</span> leads
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden relative">
        {/* Bulk Actions Bar */}
        {selectedLeads.length > 0 && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-primary text-primary-foreground p-2 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3 px-4">
              <span className="font-semibold text-sm">{selectedLeads.length} selected</span>
              <div className="h-4 w-px bg-primary-foreground/20"></div>
              <button 
                onClick={() => setSelectedLeads([])}
                className="text-xs hover:underline opacity-80 hover:opacity-100"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2 pr-2">
              <button
                onClick={handleBulkExport}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={handleBulkDelete}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5 text-red-100 hover:text-red-50 hover:bg-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 w-12">
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
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Name
                  </div>
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </div>
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Date
                  </div>
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => {
                  const isSelected = selectedLeads.includes(lead.id);
                  return (
                    <tr 
                      key={lead.id} 
                      className={`group transition-colors ${isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-gray-50/50'}`}
                    >
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => toggleSelectLead(lead.id)}
                          className="flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{lead.name}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-600">{lead.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-500">{lead.date}</div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <p>No leads found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
