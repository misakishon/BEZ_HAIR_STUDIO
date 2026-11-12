import React from "react";
import { ArrowDown, ArrowRight, Star } from "lucide-react";
import { Link } from "@inertiajs/react";
import bezHeroBg from "../../assets/bez-hero-bg.jpg";

function HeroSection() {
    return (
        <section className="relative w-full overflow-hidden border-b border-neutral-200 bg-white">
            <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 pt-12 pb-14 text-center sm:px-8 sm:pt-16 sm:pb-20 lg:pt-16 lg:pb-24">
                {/* Central BEZ Logo: Trimmed, High-Res, 280-320px mobile / 400-480px desktop */}
                <div className="w-full max-w-[290px] min-[400px]:max-w-[320px] sm:max-w-[380px] md:max-w-[440px] lg:max-w-[480px] select-none mx-auto mb-6 sm:mb-7">
                    <img
                        src={bezHeroBg}
                        alt="BEZ Hair Studio"
                        className="h-auto w-full object-contain mx-auto select-none"
                        style={{
                            imageRendering: "-webkit-optimize-contrast",
                        }}
                    />
                </div>

                {/* Editorial Content & Booking CTA */}
                <div className="mx-auto w-full max-w-3xl">
                    <h1 className="font-serif text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl md:text-5xl lg:text-6xl leading-[1.08]">
                        A better kind of{" "}
                        <span className="font-normal italic text-black">
                            barbershop.
                        </span>
                    </h1>

                    <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base md:text-lg text-neutral-600 leading-relaxed sm:leading-8">
                        Thoughtful cuts, clean fades, and a relaxed studio
                        experience—tailored to you, every time.
                    </p>

                    {/* Action Buttons: Full-width on mobile, spacious horizontal on desktop */}
                    <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-5">
                        <Link
                            href="/booking/step-1"
                            className="group flex w-full sm:w-auto min-h-[48px] sm:min-h-[52px] items-center justify-center gap-2.5 sm:gap-3 rounded-full bg-black px-7 sm:px-9 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                            Book an appointment
                            <ArrowRight
                                aria-hidden="true"
                                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </Link>
                        <a
                            href="/#haircut"
                            onClick={(event) => {
                                const styles =
                                    document.getElementById("haircut");
                                if (styles) {
                                    event.preventDefault();
                                    styles.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                    });
                                }
                            }}
                            className="flex w-full sm:w-auto min-h-[48px] sm:min-h-[52px] items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white/95 px-7 sm:px-9 py-3 text-sm font-medium text-neutral-900 backdrop-blur-md transition-colors hover:border-black hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                            Explore our cuts
                            <ArrowDown
                                aria-hidden="true"
                                className="h-4 w-4"
                            />
                        </a>
                    </div>

                    {/* Rating & Social Proof */}
                    <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3 gap-y-1 text-xs sm:text-sm text-neutral-600">
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 font-semibold text-neutral-950">
                            <Star
                                aria-hidden="true"
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-black text-black"
                            />
                            4.9 / 5
                        </span>
                        <span aria-hidden="true" className="text-neutral-300">
                            ·
                        </span>
                        <span>500+ happy clients</span>
                        <span aria-hidden="true" className="text-neutral-300">
                            ·
                        </span>
                        <span>Master Barbers</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
