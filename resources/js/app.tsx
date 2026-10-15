import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

type ConnectionSpeed = "fast" | "medium" | "slow" | "unknown";

function getConnectionSpeed(): ConnectionSpeed {
    const nav = navigator as any;
    const connection =
        nav.connection || nav.mozConnection || nav.webkitConnection;

    if (!connection) return "unknown";

    const effectiveType: string = connection.effectiveType || "";
    const downlink: number = connection.downlink ?? 0;

    if (
        effectiveType === "slow-2g" ||
        effectiveType === "2g" ||
        (downlink > 0 && downlink < 0.5)
    ) {
        return "slow";
    }
    if (effectiveType === "3g" || (downlink >= 0.5 && downlink < 2)) {
        return "medium";
    }
    if (effectiveType === "4g" || downlink >= 2) {
        return "fast";
    }
    return "unknown";
}

function createLoadingScreen() {
    const speed = getConnectionSpeed();

    const messages: Record<ConnectionSpeed, string> = {
        fast: "Loading…",
        medium: "Loading, this may take a moment…",
        slow: "Loading on a slow connection, hang tight…",
        unknown: "Loading…",
    };

    // How long the progress bar animates to ~90% before real render finishes.
    const fillDuration = speed === "slow" ? 7 : speed === "medium" ? 3.5 : 1.2;

    const wrapper = document.createElement("div");
    wrapper.id = "app-boot-loader";
    wrapper.style.cssText = `
        position: fixed;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        background: #ffffff;
        z-index: 9999;
        transition: opacity 0.35s ease;
    `;

    const style = document.createElement("style");
    style.textContent = `
        @keyframes app-boot-spin { to { transform: rotate(360deg); } }
        @keyframes app-boot-fill { 0% { width: 0%; } 100% { width: 90%; } }
    `;

    const spinner = document.createElement("div");
    spinner.style.cssText = `
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid #e5e7eb;
        border-top-color: #4B5563;
        animation: app-boot-spin 0.8s linear infinite;
    `;

    const text = document.createElement("p");
    text.textContent = messages[speed];
    text.style.cssText = `
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        color: #4B5563;
        margin: 0;
    `;

    const barTrack = document.createElement("div");
    barTrack.style.cssText = `
        width: 180px;
        height: 3px;
        background: #e5e7eb;
        border-radius: 999px;
        overflow: hidden;
    `;

    const barFill = document.createElement("div");
    barFill.style.cssText = `
        height: 100%;
        width: 0%;
        background: #4B5563;
        border-radius: 999px;
        animation: app-boot-fill ${fillDuration}s ease-out forwards;
    `;

    barTrack.appendChild(barFill);
    wrapper.append(style, spinner, text, barTrack);
    document.body.appendChild(wrapper);

    return {
        remove: () => {
            wrapper.style.opacity = "0";
            setTimeout(() => wrapper.remove(), 350);
        },
    };
}

const loader = createLoadingScreen();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );

        // Page component + assets are already fetched by the time setup()
        // runs, so it's safe to remove the loader right after mounting.
        requestAnimationFrame(() => loader.remove());
    },
    progress: {
        color: "#4B5563",
    },
});
