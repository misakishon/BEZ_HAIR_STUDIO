import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";
import AdminToast, { ToastMessage } from "../../components/AdminToast";
import AdminConfirmModal from "../../components/AdminConfirmModal";
import {
    Users as UsersIcon,
    CalendarCheck,
    UserCheck,
    Search,
    Eye,
    Edit3,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Shield,
    Phone,
    Mail,
    Lock,
    X,
    Check,
    UserPlus,
} from "lucide-react";

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    created_at: string;
    total_bookings: number;
    completed_bookings: number;
}

interface UsersProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    totalUsers: number;
    totalBookings: number;
    activeUsers: number;
    search: string;
    roleFilter: string;
}

export default function Users({
    users,
    totalUsers,
    totalBookings,
    activeUsers,
    search: initialSearch,
    roleFilter: initialRoleFilter,
}: UsersProps) {
    const [search, setSearch] = useState(initialSearch || "");
    const [roleFilter, setRoleFilter] = useState(initialRoleFilter || "all");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [toast, setToast] = useState<ToastMessage | null>(null);

    const [editForm, setEditForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "user",
        password: "",
        password_confirmation: "",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            "/admin/users",
            { search, role: roleFilter },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleRoleFilter = (role: string) => {
        setRoleFilter(role);
        router.get(
            "/admin/users",
            { search, role },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            "/admin/users",
            { search, role: roleFilter, page },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setEditForm({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || "user",
            password: "",
            password_confirmation: "",
        });
        setShowEditModal(true);
    };

    const getCsrfHeaders = () => {
        const csrfToken =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "";

        const xsrfCookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="));
        const xsrfToken = xsrfCookie
            ? decodeURIComponent(xsrfCookie.split("=")[1])
            : "";

        return {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": csrfToken,
            ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        };
    };

    const parseJsonResponse = async (response: Response) => {
        const text = await response.text();
        if (!text) return {};
        try {
            return JSON.parse(text);
        } catch (error) {
            console.error("Failed to parse JSON response:", error, text);
            return {
                success: false,
                message: "The server returned an invalid response. Please refresh and try again.",
            };
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsSaving(true);

        try {
            const payload: Record<string, string> = {
                first_name: editForm.first_name,
                last_name: editForm.last_name,
                email: editForm.email,
                phone: editForm.phone,
                role: editForm.role,
            };

            if (editForm.password.trim()) {
                payload.password = editForm.password;
                payload.password_confirmation = editForm.password_confirmation;
            }

            const response = await fetch(`/admin/users/${editingUser.id}`, {
                method: "PUT",
                credentials: "same-origin",
                headers: getCsrfHeaders(),
                body: JSON.stringify(payload),
            });

            const result = await parseJsonResponse(response);

            if (!response.ok && !result.success) {
                throw new Error(result.message || "Unable to update user.");
            }

            if (result.success) {
                setShowEditModal(false);
                setEditingUser(null);
                setToast({ text: "User account updated successfully.", type: "success" });
                router.reload();
            } else {
                setToast({ text: result.message || "Error updating user.", type: "error" });
            }
        } catch (error) {
            console.error("Error updating user:", error);
            setToast({
                text:
                    error instanceof Error
                        ? error.message
                        : "Error updating user. Please refresh and try again.",
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);

        try {
            const response = await fetch(`/admin/users/${deleteId}`, {
                method: "DELETE",
                credentials: "same-origin",
                headers: getCsrfHeaders(),
            });
            const result = await parseJsonResponse(response);

            if (!response.ok && !result.success) {
                throw new Error(result.message || "Unable to delete user.");
            }

            if (result.success) {
                setDeleteId(null);
                setToast({ text: "User account deleted successfully.", type: "success" });
                router.reload();
            } else {
                setToast({ text: result.message || "Error deleting user.", type: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            setToast({
                text:
                    error instanceof Error
                        ? error.message
                        : "Error deleting user. Please refresh and try again.",
                type: "error",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const targetDeleteUser = users.data.find((u) => u.id === deleteId);

    return (
        <>
            <Head title="Client Directory — BEZ Hair Studio" />
            <Sidebar>
                <main className="min-h-screen bg-[#f8f7f4] text-stone-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Header Banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
                                    <UsersIcon className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Client & Membership Management</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                                    User Accounts
                                </h1>
                                <p className="text-sm text-stone-500 mt-1">
                                    Browse registered clients, track booking histories, and manage administrator access.
                                </p>
                            </div>
                        </div>

                        {/* Top KPI Metrics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
                                <div>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                                        Total Registered Users
                                    </span>
                                    <div className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
                                        {totalUsers}
                                    </div>
                                    <span className="text-[11px] text-stone-500">
                                        Accounts across all roles
                                    </span>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                                    <UsersIcon className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
                                <div>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                                        Total Client Bookings
                                    </span>
                                    <div className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
                                        {totalBookings}
                                    </div>
                                    <span className="text-[11px] text-stone-500">
                                        Historical studio visits
                                    </span>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
                                    <CalendarCheck className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
                                <div>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                                        Active (Last 30 Days)
                                    </span>
                                    <div className="text-2xl font-bold tracking-tight text-emerald-600 mt-1">
                                        {activeUsers}
                                    </div>
                                    <span className="text-[11px] text-stone-500">
                                        Engaged studio clients
                                    </span>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                                    <UserCheck className="h-6 w-6" />
                                </div>
                            </div>
                        </div>

                        {/* Search & Role Filter Toolbar */}
                        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <form
                                    onSubmit={handleSearch}
                                    className="flex items-center gap-2 w-full sm:w-96"
                                >
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or phone..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-xs text-stone-900 transition"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-stone-900 text-amber-300 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-stone-800 transition shrink-0"
                                    >
                                        Search
                                    </button>
                                </form>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    {["all", "user", "admin"].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => handleRoleFilter(role)}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                                                roleFilter === role
                                                    ? "bg-stone-900 text-amber-300 shadow-xs"
                                                    : "bg-stone-100 text-stone-600 hover:bg-stone-200/80"
                                            }`}
                                        >
                                            {role === "all" ? "All Roles" : role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-stone-100 bg-stone-50/75">
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                                                Client
                                            </th>
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                                                Phone
                                            </th>
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                                                Bookings
                                            </th>
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                                                Joined Date
                                            </th>
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 text-xs">
                                        {users.data.length > 0 ? (
                                            users.data.map((user) => {
                                                const initials = `${(user.first_name || "").charAt(0)}${(user.last_name || "").charAt(0)}`.toUpperCase() || "U";
                                                return (
                                                    <tr
                                                        key={user.id}
                                                        className="hover:bg-amber-50/20 transition-colors"
                                                    >
                                                        {/* Client Name & Avatar */}
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-stone-900 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                                                                    {initials}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-stone-900">
                                                                        {user.first_name} {user.last_name}
                                                                    </div>
                                                                    <div className="text-[10px] text-stone-400">
                                                                        ID: #{user.id}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Email */}
                                                        <td className="py-3.5 px-4 text-stone-600 font-medium">
                                                            {user.email}
                                                        </td>

                                                        {/* Phone */}
                                                        <td className="py-3.5 px-4 text-stone-500">
                                                            {user.phone ? (
                                                                <span className="font-mono">{user.phone}</span>
                                                            ) : (
                                                                <span className="text-stone-300 italic">None</span>
                                                            )}
                                                        </td>

                                                        {/* Role */}
                                                        <td className="py-3.5 px-4">
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                    user.role === "admin"
                                                                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                                                                        : "bg-stone-100 text-stone-700 border border-stone-200"
                                                                }`}
                                                            >
                                                                {user.role === "admin" && (
                                                                    <Shield className="h-3 w-3 text-purple-600" />
                                                                )}
                                                                {user.role}
                                                            </span>
                                                        </td>

                                                        {/* Bookings */}
                                                        <td className="py-3.5 px-4">
                                                            <div className="font-bold text-stone-900">
                                                                {user.total_bookings}{" "}
                                                                <span className="text-[10px] font-normal text-stone-400">
                                                                    visits
                                                                </span>
                                                            </div>
                                                            {Number(user.completed_bookings) > 0 && (
                                                                <div className="text-[10px] text-emerald-600 font-medium">
                                                                    {user.completed_bookings} completed
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Joined */}
                                                        <td className="py-3.5 px-4 text-stone-500">
                                                            {new Date(user.created_at).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            })}
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="py-3.5 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Link
                                                                    href={`/admin/users/${user.id}`}
                                                                    className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => openEditModal(user)}
                                                                    className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-amber-600 hover:bg-amber-50/50 transition"
                                                                    title="Edit User"
                                                                >
                                                                    <Edit3 className="h-3.5 w-3.5" />
                                                                </button>
                                                                {user.role !== "admin" && (
                                                                    <button
                                                                        onClick={() => setDeleteId(user.id)}
                                                                        className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                                                                        title="Delete User"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="py-12 text-center text-stone-400"
                                                >
                                                    <UsersIcon className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                                                    No users found matching your search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {users.last_page > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-stone-100 bg-stone-50/40">
                                    <div className="text-xs text-stone-500 font-medium">
                                        Showing <span className="font-bold text-stone-800">{users.data.length}</span> of{" "}
                                        <span className="font-bold text-stone-800">{users.total}</span> users
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handlePageChange(users.current_page - 1)}
                                            disabled={users.current_page === 1}
                                            className="h-8 w-8 flex items-center justify-center border border-stone-200 rounded-xl text-stone-600 hover:bg-white hover:border-stone-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        {Array.from({ length: Math.min(5, users.last_page) }, (_, i) => {
                                            let page = i + 1;
                                            if (users.last_page > 5 && users.current_page > 3) {
                                                page = users.current_page - 2 + i;
                                                if (page > users.last_page) return null;
                                            }
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`h-8 w-8 rounded-xl text-xs font-semibold transition ${
                                                        page === users.current_page
                                                            ? "bg-stone-900 text-amber-300 shadow-xs"
                                                            : "border border-stone-200 text-stone-600 hover:bg-white hover:border-stone-400"
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => handlePageChange(users.current_page + 1)}
                                            disabled={users.current_page === 1 || users.current_page === users.last_page}
                                            className="h-8 w-8 flex items-center justify-center border border-stone-200 rounded-xl text-stone-600 hover:bg-white hover:border-stone-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* EDIT USER MODAL */}
                {showEditModal && editingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-stone-900">
                                        Edit User Account
                                    </h3>
                                    <p className="text-xs text-stone-500 mt-0.5">
                                        Update client information and role credentials.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                            First Name <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.first_name}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, first_name: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                            Last Name <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.last_name}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, last_name: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                        Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, email: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, phone: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                        Role Access
                                    </label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, role: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition"
                                    >
                                        <option value="user">User (Customer)</option>
                                        <option value="admin">Admin (Full Access)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                        New Password <span className="text-stone-400 font-normal">(Leave blank to keep unchanged)</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={editForm.password}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, password: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {editForm.password && (
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={editForm.password_confirmation}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    password_confirmation: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition"
                                            placeholder="••••••••"
                                            required={!!editForm.password}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-stone-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-amber-300 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition shadow-sm disabled:opacity-50"
                                    >
                                        <Check className="h-4 w-4 text-amber-400" />
                                        {isSaving ? "Saving Changes..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* DELETE CONFIRMATION MODAL */}
                <AdminConfirmModal
                    isOpen={deleteId !== null}
                    title="Delete User Account"
                    message={
                        targetDeleteUser?.total_bookings && targetDeleteUser.total_bookings > 0
                            ? `Warning: ${targetDeleteUser.first_name} ${targetDeleteUser.last_name} has ${targetDeleteUser.total_bookings} existing booking records. Deleting this account will permanently remove their access and history.`
                            : `Are you sure you want to delete ${targetDeleteUser?.first_name || "this user"} ${targetDeleteUser?.last_name || ""}? This action cannot be undone.`
                    }
                    confirmText="Delete Account"
                    cancelText="Cancel"
                    isDestructive={true}
                    isLoading={isDeleting}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                />

                {/* Toast Notification */}
                {toast && (
                    <AdminToast
                        toast={toast}
                        onClose={() => setToast(null)}
                    />
                )}
            </Sidebar>
        </>
    );
}
