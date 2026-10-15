import { useEffect } from "react";

function Footer() {
    useEffect(() => {
        // Check if the link already exists to avoid duplicate
        const linkExists = document.querySelector(
            'link[href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"]',
        );

        if (!linkExists) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href =
                "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
            document.head.appendChild(link);
        }
    }, []);

    return (
        <footer className="bg-black text-white py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-3 gap-8">
                <div>
                    <div className="text-2xl font-extrabold mb-2">
                        BEZ<span className="text-gray-500">.</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">
                        Hair Studio
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        BEZ Hair Studio is your destination for premium haircuts
                        and fades.
                    </p>
                </div>

                <div>
                    <h4 className="text-[11px] uppercase tracking-wider text-gray-400 mb-4">
                        Quick Links
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li>
                            <a href="/" className="hover:text-white transition">
                                Home
                            </a>
                        </li>
                        <li>
                            <a
                                href="/hairstyles"
                                className="hover:text-white transition"
                            >
                                Hairstyles
                            </a>
                        </li>
                        <li>
                            <a
                                href="/barbers"
                                className="hover:text-white transition"
                            >
                                Barbers
                            </a>
                        </li>
                        <li>
                            <a
                                href="/booking/step-1"
                                className="hover:text-white transition"
                            >
                                Book Appointment
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-[11px] uppercase tracking-wider text-gray-400 mb-4">
                        Contact
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl text-gray-400 w-6 select-none">
                                location_on
                            </span>
                            <span>123 Main Street, City</span>
                        </li>

                        <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl text-gray-400 w-6 select-none">
                                call
                            </span>
                            <span>(555) 123-4567</span>
                        </li>

                        <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl text-gray-400 w-6 select-none">
                                mail
                            </span>
                            <span>bezcutsfades@gmail.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 pt-8 border-t border-white/10">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    &copy; 2024 BEZ Hair Studio. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;
