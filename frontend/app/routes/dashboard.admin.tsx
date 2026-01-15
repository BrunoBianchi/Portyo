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
    AlertTriangle
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
            default: return 'bg-gray-100 text-gray-600';
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
                        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-gray-500 text-sm">Manage users and platform settings</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">Total Users</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">New This Month</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.newUsersThisMonth}</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <Crown className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">Pro Users</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.planDistribution.pro}</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                <Ban className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">Banned</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.bannedUsers}</p>
                    </div>
                </div>
            )}

            {/* Plan Distribution */}
            {stats && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-8">
                    <h3 className="font-bold text-gray-900 mb-4">Plan Distribution</h3>
                    <div className="flex gap-2 h-4 rounded-full overflow-hidden bg-gray-100">
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
                            <span className="text-gray-600">Free ({stats.planDistribution.free})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-500" />
                            <span className="text-gray-600">Standard ({stats.planDistribution.standard})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-purple-500" />
                            <span className="text-gray-600">Pro ({stats.planDistribution.pro})</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by email or name..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
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
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Bios</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Provider</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user.id} className={`hover:bg-gray-50 ${user.isBanned ? 'bg-red-50/50' : ''}`}>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{user.fullName}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${getPlanBadgeColor(user.plan)}`}>
                                                {user.plan.toUpperCase()}
                                            </span>
                                            {user.planExpiresAt && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Expires: {formatDate(user.planExpiresAt)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-gray-600">{user.biosCount}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-gray-600 capitalize">{user.provider}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-gray-600 text-sm">{formatDate(user.createdAt)}</span>
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
                                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
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
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {users.length} of {total} users
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600 px-3">
                            Page {currentPage} of {pages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
                            disabled={currentPage === pages}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Plan Modal */}
            {showPlanModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Set Plan for {selectedUser.fullName}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                                <select
                                    value={planForm.plan}
                                    onChange={(e) => setPlanForm({ ...planForm, plan: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                >
                                    <option value="free">Free</option>
                                    <option value="standard">Standard</option>
                                    <option value="pro">Pro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration (days) - 0 for permanent
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        value={planForm.durationDays}
                                        onChange={(e) => setPlanForm({ ...planForm, durationDays: parseInt(e.target.value) || 0 })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowPlanModal(false); setSelectedUser(null); }}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{selectedUser.fullName}</strong> ({selectedUser.email})? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
        </div>
    );
}
