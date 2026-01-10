import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || error.message;

            // Handle authentication errors
            if (status === 401) {
                console.error("Authentication required:", message);
                // Optionally redirect to login
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
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
    async getHistory() {
        return api.get("/user/billing/history");
    }
}
