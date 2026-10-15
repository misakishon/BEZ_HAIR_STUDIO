import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";
const defaultProfileImage = "/uploads/barbers/defaultBarber.jpg";
import { resolveUploadImageUrl } from "../../utils/imageUrls";

interface Barber {
    id: number;
    full_name: string;
    specialty: string;
    experience_years: number;
    bio: string;
    introduction?: string;
    profile_image: string;
    is_available: number;
    rating: number | string;
    total_reviews: number | string;
    certifications?: string;
    gcash_qr_code?: string | null;
    default_price?: number | null;
}

interface BarbersProps {
    barber?: Barber | null;
}

export default function Barbers({ barber }: BarbersProps) {
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string };
    };

    const safeBarber: Barber = barber || {
        id: 0,
        full_name: "No barber profile yet",
        specialty: "",
        experience_years: 0,
        bio: "",
        introduction: "",
        profile_image: "",
        is_available: 0,
        rating: 4.9,
        total_reviews: 0,
        certifications: "",
        gcash_qr_code: null,
        default_price: null,
    };

    const [isEditing, setIsEditing] = useState(!barber);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        full_name: safeBarber.full_name,
        specialty: safeBarber.specialty || "",
        experience_years: safeBarber.experience_years || 0,
        bio: safeBarber.bio || "",
        introduction: safeBarber.introduction || "",
        is_available: safeBarber.is_available === 1,
        certifications: safeBarber.certifications || "",
        default_price: safeBarber.default_price ?? "",
        profile_image: null as File | null,
        gcash_qr_code: null as File | null,
    });

    const imageUrl = resolveUploadImageUrl(
        safeBarber.profile_image,
        defaultProfileImage,
        "/uploads/barbers",
    );

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({
                ...formData,
                [e.target.name]: e.target.files[0],
            });
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        const data = new FormData();
        data.append("full_name", formData.full_name);
        data.append("specialty", formData.specialty);
        data.append("experience_years", formData.experience_years.toString());
        data.append("bio", formData.bio);
        data.append("introduction", formData.introduction);
        data.append("certifications", formData.certifications);
        data.append("is_available", formData.is_available ? "1" : "0");
        data.append("action", safeBarber.id ? "edit" : "add");
        data.append("id", safeBarber.id.toString());
        if (formData.profile_image) {
            data.append("profile_image", formData.profile_image);
        }
        if (formData.gcash_qr_code) {
            data.append("gcash_qr_code", formData.gcash_qr_code);
        }
        // include barber-level default price (used only for display/popular views)
        if (formData.default_price !== undefined) {
            data.append("default_price", String(formData.default_price || ""));
        }

        router.post(`/admin/barbers/${safeBarber.id}`, data, {
            onSuccess: () => {
                setIsEditing(false);
                setErrorMessage(null);
                router.reload();
            },
            onError: (errors) => {
                setErrorMessage(
                    typeof errors === "string"
                        ? errors
                        : Object.values(errors).join(", "),
                );
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleToggleStatus = () => {
        const data = new FormData();
        data.append("action", "toggle_status");
        data.append("id", safeBarber.id.toString());
        data.append("current_status", safeBarber.is_available.toString());

        router.post(`/admin/barbers/${safeBarber.id}`, data, {
            onSuccess: () => {
                setErrorMessage(null);
                router.reload();
            },
            onError: (errors) => {
                console.error("Toggle status error:", errors);
                setErrorMessage(
                    typeof errors === "string"
                        ? errors
                        : Object.values(errors).join(", "),
                );
            },
        });
    };

    const getRating = (rating: number | string): number => {
        const parsed =
            typeof rating === "number" ? rating : Number(rating ?? 0);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 4.9;
    };

    const rating = getRating(safeBarber.rating);
    const totalReviews =
        typeof safeBarber.total_reviews === "number"
            ? safeBarber.total_reviews
            : Number(safeBarber.total_reviews || 0);
    const specialties = safeBarber.specialty
        ? safeBarber.specialty
              .split(/[\r\n,;&]+/)
              .map((item) => item.trim())
              .filter(Boolean)
        : [];
    const certifications = safeBarber.certifications
        ? safeBarber.certifications
              .split(/[\r\n,;&]+/)
              .map((item) => item.trim())
              .filter(Boolean)
        : [];

    const renderStars = (rating: number): React.ReactNode[] => {
        const stars: React.ReactNode[] = [];

        if (!isFinite(rating) || rating <= 0) {
            for (let i = 1; i <= 5; i++) {
                stars.push(
                    <span key={i} className="text-gray-300 text-lg">
                        ★
                    </span>,
                );
            }
            return stars;
        }

        const clamped = Math.max(0, Math.min(5, rating));
        const fullStars = Math.floor(clamped);
        const hasHalf = clamped - fullStars >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <span key={i} className="text-yellow-500 text-lg">
                        ★
                    </span>,
                );
            } else if (hasHalf && i === fullStars + 1) {
                stars.push(
                    <span key={i} className="text-yellow-500 text-lg">
                        ★
                    </span>,
                );
            } else {
                stars.push(
                    <span key={i} className="text-gray-300 text-lg">
                        ★
                    </span>,
                );
            }
        }

        return stars;
    };

    return (
        <>
            <Head title={`${safeBarber.full_name} — Admin Barber`} />
            <Sidebar>
                <main className="min-h-screen bg-[#f0ede7]">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {safeBarber.full_name}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {safeBarber.specialty || "Senior Barber"}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-6 py-2.5 bg-black text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-800 transition rounded-lg"
                            >
                                {isEditing
                                    ? "Cancel"
                                    : safeBarber.id
                                      ? "Edit Profile"
                                      : "Create Profile"}
                            </button>
                        </div>

                        {flash?.success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                                {flash.success}
                            </div>
                        )}
                        {flash?.error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                                {flash.error}
                            </div>
                        )}
                        {errorMessage && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                                {errorMessage}
                            </div>
                        )}

                        {isEditing ? (
                            <div className="bg-white rounded-lg shadow-sm p-8">
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Specialty *
                                            </label>
                                            <input
                                                type="text"
                                                name="specialty"
                                                value={formData.specialty}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="e.g., Senior Barber, Fade Specialist"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Experience (years)
                                            </label>
                                            <input
                                                type="number"
                                                name="experience_years"
                                                value={
                                                    formData.experience_years
                                                }
                                                onChange={handleInputChange}
                                                min="0"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Profile Image
                                            </label>
                                            <input
                                                type="file"
                                                name="profile_image"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Leave empty to keep current
                                                image
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Introduction
                                        </label>
                                        <textarea
                                            name="introduction"
                                            value={formData.introduction}
                                            onChange={handleInputChange}
                                            rows={4}
                                            placeholder="Enter the About text shown in the public profile"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Certifications
                                        </label>
                                        <textarea
                                            name="certifications"
                                            value={formData.certifications}
                                            onChange={handleInputChange}
                                            rows={3}
                                            placeholder="Licensed Master Barber\nAdvanced Fade Techniques\nHair Design Specialist"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <p className="text-xs text-gray-400 mt-1">
                                            This price is used only for display
                                            (popular section) and does not
                                            affect booking prices.
                                        </p>
                                    </div>

                                    {/* GCash QR Code Upload */}
                                    <div className="mt-6">
                                        <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                            <input
                                                type="checkbox"
                                                name="is_available"
                                                checked={formData.is_available}
                                                onChange={handleInputChange}
                                                className="w-4 h-4"
                                            />
                                            Available for appointments
                                        </label>
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting
                                                ? "Saving..."
                                                : "Save Changes"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
                                    <div className="md:col-span-1 flex flex-col items-center">
                                        <img
                                            src={imageUrl}
                                            alt={safeBarber.full_name}
                                            className="w-48 h-48 rounded-full object-cover shadow-lg mb-4"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src = defaultProfileImage;
                                            }}
                                        />
                                        <button
                                            onClick={handleToggleStatus}
                                            className={`px-6 py-2 rounded-full font-semibold uppercase tracking-wider transition ${
                                                safeBarber.is_available === 1
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                            }`}
                                        >
                                            {Number(safeBarber.is_available) ==
                                            1
                                                ? "Active"
                                                : "Inactive"}
                                        </button>
                                    </div>

                                    <div className="md:col-span-2">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                            {safeBarber.full_name}
                                        </h2>
                                        <p className="text-lg text-gray-600 mb-4">
                                            {safeBarber.specialty}
                                        </p>

                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="flex gap-1">
                                                {renderStars(rating)}
                                            </div>
                                            <span className="text-xl font-bold text-gray-900">
                                                {rating.toFixed(1)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                                    Experience
                                                </p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {
                                                        safeBarber.experience_years
                                                    }{" "}
                                                    <span className="text-lg">
                                                        years
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                                    Status
                                                </p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {safeBarber.is_available ===
                                                    1
                                                        ? "Available"
                                                        : "Unavailable"}
                                                </p>
                                            </div>
                                        </div>

                                        {specialties.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="font-semibold text-gray-900 mb-2">
                                                    Specialties
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {specialties.map(
                                                        (item, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center rounded-full bg-black text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                                                            >
                                                                {item}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {certifications.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="font-semibold text-gray-900 mb-2">
                                                    Certifications
                                                </h3>
                                                <ul className="space-y-2 text-gray-700">
                                                    {certifications.map(
                                                        (item, index) => (
                                                            <li
                                                                key={index}
                                                                className="flex items-start gap-2"
                                                            >
                                                                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-black" />
                                                                <span>
                                                                    {item}
                                                                </span>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {(safeBarber.introduction ||
                                            safeBarber.bio) && (
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">
                                                    About
                                                </h3>
                                                <p className="text-gray-600 leading-relaxed">
                                                    {safeBarber.introduction ||
                                                        safeBarber.bio}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </Sidebar>
        </>
    );
}
