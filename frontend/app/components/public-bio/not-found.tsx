import React from "react";

export const BioNotFound = ({ username }: { username: string }) => {
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    const baseUrl = `${protocol}//portyo.me`;
    const cleanUsername = (username || "").replace(/^@+/, "").trim();
    const claimUrl = `${baseUrl}/sign-up?step=1&sufix=${encodeURIComponent(cleanUsername)}`;
    const homeUrl = `${baseUrl}/`;

    return (
        <div className="min-h-screen bg-[#F3F3F1] text-[#1A1A1A] font-sans">
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-[28px] border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-7 sm:p-8 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF7D1] border-2 border-black text-4xl">
                        🥲
                    </div>

                    <p className="inline-flex items-center rounded-full border border-black/15 bg-black/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 mb-4">
                        This username is available
                    </p>

                    <h1 className="text-3xl sm:text-[34px] leading-tight font-black tracking-tight mb-3">
                        Bio not found
                    </h1>

                    <p className="text-[15px] leading-relaxed text-black/60 mb-7">
                        The bio for <span className="font-extrabold text-black">@{cleanUsername}</span> doesn’t exist yet.
                    </p>

                    <div className="space-y-3">
                        <a
                            href={claimUrl}
                            className="block w-full rounded-2xl border-2 border-black bg-[#D2E823] px-6 py-3.5 text-[16px] font-black text-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        >
                            Claim @{cleanUsername}
                        </a>

                        <a
                            href={homeUrl}
                            className="block w-full rounded-2xl border-2 border-black/15 bg-white px-6 py-3.5 text-[15px] font-bold text-[#1A1A1A] transition-colors hover:bg-black/[0.03]"
                        >
                            Go to Portyo Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
