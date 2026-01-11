import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { trackQrCodeView } from "~/services/qrcode.service";
import { Loader2 } from "lucide-react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
    return [
        { title: "Redirecting... | Portyo" },
    ];
};

export default function RedirectQrCodePage() {
    const { id: qrcodeId } = useParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const performRedirect = async () => {
            if (!qrcodeId) {
                setError("Invalid QR code");
                return;
            }

            try {
                // Track the view and get destination URL
                const { url } = await trackQrCodeView(qrcodeId);

                // Redirect to destination
                window.location.href = url;
            } catch (err) {
                console.error("Redirect error:", err);
                setError("QR code not found or invalid");
            }
        };

        performRedirect();
    }, [qrcodeId]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                        <span className="text-red-500 text-2xl">✕</span>
                    </div>
                    <h1 className="text-2xl font-bold text-text-main">Oops!</h1>
                    <p className="text-text-muted">{error}</p>
                    <a
                        href="/"
                        className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Go to Homepage
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="text-center space-y-6 p-8">
                <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-text-main">Redirecting...</h1>
                    <p className="text-text-muted">Please wait while we redirect you</p>
                </div>
            </div>
        </div>
    );
}
