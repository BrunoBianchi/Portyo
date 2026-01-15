import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { api } from "~/services/api";
import { X, ExternalLink } from "lucide-react";

interface PortfolioItem {
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    order: number;
}

interface PortfolioWidgetProps {
    bioId: string;
    title?: string;
}

export function PortfolioWidget({ bioId, title = "Portfólio" }: PortfolioWidgetProps) {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await api.get(`/portfolio/${bioId}`);
                setItems(res.data);
            } catch (error) {
                console.error("Failed to fetch portfolio:", error);
            } finally {
                setLoading(false);
            }
        };

        if (bioId) {
            fetchItems();
        }
    }, [bioId]);

    if (loading || items.length === 0) {
        return null;
    }

    return (
        <>
            <div className="w-full">
                {/* Section Title */}
                {title && (
                    <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">{title}</h3>
                )}

                {/* Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 text-left"
                        >
                            {/* Image */}
                            <div className="aspect-square bg-gray-100 overflow-hidden">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                        <span className="text-3xl font-bold text-gray-300">
                                            {item.title[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Title Overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                                <p className="text-white font-medium text-sm line-clamp-2 drop-shadow-sm">
                                    {item.title}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedItem && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal */}
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Image */}
                        {selectedItem.image && (
                            <div className="aspect-video bg-gray-100">
                                <img
                                    src={selectedItem.image}
                                    alt={selectedItem.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {selectedItem.title}
                            </h3>

                            {selectedItem.description && (
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {selectedItem.description}
                                </p>
                            )}

                            <button
                                onClick={() => setSelectedItem(null)}
                                className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
