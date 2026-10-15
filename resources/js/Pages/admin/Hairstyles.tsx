import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";

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
    // ALL STATE DECLARATIONS
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedHairstyle, setSelectedHairstyle] =
        useState<Hairstyle | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fileName, setFileName] = useState("No file chosen");
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
        const baseUrl = window.location.origin;
        setSiteRoot(baseUrl);
    }, []);

    const categories = ["Fade Cut", "Taper Cut", "Curly Fade", "Buzz Cut"];

    const openAddModal = () => {
        setIsEditing(false);
        setSelectedHairstyle(null);
        setErrorMessage(null);
        setFileName("No file chosen");
        setFormData({
            name: "",
            category: "",
            price: "",
            duration_minutes: "",
            description: "",
            image: null,
        });
        setShowModal(true);
    };

    const openEditModal = (hairstyle: Hairstyle) => {
        setIsEditing(true);
        setSelectedHairstyle(hairstyle);
        setErrorMessage(null);
        setFileName("No file chosen");
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
        setErrorMessage(null);
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
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({
                ...formData,
                image: file,
            });
            setFileName(file.name);
        } else {
            setFileName("No file chosen");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        if (!formData.name.trim()) {
            setErrorMessage("Hairstyle name is required");
            setIsSubmitting(false);
            return;
        }
        if (!formData.category) {
            setErrorMessage("Category is required");
            setIsSubmitting(false);
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            setErrorMessage("Valid price is required");
            setIsSubmitting(false);
            return;
        }
        if (
            !formData.duration_minutes ||
            parseInt(formData.duration_minutes) <= 0
        ) {
            setErrorMessage("Valid duration is required");
            setIsSubmitting(false);
            return;
        }

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
                router.reload();
            },
            onError: (errors) => {
                console.error("Errors:", errors);
                setErrorMessage(errors.message || "Error saving hairstyle");
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const handleDelete = () => {
        if (!deleteId) return;

        const data = new FormData();
        data.append("action", "delete");
        data.append("id", deleteId.toString());

        router.post("/admin/hairstyles", data, {
            onSuccess: () => {
                setShowDeleteConfirm(false);
                setDeleteId(null);
                router.reload();
            },
            onError: (errors) => {
                alert(errors.message || "Error deleting hairstyle");
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
            <Head title="Hairstyles — BEZ Hair Studio" />
            <Sidebar>
                <main className="min-h-screen bg-[#f0ede7]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    HAIRSTYLES
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage your service offerings
                                </p>
                            </div>
                            <button
                                onClick={openAddModal}
                                className="px-6 py-2.5 bg-black text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-800 transition rounded-lg"
                            >
                                + Add Hairstyle
                            </button>
                        </div>

                        {/* Hairstyles Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {hairstyles.length === 0 ? (
                                <div className="col-span-full text-center py-12 bg-white rounded-lg">
                                    <p className="text-gray-500">
                                        No hairstyles found. Click "Add
                                        Hairstyle" to create one.
                                    </p>
                                </div>
                            ) : (
                                hairstyles.map((hairstyle) => (
                                    <div
                                        key={hairstyle.id}
                                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <img
                                            src={getImageUrl(
                                                hairstyle.image_path,
                                            )}
                                            alt={hairstyle.name}
                                            className="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-300"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src =
                                                    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80";
                                            }}
                                        />
                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {hairstyle.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                                                        {
                                                            hairstyle.duration_minutes
                                                        }{" "}
                                                        min
                                                    </div>
                                                    {hairstyle.category && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {hairstyle.category}
                                                        </div>
                                                    )}
                                                    {!hairstyle.is_active && (
                                                        <div className="mt-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                                                            Default Price Entry
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    ₱
                                                    {Number(
                                                        hairstyle.price,
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                            {hairstyle.description && (
                                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                                    {hairstyle.description}
                                                </p>
                                            )}
                                            <div className="flex justify-end gap-2 mt-3">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(hairstyle)
                                                    }
                                                    className="text-gray-400 hover:text-black transition"
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        edit
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        confirmDelete(
                                                            hairstyle.id,
                                                        )
                                                    }
                                                    className="text-gray-400 hover:text-red-600 transition"
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        delete
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>

                {/* ADD/EDIT MODAL - This was missing! */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {isEditing
                                        ? "Edit Hairstyle"
                                        : "Add Hairstyle"}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition"
                                >
                                    <span className="material-symbols-outlined">
                                        close
                                    </span>
                                </button>
                            </div>

                            {errorMessage && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {errorMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hairstyle Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                        placeholder="e.g., Classic Fade"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                    >
                                        <option value="">
                                            Select Category
                                        </option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price (₱) *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Duration (minutes) *
                                        </label>
                                        <input
                                            type="number"
                                            name="duration_minutes"
                                            value={formData.duration_minutes}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                            placeholder="30"
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                                        placeholder="Describe the hairstyle..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Image
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <label className="cursor-pointer">
                                            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
                                                Choose File
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                        <span className="text-sm text-gray-500">
                                            {fileName}
                                        </span>
                                    </div>
                                    {isEditing && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Leave empty to keep current image
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-black text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting
                                            ? "Saving..."
                                            : isEditing
                                              ? "Update Hairstyle"
                                              : "Add Hairstyle"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
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
                                Are you sure you want to delete this hairstyle?
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
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
