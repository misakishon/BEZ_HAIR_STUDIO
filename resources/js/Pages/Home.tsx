import React from "react";
import Header from "../components/header";
import HeroSection from "../section/HeroSection";
import AchievementsSection from "../section/AchievementsSection";
import PopularSection from "../section/popularSection";
import BarbersSection from "../section/BarbersSection";
import ContactSection from "../section/ContactSection";
import Footer from "../components/footer";
import { Head } from "@inertiajs/react";
import WhyChooseSection from "../section/WhyChooseSection";

interface HomeProps {
    popularHairstyles: Array<{
        id: number;
        name: string;
        duration_minutes: number;
        price: number;
        image_path?: string | null;
        booking_count?: number;
    }>;
    barbers: Array<{
        id: number;
        full_name: string;
        specialty: string;
        rating: number;
        total_reviews: number;
        experience_years: number;
        profile_image: string;
        is_available: number;
        bio: string;
        introduction?: string;
    }>;
}

export default function Home({ popularHairstyles, barbers = [] }: HomeProps) {
    return (
        <>
            <Head title="Premium Haircuts — BEZ Hair Studio" />

            <div className="relative min-h-screen bg-white text-black antialiased">
                <a
                    href="#main-content"
                    className="sr-only z-[100] rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
                >
                    Skip to content
                </a>
                <Header />
                <main id="main-content">
                    <div id="home" className="scroll-mt-20">
                        <HeroSection />
                        <AchievementsSection />
                    </div>
                    <div id="haircut" className="scroll-mt-20">
                        <PopularSection hairstyles={popularHairstyles} />
                    </div>

                    <div id="barbers" className="scroll-mt-20">
                        {/* Pass barbers prop to BarbersSection */}
                        <BarbersSection barbers={barbers} />
                    </div>
                    <div id="why-bez" className="scroll-mt-20">
                        <WhyChooseSection />
                    </div>
                    <div id="contact" className="scroll-mt-20">
                        <ContactSection />
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}
