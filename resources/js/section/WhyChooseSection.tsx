import React from "react";

interface WhyChooseSectionProps {
    // Optional props for customization
    title?: string;
    subtitle?: string;
}

function WhyChooseSection({
    title = "Why Choose BEZ?",
    subtitle = "What Our Clients Say",
}: WhyChooseSectionProps) {
    const features = [
        {
            icon: "settings",
            title: "Premium Service",
            description: "Top quality tools and professional care.",
        },
        {
            icon: "handshake",
            title: "Expert Barbers",
            description: "Skilled professionals you can trust.",
        },
        {
            icon: "cleaning_services",
            title: "Clean Environment",
            description: "Hygienic and comfortable studio.",
        },
        {
            icon: "person",
            title: "Customer First",
            description: "Service tailored to your needs.",
        },
    ];

    return (
        <section className="bg-[#f5f5f0] py-16 md:py-24 border-t border-neutral-100">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Left Column - Why Choose */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">
                            {title}
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-neutral-100"
                                >
                                    <span className="material-symbols-outlined text-[32px] text-gray-700 block mb-2 select-none">
                                        {feature.icon}
                                    </span>
                                    <h4 className="font-semibold text-sm text-gray-900">
                                        {feature.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 leading-relaxed mt-1">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Testimonial */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">
                            {subtitle}
                        </h3>
                        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-neutral-100 transition-all duration-300 hover:shadow-lg">
                            <div className="flex items-start gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className="w-5 h-5 text-amber-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-sm leading-relaxed text-gray-700 mb-4 italic">
                                "Best haircut experience ever! The barbers are
                                professional and the studio is top-notch. I've
                                been coming here for years and never been
                                disappointed."
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                    JS
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-gray-900">
                                        John Smith
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                                        Regular Client
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default WhyChooseSection;
