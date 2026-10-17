import React from "react";
import { ArrowDown, ArrowRight, MapPin, Star } from "lucide-react";
import { Link } from "@inertiajs/react";
import archImage from "../../assets/positionperson.avif";
import toolsImage from "../../assets/tableSecondimage.jpg";

function HeroSection() {
    return (
        <section className="relative overflow-hidden border-b border-neutral-200/70 bg-[#faf9f6]">
            <div className="mx-auto grid min-h-[calc(100svh-68px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-24">
                <div className="relative z-10 max-w-2xl">
                    <div className="mb-7 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
                        <MapPin
                            aria-hidden="true"
                            className="h-4 w-4 text-amber-700"
                        />
                        <span>Bangui, Ilocos Norte</span>
                    </div>

                    <h1 className="max-w-xl font-serif text-5xl font-medium leading-[1.04] tracking-tight text-neutral-950 sm:text-6xl lg:text-7xl">
                        A better kind of
                        <span className="mt-1 block font-normal italic text-amber-800">
                            barbershop.
                        </span>
                    </h1>

                    <p className="mt-6 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
                        Thoughtful cuts, clean fades, and a relaxed studio
                        experience—tailored to you, every time.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/booking/step-1"
                            className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-neutral-950 px-6 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
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
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white/70 px-6 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-400 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                        >
                            Explore our cuts
                            <ArrowDown
                                aria-hidden="true"
                                className="h-4 w-4"
                            />
                        </a>
                    </div>

                    <div className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-neutral-200 pt-5 text-sm text-neutral-600">
                        <span className="inline-flex items-center gap-1.5">
                            <Star
                                aria-hidden="true"
                                className="h-4 w-4 fill-amber-500 text-amber-500"
                            />
                            <strong className="font-semibold text-neutral-900">
                                4.9 / 5
                            </strong>
                        </span>
                        <span aria-hidden="true" className="text-neutral-300">
                            ·
                        </span>
                        <span>500+ happy clients</span>
                        <span aria-hidden="true" className="text-neutral-300">
                            ·
                        </span>
                        <span>Walk-ins welcome</span>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-lg pb-8 sm:pb-10">
                    <div className="aspect-[4/5] overflow-hidden rounded-t-[48%] rounded-b-3xl bg-neutral-200">
                        <img
                            src={archImage}
                            alt="Barber at work in a calm, modern studio"
                            className="h-full w-full object-cover object-top"
                            fetchPriority="high"
                        />
                    </div>
                    <div className="absolute -bottom-1 left-0 w-32 rounded-2xl border-4 border-[#faf9f6] bg-white shadow-lg sm:-left-8 sm:w-40">
                        <img
                            src={toolsImage}
                            alt="Barber tools ready for a precision cut"
                            className="aspect-square w-full rounded-xl object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                    <div className="absolute bottom-4 right-0 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-xs font-medium text-neutral-700 shadow-md backdrop-blur sm:-right-3 sm:bottom-8">
                        Your style, thoughtfully crafted
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
