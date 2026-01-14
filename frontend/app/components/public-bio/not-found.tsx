import React from "react";
import { Links, Meta, Scripts } from "react-router";

export const BioNotFound = ({ username }: { username: string }) => {
    // Basic construction of main domain URL
    const mainDomain = typeof window !== 'undefined' ? window.location.host : 'portyo.me';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    const claimUrl = `${protocol}//${mainDomain}/sign-up?step=1&sufix=${username}`;

    return (
        <div className="bg-[#F9F4E8] font-sans text-[#171717] min-h-screen">
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="text-center p-8 bg-white shadow-xl rounded-3xl max-w-md w-full border border-[#e5e5e5] relative overflow-hidden">
                    <div className="mb-6 text-6xl animate-bounce">😕</div>
                    <h1 className="text-3xl font-bold mb-3 text-[#171717]">Bio not found</h1>
                    <p className="text-[#737373] mb-8 text-lg">
                        The bio for <span className="font-bold text-[#171717]">@{username}</span> hasn't been created yet.
                    </p>

                    <div className="space-y-4">
                        <p className="text-sm text-[#737373] font-medium uppercase tracking-wide">Is this your brand?</p>
                        <a
                            href={claimUrl}
                            className="block w-full py-4 px-6 bg-[#d2e823] hover:bg-[#c4d922] text-[#171717] font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Claim <span className="underline decoration-2 decoration-black/20">{username}</span> now
                        </a>
                        <a
                            href="/"
                            className="block w-full py-4 px-6 bg-white border-2 border-[#e5e5e5] hover:border-[#d4d4d4] hover:bg-[#f5f5f5] text-[#171717] font-bold rounded-xl transition-all duration-200"
                        >
                            Go to Portyo Home
                        </a>
                    </div>
                </div>

                <div className="mt-8 text-[#737373] text-sm">
                    Powered by <span className="font-bold text-[#171717]">Portyo</span>
                </div>
            </div>
        </div>
    );
};
