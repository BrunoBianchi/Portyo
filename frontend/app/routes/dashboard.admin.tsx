import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import {
    Users,
    Shield,
    Crown,
    TrendingUp,
    Search,
    Ban,
    Check,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Trash2,
    Calendar,
    AlertTriangle,
    FileText,
    ExternalLink,
    Edit2,
    Save,
    X
} from "lucide-react";
import { api } from "~/services/api";
import AuthContext from "~/contexts/auth.context";

const ADMIN_EMAIL = 'bruno2002.raiado@gmail.com';

interface User {
    id: string;
    email: string;
    fullName: string;
    plan: string;
    planExpiresAt?: string;
    isBanned: boolean;
    verified: boolean;
    provider: string;
    createdAt: string;
    biosCount: number;
}

interface AdminBio {
    id: string;
    sufix: string;
    verified: boolean;
    seoTitle: string;
    views: number;
    createdAt: string;
    profileImage?: string;
    userId: string;
}

interface Stats {
    totalUsers: number;
    totalBios: number;
    planDistribution: {
        free: number;
        standard: number;
        pro: number;
    };
    bannedUsers: number;
    newUsersThisMonth: number;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    // Modal states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [planForm, setPlanForm] = useState({ plan: 'free', durationDays: 30 });
    const [actionLoading, setActionLoading] = useState(false);

    // Bios Modal states
    const [showBiosModal, setShowBiosModal] = useState(false);
    const [userBios, setUserBios] = useState<AdminBio[]>([]);
    const [loadingBios, setLoadingBios] = useState(false);
    const [editingBioId, setEditingBioId] = useState<string | null>(null);
    const [editSuffix, setEditSuffix] = useState("");

    // Check if current user is admin
    useEffect(() => {
        if (currentUser && currentUser.email !== ADMIN_EMAIL) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, search]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users', {
                params: { page: currentPage, limit: 15, search }
            });
            setUsers(res.data.users);
            setTotal(res.data.total);
            setPages(res.data.pages);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setCurrentPage(1);
    };

    const handleBan = async (user: User) => {
        try {
            setActionLoading(true);
            await api.post(`/admin/users/${user.id}/ban`, { isBanned: !user.isBanned });
            setUsers(users.map(u => u.id === user.id ? { ...u, isBanned: !u.isBanned } : u));
            fetchStats();
        } catch (error) {
            console.error("Failed to update ban status:", error);
            alert("Failed to update ban status");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSetPlan = async () => {
        if (!selectedUser) return;
        try {
            setActionLoading(true);
            const res = await api.post(`/admin/users/${selectedUser.id}/plan`, {
                plan: planForm.plan,
                durationDays: planForm.durationDays
            });
            setUsers(users.map(u => u.id === selectedUser.id ? {
                ...u,
                plan: res.data.user.plan,
                planExpiresAt: res.data.user.planExpiresAt
            } : u));
            setShowPlanModal(false);
            setSelectedUser(null);
            fetchStats();
        } catch (error) {
            console.error("Failed to set plan:", error);
            alert("Failed to set plan");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            setActionLoading(true);
            await api.delete(`/admin/users/${selectedUser.id}`);
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchStats();
        } catch (error) {
            console.error("Failed to delete user:", error);
            alert("Failed to delete user");
        } finally {
            setActionLoading(false);
        }
    };

    const handleViewBios = async (user: User) => {
        setSelectedUser(user);
        setShowBiosModal(true);
        setLoadingBios(true);
        try {
            const res = await api.get(`/admin/users/${user.id}/bios`);
            setUserBios(res.data);
        } catch (error) {
            console.error("Failed to fetch user bios:", error);
            alert("Failed to fetch user bios");
        } finally {
            setLoadingBios(false);
        }
    };

    const handleVerifyBio = async (bio: AdminBio) => {
        try {
            const newVerified = !bio.verified;
            // Optimistic update
            setUserBios(prev => prev.map(b => b.id === bio.id ? { ...b, verified: newVerified } : b));

            await api.put(`/admin/bios/${bio.id}`, { verified: newVerified });
        } catch (error) {
            console.error("Failed to update verify status:", error);
            alert("Failed to update verify status");
            // Revert
            setUserBios(prev => prev.map(b => b.id === bio.id ? { ...b, verified: bio.verified } : b));
        }
    };

    const handleDeleteBio = async (bioId: string) => {
        if (!confirm("Are you sure you want to delete this bio?")) return;
        try {
            setUserBios(prev => prev.filter(b => b.id !== bioId)); // Optimistic
            await api.delete(`/admin/bios/${bioId}`);
            setUsers(prev => prev.map(u => u.id === selectedUser?.id ? { ...u, biosCount: u.biosCount - 1 } : u));
        } catch (error) {
            console.error("Failed to delete bio:", error);
            alert("Failed to delete bio");
            // Fetch again to revert
            if (selectedUser) handleViewBios(selectedUser);
        }
    };

    const handleUpdateBioSuffix = async (bioId: string) => {
        if (!editSuffix.trim()) return;
        try {
            await api.put(`/admin/bios/${bioId}`, { sufix: editSuffix });
            setUserBios(prev => prev.map(b => b.id === bioId ? { ...b, sufix: editSuffix } : b));
            setEditingBioId(null);
            setEditSuffix("");
        } catch (error: any) {
            console.error("Failed to update suffix:", error);
            alert(error.response?.data?.error || "Failed to update suffix");
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'pro': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
            case 'standard': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
            default: return 'bg-white/10 text-white/70';
        }
    };

    if (currentUser?.email !== ADMIN_EMAIL) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-red-500 font-medium">Access Denied</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 font-['Manrope']">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF4F17] flex items-center justify-center text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Shield className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-black" style={{ fontFamily: 'var(--font-display)' }}>Admin Panel</h1>
                    <p className="text-gray-500 font-medium">Manage users and platform settings</p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 border-2 border-black flex items-center justify-center">
                                <Users className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Users</span>
                        </div>
                        <p className="text-3xl font-black text-black">{stats.totalUsers}</p>
                    </div>

                    <div className="bg-white rounded-2xl border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-[#C6F035] border-2 border-black flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">New This Month</span>
                        </div>
                        <p className="text-3xl font-black text-black">{stats.newUsersThisMonth}</p>
                    </div>

                    <div className="bg-white rounded-2xl border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 border-2 border-black flex items-center justify-center">
                                <Crown className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Pro Users</span>
                        </div>
                        <p className="text-3xl font-black text-black">{stats.planDistribution.pro}</p>
                    </div>

                    <div className="bg-white rounded-2xl border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 border-2 border-black flex items-center justify-center">
                                <Ban className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Banned</span>
                        </div>
                        <p className="text-3xl font-black text-black">{stats.bannedUsers}</p>
                    </div>
                </div>
            )}

            {/* Plan Distribution */}
            {stats && (
                <div className="bg-white rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-lg font-black text-black mb-4 uppercase" style={{ fontFamily: 'var(--font-display)' }}>Plan Distribution</h3>
                    <div className="flex gap-0 h-6 rounded-xl overflow-hidden border-2 border-black">
                        <div
                            className="bg-gray-100 transition-all border-r-2 border-black last:border-0"
                            style={{ width: `${(stats.planDistribution.free / stats.totalUsers) * 100}%` }}
                            title={`Free: ${stats.planDistribution.free}`}
                        />
                        <div
                            className="bg-blue-400 transition-all border-r-2 border-black last:border-0"
                            style={{ width: `${(stats.planDistribution.standard / stats.totalUsers) * 100}%` }}
                            title={`Standard: ${stats.planDistribution.standard}`}
                        />
                        <div
                            className="bg-[#C6F035] transition-all border-r-2 border-black last:border-0"
                            style={{ width: `${(stats.planDistribution.pro / stats.totalUsers) * 100}%` }}
                            title={`Pro: ${stats.planDistribution.pro}`}
                        />
                    </div>
                    <div className="flex gap-6 mt-4 text-sm font-bold">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-black bg-gray-100" />
                            <span className="text-gray-600">Free ({stats.planDistribution.free})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-black bg-blue-400" />
                            <span className="text-gray-600">Standard ({stats.planDistribution.standard})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-black bg-[#C6F035]" />
                            <span className="text-gray-600">Pro ({stats.planDistribution.pro})</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="p-4 border-b-2 border-black bg-gray-50">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by email or name..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none text-black font-medium transition-colors bg-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-[#C6F035] text-black rounded-xl font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wide"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-black animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white border-b-2 border-black">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">User</th>
                                    <th className="text-left px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Plan</th>
                                    <th className="text-left px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Bios</th>
                                    <th className="text-left px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Provider</th>
                                    <th className="text-left px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Joined</th>
                                    <th className="text-left px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="text-right px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-gray-100">
                                {users.map(user => (
                                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.isBanned ? 'bg-red-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-black">{user.fullName}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-lg border-2 border-black text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${user.plan === 'pro' ? 'bg-[#C6F035] text-black' :
                                                    user.plan === 'standard' ? 'bg-blue-200 text-black' :
                                                        'bg-white text-gray-500'
                                                }`}>
                                                {user.plan.toUpperCase()}
                                            </span>
                                            {user.planExpiresAt && (
                                                <p className="text-xs text-gray-400 mt-1 font-medium">
                                                    Expires: {formatDate(user.planExpiresAt)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleViewBios(user)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-gray-200 hover:border-black text-gray-600 hover:text-black font-bold transition-all text-sm bg-white"
                                            >
                                                <FileText className="w-4 h-4" />
                                                {user.biosCount} Bios
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 capitalize font-medium">{user.provider}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 text-sm font-medium">{formatDate(user.createdAt)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isBanned ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 border-2 border-red-200">
                                                    <Ban className="w-3 h-3" /> Banned
                                                </span>
                                            ) : user.verified ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 border-2 border-green-200">
                                                    <Check className="w-3 h-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-700 border-2 border-yellow-200">
                                                    Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setPlanForm({ plan: user.plan, durationDays: 30 }); setShowPlanModal(true); }}
                                                    className="p-2 rounded-lg border-2 border-transparent hover:border-black hover:bg-white text-gray-400 hover:text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                                    title="Set Plan"
                                                >
                                                    <Crown className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleBan(user)}
                                                    className={`p-2 rounded-lg border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${user.isBanned ? 'hover:bg-green-100 text-green-600' : 'hover:bg-red-100 text-red-600'}`}
                                                    title={user.isBanned ? "Unban" : "Ban"}
                                                >
                                                    {user.isBanned ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                                                    className="p-2 rounded-lg border-2 border-transparent hover:border-black hover:bg-red-50 text-gray-400 hover:text-red-600 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t-2 border-black bg-gray-50 flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-500">
                        Showing {users.length} of {total} users
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border-2 border-gray-300 hover:border-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-black"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-black px-3">
                            Page {currentPage} of {pages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
                            disabled={currentPage === pages}
                            className="p-2 rounded-lg border-2 border-gray-300 hover:border-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-black"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Plan Modal */}
            {showPlanModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6">
                        <h3 className="text-2xl font-black text-black mb-6 uppercase" style={{ fontFamily: 'var(--font-display)' }}>Set Plan</h3>

                        <div className="bg-gray-50 p-4 rounded-xl border-2 border-black mb-6">
                            <p className="font-bold text-black">{selectedUser.fullName}</p>
                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">Plan</label>
                                <select
                                    value={planForm.plan}
                                    onChange={(e) => setPlanForm({ ...planForm, plan: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-black focus:ring-4 focus:ring-black/10 outline-none font-medium appearance-none bg-white"
                                >
                                    <option value="free">Free</option>
                                    <option value="standard">Standard</option>
                                    <option value="pro">Pro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                                    Duration (days)
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0 for permanent"
                                        value={planForm.durationDays}
                                        onChange={(e) => setPlanForm({ ...planForm, durationDays: parseInt(e.target.value) || 0 })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-black focus:ring-4 focus:ring-black/10 outline-none font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => { setShowPlanModal(false); setSelectedUser(null); }}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-600 hover:border-black hover:text-black hover:bg-gray-50 transition-all uppercase text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSetPlan}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-3 rounded-xl bg-black text-white border-2 border-black font-bold uppercase text-sm hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#C6F035] transition-all disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-red-100 border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <AlertTriangle className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-black uppercase leading-tight" style={{ fontFamily: 'var(--font-display)' }}>Delete User</h3>
                                <p className="text-red-500 font-bold text-sm">Irreversible Action</p>
                            </div>
                        </div>

                        <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                            Are you sure you want to delete <strong className="text-black bg-gray-100 px-1 rounded">{selectedUser.fullName}</strong>?
                            <br />This will permanently verify remove all their data.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-600 hover:border-black hover:text-black hover:bg-gray-50 transition-all uppercase text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white border-2 border-black font-bold uppercase text-sm hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bios Modal */}
            {showBiosModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-3xl w-full p-6 max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#C6F035] border-2 border-black flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-black uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                                        User Bios
                                    </h3>
                                    <p className="text-sm font-bold text-gray-500">{selectedUser.fullName}</p>
                                </div>

                            </div>
                            <button
                                onClick={() => { setShowBiosModal(false); setSelectedUser(null); }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors border-2 border-transparent hover:border-black"
                            >
                                <X className="w-6 h-6 text-black" />
                            </button>
                        </div>

                        {loadingBios ? (
                            <div className="flex-1 flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-black animate-spin" />
                            </div>
                        ) : userBios.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-400">
                                <FileText className="w-16 h-16 mb-4 opacity-50" />
                                <p className="font-bold text-lg">No bios found</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                {userBios.map(bio => (
                                    <div key={bio.id} className="border-2 border-black rounded-xl p-4 flex items-center gap-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white group">
                                        <div className="w-14 h-14 bg-gray-100 rounded-lg border-2 border-black flex items-center justify-center flex-shrink-0 bg-cover bg-center overflow-hidden" style={bio.profileImage ? { backgroundImage: `url(${bio.profileImage})` } : {}}>
                                            {!bio.profileImage && <span className="text-xl font-black text-gray-400">{bio.sufix.charAt(0).toUpperCase()}</span>}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {editingBioId === bio.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded">portyo.me/</span>
                                                        <input
                                                            autoFocus
                                                            className="bg-white border-2 border-black rounded px-2 py-1 text-sm font-bold w-32 focus:outline-none"
                                                            value={editSuffix}
                                                            onChange={e => setEditSuffix(e.target.value)}
                                                            onKeyDown={e => e.key === 'Enter' && handleUpdateBioSuffix(bio.id)}
                                                        />
                                                        <button onClick={() => handleUpdateBioSuffix(bio.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                                                        <button onClick={() => setEditingBioId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 group/edit">
                                                        <a href={`https://portyo.me/p/${bio.sufix}`} target="_blank" rel="noreferrer" className="font-black text-black hover:text-[#C6F035] hover:underline flex items-center gap-1 text-lg">
                                                            {bio.sufix}
                                                            <ExternalLink className="w-3 h-3 text-gray-400" />
                                                        </a>
                                                        <button onClick={() => { setEditingBioId(bio.id); setEditSuffix(bio.sufix); }} className="opacity-0 group-hover/edit:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-black transition-all">
                                                            <Edit2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium truncate">{bio.seoTitle || "No title available"}</p>
                                            <div className="flex gap-4 mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {bio.views} views</span>
                                                <span>{formatDate(bio.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleVerifyBio(bio)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border-2 border-black ${bio.verified
                                                    ? 'bg-blue-100 text-blue-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                    : 'bg-white text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {bio.verified ? <Check className="w-3 h-3" /> : null}
                                                {bio.verified ? 'Verified' : 'Verify'}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteBio(bio.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-2 border-transparent hover:border-red-100"
                                                title="Delete Bio"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
