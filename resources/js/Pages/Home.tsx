import React from "react";
import Header from "../components/header";
import HeroSection from "../section/HeroSection";
import AchievementsSection from "../section/AchievementsSection";
import PopularSection from "../section/popularSection";
import BarbersSection from "../section/BarbersSection";
import ContactSection from "../section/ContactSection";
import Booking from "./booking";
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
                <Header />
                <main>
                    <div id="home">
                        <HeroSection />
                        <AchievementsSection />
                    </div>
                    <div id="haircut">
                        <PopularSection hairstyles={popularHairstyles} />
                    </div>

                    <div id="barbers">
                        {/* Pass barbers prop to BarbersSection */}
                        <BarbersSection barbers={barbers} />
                    </div>
                    <div id="contact">
                        <ContactSection />
                    </div>
                    <div>
                        <WhyChooseSection />
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}
