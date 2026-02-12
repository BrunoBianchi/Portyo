import React, { useEffect, useState } from "react";
import type { BlockComponentProps } from "./types";
import { fetchBioSponsoredLinks, type SponsoredLinkPublic } from "~/services/sponsored-api";
import { DollarSign, ExternalLink, Sparkles } from "lucide-react";

export function SponsoredLinksBlock({ block, bioId }: BlockComponentProps) {
    const [links, setLinks] = useState<SponsoredLinkPublic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!bioId) return;
        fetchBioSponsoredLinks(bioId)
            .then(setLinks)
            .catch(() => setLinks([]))
            .finally(() => setLoading(false));
    }, [bioId]);

    if (loading) {
        return (
            <div className="w-full flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (links.length === 0) return null;

    const apiBase = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <div className="w-full space-y-2.5">
            {/* Sponsored badge */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium">
                <Sparkles className="w-3 h-3" />
                Patrocinado
            </div>

            {links.map(link => {
                const clickUrl = `${apiBase}/api/public/sponsored/click/${link.trackingCode}`;
                const offer = link.offer;
                const layout = offer.layout || "card";

                if (layout === "banner") {
                    return (
                        <a
                            key={link.trackingCode}
                            href={clickUrl}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="block w-full rounded-xl overflow-hidden transition-transform hover:scale-[1.01] active:scale-[0.99]"
                            style={{ backgroundColor: offer.backgroundColor || "#10b981" }}
                        >
                            <div className="flex items-center gap-3 px-4 py-3">
                                {offer.imageUrl ? (
                                    <img src={offer.imageUrl} alt={offer.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-black flex-shrink-0">
                                        {offer.title.charAt(0)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate" style={{ color: offer.textColor || "#fff" }}>
                                        {offer.title}
                                    </p>
                                    <p className="text-xs truncate opacity-80" style={{ color: offer.textColor || "#fff" }}>
                                        {offer.description}
                                    </p>
                                </div>
                                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-60" style={{ color: offer.textColor || "#fff" }} />
                            </div>
                        </a>
                    );
                }

                if (layout === "compact") {
                    return (
                        <a
                            key={link.trackingCode}
                            href={clickUrl}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-all"
                        >
                            {offer.imageUrl ? (
                                <img src={offer.imageUrl} alt={offer.title} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                            ) : (
                                <div
                                    className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                                    style={{ backgroundColor: offer.backgroundColor || "#10b981" }}
                                >
                                    {offer.title.charAt(0)}
                                </div>
                            )}
                            <span className="text-sm font-medium text-gray-800 truncate flex-1">{offer.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        </a>
                    );
                }

                // Default: card layout
                return (
                    <a
                        key={link.trackingCode}
                        href={clickUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="block w-full rounded-2xl overflow-hidden border-2 border-gray-100 hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <div
                            className="p-4 flex items-center gap-3"
                            style={{ backgroundColor: offer.backgroundColor || "#10b981" }}
                        >
                            {offer.imageUrl ? (
                                <img src={offer.imageUrl} alt={offer.title} className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 flex-shrink-0" />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                                    {offer.title.charAt(0)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate" style={{ color: offer.textColor || "#fff" }}>
                                    {offer.title}
                                </p>
                                <p className="text-xs truncate opacity-80 mt-0.5" style={{ color: offer.textColor || "#fff" }}>
                                    {offer.description}
                                </p>
                            </div>
                            <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-60" style={{ color: offer.textColor || "#fff" }} />
                        </div>
                    </a>
                );
            })}
        </div>
    );
}
