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
                <main className="min-h-screen bg-[#F5F4EF] text-[#1C1B18]">
                    <div className="studio-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
                        {/* Header Banner */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-6 border-b border-[#E5E2DA]">
                            <div>
                                <div className="font-morche flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#918E85] mb-1">
                                    <span>Service Offerings</span>
                                </div>
                                <h1 className="font-morche text-2xl sm:text-3xl font-medium tracking-tight text-[#1C1B18]">
                                    Hairstyle Catalogue
                                </h1>
                                <p className="text-xs sm:text-sm text-[#737069] mt-1">
                                    Manage studio cuts, service durations, and pricing shown on the booking portal.
                                </p>
                            </div>

                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#252420] text-[#FAF9F5] text-xs font-semibold hover:bg-[#373530] transition-all duration-150 active:scale-[0.98]"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Hairstyle
                            </button>
                        </div>

                        {/* Search & Category Filter Toolbar */}
                        <div className="bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] shadow-[0_1px_2px_rgba(28,27,24,0.03)] p-4 mb-6">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                {/* Search Bar */}
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#918E85]" />
                                    <input
                                        type="text"
                                        placeholder="Search hairstyles..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-[#E5E2DA] rounded-lg bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-xs text-[#1C1B18] transition-colors placeholder:text-[#918E85]"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#918E85] hover:text-[#1C1B18]"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Category Pills */}
                                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                                    <button
                                        onClick={() => setSelectedCategory("All")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.97] shrink-0 ${
                                            selectedCategory === "All"
                                                ? "bg-[#252420] text-[#FAF9F5]"
                                                : "bg-[#F3F1EC] text-[#5C5953] hover:bg-[#EAE7DF] hover:text-[#1C1B18]"
                                        }`}
                                    >
                                        All ({hairstyles.length})
                                    </button>
                                    {allCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.97] shrink-0 ${
                                                selectedCategory === cat
                                                    ? "bg-[#252420] text-[#FAF9F5]"
                                                    : "bg-[#F3F1EC] text-[#5C5953] hover:bg-[#EAE7DF] hover:text-[#1C1B18]"
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
                                <div className="col-span-full text-center py-16 bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] p-8 shadow-[0_1px_2px_rgba(28,27,24,0.03)]">
                                    <Scissors className="h-10 w-10 text-[#C7C3B9] mx-auto mb-3" />
                                    <h3 className="text-base font-bold text-[#1C1B18]">
                                        No hairstyles found
                                    </h3>
                                    <p className="text-xs text-[#737069] mt-1 max-w-sm mx-auto">
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
                                            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#F3F1EC] text-[#3D3B36] hover:bg-[#EAE7DF] transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredHairstyles.map((hairstyle) => (
                                    <div
                                        key={hairstyle.id}
                                        className="group bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] overflow-hidden shadow-[0_1px_2px_rgba(28,27,24,0.03)] hover:border-[#CFCAC0] hover:shadow-[0_8px_20px_rgba(28,27,24,0.06)] hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Image container with floating badges */}
                                            <div className="relative aspect-square overflow-hidden bg-[#EFECE5]">
                                                <img
                                                    src={getImageUrl(hairstyle.image_path)}
                                                    alt={hairstyle.name}
                                                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80";
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B18]/45 via-transparent to-[#1C1B18]/15" />

                                                {/* Top Category Badge */}
                                                {hairstyle.category && (
                                                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#252420]/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#FAF9F5] border border-white/10">
                                                        {hairstyle.category}
                                                    </span>
                                                )}

                                                {/* Top Price Badge */}
                                                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#252420] text-[#FAF9F5] text-xs font-bold tracking-tight tabular-nums">
                                                    ₱{Number(hairstyle.price).toFixed(2)}
                                                </span>

                                                {/* Inactive flag */}
                                                {!hairstyle.is_active && (
                                                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-[#FDFCF9] text-[#1C1B18] text-[10px] font-semibold tracking-wide border border-[#E5E2DA]">
                                                        Default Price Setting
                                                    </span>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="p-4">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="font-bold text-[#1C1B18] text-base tracking-tight truncate">
                                                        {hairstyle.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-[#737069] text-xs shrink-0 tabular-nums">
                                                        <Clock className="h-3.5 w-3.5 text-[#5C5953]" />
                                                        <span>{hairstyle.duration_minutes}m</span>
                                                    </div>
                                                </div>

                                                {hairstyle.description ? (
                                                    <p className="text-xs text-[#737069] mt-2 line-clamp-2 leading-relaxed">
                                                        {hairstyle.description}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-[#A39F96] mt-2 italic">
                                                        No description provided.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Actions */}
                                        <div className="px-4 pb-4 pt-2 border-t border-[#EFECE5] flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(hairstyle)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E2DA] bg-[#FDFCF9] text-xs font-semibold text-[#3D3B36] hover:bg-[#F3F1EC] hover:border-[#CFCAC0] transition-all duration-150 active:scale-[0.97]"
                                                title="Edit Cut"
                                            >
                                                <Edit3 className="h-3.5 w-3.5 text-[#737069]" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(hairstyle.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E9CECE] bg-[#FDFCF9] text-xs font-semibold text-[#8E3535] hover:bg-[#F9ECEC] transition-all duration-150 active:scale-[0.97]"
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
                    <div className="studio-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/40 backdrop-blur-[2px]">
                        <div className="studio-modal-panel bg-[#FDFCF9] rounded-2xl border border-[#E5E2DA] shadow-[0_16px_40px_rgba(28,27,24,0.16)] max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-[#EFECE5] mb-6">
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-[#1C1B18]">
                                        {isEditing ? "Edit Hairstyle" : "Add New Hairstyle"}
                                    </h2>
                                    <p className="text-xs text-[#737069] mt-0.5">
                                        {isEditing
                                            ? "Update styling specs, duration, and pricing."
                                            : "Introduce a new cut option to your appointment booking list."}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-1.5 rounded-lg text-[#807D75] hover:text-[#1C1B18] hover:bg-[#EFECE5] transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                        Hairstyle Name <span className="text-[#8E3535]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-[#E5E2DA] rounded-xl bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-sm text-[#1C1B18] transition-colors"
                                        placeholder="e.g. Modern Textured Fade"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                        Category <span className="text-[#8E3535]">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-[#E5E2DA] rounded-xl bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-sm text-[#1C1B18] transition-colors"
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
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                            Price (₱) <span className="text-[#8E3535]">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-[#E5E2DA] rounded-xl bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-sm text-[#1C1B18] transition-colors"
                                            placeholder="350.00"
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                            Duration (Minutes) <span className="text-[#8E3535]">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="duration_minutes"
                                            value={formData.duration_minutes}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-[#E5E2DA] rounded-xl bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-sm text-[#1C1B18] transition-colors"
                                            placeholder="30"
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                        Description & Style Notes
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-[#E5E2DA] rounded-xl bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-sm text-[#1C1B18] transition-colors resize-none"
                                        placeholder="Describe the taper, shears technique, or suitable hair textures..."
                                    />
                                </div>

                                {/* Image Upload & Preview */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                        Showcase Photo
                                    </label>
                                    <div className="p-4 rounded-xl border border-[#E5E2DA] bg-[#F5F4EF] flex items-center gap-4">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-16 h-16 rounded-xl object-cover border border-[#E5E2DA]"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-[#EAE7DF] flex items-center justify-center text-[#918E85]">
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
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCD8CE] bg-[#FDFCF9] text-xs font-medium text-[#3D3B36] hover:bg-[#EFECE5] cursor-pointer transition-colors"
                                            >
                                                <UploadCloud className="h-3.5 w-3.5 text-[#5C5953]" />
                                                Choose Photo
                                            </label>
                                            <p className="text-[11px] text-[#737069] mt-1 truncate">
                                                {fileName}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFECE5]">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2.5 rounded-xl border border-[#DCD8CE] text-xs font-semibold uppercase tracking-wider text-[#5C5953] hover:bg-[#F3F1EC] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#252420] text-[#FAF9F5] text-xs font-semibold hover:bg-[#373530] transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        <Check className="h-3.5 w-3.5" />
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
