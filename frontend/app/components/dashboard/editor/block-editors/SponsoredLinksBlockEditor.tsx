import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import type { BioBlock } from "~/contexts/bio.context";
import { DollarSign, ExternalLink, ShoppingBag, Loader2 } from "lucide-react";
import * as SponsoredApi from "~/services/sponsored-api";
import type { SponsoredAdoption } from "~/services/sponsored-api";
import BioContext from "~/contexts/bio.context";

interface Props {
    block: BioBlock;
    onChange: (updates: Partial<BioBlock>) => void;
}

export function SponsoredLinksBlockEditor({ block, onChange }: Props) {
    const { bio } = useContext(BioContext);
    const [links, setLinks] = useState<SponsoredAdoption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!bio?.id) return;
        SponsoredApi.fetchMyLinks(bio.id)
            .then(setLinks)
            .catch(() => setLinks([]))
            .finally(() => setLoading(false));
    }, [bio?.id]);

    return (
        <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Links Patrocinados
                </p>
                <p className="text-[10px] text-emerald-600 mt-1">
                    Este bloco exibe automaticamente os links patrocinados que você adotou no Marketplace.
                </p>
            </div>

            {/* Current links */}
            {loading ? (
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
            ) : links.length === 0 ? (
                <div className="text-center py-6">
                    <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Nenhum link patrocinado adotado</p>
                    <p className="text-[10px] text-gray-400 mt-1 mb-3">Visite o Marketplace para adotar ofertas</p>
                    <Link
                        to="/dashboard/sponsored"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                    >
                        <ShoppingBag className="w-3 h-3" />
                        Ir ao Marketplace
                    </Link>
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                        {links.length} link(s) ativo(s)
                    </p>
                    {links.map(link => (
                        <div
                            key={link.id}
                            className="flex items-center gap-2.5 p-2.5 bg-white border-2 border-gray-200 rounded-xl"
                        >
                            {link.offer?.imageUrl ? (
                                <img src={link.offer.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                    style={{ backgroundColor: link.offer?.backgroundColor || "#10b981" }}
                                >
                                    {link.offer?.title?.charAt(0) || "S"}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">{link.offer?.title || "Oferta"}</p>
                                <p className="text-[10px] text-gray-400">{link.totalClicks} clicks · ${Number(link.totalEarnings).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}

                    <Link
                        to="/dashboard/sponsored"
                        className="flex items-center justify-center gap-1.5 w-full py-2 mt-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-colors"
                    >
                        Gerenciar no Marketplace
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            )}
        </div>
    );
}
