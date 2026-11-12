import React from "react";
import { Sparkles, Award, ShieldCheck, UserCheck, Star, Quote, CheckCircle2 } from "lucide-react";

interface WhyChooseSectionProps {
    title?: string;
    subtitle?: string;
}

function WhyChooseSection({
    title = "The BEZ Standard",
    subtitle = "What Our Clients Say",
}: WhyChooseSectionProps) {
    const features = [
        {
            icon: <Sparkles className="w-5 h-5 text-black" />,
            title: "Precision Craftsmanship",
            description: "Custom clippers and shears dialed in for immaculate fades, clean tapers, and sharp line-ups.",
        },
        {
            icon: <Award className="w-5 h-5 text-black" />,
            title: "Master Barbers",
            description: "Artisans dedicated to continuous education, trend mastery, and personalized hair sculpting.",
        },
        {
            icon: <ShieldCheck className="w-5 h-5 text-black" />,
            title: "Pristine Sanitation",
            description: "Hospital-grade UV sterilization, fresh sanitized capes, and single-use blades for every client.",
        },
        {
            icon: <UserCheck className="w-5 h-5 text-black" />,
            title: "Tailored Consultation",
            description: "Detailed analysis of your head shape, hair texture, and daily styling routine before each cut.",
        },
    ];

    return (
        <section className="bg-neutral-50 py-20 md:py-28 border-t border-neutral-200 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                    {/* Left Column - Why Choose */}
                    <div className="lg:col-span-7 flex flex-col">
                        <div className="inline-flex items-center gap-2 self-start rounded-full border border-neutral-300 bg-white px-3.5 py-1 text-xs font-semibold tracking-widest uppercase text-black mb-3 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-black" />
                            <span>Why Choose BEZ</span>
                        </div>

                        <h3 className="text-3xl sm:text-4xl font-serif text-black tracking-tight leading-tight mb-4">
                            Excellence in Every Cut, <br className="hidden sm:block" />
                            Comfort in Every Visit.
                        </h3>
                        <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-xl mb-8">
                            We have elevated the traditional barbershop into a modern grooming sanctuary. From bespoke consultations to meticulous scissor work, every detail is engineered for your confidence.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md hover:border-black hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform duration-300">
                                            {feature.icon}
                                        </div>
                                        <h4 className="font-semibold text-sm sm:text-base text-black mb-1.5">
                                            {feature.title}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Client Testimonial & Social Proof Card */}
                    <div className="lg:col-span-5 flex flex-col">
                        <div className="inline-flex items-center gap-2 self-start rounded-full border border-neutral-200 bg-white px-3.5 py-1 text-xs font-semibold tracking-widest uppercase text-black mb-3 shadow-xs">
                            <Quote className="w-3.5 h-3.5 text-black" />
                            <span>Client Voices</span>
                        </div>

                        <h3 className="text-3xl sm:text-4xl font-serif text-black tracking-tight leading-tight mb-4">
                            {subtitle}
                        </h3>
                        <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-8">
                            Read genuine stories from guests who trust BEZ Hair Studio for their everyday style and milestone occasions.
                        </p>

                        {/* Testimonial Feature Card */}
                        <div className="relative bg-white rounded-2xl p-7 sm:p-8 border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300">
                            {/* Decorative background quote mark */}
                            <Quote className="absolute top-6 right-6 w-16 h-16 text-neutral-100 -scale-x-100 pointer-events-none" />

                            {/* Stars rating */}
                            <div className="flex items-center gap-1.5 mb-5 relative z-10">
                                <div className="flex text-black">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-4 h-4 fill-black text-black"
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-semibold text-black bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200 ml-1">
                                    5.0 Verified Review
                                </span>
                            </div>

                            {/* Quote text */}
                            <p className="text-neutral-800 text-sm sm:text-base leading-relaxed italic mb-6 relative z-10 font-serif">
                                “Best haircut experience in Manila, hands down. The barbers take their time to understand your face shape and hair growth pattern. The atmosphere is top-tier and unpretentious.”
                            </p>

                            {/* Author info */}
                            <div className="flex items-center gap-3.5 pt-5 border-t border-neutral-100 relative z-10">
                                <div className="w-11 h-11 rounded-full bg-black text-white font-semibold text-sm flex items-center justify-center shadow-xs">
                                    JS
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-sm text-black">
                                            John Smith
                                        </span>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                                    </div>
                                    <p className="text-xs text-neutral-400">
                                        Executive • Regular Client since 2023
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Trust summary footer */}
                        <div className="mt-4 flex items-center justify-between px-3 py-2 text-xs text-neutral-500">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                                99.4% Repeat Customer Rate
                            </span>
                            <span>• Over 500+ 5-Star Cuts</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default WhyChooseSection;

