import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";
import AdminToast, { ToastMessage } from "../../components/AdminToast";
import { resolveUploadImageUrl } from "../../utils/imageUrls";
import {
    Award,
    CheckCircle2,
    Clock,
    Edit3,
    Image as ImageIcon,
    QrCode,
    Save,
    Sparkles,
    Star,
    UploadCloud,
    UserCheck,
    X,
    Scissors,
    FileText,
    Tag,
} from "lucide-react";

const defaultProfileImage = "/uploads/barbers/defaultBarber.jpg";

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
    const [toast, setToast] = useState<ToastMessage | null>(() => {
        if (flash?.success) return { text: flash.success, type: "success" };
        if (flash?.error) return { text: flash.error, type: "error" };
        return null;
    });

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

    const [previewProfileUrl, setPreviewProfileUrl] = useState<string | null>(null);
    const [previewQrUrl, setPreviewQrUrl] = useState<string | null>(null);

    const imageUrl = resolveUploadImageUrl(
        safeBarber.profile_image,
        defaultProfileImage,
        "/uploads/barbers",
    );

    const qrCodeUrl = safeBarber.gcash_qr_code
        ? resolveUploadImageUrl(
              safeBarber.gcash_qr_code,
              "",
              "/uploads/qrcode",
          )
        : null;

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            setFormData((prev) => ({
                ...prev,
                [name]: file,
            }));
            const url = URL.createObjectURL(file);
            if (name === "profile_image") {
                setPreviewProfileUrl(url);
            } else if (name === "gcash_qr_code") {
                setPreviewQrUrl(url);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

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
        if (formData.default_price !== undefined) {
            data.append("default_price", String(formData.default_price || ""));
        }

        router.post(`/admin/barbers/${safeBarber.id}`, data, {
            onSuccess: () => {
                setIsEditing(false);
                setToast({ text: "Barber profile updated successfully.", type: "success" });
                router.reload();
            },
            onError: (errors) => {
                const message =
                    typeof errors === "string"
                        ? errors
                        : Object.values(errors).join(", ");
                setToast({ text: message || "Failed to save profile changes.", type: "error" });
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
                setToast({
                    text: `Barber status set to ${safeBarber.is_available === 1 ? "Unavailable" : "Available"}.`,
                    type: "info",
                });
                router.reload();
            },
            onError: (errors) => {
                console.error("Toggle status error:", errors);
                const message =
                    typeof errors === "string"
                        ? errors
                        : Object.values(errors).join(", ");
                setToast({ text: message || "Failed to toggle status.", type: "error" });
            },
        });
    };

    const getRating = (rating: number | string): number => {
        const parsed = typeof rating === "number" ? rating : Number(rating ?? 0);
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

    return (
        <>
            <Head title={`${safeBarber.full_name} — Admin Barber`} />
            <Sidebar>
                <main className="min-h-screen bg-[#f8f7f4] text-stone-900">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Header Navigation / Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
                                    <Scissors className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Staff & Artist Profile</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                                    {isEditing ? (safeBarber.id ? "Edit Barber Profile" : "Create Barber Profile") : safeBarber.full_name}
                                </h1>
                                <p className="text-sm text-stone-500 mt-1">
                                    {isEditing
                                        ? "Configure your public barber profile, specialties, and booking availability."
                                        : (safeBarber.specialty || "Senior Master Barber")}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {isEditing ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setPreviewProfileUrl(null);
                                            setPreviewQrUrl(null);
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-stone-50 transition shadow-sm"
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-amber-300 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition shadow-sm hover:shadow"
                                    >
                                        <Edit3 className="h-4 w-4 text-amber-400" />
                                        {safeBarber.id ? "Edit Profile" : "Create Profile"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content Area */}
                        {isEditing ? (
                            /* EDIT FORM */
                            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 sm:p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Section 1: Basic Information */}
                                    <div>
                                        <h3 className="text-base font-bold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
                                            <UserCheck className="h-4 w-4 text-amber-500" />
                                            Basic Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                                    Full Name <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-900 text-sm transition"
                                                    placeholder="e.g. Marcus Vance"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                                    Primary Specialty <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="specialty"
                                                    value={formData.specialty}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="e.g., Senior Barber, Fade Specialist"
                                                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-900 text-sm transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                                    Experience (Years)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="experience_years"
                                                    value={formData.experience_years}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-900 text-sm transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                                    Default Price (₱) <span className="text-stone-400 font-normal">(Display only)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="default_price"
                                                    value={formData.default_price}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="e.g., 350.00"
                                                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-900 text-sm transition"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Narrative & Certifications */}
                                    <div>
                                        <h3 className="text-base font-bold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-amber-500" />
                                            Profile Story & Credentials
                                        </h3>
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                                    Short Introduction (About Headline)
                                                </label>
                                                <textarea
                                                    name="introduction"
                                                    value={formData.introduction}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    placeholder="Enter a compelling brief introduction shown prominently on the storefront..."
                                                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-900 text-sm transition resize-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                                    Full Biography & Background
                                                </label>
                                                <textarea
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                    rows={4}
                                                    placeholder="Describe years of barbering experience, cutting philosophy, and client care approach..."
                                                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-900 text-sm transition resize-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                                                    Certifications & Honors (one per line or comma-separated)
                                                </label>
                                                <textarea
                                                    name="certifications"
                                                    value={formData.certifications}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    placeholder="Licensed Master Barber&#10;Advanced Fade Techniques Certification&#10;Precision Scissor Work Masterclass"
                                                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-900 text-sm transition resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Media & Payment */}
                                    <div>
                                        <h3 className="text-base font-bold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-amber-500" />
                                            Media & GCash QR Code
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Profile Photo */}
                                            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-2">
                                                    <UploadCloud className="h-4 w-4 text-amber-600" />
                                                    Barber Portrait
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={previewProfileUrl || imageUrl}
                                                        alt="Portrait Preview"
                                                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-sm"
                                                    />
                                                    <div className="flex-1">
                                                        <input
                                                            type="file"
                                                            name="profile_image"
                                                            id="profile_image_input"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                        />
                                                        <label
                                                            htmlFor="profile_image_input"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer transition shadow-xs"
                                                        >
                                                            Select Image
                                                        </label>
                                                        <p className="text-[11px] text-stone-400 mt-1">
                                                            JPG or PNG. Square ratio recommended.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* GCash QR Code */}
                                            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-2">
                                                    <QrCode className="h-4 w-4 text-amber-600" />
                                                    GCash Payment QR Code
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    {previewQrUrl || qrCodeUrl ? (
                                                        <img
                                                            src={previewQrUrl || qrCodeUrl!}
                                                            alt="QR Preview"
                                                            className="w-16 h-16 rounded-xl object-contain bg-white border border-stone-200 p-1 shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400">
                                                            <QrCode className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <input
                                                            type="file"
                                                            name="gcash_qr_code"
                                                            id="gcash_qr_input"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                        />
                                                        <label
                                                            htmlFor="gcash_qr_input"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer transition shadow-xs"
                                                        >
                                                            Upload QR
                                                        </label>
                                                        <p className="text-[11px] text-stone-400 mt-1">
                                                            Used by clients to scan and pay on checkout.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 4: Availability */}
                                    <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/40 flex items-center justify-between">
                                        <div>
                                            <span className="block text-sm font-bold text-stone-900">
                                                Active Booking Status
                                            </span>
                                            <span className="text-xs text-stone-500">
                                                When enabled, clients can book appointments with this barber.
                                            </span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="is_available"
                                                checked={formData.is_available}
                                                onChange={handleInputChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                        </label>
                                    </div>

                                    {/* Submit actions */}
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setPreviewProfileUrl(null);
                                                setPreviewQrUrl(null);
                                            }}
                                            className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-stone-50 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-amber-300 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition shadow-sm disabled:opacity-50"
                                        >
                                            <Save className="h-4 w-4 text-amber-400" />
                                            {isSubmitting ? "Saving Changes..." : "Save Profile"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            /* READ ONLY MODERN LUXURY PROFILE */
                            <div className="space-y-6">
                                {/* Profile Banner Card */}
                                <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                        <div className="relative">
                                            <img
                                                src={imageUrl}
                                                alt={safeBarber.full_name}
                                                className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-md border-2 border-stone-100"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = defaultProfileImage;
                                                }}
                                            />
                                            <span
                                                className={`absolute bottom-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-xs ${
                                                    Number(safeBarber.is_available) === 1
                                                        ? "bg-emerald-500 text-white border-emerald-400"
                                                        : "bg-rose-500 text-white border-rose-400"
                                                }`}
                                            >
                                                {Number(safeBarber.is_available) === 1 ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                                                        {safeBarber.full_name}
                                                    </h2>
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                                                        <Scissors className="h-3 w-3 text-amber-600" />
                                                        {safeBarber.specialty || "Master Barber"}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleToggleStatus}
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition border shadow-xs ${
                                                        Number(safeBarber.is_available) === 1
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                            : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                                                    }`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${Number(safeBarber.is_available) === 1 ? "bg-emerald-500" : "bg-stone-400"}`} />
                                                    {Number(safeBarber.is_available) === 1 ? "Accepting Bookings" : "Temporarily Paused"}
                                                </button>
                                            </div>

                                            {/* Rating Stars */}
                                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-4">
                                                <div className="flex items-center text-amber-400">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${
                                                                star <= Math.round(rating)
                                                                    ? "fill-amber-400 text-amber-400"
                                                                    : "text-stone-300"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-bold text-stone-900">
                                                    {rating.toFixed(1)}
                                                </span>
                                                <span className="text-xs text-stone-400">
                                                    ({totalReviews} reviews)
                                                </span>
                                            </div>

                                            {safeBarber.introduction && (
                                                <p className="text-sm text-stone-600 mt-4 leading-relaxed max-w-2xl">
                                                    "{safeBarber.introduction}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Cards Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
                                        <div className="flex items-center justify-between text-stone-400 mb-2">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                                                Experience
                                            </span>
                                            <Award className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <div className="text-2xl font-bold text-stone-900">
                                            {safeBarber.experience_years}{" "}
                                            <span className="text-xs font-normal text-stone-500">Years</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
                                        <div className="flex items-center justify-between text-stone-400 mb-2">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                                                Rating Score
                                            </span>
                                            <Star className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <div className="text-2xl font-bold text-stone-900">
                                            {rating.toFixed(1)}
                                            <span className="text-xs font-normal text-stone-500"> / 5.0</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
                                        <div className="flex items-center justify-between text-stone-400 mb-2">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                                                Base Rate
                                            </span>
                                            <Tag className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <div className="text-2xl font-bold text-stone-900">
                                            {safeBarber.default_price ? `₱${Number(safeBarber.default_price).toFixed(2)}` : "Tiered"}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
                                        <div className="flex items-center justify-between text-stone-400 mb-2">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                                                Status
                                            </span>
                                            <Clock className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <div className={`text-base font-bold ${safeBarber.is_available === 1 ? "text-emerald-600" : "text-stone-500"}`}>
                                            {safeBarber.is_available === 1 ? "Available" : "Unavailable"}
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Sections Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Left 2 Cols: Biography & Credentials */}
                                    <div className="md:col-span-2 space-y-6">
                                        {/* Biography */}
                                        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-amber-500" />
                                                Professional Bio
                                            </h3>
                                            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                                                {safeBarber.bio || "No detailed biography written yet. Click 'Edit Profile' to add background information."}
                                            </p>
                                        </div>

                                        {/* Specialties */}
                                        {specialties.length > 0 && (
                                            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6">
                                                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                                    Signature Skills & Specialties
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {specialties.map((item, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 text-stone-800 px-3 py-1.5 text-xs font-semibold border border-stone-200/80"
                                                        >
                                                            <Scissors className="h-3 w-3 text-amber-600" />
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Certifications */}
                                        {certifications.length > 0 && (
                                            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6">
                                                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-2">
                                                    <Award className="h-4 w-4 text-amber-500" />
                                                    Certifications & Honors
                                                </h3>
                                                <ul className="space-y-2.5">
                                                    {certifications.map((item, index) => (
                                                        <li
                                                            key={index}
                                                            className="flex items-center gap-2.5 text-xs text-stone-700 font-medium"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right 1 Col: GCash Payment Card */}
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-2">
                                                <QrCode className="h-4 w-4 text-amber-500" />
                                                GCash QR Code
                                            </h3>
                                            <p className="text-xs text-stone-500 mb-4">
                                                Shown to customers during checkout for cashless digital payments.
                                            </p>
                                            {qrCodeUrl ? (
                                                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col items-center">
                                                    <img
                                                        src={qrCodeUrl}
                                                        alt="GCash QR Code"
                                                        className="w-48 h-48 object-contain bg-white rounded-lg p-2 border border-stone-200 shadow-sm"
                                                    />
                                                    <span className="text-[11px] font-semibold text-stone-400 mt-2">
                                                        Active QR Code
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="bg-stone-50 rounded-xl border border-dashed border-stone-300 p-8 text-center">
                                                    <QrCode className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                                                    <p className="text-xs text-stone-400">
                                                        No QR Code uploaded yet.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditing(true)}
                                                        className="mt-3 text-xs font-semibold text-amber-600 hover:underline"
                                                    >
                                                        Upload QR Code
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </Sidebar>

            {/* Reusable Toast */}
            {toast && (
                <AdminToast
                    toast={toast}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}
