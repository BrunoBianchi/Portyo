/**
 * Lightweight browser fingerprinting utility for sponsored link click dedup.
 * NOT a full fingerprint library — just enough uniqueness for anti-fraud.
 * Returns a SHA-256 hex hash of collected signals.
 */

async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function getCanvasFingerprint(): string {
    try {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 50;
        const ctx = canvas.getContext("2d");
        if (!ctx) return "no-canvas";

        ctx.textBaseline = "top";
        ctx.font = "14px Arial";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("Portyo fp", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Portyo fp", 4, 17);

        return canvas.toDataURL();
    } catch {
        return "canvas-error";
    }
}

function collectSignals(): string {
    const signals: string[] = [];

    // Screen
    signals.push(`${screen.width}x${screen.height}`);
    signals.push(`${screen.colorDepth}`);
    signals.push(`${window.devicePixelRatio || 1}`);

    // Navigator
    signals.push(navigator.language || "");
    signals.push(`${navigator.hardwareConcurrency || 0}`);
    signals.push(`${(navigator as any).deviceMemory || 0}`);
    signals.push(navigator.platform || "");

    // Timezone
    signals.push(Intl.DateTimeFormat().resolvedOptions().timeZone || "");
    signals.push(`${new Date().getTimezoneOffset()}`);

    // Touch support
    signals.push(`${navigator.maxTouchPoints || 0}`);

    // Canvas
    signals.push(getCanvasFingerprint());

    // WebGL renderer
    try {
        const gl = document.createElement("canvas").getContext("webgl");
        if (gl) {
            const ext = gl.getExtension("WEBGL_debug_renderer_info");
            if (ext) {
                signals.push(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "");
            }
        }
    } catch {
        signals.push("no-webgl");
    }

    return signals.join("|");
}

let cachedFingerprint: string | null = null;

/**
 * Generate a browser fingerprint hash. Result is cached for the session.
 */
export async function getFingerprint(): Promise<string> {
    if (cachedFingerprint) return cachedFingerprint;

    try {
        const raw = collectSignals();
        cachedFingerprint = await sha256(raw);
        return cachedFingerprint;
    } catch {
        return "fp-error";
    }
}
