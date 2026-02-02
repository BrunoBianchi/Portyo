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
            default: return 'bg-muted text-muted-foreground';
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
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Admin Panel</h1>
                        <p className="text-muted-foreground text-sm">Manage users and platform settings</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-surface-card rounded-2xl border border-border p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm text-muted-foreground font-medium">Total Users</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                    </div>

                    <div className="bg-surface-card rounded-2xl border border-border p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-sm text-muted-foreground font-medium">New This Month</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{stats.newUsersThisMonth}</p>
                    </div>

                    <div className="bg-surface-card rounded-2xl border border-border p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <Crown className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm text-muted-foreground font-medium">Pro Users</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{stats.planDistribution.pro}</p>
                    </div>

                    <div className="bg-surface-card rounded-2xl border border-border p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                <Ban className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-sm text-muted-foreground font-medium">Banned</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{stats.bannedUsers}</p>
                    </div>
                </div>
            )}

            {/* Plan Distribution */}
            {stats && (
                <div className="bg-surface-card rounded-2xl border border-border p-5 shadow-sm mb-8">
                    <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-display)' }}>Plan Distribution</h3>
                    <div className="flex gap-2 h-4 rounded-full overflow-hidden bg-muted">
                        <div
                            className="bg-gray-400 transition-all"
                            style={{ width: `${(stats.planDistribution.free / stats.totalUsers) * 100}%` }}
                            title={`Free: ${stats.planDistribution.free}`}
                        />
                        <div
                            className="bg-blue-500 transition-all"
                            style={{ width: `${(stats.planDistribution.standard / stats.totalUsers) * 100}%` }}
                            title={`Standard: ${stats.planDistribution.standard}`}
                        />
                        <div
                            className="bg-purple-500 transition-all"
                            style={{ width: `${(stats.planDistribution.pro / stats.totalUsers) * 100}%` }}
                            title={`Pro: ${stats.planDistribution.pro}`}
                        />
                    </div>
                    <div className="flex gap-6 mt-3 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-gray-400" />
                            <span className="text-muted-foreground">Free ({stats.planDistribution.free})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-500" />
                            <span className="text-muted-foreground">Standard ({stats.planDistribution.standard})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-purple-500" />
                            <span className="text-muted-foreground">Pro ({stats.planDistribution.pro})</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="bg-surface-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by email or name..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Bios</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Provider</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Joined</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user.id} className={`hover:bg-muted ${user.isBanned ? 'bg-red-50/50' : ''}`}>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-medium text-foreground">{user.fullName}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${getPlanBadgeColor(user.plan)}`}>
                                                {user.plan.toUpperCase()}
                                            </span>
                                            {user.planExpiresAt && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Expires: {formatDate(user.planExpiresAt)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => handleViewBios(user)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-gray-200 text-muted-foreground font-medium transition-colors text-sm"
                                            >
                                                <FileText className="w-4 h-4" />
                                                {user.biosCount} Bios
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-muted-foreground capitalize">{user.provider}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-muted-foreground text-sm">{formatDate(user.createdAt)}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {user.isBanned ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700">
                                                    <Ban className="w-3 h-3" /> Banned
                                                </span>
                                            ) : user.verified ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700">
                                                    <Check className="w-3 h-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-700">
                                                    Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setPlanForm({ plan: user.plan, durationDays: 30 }); setShowPlanModal(true); }}
                                                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                                                    title="Set Plan"
                                                >
                                                    <Crown className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleBan(user)}
                                                    className={`p-2 rounded-lg transition-colors ${user.isBanned ? 'hover:bg-green-100 text-green-600' : 'hover:bg-red-100 text-red-600'}`}
                                                    title={user.isBanned ? "Unban" : "Ban"}
                                                >
                                                    {user.isBanned ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                                                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
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
                <div className="p-4 border-t border-border flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {users.length} of {total} users
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-muted-foreground px-3">
                            Page {currentPage} of {pages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
                            disabled={currentPage === pages}
                            className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Plan Modal */}
            {showPlanModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-display)' }}>Set Plan for {selectedUser.fullName}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Plan</label>
                                <select
                                    value={planForm.plan}
                                    onChange={(e) => setPlanForm({ ...planForm, plan: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                >
                                    <option value="free">Free</option>
                                    <option value="standard">Standard</option>
                                    <option value="pro">Pro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Duration (days) - 0 for permanent
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        min="0"
                                        value={planForm.durationDays}
                                        onChange={(e) => setPlanForm({ ...planForm, durationDays: parseInt(e.target.value) || 0 })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowPlanModal(false); setSelectedUser(null); }}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium text-muted-foreground hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSetPlan}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Delete User</h3>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete <strong>{selectedUser.fullName}</strong> ({selectedUser.email})? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium text-muted-foreground hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bios Modal */}
            {showBiosModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                                <FileText className="w-6 h-6 text-primary" />
                                Manage Bios for {selectedUser.fullName}
                            </h3>
                            <button
                                onClick={() => { setShowBiosModal(false); setSelectedUser(null); }}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {loadingBios ? (
                            <div className="flex-1 flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : userBios.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 text-muted-foreground">
                                <FileText className="w-12 h-12 mb-3 opacity-20" />
                                <p>No bios found for this user.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                {userBios.map(bio => (
                                    <div key={bio.id} className="border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow bg-muted/50">
                                        <div className="w-12 h-12 bg-surface-card rounded-lg border border-border flex items-center justify-center flex-shrink-0 bg-cover bg-center" style={bio.profileImage ? { backgroundImage: `url(${bio.profileImage})` } : {}}>
                                            {!bio.profileImage && <span className="text-lg font-bold text-muted-foreground">{bio.sufix.charAt(0).toUpperCase()}</span>}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {editingBioId === bio.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground font-medium">portyo.me/</span>
                                                        <input
                                                            autoFocus
                                                            className="bg-surface-card border border-blue-500 rounded px-2 py-0.5 text-sm font-bold w-32 focus:outline-none"
                                                            value={editSuffix}
                                                            onChange={e => setEditSuffix(e.target.value)}
                                                            onKeyDown={e => e.key === 'Enter' && handleUpdateBioSuffix(bio.id)}
                                                        />
                                                        <button onClick={() => handleUpdateBioSuffix(bio.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                                                        <button onClick={() => setEditingBioId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 group">
                                                        <a href={`https://portyo.me/p/${bio.sufix}`} target="_blank" rel="noreferrer" className="font-bold text-foreground hover:text-primary hover:underline flex items-center gap-1">
                                                            {bio.sufix}
                                                            <ExternalLink className="w-3 h-3 opacity-50" />
                                                        </a>
                                                        <button onClick={() => { setEditingBioId(bio.id); setEditSuffix(bio.sufix); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-muted-foreground transition-opacity">
                                                            <Edit2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{bio.seoTitle || "No title"}</p>
                                            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                                                <span>{bio.views} views</span>
                                                <span>•</span>
                                                <span>Created {formatDate(bio.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleVerifyBio(bio)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${bio.verified
                                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                    : 'bg-muted text-muted-foreground hover:bg-gray-200'
                                                    }`}
                                            >
                                                {bio.verified ? <Check className="w-3 h-3" /> : null}
                                                {bio.verified ? 'Verified' : 'Verify'}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteBio(bio.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
