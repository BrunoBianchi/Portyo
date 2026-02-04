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
            <div className="min-h-screen flex items-center justify-center bg-[#F3F3F1] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="text-center space-y-4 p-8 bg-white border-4 border-black rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full mx-4">
                    <div className="w-20 h-20 rounded-2xl bg-red-100 border-4 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-black text-4xl font-black">✕</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Oops!</h1>
                        <p className="text-gray-600 mt-2 font-medium">{error}</p>
                    </div>
                    <a
                        href="/"
                        className="inline-flex mt-6 px-8 py-3 bg-[#E94E77] text-white border-2 border-black rounded-xl font-black uppercase tracking-wide hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                    >
                        Go to Homepage
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F3F3F1] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="text-center space-y-8 p-12 bg-white border-4 border-black rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full mx-4">
                <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-[#C6F035] rounded-full border-4 border-black animate-ping opacity-20"></div>
                    <div className="relative w-20 h-20 bg-[#C6F035] rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Loader2 className="w-8 h-8 animate-spin text-black stroke-[3px]" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Redirecting...</h1>
                    <p className="text-gray-600 font-bold text-sm">Please wait while we redirect you</p>
                </div>
            </div>
        </div>
    );
}
