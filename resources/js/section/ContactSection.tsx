import React, { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";

function ContactSection() {
    const [formData, setFormData] = useState({
        fullName: "",
        emailAddress: "",
        phoneNumber: "",
        subject: "General Inquiry",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

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
                    data.message || "Unable to send your message right now.",
                );
            }

            setFeedback("Your message has been sent successfully.");
            setFormData({
                fullName: "",
                emailAddress: "",
                phoneNumber: "",
                subject: "General Inquiry",
                message: "",
            });
        } catch (error) {
            setFeedback(
                error instanceof Error
                    ? error.message
                    : "Unable to send your message right now.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Google Maps embed URL for Bez Cuts and Fades
    const googleMapsEmbedUrl =
        "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15243.739649056446!2d120.7644279!3d18.5354311!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3389250052ac37fb%3A0x392b9bf4208125b4!2sBez%20Cuts%20and%20Fades!5e0!3m2!1sen!2sph!4v1700000000000";

    // Google Maps directions URL
    const directionsUrl =
        "https://www.google.com/maps/dir/?api=1&destination=Bez+Cuts+and+Fades&destination_place_id=ChIJ-zeqUgAJkzkRtIEg9JQbKzk";

    return (
        <section className="w-full bg-white py-16 md:py-24 border-b border-neutral-100">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
                {/* SECTION HEADER */}
                <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
                    <span className="text-xs font-semibold tracking-[0.30em] text-neutral-400 uppercase">
                        Get in Touch
                    </span>
                    <h2 className="text-3xl md:text-4xl font-normal text-black tracking-tight uppercase">
                        Contact Bez
                    </h2>
                    <p className="text-sm text-neutral-500 font-light max-w-sm mx-auto leading-relaxed">
                        Have a question about a service, availability, or
                        booking? Reach out to us.
                    </p>
                </div>

                {/* TWO-COLUMN LAYOUT CONTAINER */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
                    {/* LEFT SIDE: DIRECT CONTACT DETAILS (5 Columns) */}
                    <div className="lg:col-span-5 flex flex-col gap-4 w-full">
                        {/* Visit Us with Google Maps */}
                        <div className="flex flex-col gap-4 p-5 border border-neutral-100 rounded-md bg-white">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-neutral-50 text-black rounded-md shrink-0">
                                    <MapPin className="w-4 h-4 stroke-[1.5]" />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <h3 className="text-sm font-semibold text-black tracking-tight">
                                        Visit Us
                                    </h3>
                                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                                        Bez Cuts and Fades
                                        <br />
                                        San Lorenzo, Bangui, Ilocos Norte
                                    </p>
                                    <a
                                        href={directionsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] font-medium uppercase tracking-wider text-black mt-1 hover:underline inline-flex items-center"
                                    >
                                        Get Directions →
                                    </a>
                                </div>
                            </div>

                            {/* Google Maps Embed */}
                            <div className="w-full h-[200px] rounded-md overflow-hidden border border-neutral-100">
                                <iframe
                                    src={googleMapsEmbedUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Bez Cuts and Fades Location Map"
                                    className="grayscale hover:grayscale-0 transition-all duration-500"
                                />
                            </div>

                            {/* Location Details */}
                            <div className="flex flex-col gap-1 text-[10px] text-neutral-400">
                                <span className="font-medium text-neutral-500">
                                    Exact Location:
                                </span>
                                <span>
                                    Bez Cuts and Fades, San Lorenzo, Bangui,
                                    Ilocos Norte
                                </span>
                                <span className="text-[9px]">
                                    Coordinates: 18.5354311, 120.7644279
                                </span>
                            </div>
                        </div>

                        {/* Call Us */}
                        <div className="flex items-start gap-4 p-5 border border-neutral-100 rounded-md bg-white">
                            <div className="p-2.5 bg-neutral-50 text-black rounded-md shrink-0">
                                <Phone className="w-4 h-4 stroke-[1.5]" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-semibold text-black tracking-tight">
                                    Call Us
                                </h3>
                                <p className="text-sm font-normal text-black tracking-tight">
                                    +63 912 345 6789
                                </p>
                                <p className="text-[11px] text-neutral-400 font-light">
                                    Mon-Sat: 9AM - 8PM
                                </p>
                            </div>
                        </div>

                        {/* Email Us */}
                        <div className="flex items-start gap-4 p-5 border border-neutral-100 rounded-md bg-white">
                            <div className="p-2.5 bg-neutral-50 text-black rounded-md shrink-0">
                                <Mail className="w-4 h-4 stroke-[1.5]" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-semibold text-black tracking-tight">
                                    Email Us
                                </h3>
                                <a
                                    href="mailto:bezcutsfades@gmail.com"
                                    className="text-sm font-normal text-black tracking-tight hover:underline"
                                >
                                    bezcutsfades@gmail.com
                                </a>
                                <p className="text-[11px] text-neutral-400 font-light">
                                    Response within 24 hours
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: MESSAGE INTERACTIVE FORM (7 Columns) */}
                    <div className="lg:col-span-7 w-full p-6 sm:p-8 border border-neutral-100 rounded-md bg-white">
                        <h3 className="text-lg font-normal text-black tracking-tight mb-6">
                            Send us a message
                        </h3>

                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-5"
                        >
                            {/* Row 1: Full Name & Email Address */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 text-sm text-black rounded-md placeholder-neutral-300 focus:outline-none focus:border-black transition-colors"
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
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="hello@example.com"
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 text-sm text-black rounded-md placeholder-neutral-300 focus:outline-none focus:border-black transition-colors"
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

                            {/* Row 2: Phone Number */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 text-sm text-black rounded-md placeholder-neutral-300 focus:outline-none focus:border-black transition-colors"
                                    value={formData.phoneNumber}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phoneNumber: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Row 3: Subject Dropdown Selection */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                    Subject
                                </label>
                                <select
                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 text-sm text-black rounded-md focus:outline-none focus:border-black transition-colors cursor-pointer appearance-none"
                                    value={formData.subject}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            subject: e.target.value,
                                        })
                                    }
                                >
                                    <option value="General Inquiry">
                                        General Inquiry
                                    </option>
                                    <option value="Booking Question">
                                        Booking Question
                                    </option>
                                    <option value="Feedback / Review">
                                        Feedback / Review
                                    </option>
                                </select>
                            </div>

                            {/* Row 4: Message Body TextArea */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                    Your Message
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell us how we can help..."
                                    required
                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 text-sm text-black rounded-md placeholder-neutral-300 focus:outline-none focus:border-black transition-colors resize-none"
                                    value={formData.message}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            message: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Submit Action Action Trigger */}
                            {feedback ? (
                                <div
                                    className={`text-sm ${feedback.includes("success") ? "text-green-600" : "text-red-600"}`}
                                >
                                    {feedback}
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-2 py-3 bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-md hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-60"
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ContactSection;
