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
    }, [selectedItem]);

    const filteredItems = activeFilter
        ? items.filter(item => item.categoryId === activeFilter)
        : items;

    const prevImage = () => {
        if (!selectedItem) return;
        setCarouselIndex(prev =>
            prev === 0 ? selectedItem.images.length - 1 : prev - 1
        );
    };

    const nextImage = () => {
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
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Modal */}
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Image Carousel */}
                        {selectedItem.images && selectedItem.images.length > 0 && (
                            <div className="relative aspect-[4/3] bg-gray-900">
                                <img
                                    src={selectedItem.images[carouselIndex]}
                                    alt={selectedItem.title}
                                    className="w-full h-full object-contain"
                                />

                                {/* Carousel Navigation */}
                                {selectedItem.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-900" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-900" />
                                        </button>

                                        {/* Dots */}
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                            {selectedItem.images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCarouselIndex(idx)}
                                                    className={`w-2 h-2 rounded-full transition-all ${idx === carouselIndex
                                                            ? 'bg-white w-5'
                                                            : 'bg-white/50 hover:bg-white/70'
                                                        }`}
                                                />
                                            ))}
                                        </div>

                                        {/* Counter */}
                                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                                            {carouselIndex + 1} / {selectedItem.images.length}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-5 max-h-[40vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {selectedItem.title}
                            </h3>

                            {selectedItem.category && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full mb-3">
                                    <Tag className="w-3 h-3" />
                                    {selectedItem.category.name}
                                </span>
                            )}

                            {selectedItem.description && (
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mt-3">
                                    {selectedItem.description}
                                </p>
                            )}

                            <button
                                onClick={() => setSelectedItem(null)}
                                className="mt-5 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
