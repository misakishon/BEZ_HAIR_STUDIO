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
                <main className="min-h-screen bg-[#F5F4EF] text-[#1C1B18]">
                    <div className="studio-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
                        {/* Header Navigation / Action */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-6 border-b border-[#E5E2DA]">
                            <div>
                                <div className="font-morche flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#918E85] mb-1">
                                    <span>Staff & Artist Profile</span>
                                </div>
                                <h1 className="font-morche text-2xl sm:text-3xl font-medium tracking-tight text-[#1C1B18]">
                                    {isEditing ? (safeBarber.id ? "Edit Barber Profile" : "Create Barber Profile") : safeBarber.full_name}
                                </h1>
                                <p className="text-xs sm:text-sm text-[#737069] mt-1">
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
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#DCD8CE] bg-[#FDFCF9] text-xs font-semibold text-[#3D3B36] hover:border-[#252420] hover:bg-[#F3F1EC] transition-all duration-150 active:scale-[0.98]"
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#252420] text-[#FAF9F5] text-xs font-semibold hover:bg-[#373530] transition-all duration-150 active:scale-[0.98]"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                        {safeBarber.id ? "Edit Profile" : "Create Profile"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content Area */}
                        {isEditing ? (
                            /* EDIT FORM */
                            <div className="bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] shadow-[0_1px_2px_rgba(28,27,24,0.03)] p-6 sm:p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Section 1: Basic Information */}
                                    <div>
                                        <h3 className="text-sm font-bold text-[#1C1B18] mb-4 pb-2 border-b border-[#EFECE5] flex items-center gap-2">
                                            <UserCheck className="h-4 w-4 text-[#252420]" />
                                            Basic Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                                    Full Name <span className="text-[#8E3535]">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-2.5 border border-[#E5E2DA] rounded-xl bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-[#1C1B18] text-sm transition-colors"
                                                    placeholder="e.g. Marcus Vance"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                                    Primary Specialty <span className="text-[#8E3535]">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="specialty"
                                                    value={formData.specialty}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="e.g., Senior Barber, Fade Specialist"
                                                    className="w-full px-4 py-2.5 border border-[#E5E2DA] rounded-xl bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-[#1C1B18] text-sm transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                                    Experience (Years)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="experience_years"
                                                    value={formData.experience_years}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    className="w-full px-4 py-2.5 border border-[#E5E2DA] rounded-xl bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-[#1C1B18] text-sm transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                                    Default Price (₱) <span className="text-[#918E85] font-normal">(Display only)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="default_price"
                                                    value={formData.default_price}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="e.g., 350.00"
                                                    className="w-full px-4 py-2.5 border border-[#E5E2DA] rounded-xl bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-[#1C1B18] text-sm transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Narrative & Certifications */}
                                    <div>
                                        <h3 className="text-sm font-bold text-[#1C1B18] mb-4 pb-2 border-b border-[#EFECE5] flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-[#252420]" />
                                            Profile Story & Credentials
                                        </h3>
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                                    Short Introduction (About Headline)
                                                </label>
                                                <textarea
                                                    name="introduction"
                                                    value={formData.introduction}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    placeholder="Enter a compelling brief introduction shown prominently on the storefront..."
                                                    className="w-full px-4 py-2.5 border border-[#E5E2DA] rounded-xl bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-[#1C1B18] text-sm transition-colors resize-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                                    Full Biography & Background
                                                </label>
                                                <textarea
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                    rows={4}
                                                    placeholder="Describe years of barbering experience, cutting philosophy, and client care approach..."
                                                    className="w-full px-4 py-2.5 border border-[#E5E2DA] rounded-xl bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-[#1C1B18] text-sm transition-colors resize-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5953] mb-1.5">
                                                    Certifications & Honors (one per line or comma-separated)
                                                </label>
                                                <textarea
                                                    name="certifications"
                                                    value={formData.certifications}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    placeholder="Licensed Master Barber&#10;Advanced Fade Techniques Certification&#10;Precision Scissor Work Masterclass"
                                                    className="w-full px-4 py-2.5 border border-[#E5E2DA] rounded-xl bg-[#F5F4EF] focus:bg-[#FDFCF9] focus:ring-0 focus:border-[#252420] outline-none text-[#1C1B18] text-sm transition-colors resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Media & Payment */}
                                    <div>
                                        <h3 className="text-sm font-bold text-[#1C1B18] mb-4 pb-2 border-b border-[#EFECE5] flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-[#252420]" />
                                            Media & GCash QR Code
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Profile Photo */}
                                            <div className="p-4 rounded-xl border border-[#E5E2DA] bg-[#F5F4EF]">
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D3B36] mb-2 flex items-center gap-2">
                                                    <UploadCloud className="h-4 w-4 text-[#5C5953]" />
                                                    Barber Portrait
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={previewProfileUrl || imageUrl}
                                                        alt="Portrait Preview"
                                                        className="w-16 h-16 rounded-xl object-cover border border-[#E5E2DA]"
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
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCD8CE] bg-[#FDFCF9] text-xs font-medium text-[#3D3B36] hover:bg-[#EFECE5] cursor-pointer transition-colors"
                                                        >
                                                            Select Image
                                                        </label>
                                                        <p className="text-[11px] text-[#918E85] mt-1">
                                                            JPG or PNG. Square ratio recommended.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* GCash QR Code */}
                                            <div className="p-4 rounded-xl border border-[#E5E2DA] bg-[#F5F4EF]">
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D3B36] mb-2 flex items-center gap-2">
                                                    <QrCode className="h-4 w-4 text-[#5C5953]" />
                                                    GCash Payment QR Code
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    {previewQrUrl || qrCodeUrl ? (
                                                        <img
                                                            src={previewQrUrl || qrCodeUrl!}
                                                            alt="QR Preview"
                                                            className="w-16 h-16 rounded-xl object-contain bg-[#FDFCF9] border border-[#E5E2DA] p-1"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-xl bg-[#EAE7DF] flex items-center justify-center text-[#918E85]">
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
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCD8CE] bg-[#FDFCF9] text-xs font-medium text-[#3D3B36] hover:bg-[#EFECE5] cursor-pointer transition-colors"
                                                        >
                                                            Upload QR
                                                        </label>
                                                        <p className="text-[11px] text-[#918E85] mt-1">
                                                            Used by clients to scan and pay on checkout.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 4: Availability */}
                                    <div className="p-4 rounded-xl border border-[#E5E2DA] bg-[#F5F4EF] flex items-center justify-between">
                                        <div>
                                            <span className="block text-sm font-bold text-[#1C1B18]">
                                                Active Booking Status
                                            </span>
                                            <span className="text-xs text-[#737069]">
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
                                            <div className="w-11 h-6 bg-[#D5D0C5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#FDFCF9] after:border-[#C7C3B9] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#252420]"></div>
                                        </label>
                                    </div>

                                    {/* Submit actions */}
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFECE5]">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setPreviewProfileUrl(null);
                                                setPreviewQrUrl(null);
                                            }}
                                            className="px-5 py-2.5 rounded-full border border-[#DCD8CE] text-xs font-semibold text-[#5C5953] hover:border-[#252420] hover:bg-[#F3F1EC] transition-all duration-150 active:scale-[0.98]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#252420] text-[#FAF9F5] text-xs font-semibold hover:bg-[#373530] transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            <Save className="h-3.5 w-3.5" />
                                            {isSubmitting ? "Saving Changes..." : "Save Profile"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            /* READ ONLY PROFILE */
                            <div className="space-y-6">
                                {/* Profile Banner Card */}
                                <div className="bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] shadow-[0_1px_2px_rgba(28,27,24,0.03)] p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                        <div className="relative">
                                            <img
                                                src={imageUrl}
                                                alt={safeBarber.full_name}
                                                className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover border border-[#E5E2DA]"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = defaultProfileImage;
                                                }}
                                            />
                                            <span
                                                className={`absolute bottom-2 right-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                                    Number(safeBarber.is_available) === 1
                                                        ? "bg-[#252420] text-[#FAF9F5] border-[#33312C]"
                                                        : "bg-[#FDFCF9] text-[#5C5953] border-[#DCD8CE]"
                                                }`}
                                            >
                                                {Number(safeBarber.is_available) === 1 ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1B18]">
                                                        {safeBarber.full_name}
                                                    </h2>
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1.5 rounded-md text-xs font-semibold bg-[#F3F1EC] text-[#3D3B36] border border-[#E5E2DA]">
                                                        <Scissors className="h-3 w-3 text-[#252420]" />
                                                        {safeBarber.specialty || "Master Barber"}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleToggleStatus}
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] border ${
                                                        Number(safeBarber.is_available) === 1
                                                            ? "bg-[#EDF3EC] text-[#2E5A36] border-[#D2E0D0] hover:bg-[#E2ECE1]"
                                                            : "bg-[#F3F1EC] text-[#5C5953] border-[#E5E2DA] hover:bg-[#EAE7DF]"
                                                    }`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${Number(safeBarber.is_available) === 1 ? "bg-[#2E5A36]" : "bg-[#918E85]"}`} />
                                                    {Number(safeBarber.is_available) === 1 ? "Accepting Bookings" : "Temporarily Paused"}
                                                </button>
                                            </div>

                                            {/* Rating Stars */}
                                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-4">
                                                <div className="flex items-center text-[#252420]">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${
                                                                star <= Math.round(rating)
                                                                    ? "fill-[#252420] text-[#252420]"
                                                                    : "text-[#D5D0C5]"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-bold text-[#1C1B18] tabular-nums">
                                                    {rating.toFixed(1)}
                                                </span>
                                                <span className="text-xs text-[#918E85] tabular-nums">
                                                    ({totalReviews} reviews)
                                                </span>
                                            </div>

                                            {safeBarber.introduction && (
                                                <p className="text-sm text-[#5C5953] mt-4 leading-relaxed max-w-2xl">
                                                    "{safeBarber.introduction}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Cards Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] p-5 shadow-[0_1px_2px_rgba(28,27,24,0.03)]">
                                        <div className="flex items-center justify-between text-[#918E85] mb-2">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737069]">
                                                Experience
                                            </span>
                                            <Award className="h-4 w-4 text-[#5C5953]" />
                                        </div>
                                        <div className="text-2xl font-bold text-[#1C1B18] tabular-nums">
                                            {safeBarber.experience_years}{" "}
                                            <span className="text-xs font-normal text-[#737069]">Years</span>
                                        </div>
                                    </div>

                                    <div className="bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] p-5 shadow-[0_1px_2px_rgba(28,27,24,0.03)]">
                                        <div className="flex items-center justify-between text-[#918E85] mb-2">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737069]">
                                                Rating Score
                                            </span>
                                            <Star className="h-4 w-4 text-[#5C5953]" />
                                        </div>
                                        <div className="text-2xl font-bold text-[#1C1B18] tabular-nums">
                                            {rating.toFixed(1)}
                                            <span className="text-xs font-normal text-[#737069]"> / 5.0</span>
                                        </div>
                                    </div>

                                    <div className="bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] p-5 shadow-[0_1px_2px_rgba(28,27,24,0.03)]">
                                        <div className="flex items-center justify-between text-[#918E85] mb-2">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737069]">
                                                Base Rate
                                            </span>
                                            <Tag className="h-4 w-4 text-[#5C5953]" />
                                        </div>
                                        <div className="text-2xl font-bold text-[#1C1B18] tabular-nums">
                                            {safeBarber.default_price ? `₱${Number(safeBarber.default_price).toFixed(2)}` : "Tiered"}
                                        </div>
                                    </div>

                                    <div className="bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] p-5 shadow-[0_1px_2px_rgba(28,27,24,0.03)]">
                                        <div className="flex items-center justify-between text-[#918E85] mb-2">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737069]">
                                                Status
                                            </span>
                                            <Clock className="h-4 w-4 text-[#5C5953]" />
                                        </div>
                                        <div className={`text-base font-bold ${safeBarber.is_available === 1 ? "text-[#2E5A36]" : "text-[#737069]"}`}>
                                            {safeBarber.is_available === 1 ? "Available" : "Unavailable"}
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Sections Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Left 2 Cols: Biography & Credentials */}
                                    <div className="md:col-span-2 space-y-6">
                                        {/* Biography */}
                                        <div className="bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] shadow-[0_1px_2px_rgba(28,27,24,0.03)] p-6">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C5953] mb-3 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-[#252420]" />
                                                Professional Bio
                                            </h3>
                                            <p className="text-sm text-[#3D3B36] leading-relaxed whitespace-pre-line">
                                                {safeBarber.bio || "No detailed biography written yet. Click 'Edit Profile' to add background information."}
                                            </p>
                                        </div>

                                        {/* Specialties */}
                                        {specialties.length > 0 && (
                                            <div className="bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] shadow-[0_1px_2px_rgba(28,27,24,0.03)] p-6">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C5953] mb-3 flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4 text-[#252420]" />
                                                    Signature Skills & Specialties
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {specialties.map((item, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#F5F4EF] text-[#252420] px-3 py-1.5 text-xs font-semibold border border-[#E5E2DA]"
                                                        >
                                                            <Scissors className="h-3 w-3 text-[#5C5953]" />
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Certifications */}
                                        {certifications.length > 0 && (
                                            <div className="bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] shadow-[0_1px_2px_rgba(28,27,24,0.03)] p-6">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C5953] mb-3 flex items-center gap-2">
                                                    <Award className="h-4 w-4 text-[#252420]" />
                                                    Certifications & Honors
                                                </h3>
                                                <ul className="space-y-2.5">
                                                    {certifications.map((item, index) => (
                                                        <li
                                                            key={index}
                                                            className="flex items-center gap-2.5 text-xs text-[#3D3B36] font-medium"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 text-[#2E5A36] shrink-0" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right 1 Col: GCash Payment Card */}
                                    <div className="space-y-6">
                                        <div className="bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] shadow-[0_1px_2px_rgba(28,27,24,0.03)] p-6">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C5953] mb-3 flex items-center gap-2">
                                                <QrCode className="h-4 w-4 text-[#252420]" />
                                                GCash QR Code
                                            </h3>
                                            <p className="text-xs text-[#737069] mb-4">
                                                Shown to customers during checkout for cashless digital payments.
                                            </p>
                                            {qrCodeUrl ? (
                                                <div className="bg-[#F5F4EF] p-4 rounded-xl border border-[#E5E2DA] flex flex-col items-center">
                                                    <img
                                                        src={qrCodeUrl}
                                                        alt="GCash QR Code"
                                                        className="w-48 h-48 object-contain bg-[#FDFCF9] rounded-lg p-2 border border-[#E5E2DA]"
                                                    />
                                                    <span className="text-[11px] font-semibold text-[#918E85] mt-2">
                                                        Active QR Code
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="bg-[#F5F4EF] rounded-xl border border-dashed border-[#D5D0C5] p-8 text-center">
                                                    <QrCode className="h-8 w-8 text-[#C7C3B9] mx-auto mb-2" />
                                                    <p className="text-xs text-[#918E85]">
                                                        No QR Code uploaded yet.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditing(true)}
                                                        className="mt-3 text-xs font-semibold text-[#1C1B18] underline underline-offset-4 hover:opacity-75"
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
