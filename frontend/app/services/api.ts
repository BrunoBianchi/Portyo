import axios from "axios";

export const resolveApiBaseURL = () => {
    let envApiUrl: string | undefined;

    // Vite exposes env vars on import.meta.env; guard for SSR/build contexts.
    if (typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined") {
        envApiUrl = import.meta.env.VITE_API_URL as string | undefined;
    }

    const nodeEnvApiUrl = (typeof process !== "undefined" && process.env?.API_URL) || undefined;

    // In the browser, use same-origin so requests go through the Vite proxy (dev)
    // or nginx proxy (prod) without cross-origin issues.
    let browserBaseUrl: string | undefined;
    if (typeof window !== "undefined" && window.location?.origin) {
        browserBaseUrl = window.location.origin;
    }

    // Prefer envs, then same-origin in browser, then fallback API domain.
    const rawBase = envApiUrl || nodeEnvApiUrl || browserBaseUrl || "https://api.portyo.me";
    const normalized = rawBase.replace(/\/+$/, "");

    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

export const api = axios.create({
    baseURL: resolveApiBaseURL(),
    withCredentials: true
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log(error)
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || error.message;

            // Handle authentication errors
            if (status === 401) {
                const requestUrl = error.config?.url || '';
                const isLoginRequest = requestUrl.includes('/login');
                const isOnAuthPage = typeof window !== 'undefined' && 
                    (window.location.pathname.includes('/login') || window.location.pathname.includes('/sign-up'));

                // Only clear session and redirect when a protected request fails,
                // NOT when a login attempt returns wrong credentials.
                if (!isLoginRequest) {
                    console.error("Authentication required:", message);

                    // Try to clear cookies via logout endpoint
                    api.post('/user/logout').catch(() => {});

                    // Force clear cookies client-side
                    if (typeof document !== 'undefined') {
                        document.cookie = '@App:token=; Max-Age=0; path=/; domain=' + window.location.hostname;
                        document.cookie = '@App:user=; Max-Age=0; path=/; domain=' + window.location.hostname;
                        document.cookie = '@App:token=; Max-Age=0; path=/;';
                        document.cookie = '@App:user=; Max-Age=0; path=/;';
                    }

                    // Redirect to login
                    if (typeof window !== 'undefined' && !isOnAuthPage) {
                        window.location.href = '/login';
                    }
                }
            }

            // Handle authorization/permission errors
            if (status === 403) {
                console.error("Access forbidden:", message);
            }

            // Handle PRO plan required errors
            if (status === 402) {
                console.error("PRO subscription required:", message);
                // Could trigger upgrade modal here
                if (typeof window !== 'undefined') {
                    // Dispatch custom event for upgrade prompt
                    window.dispatchEvent(new CustomEvent('show-upgrade-prompt', {
                        detail: { feature: error.response.data?.feature || 'This feature' }
                    }));
                }
            }

            // Handle not found errors
            if (status === 404) {
                console.error("Resource not found:", message);
            }

            // Handle server errors
            if (status >= 500) {
                console.error("Server error:", message);
            }
        }

        return Promise.reject(error);
    }
);

export const BillingService = {
    async getHistory(page = 1, limit = 10) {
        return api.get(`/user/billing/history?page=${page}&limit=${limit}`);
    }
}
