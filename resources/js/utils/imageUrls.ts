export function resolveUploadImageUrl(
    imagePath: string | null | undefined,
    fallback: string,
    uploadsFolder = "/uploads/barbers",
): string {
    // fallback for empty values
    if (!imagePath) return fallback;

    const raw = String(imagePath).trim();
    if (!raw) return fallback;

    const lower = raw.toLowerCase();
    const isDefaultFile =
        lower === "default.jpg" ||
        lower === "default.jpeg" ||
        lower === "default.png" ||
        lower.endsWith("/default.jpg") ||
        lower.endsWith("/default.jpeg") ||
        lower.endsWith("/default.png");
    if (isDefaultFile) return fallback;

    // keep absolute URLs as-is
    if (/^(https?:)?\/\//i.test(raw)) return raw;

    // normalize uploadsFolder: ensure it starts with a single slash and has no trailing slash
    let uploads = String(uploadsFolder || "/uploads/barbers").trim();
    if (!uploads.startsWith("/")) uploads = "/" + uploads;
    if (uploads.length > 1 && uploads.endsWith("/")) uploads = uploads.slice(0, -1);

    // if the provided value already contains an /uploads/ segment, return that segment
    const uploadsIndex = raw.indexOf("/uploads/");
    if (uploadsIndex !== -1) {
        const sub = raw.slice(uploadsIndex);
        return sub.startsWith("/") ? sub : "/" + sub;
    }

    // support values starting with uploads/ (without leading slash)
    if (raw.startsWith("uploads/")) return "/" + raw;

    // storage paths (keep as-is)
    if (raw.startsWith("/storage/")) return raw;

    // values that already start with a slash (but not /uploads/) are returned as-is
    if (raw.startsWith("/")) return raw;

    // if it's a bare filename (e.g. image.jpg) prefix with uploads folder
    if (/^[^\/]+\.[a-z0-9]{1,5}$/i.test(raw)) {
        return `${uploads}/${raw}`;
    }

    // fallback to returning the raw value
    return raw;
}
