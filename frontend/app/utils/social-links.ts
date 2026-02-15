import { normalizeExternalUrl } from "~/utils/security";

const stripAt = (value: string) => value.replace(/^@+/, "").trim();

const hasProtocol = (value: string) => /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value);

const looksLikeDomain = (value: string) => /[a-zA-Z\d-]+\.[a-zA-Z]{2,}/.test(value);

export const normalizeSocialProfileUrl = (platform: string, rawValue: string | undefined | null): string => {
    if (!rawValue) return "#";

    const value = rawValue.trim();
    if (!value) return "#";

    const key = platform.toLowerCase();

    if (key === "email") {
        if (value.startsWith("mailto:")) return value;
        return `mailto:${value}`;
    }

    if (key === "whatsapp") {
        const digits = value.replace(/\D/g, "");
        return digits ? `https://wa.me/${digits}` : "#";
    }

    if (key === "telegram") {
        if (value.startsWith("@")) return `https://t.me/${stripAt(value)}`;
        if (hasProtocol(value) || looksLikeDomain(value)) return normalizeExternalUrl(value);
        return `https://t.me/${value}`;
    }

    if (key === "website") {
        return normalizeExternalUrl(value);
    }

    if (hasProtocol(value) || looksLikeDomain(value)) {
        return normalizeExternalUrl(value);
    }

    const username = stripAt(value);
    if (!username) return "#";

    switch (key) {
        case "instagram":
            return `https://instagram.com/${username}`;
        case "twitter":
        case "x":
            return `https://x.com/${username}`;
        case "tiktok":
            return `https://tiktok.com/@${username}`;
        case "linkedin":
            if (username.startsWith("in/") || username.startsWith("company/")) {
                return `https://linkedin.com/${username}`;
            }
            return `https://linkedin.com/in/${username}`;
        case "github":
            return `https://github.com/${username}`;
        case "youtube":
            if (username.startsWith("@") || username.startsWith("channel/") || username.startsWith("c/") || username.startsWith("user/")) {
                return `https://youtube.com/${username}`;
            }
            return `https://youtube.com/@${username}`;
        case "facebook":
            return `https://facebook.com/${username}`;
        case "threads":
            return `https://threads.net/@${username}`;
        case "twitch":
            return `https://twitch.tv/${username}`;
        case "pinterest":
            return `https://pinterest.com/${username}`;
        case "snapchat":
            return `https://snapchat.com/add/${username}`;
        case "discord":
            return `https://discord.gg/${username}`;
        case "dribbble":
            return `https://dribbble.com/${username}`;
        case "behance":
            return `https://behance.net/${username}`;
        default:
            return normalizeExternalUrl(value);
    }
};
