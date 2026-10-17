import React, { useState } from "react";
import {
    MapPin,
    Phone,
    Mail,
    Sparkles,
    Clock,
    Navigation,
    Send,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
} from "lucide-react";

function ContactSection() {
    const [formData, setFormData] = useState({
        fullName: "",
        emailAddress: "",
        phoneNumber: "",
        subject: "General Inquiry",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const getCsrfToken = () => {
        const token = document.querySelector<HTMLMetaElement>(
            'meta[name="csrf-token"]',
        );
        return token?.content ?? "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);

        try {
            const response = await fetch("/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    full_name: formData.fullName,
                    email: formData.emailAddress,
                    phone: formData.phoneNumber,
                    subject: formData.subject,
                    message: formData.message,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to send your message right now. Please try again.",
                );
            }

            setFeedback({
                type: "success",
                message: "Thank you! Your message has been sent. We'll be in touch shortly.",
            });
            setFormData({
                fullName: "",
                emailAddress: "",
                phoneNumber: "",
                subject: "General Inquiry",
                message: "",
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to send your message right now.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const googleMapsEmbedUrl =
        "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15243.739649056446!2d120.7644279!3d18.5354311!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3389250052ac37fb%3A0x392b9bf4208125b4!2sBez%20Cuts%20and%20Fades!5e0!3m2!1sen!2sph!4v1700000000000";

    const directionsUrl =
        "https://www.google.com/maps/dir/?api=1&destination=Bez+Cuts+and+Fades&destination_place_id=ChIJ-zeqUgAJkzkRtIEg9JQbKzk";

    return (
        <section className="w-full bg-stone-50/40 py-20 md:py-28 border-b border-neutral-200/70 relative overflow-hidden">
            {/* Ambient background decoration */}
            <div className="absolute bottom-0 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
                {/* SECTION HEADER */}
                <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold tracking-widest uppercase text-amber-900 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Get In Touch</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900 tracking-tight leading-tight">
                        Visit the Studio or Connect
                    </h2>
                    <p className="text-sm sm:text-base text-neutral-600 font-light max-w-md mx-auto leading-relaxed">
                        Walk-ins are always welcome, or send us an inquiry for wedding parties, group bookings, and private sessions.
                    </p>
                </div>

                {/* TWO-COLUMN LAYOUT CONTAINER */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start max-w-6xl mx-auto">
                    {/* LEFT SIDE: STUDIO LOCATION & QUICK CONTACT (5 Columns) */}
                    <div className="lg:col-span-5 flex flex-col gap-5 w-full">
                        {/* Main Location Card */}
                        <div className="p-6 sm:p-7 bg-white border border-stone-200/90 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-5">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                                    <MapPin className="w-6 h-6 stroke-[1.75]" />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                                            BEZ Cuts & Fades
                                        </h3>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                                            Main Studio
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        San Lorenzo, Bangui, Ilocos Norte, Philippines
                                    </p>
                                    <a
                                        href={directionsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold text-neutral-900 hover:text-amber-700 transition-colors inline-flex items-center gap-1.5 mt-2"
                                    >
                                        <Navigation className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Get Driving Directions →</span>
                                    </a>
                                </div>
                            </div>

                            {/* Google Maps Embed */}
                            <div className="w-full h-[220px] rounded-2xl overflow-hidden border border-stone-200/80 shadow-inner relative group/map">
                                <iframe
                                    src={googleMapsEmbedUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Bez Cuts and Fades Location Map"
                                    className="grayscale hover:grayscale-0 transition-all duration-700 w-full h-full"
                                />
                            </div>

                            {/* Hours strip */}
                            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs text-neutral-600">
                                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-neutral-900">
                                        Studio Hours: Mon – Sat: 9:00 AM – 8:00 PM
                                    </span>
                                    <span className="text-[11px] text-neutral-400">
                                        Sunday: By Special Appointment
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Contact Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            {/* Call Us */}
                            <a
                                href="tel:+639123456789"
                                className="flex items-center gap-4 p-5 bg-white border border-stone-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-amber-500/30 transition-all duration-200 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-amber-500/10 text-neutral-700 group-hover:text-amber-600 flex items-center justify-center shrink-0 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Direct Phone
                                    </span>
                                    <span className="text-sm font-bold text-neutral-900 group-hover:text-amber-700 transition-colors">
                                        +63 912 345 6789
                                    </span>
                                    <span className="text-[11px] text-neutral-400">
                                        Tap to call during studio hours
                                    </span>
                                </div>
                            </a>

                            {/* Email Us */}
                            <a
                                href="mailto:bezcutsfades@gmail.com"
                                className="flex items-center gap-4 p-5 bg-white border border-stone-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-amber-500/30 transition-all duration-200 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-amber-500/10 text-neutral-700 group-hover:text-amber-600 flex items-center justify-center shrink-0 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Email Concierge
                                    </span>
                                    <span className="text-sm font-bold text-neutral-900 group-hover:text-amber-700 transition-colors">
                                        bezcutsfades@gmail.com
                                    </span>
                                    <span className="text-[11px] text-neutral-400">
                                        Typical response within 24 hours
                                    </span>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* RIGHT SIDE: MESSAGE INTERACTIVE FORM (7 Columns) */}
                    <div className="lg:col-span-7 w-full p-8 sm:p-10 bg-white border border-stone-200/90 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="mb-8">
                            <h3 className="text-2xl font-serif text-neutral-900 tracking-tight">
                                Send us a Message
                            </h3>
                            <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">
                                Fill in your details below and our team will get back to you promptly.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {/* Row 1: Full Name & Email Address */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-neutral-700">
                                        Full Name <span className="text-amber-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Marcus Vance"
                                        required
                                        className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 text-sm text-neutral-900 rounded-xl placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 transition-all"
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                fullName: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-neutral-700">
                                        Email Address <span className="text-amber-600">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 text-sm text-neutral-900 rounded-xl placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 transition-all"
                                        value={formData.emailAddress}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                emailAddress: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Row 2: Phone & Subject */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-neutral-700">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+63 900 000 0000"
                                        className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 text-sm text-neutral-900 rounded-xl placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 transition-all"
                                        value={formData.phoneNumber}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phoneNumber: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-neutral-700">
                                        Inquiry Subject
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 text-sm text-neutral-900 rounded-xl focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 transition-all cursor-pointer appearance-none pr-10"
                                            value={formData.subject}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    subject: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="General Inquiry">General Inquiry</option>
                                            <option value="Booking Question">Booking & Rescheduling</option>
                                            <option value="Group / Wedding Party">Group & Wedding Packages</option>
                                            <option value="Feedback / Review">Feedback & Compliments</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Message Body */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-neutral-700">
                                    Your Message <span className="text-amber-600">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell us what you have in mind or any questions about hairstyles, timing, or group reservations..."
                                    required
                                    className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 text-sm text-neutral-900 rounded-xl placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 transition-all resize-none"
                                    value={formData.message}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            message: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Feedback Banner */}
                            {feedback && (
                                <div
                                    className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in ${
                                        feedback.type === "success"
                                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                                            : "bg-rose-50 border border-rose-200 text-rose-800"
                                    }`}
                                >
                                    {feedback.type === "success" ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                    )}
                                    <span>{feedback.message}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-2 py-4 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-neutral-800 shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
                            >
                                <Send className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" />
                                <span>{isSubmitting ? "Dispatching..." : "Send Message"}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ContactSection;
