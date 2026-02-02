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
    const [fetching, setFetching] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 4;

    useEffect(() => {
        if (!bioId) return;
        const fetchCategories = async () => {
            try {
                const res = await api.get(`/portfolio/categories/${bioId}`);
                setCategories(res.data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, [bioId]);

    useEffect(() => {
        if (!bioId) return;
        const fetchProjects = async () => {
            setFetching(true);
            try {
                const params: any = {
                    page,
                    limit: ITEMS_PER_PAGE,
                    categoryId: activeFilter || undefined
                };

                const res = await api.get(`/portfolio/${bioId}`, { params });

                if (res.data.meta) {
                    setItems(res.data.data);
                    setTotalPages(res.data.meta.totalPages);
                } else {
                    setItems(res.data);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Failed to fetch portfolio:", error);
            } finally {
                setLoading(false);
                setFetching(false);
            }
        };

        fetchProjects();
    }, [bioId, page, activeFilter]);

    // Reset carousel index when selecting new item
    useEffect(() => {
        setCarouselIndex(0);
        setShowLightbox(false);
    }, [selectedItem]);

    // Reset page to 1 when filter changes
    useEffect(() => {
        setPage(1);
    }, [activeFilter]);

    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    const goToPrevPage = () => {
        setPage(prev => Math.max(1, prev - 1));
    };

    const goToNextPage = () => {
        setPage(prev => Math.min(totalPages, prev + 1));
    };

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

    // If loading first time and no items, show nothing or skeleton structure (handled below)
    if (loading && !fetching && items.length === 0) {
        // We let it render so Skeleton can be shown
        // return null; 
    }

    return (
        <>
            <div className="w-full">
                {/* Section Title */}
                {title && (
                    <h3 className="text-lg font-bold text-foreground mb-4 text-center">{title}</h3>
                )}

                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                        <button
                            onClick={() => setActiveFilter(null)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeFilter === null
                                ? 'bg-gray-900 text-white'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid with Carousel */}
                <div className="relative">
                    {/* Navigation Arrows */}
                    {hasPrevPage && (
                        <button
                            onClick={goToPrevPage}
                            className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-10 p-2 bg-surface-card shadow-lg rounded-full hover:bg-muted transition-all border border-border"
                            aria-label="Previous projects"
                        >
                            <ChevronLeft className="w-5 h-5 text-foreground" />
                        </button>
                    )}
                    {hasNextPage && (
                        <button
                            onClick={goToNextPage}
                            className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-10 p-2 bg-surface-card shadow-lg rounded-full hover:bg-muted transition-all border border-border"
                            aria-label="Next projects"
                        >
                            <ChevronRight className="w-5 h-5 text-foreground" />
                        </button>
                    )}

                    <div className="grid grid-cols-2 gap-3 min-h-[200px]">
                        {(loading || fetching) ? (
                            // Skeleton Loading
                            Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="aspect-square bg-muted rounded-xl animate-pulse border border-border" />
                            ))
                        ) : (
                            items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className="group relative bg-surface-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-border text-left"
                                >
                                    {/* Image */}
                                    <div className="aspect-square bg-muted overflow-hidden">
                                        {item.images && item.images.length > 0 ? (
                                            <img
                                                src={item.images[0]}
                                                alt={item.title}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
                                                <span className="text-3xl font-bold text-muted-foreground/30">
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
                            )))}
                    </div>

                    {/* Pagination Dots */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap px-4">
                            {Array.from({ length: totalPages }, (_, idx) => {
                                const p = idx + 1;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setPage(p)}
                                        className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${p === page
                                            ? 'bg-gray-900 w-4'
                                            : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                            }`}
                                        aria-label={`Go to page ${p}`}
                                    />
                                );
                            })}
                        </div>
                    )}
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
                        className="relative bg-surface-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200"
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
                        <div className="relative md:w-2/3 bg-black/80 group">
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
                                <div className="w-full h-[300px] md:h-[600px] bg-muted flex items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* Content (Right/Bottom) */}
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-surface-card flex flex-col">
                            <div>
                                <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">
                                    {selectedItem.title}
                                </h3>

                                {selectedItem.category && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full mb-4">
                                        <Tag className="w-3 h-3" />
                                        {selectedItem.category.name}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 mt-4">
                                {selectedItem.description ? (
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                                        {selectedItem.description}
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground italic text-sm">No description available</p>
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
