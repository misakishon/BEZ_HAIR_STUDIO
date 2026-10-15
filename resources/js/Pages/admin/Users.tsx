import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";

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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
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

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
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

        if (!text) {
            return {};
        }

        try {
            return JSON.parse(text);
        } catch (error) {
            console.error("Failed to parse JSON response:", error, text);
            return {
                success: false,
                message:
                    "The server returned an invalid response. Please refresh and try again.",
            };
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

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
                setEditForm({
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    role: "user",
                    password: "",
                    password_confirmation: "",
                });
                router.reload();
            } else {
                alert(result.message || "Error updating user");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Error updating user. Please refresh and try again.",
            );
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

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
                setShowDeleteConfirm(false);
                setDeleteId(null);
                router.reload();
            } else {
                alert(result.message || "Error deleting user");
            }
        } catch (error) {
            console.error("Error:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Error deleting user. Please refresh and try again.",
            );
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-purple-100 text-purple-700";
            case "user":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <>
            <Head title="Users — BEZ Hair Studio" />
            <Sidebar>
                <main className="min-h-screen bg-[#f0ede7]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    USERS
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage your customers
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards - Small like in the image */}
                        <div className="flex gap-3 mb-6">
                            <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100 min-w-[120px]">
                                <div className="text-[10px] uppercase tracking-wider text-gray-400">
                                    Total Users
                                </div>
                                <div className="text-xl font-bold text-gray-900 mt-0.5">
                                    {totalUsers}
                                </div>
                            </div>
                            <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100 min-w-[120px]">
                                <div className="text-[10px] uppercase tracking-wider text-gray-400">
                                    Total Bookings
                                </div>
                                <div className="text-xl font-bold text-gray-900 mt-0.5">
                                    {totalBookings}
                                </div>
                            </div>
                            <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100 min-w-[120px]">
                                <div className="text-[10px] uppercase tracking-wider text-gray-400">
                                    Active Users
                                </div>
                                <div className="text-xl font-bold text-gray-900 mt-0.5">
                                    {activeUsers}
                                </div>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <form
                                    onSubmit={handleSearch}
                                    className="flex-1 flex gap-2"
                                >
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or phone..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
                                    >
                                        Search
                                    </button>
                                </form>
                                <div className="flex gap-2 flex-wrap">
                                    {["all", "user", "admin"].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() =>
                                                handleRoleFilter(role)
                                            }
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                                                roleFilter === role
                                                    ? "bg-black text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            {role.charAt(0).toUpperCase() +
                                                role.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Phone
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Bookings
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Joined
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.data.length > 0 ? (
                                            users.data.map((user) => (
                                                <tr
                                                    key={user.id}
                                                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                                                >
                                                    <td className="py-4 px-4 font-medium text-gray-900">
                                                        {user.first_name}{" "}
                                                        {user.last_name}
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-500 text-xs">
                                                        {user.email}
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-500 text-xs">
                                                        {user.phone || "N/A"}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase ${getRoleBadgeClass(user.role)}`}
                                                        >
                                                            {user.role}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-4 text-gray-500 text-xs">
                                                        {new Date(
                                                            user.created_at,
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            },
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                href={`/admin/users/${user.id}`}
                                                                className="text-gray-400 hover:text-blue-600 transition"
                                                                title="View Details"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">
                                                                    visibility
                                                                </span>
                                                            </Link>
                                                            <button
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        user,
                                                                    )
                                                                }
                                                                className="text-gray-400 hover:text-amber-600 transition"
                                                                title="Edit User"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">
                                                                    edit
                                                                </span>
                                                            </button>
                                                            {user.role !==
                                                                "admin" && (
                                                                <button
                                                                    onClick={() =>
                                                                        confirmDelete(
                                                                            user.id,
                                                                        )
                                                                    }
                                                                    className="text-gray-400 hover:text-red-600 transition"
                                                                    title="Delete"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">
                                                                        delete
                                                                    </span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="py-8 text-center text-gray-500"
                                                >
                                                    No users found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {users.last_page > 1 && (
                                <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
                                    <div className="text-xs text-gray-500">
                                        Showing {users.data.length} of{" "}
                                        {users.total} users
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    users.current_page - 1,
                                                )
                                            }
                                            disabled={users.current_page === 1}
                                            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-xs text-gray-500 hover:border-black hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-base">
                                                chevron_left
                                            </span>
                                        </button>
                                        {Array.from(
                                            {
                                                length: Math.min(
                                                    5,
                                                    users.last_page,
                                                ),
                                            },
                                            (_, i) => {
                                                let page = i + 1;
                                                if (
                                                    users.last_page > 5 &&
                                                    users.current_page > 3
                                                ) {
                                                    page =
                                                        users.current_page -
                                                        2 +
                                                        i;
                                                    if (page > users.last_page)
                                                        return null;
                                                }
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() =>
                                                            handlePageChange(
                                                                page,
                                                            )
                                                        }
                                                        className={`w-8 h-8 flex items-center justify-center border rounded text-xs transition ${
                                                            page ===
                                                            users.current_page
                                                                ? "border-black bg-black text-white"
                                                                : "border-gray-200 text-gray-500 hover:border-black hover:text-black"
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            },
                                        )}
                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    users.current_page + 1,
                                                )
                                            }
                                            disabled={
                                                users.current_page ===
                                                users.last_page
                                            }
                                            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-xs text-gray-500 hover:border-black hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-base">
                                                chevron_right
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                {/* Edit User Modal */}
                {showEditModal && editingUser && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    Edit User
                                </h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <form
                                onSubmit={handleEditSubmit}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.first_name}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    first_name: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.last_name}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    last_name: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                role: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        New Password (optional)
                                    </label>
                                    <input
                                        type="password"
                                        value={editForm.password}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                password: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                        placeholder="Leave blank to keep current password"
                                    />
                                </div>

                                {editForm.password && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={
                                                editForm.password_confirmation
                                            }
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    password_confirmation:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            required={!!editForm.password}
                                        />
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-black text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Confirm Delete
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {(() => {
                                    const user = users.data.find(
                                        (u) => u.id === deleteId,
                                    );

                                    if (user?.role === "admin") {
                                        return "Admin accounts are protected and cannot be deleted from this page.";
                                    }

                                    return (
                                        <>
                                            Are you sure you want to delete this
                                            user? This action cannot be undone.
                                            {user &&
                                                user.total_bookings > 0 && (
                                                    <span className="block mt-2 text-amber-600">
                                                        Warning: This user has{" "}
                                                        {user.total_bookings}{" "}
                                                        bookings.
                                                    </span>
                                                )}
                                        </>
                                    );
                                })()}
                            </p>
                            <div className="flex gap-3">
                                {(() => {
                                    const user = users.data.find(
                                        (u) => u.id === deleteId,
                                    );
                                    if (user?.role === "admin") {
                                        return (
                                            <button
                                                onClick={() =>
                                                    setShowDeleteConfirm(false)
                                                }
                                                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition"
                                            >
                                                Close
                                            </button>
                                        );
                                    }

                                    return (
                                        <button
                                            onClick={handleDelete}
                                            className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition"
                                        >
                                            Delete
                                        </button>
                                    );
                                })()}
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Sidebar>
        </>
    );
}
