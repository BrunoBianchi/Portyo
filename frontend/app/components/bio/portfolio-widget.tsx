import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { api } from "~/services/api";
import { X, ChevronLeft, ChevronRight, Tag } from "lucide-react";

interface Category {
    id: string;
    name: string;
}

interface PortfolioItem {
    id: string;
    title: string;
    description: string | null;
    images: string[];
    category: Category | null;
    categoryId: string | null;
    order: number;
}

interface PortfolioWidgetProps {
    bioId: string;
    title?: string;
}

export function PortfolioWidget({ bioId, title = "Portfolio" }: PortfolioWidgetProps) {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemsRes, catsRes] = await Promise.all([
                    api.get(`/portfolio/${bioId}`),
                    api.get(`/portfolio/categories/${bioId}`)
                ]);
                setItems(itemsRes.data);
                setCategories(catsRes.data);
            } catch (error) {
                console.error("Failed to fetch portfolio:", error);
            } finally {
                setLoading(false);
            }
        };

        if (bioId) {
            fetchData();
        }
    }, [bioId]);

    // Reset carousel index when selecting new item
    useEffect(() => {
        setCarouselIndex(0);
        setShowLightbox(false);
    }, [selectedItem]);

    const filteredItems = activeFilter
        ? items.filter(item => item.categoryId === activeFilter)
        : items;

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!selectedItem) return;
        setCarouselIndex(prev =>
            prev === 0 ? selectedItem.images.length - 1 : prev - 1
        );
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!selectedItem) return;
        setCarouselIndex(prev =>
            prev === selectedItem.images.length - 1 ? 0 : prev + 1
        );
    };

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

                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                        <button
                            onClick={() => setActiveFilter(null)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeFilter === null
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setActiveFilter(category.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeFilter === category.id
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {filteredItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 text-left"
                        >
                            {/* Image */}
                            <div className="aspect-square bg-gray-100 overflow-hidden">
                                {item.images && item.images.length > 0 ? (
                                    <img
                                        src={item.images[0]}
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

                            {/* Multiple images badge */}
                            {item.images && item.images.length > 1 && (
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-[10px] font-medium">
                                    {item.images.length} photos
                                </div>
                            )}

                            {/* Title Overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                                <p className="text-white font-medium text-sm line-clamp-1 drop-shadow-sm">
                                    {item.title}
                                </p>
                                {item.category && (
                                    <span className="inline-flex items-center gap-1 mt-1 text-white/80 text-[10px]">
                                        <Tag className="w-2.5 h-2.5" />
                                        {item.category.name}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Detail Modal with Carousel */}
            {selectedItem && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedItem(null)}
                    />

                    {/* Modal */}
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Image Carousel (Left/Top) */}
                        <div className="relative md:w-2/3 bg-gray-900 group">
                            {selectedItem.images && selectedItem.images.length > 0 ? (
                                <>
                                    <div
                                        className="w-full h-[300px] md:h-[600px] cursor-zoom-in"
                                        onClick={() => setShowLightbox(true)}
                                    >
                                        <img
                                            src={selectedItem.images[carouselIndex]}
                                            alt={selectedItem.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* View Hint */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-black/20">
                                        <span className="bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                                            Click to expand
                                        </span>
                                    </div>

                                    {/* Carousel Navigation */}
                                    {selectedItem.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all z-20"
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all z-20"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>

                                            {/* Dots */}
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                                {selectedItem.images.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCarouselIndex(idx);
                                                        }}
                                                        className={`w-2 h-2 rounded-full transition-all ${idx === carouselIndex
                                                            ? 'bg-white w-6'
                                                            : 'bg-white/50 hover:bg-white/70'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-[300px] md:h-[600px] bg-gray-100 flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* Content (Right/Bottom) */}
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white flex flex-col">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                                    {selectedItem.title}
                                </h3>

                                {selectedItem.category && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full mb-4">
                                        <Tag className="w-3 h-3" />
                                        {selectedItem.category.name}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 mt-4">
                                {selectedItem.description ? (
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                                        {selectedItem.description}
                                    </p>
                                ) : (
                                    <p className="text-gray-400 italic text-sm">No description available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lightbox Overlay */}
                    {showLightbox && selectedItem.images && selectedItem.images.length > 0 && (
                        <div
                            className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
                            onClick={() => setShowLightbox(false)}
                        >
                            <button
                                onClick={() => setShowLightbox(false)}
                                className="absolute top-4 right-4 p-3 text-white/70 hover:text-white transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            <img
                                src={selectedItem.images[carouselIndex]}
                                alt={selectedItem.title}
                                className="max-w-[95vw] max-h-[95vh] object-contain select-none"
                                onClick={(e) => e.stopPropagation()}
                            />

                            {/* Lightbox Navigation */}
                            {selectedItem.images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prevImage();
                                        }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/70 hover:text-white transition-colors"
                                    >
                                        <ChevronLeft className="w-10 h-10" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nextImage();
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/70 hover:text-white transition-colors"
                                    >
                                        <ChevronRight className="w-10 h-10" />
                                    </button>
                                </>
                            )}

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
                                {carouselIndex + 1} / {selectedItem.images.length}
                            </div>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </>
    );
}
