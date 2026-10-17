import React, { useState, useEffect, useMemo } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";
import AdminToast, { ToastMessage } from "../../components/AdminToast";
import AdminConfirmModal from "../../components/AdminConfirmModal";
import {
    Scissors,
    Plus,
    Search,
    Edit3,
    Trash2,
    Clock,
    Sparkles,
    Tag,
    X,
    UploadCloud,
    Filter,
    Check,
} from "lucide-react";

interface Hairstyle {
    id: number;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    category: string;
    image_path: string;
    is_active: number;
    created_at: string;
}

interface HairstylesProps {
    hairstyles: Hairstyle[];
}

export default function Hairstyles({ hairstyles = [] }: HairstylesProps) {
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string };
    };

    // Filter & Search states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    // Modal & Action states
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState("No file chosen");

    const [toast, setToast] = useState<ToastMessage | null>(() => {
        if (flash?.success) return { text: flash.success, type: "success" };
        if (flash?.error) return { text: flash.error, type: "error" };
        return null;
    });

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        duration_minutes: "",
        description: "",
        image: null as File | null,
    });

    const [siteRoot, setSiteRoot] = useState("");

    useEffect(() => {
        setSiteRoot(window.location.origin);
    }, []);

    const defaultCategories = ["Fade Cut", "Taper Cut", "Curly Fade", "Buzz Cut"];

    // Compute distinct categories
    const allCategories = useMemo(() => {
        const set = new Set<string>(defaultCategories);
        hairstyles.forEach((h) => {
            if (h.category) set.add(h.category);
        });
        return Array.from(set);
    }, [hairstyles]);

    // Filtered hairstyles
    const filteredHairstyles = useMemo(() => {
        return hairstyles.filter((h) => {
            const matchesSearch =
                h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (h.description &&
                    h.description.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCat =
                selectedCategory === "All" || h.category === selectedCategory;
            return matchesSearch && matchesCat;
        });
    }, [hairstyles, searchTerm, selectedCategory]);

    const openAddModal = () => {
        setIsEditing(false);
        setSelectedHairstyle(null);
        setImagePreview(null);
        setFileName("No file chosen");
        setFormData({
            name: "",
            category: allCategories[0] || "Fade Cut",
            price: "",
            duration_minutes: "30",
            description: "",
            image: null,
        });
        setShowModal(true);
    };

    const openEditModal = (hairstyle: Hairstyle) => {
        setIsEditing(true);
        setSelectedHairstyle(hairstyle);
        setImagePreview(getImageUrl(hairstyle.image_path));
        setFileName("Keep current image");
        setFormData({
            name: hairstyle.name,
            category: hairstyle.category || "",
            price: hairstyle.price.toString(),
            duration_minutes: hairstyle.duration_minutes.toString(),
            description: hairstyle.description || "",
            image: null,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedHairstyle(null);
        setImagePreview(null);
        setFileName("No file chosen");
        setFormData({
            name: "",
            category: "",
            price: "",
            duration_minutes: "",
            description: "",
            image: null,
        });
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData((prev) => ({
                ...prev,
                image: file,
            }));
            setFileName(file.name);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setFileName("No file chosen");
            setImagePreview(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setToast({ text: "Hairstyle name is required.", type: "error" });
            return;
        }
        if (!formData.category) {
            setToast({ text: "Category is required.", type: "error" });
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            setToast({ text: "Valid price is required.", type: "error" });
            return;
        }
        if (
            !formData.duration_minutes ||
            parseInt(formData.duration_minutes) <= 0
        ) {
            setToast({ text: "Valid duration is required.", type: "error" });
            return;
        }

        setIsSubmitting(true);

        const data = new FormData();
        data.append("action", isEditing ? "edit" : "add");
        if (isEditing && selectedHairstyle) {
            data.append("id", selectedHairstyle.id.toString());
        }
        data.append("name", formData.name.trim());
        data.append("category", formData.category);
        data.append("price", formData.price);
        data.append("duration_minutes", formData.duration_minutes);
        data.append("description", formData.description || "");
        if (formData.image) {
            data.append("image", formData.image);
        }

        router.post("/admin/hairstyles", data, {
            onSuccess: () => {
                closeModal();
                setToast({
                    text: isEditing
                        ? "Hairstyle updated successfully."
                        : "New hairstyle added to catalogue.",
                    type: "success",
                });
                router.reload();
            },
            onError: (errors) => {
                console.error("Errors:", errors);
                setToast({
                    text: errors.message || "Error saving hairstyle.",
                    type: "error",
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteId) return;
        setIsDeleting(true);

        const data = new FormData();
        data.append("action", "delete");
        data.append("id", deleteId.toString());

        router.post("/admin/hairstyles", data, {
            onSuccess: () => {
                setDeleteId(null);
                setToast({
                    text: "Hairstyle deleted successfully.",
                    type: "success",
                });
                router.reload();
            },
            onError: (errors) => {
                setToast({
                    text: errors.message || "Error deleting hairstyle.",
                    type: "error",
                });
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) {
            return "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80";
        }
        if (imagePath.startsWith("http")) {
            return imagePath;
        }
        return `${siteRoot}/${imagePath.replace(/^\//, "")}`;
    };

    return (
        <>
            <Head title="Hairstyles Catalogue — BEZ Hair Studio" />
            <Sidebar>
                <main className="min-h-screen bg-[#f8f7f4] text-stone-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Header Banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
                                    <Scissors className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Service Offerings</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                                    Hairstyle Catalogue
                                </h1>
                                <p className="text-sm text-stone-500 mt-1">
                                    Manage studio cuts, service durations, and pricing shown on the booking portal.
                                </p>
                            </div>

                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-amber-300 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition shadow-sm hover:shadow"
                            >
                                <Plus className="h-4 w-4 text-amber-400" />
                                Add Hairstyle
                            </button>
                        </div>

                        {/* Search & Category Filter Toolbar */}
                        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                {/* Search Bar */}
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                                    <input
                                        type="text"
                                        placeholder="Search hairstyles..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-xs text-stone-900 transition"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Category Pills */}
                                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                                    <button
                                        onClick={() => setSelectedCategory("All")}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition shrink-0 ${
                                            selectedCategory === "All"
                                                ? "bg-stone-900 text-amber-300 shadow-xs"
                                                : "bg-stone-100 text-stone-600 hover:bg-stone-200/80"
                                        }`}
                                    >
                                        All ({hairstyles.length})
                                    </button>
                                    {allCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition shrink-0 ${
                                                selectedCategory === cat
                                                    ? "bg-stone-900 text-amber-300 shadow-xs"
                                                    : "bg-stone-100 text-stone-600 hover:bg-stone-200/80"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Hairstyles Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredHairstyles.length === 0 ? (
                                <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-stone-200/80 p-8 shadow-xs">
                                    <Scissors className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                                    <h3 className="text-base font-bold text-stone-900">
                                        No hairstyles found
                                    </h3>
                                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                                        {searchTerm || selectedCategory !== "All"
                                            ? "Try adjusting your search query or category filter."
                                            : "Your catalogue is currently empty. Click '+ Add Hairstyle' to build your haircut offerings."}
                                    </p>
                                    {(searchTerm || selectedCategory !== "All") && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setSelectedCategory("All");
                                            }}
                                            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredHairstyles.map((hairstyle) => (
                                    <div
                                        key={hairstyle.id}
                                        className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Image container with floating badges */}
                                            <div className="relative aspect-square overflow-hidden bg-stone-100">
                                                <img
                                                    src={getImageUrl(hairstyle.image_path)}
                                                    alt={hairstyle.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80";
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-black/20" />

                                                {/* Top Category Badge */}
                                                {hairstyle.category && (
                                                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-stone-200 border border-white/10">
                                                        {hairstyle.category}
                                                    </span>
                                                )}

                                                {/* Top Price Badge */}
                                                <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-amber-500 text-stone-950 text-xs font-extrabold tracking-tight shadow-md">
                                                    ₱{Number(hairstyle.price).toFixed(2)}
                                                </span>

                                                {/* Inactive flag */}
                                                {!hairstyle.is_active && (
                                                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-stone-900/90 text-amber-300 text-[10px] font-semibold tracking-wide border border-amber-500/30">
                                                        Default Price Setting
                                                    </span>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="p-4">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="font-bold text-stone-900 text-base tracking-tight truncate">
                                                        {hairstyle.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-stone-500 text-xs shrink-0">
                                                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                                                        <span>{hairstyle.duration_minutes}m</span>
                                                    </div>
                                                </div>

                                                {hairstyle.description ? (
                                                    <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                                                        {hairstyle.description}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-stone-400 mt-2 italic">
                                                        No description provided.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Actions */}
                                        <div className="px-4 pb-4 pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(hairstyle)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition"
                                                title="Edit Cut"
                                            >
                                                <Edit3 className="h-3.5 w-3.5 text-stone-500" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(hairstyle.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                                                title="Delete Cut"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>

                {/* ADD / EDIT MODAL */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-stone-900">
                                        {isEditing ? "Edit Hairstyle" : "Add New Hairstyle"}
                                    </h2>
                                    <p className="text-xs text-stone-500 mt-0.5">
                                        {isEditing
                                            ? "Update styling specs, duration, and pricing."
                                            : "Introduce a new cut option to your appointment booking list."}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                        Hairstyle Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition"
                                        placeholder="e.g. Modern Textured Fade"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                        Category <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {allCategories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                            Price (₱) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition"
                                            placeholder="350.00"
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                            Duration (Minutes) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="duration_minutes"
                                            value={formData.duration_minutes}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition"
                                            placeholder="30"
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                        Description & Style Notes
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-900 transition resize-none"
                                        placeholder="Describe the taper, shears technique, or suitable hair textures..."
                                    />
                                </div>

                                {/* Image Upload & Preview */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                        Showcase Photo
                                    </label>
                                    <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex items-center gap-4">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-xs"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400">
                                                <Scissors className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                id="hairstyle_image"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="hairstyle_image"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer transition shadow-2xs"
                                            >
                                                <UploadCloud className="h-3.5 w-3.5 text-amber-600" />
                                                Choose Photo
                                            </label>
                                            <p className="text-[11px] text-stone-500 mt-1 truncate">
                                                {fileName}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-stone-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-amber-300 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition shadow-sm disabled:opacity-50"
                                    >
                                        <Check className="h-4 w-4 text-amber-400" />
                                        {isSubmitting
                                            ? "Saving..."
                                            : isEditing
                                              ? "Update Hairstyle"
                                              : "Save to Catalogue"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Reusable Delete Confirmation Modal */}
                <AdminConfirmModal
                    isOpen={deleteId !== null}
                    title="Delete Hairstyle"
                    message="Are you sure you want to permanently delete this hairstyle from your catalogue? This action cannot be undone."
                    confirmText="Delete Hairstyle"
                    cancelText="Cancel"
                    isDestructive={true}
                    isLoading={isDeleting}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                />

                {/* Toast Feedback */}
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
