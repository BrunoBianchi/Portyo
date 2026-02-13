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

    // Lock body scroll when modal is open
    useEffect(() => {
        if (selectedItem) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [selectedItem]);

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
            <div style={{ width: '100%' }}>
                {/* Section Title */}
                {title && (
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#1f2937',
                        marginBottom: '16px',
                        textAlign: 'center',
                    }}>{title}</h3>
                )}

                {/* Category Filter */}
                {categories.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                        flexWrap: 'wrap',
                    }}>
                        <button
                            onClick={() => setActiveFilter(null)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '9999px',
                                fontSize: '12px',
                                fontWeight: 500,
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: activeFilter === null ? '#111827' : '#f3f4f6',
                                color: activeFilter === null ? '#fff' : '#6b7280',
                            }}
                        >
                            All
                        </button>
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setActiveFilter(category.id)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: activeFilter === category.id ? '#111827' : '#f3f4f6',
                                    color: activeFilter === category.id ? '#fff' : '#6b7280',
                                }}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid with Carousel */}
                <div style={{ position: 'relative' }}>
                    {/* Navigation Arrows */}
                    {hasPrevPage && (
                        <button
                            onClick={goToPrevPage}
                            style={{
                                position: 'absolute',
                                left: '-12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10,
                                padding: '8px',
                                backgroundColor: '#fff',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                borderRadius: '9999px',
                                border: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            aria-label="Previous projects"
                        >
                            <ChevronLeft style={{ width: 20, height: 20, color: '#1f2937' }} />
                        </button>
                    )}
                    {hasNextPage && (
                        <button
                            onClick={goToNextPage}
                            style={{
                                position: 'absolute',
                                right: '-12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10,
                                padding: '8px',
                                backgroundColor: '#fff',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                borderRadius: '9999px',
                                border: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            aria-label="Next projects"
                        >
                            <ChevronRight style={{ width: 20, height: 20, color: '#1f2937' }} />
                        </button>
                    )}

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        minHeight: '200px',
                    }}>
                        {(loading || fetching) ? (
                            // Skeleton Loading
                            Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} style={{
                                    aspectRatio: '1',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '16px',
                                    border: '1px solid #e5e7eb',
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }} />
                            ))
                        ) : (
                            items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    style={{
                                        position: 'relative',
                                        backgroundColor: '#fff',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        border: '1px solid #e5e7eb',
                                        textAlign: 'left' as const,
                                        cursor: 'pointer',
                                        padding: 0,
                                        transition: 'box-shadow 0.2s, transform 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {/* Image */}
                                    <div style={{
                                        aspectRatio: '1',
                                        backgroundColor: '#f3f4f6',
                                        overflow: 'hidden',
                                    }}>
                                        {item.images && item.images.length > 0 ? (
                                            <img
                                                src={item.images[0]}
                                                alt={item.title}
                                                loading="lazy"
                                                decoding="async"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.3s',
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                                            }}>
                                                <span style={{
                                                    fontSize: '28px',
                                                    fontWeight: 700,
                                                    color: 'rgba(156,163,175,0.4)',
                                                }}>
                                                    {item.title[0]?.toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Multiple images badge */}
                                    {item.images && item.images.length > 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            padding: '3px 8px',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            backdropFilter: 'blur(4px)',
                                            borderRadius: '9999px',
                                            color: '#fff',
                                            fontSize: '10px',
                                            fontWeight: 500,
                                        }}>
                                            {item.images.length} photos
                                        </div>
                                    )}

                                    <a
                                        href={`/portfolio/${encodeURIComponent(bioId)}/${encodeURIComponent(item.id)}`}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            left: '8px',
                                            padding: '4px 8px',
                                            backgroundColor: 'rgba(255,255,255,0.92)',
                                            borderRadius: '9999px',
                                            color: '#111827',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            textDecoration: 'none',
                                            border: '1px solid rgba(0,0,0,0.08)',
                                        }}
                                    >
                                        Ver página
                                    </a>

                                    {/* Title Overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
                                        padding: '32px 12px 12px',
                                    }}>
                                        <p style={{
                                            color: '#fff',
                                            fontWeight: 500,
                                            fontSize: '14px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                            margin: 0,
                                        }}>
                                            {item.title}
                                        </p>
                                        {item.category && (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                marginTop: '4px',
                                                color: 'rgba(255,255,255,0.8)',
                                                fontSize: '10px',
                                            }}>
                                                <Tag style={{ width: 10, height: 10 }} />
                                                {item.category.name}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            )))}
                    </div>

                    {/* Pagination Dots */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            marginTop: '16px',
                            flexWrap: 'wrap',
                            padding: '0 16px',
                        }}>
                            {Array.from({ length: totalPages }, (_, idx) => {
                                const p = idx + 1;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setPage(p)}
                                        style={{
                                            width: p === page ? '16px' : '8px',
                                            height: '8px',
                                            borderRadius: '9999px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            flexShrink: 0,
                                            backgroundColor: p === page ? '#111827' : 'rgba(107,114,128,0.3)',
                                            padding: 0,
                                        }}
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
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                }}>
                    {/* Backdrop */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(8px)',
                        }}
                        onClick={() => setSelectedItem(null)}
                    />

                    {/* Modal */}
                    <div
                        style={{
                            position: 'relative',
                            backgroundColor: '#ffffff',
                            borderRadius: '20px',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedItem(null)}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                zIndex: 50,
                                padding: '8px',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                border: 'none',
                                borderRadius: '9999px',
                                color: '#fff',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'; }}
                        >
                            <X style={{ width: 20, height: 20 }} />
                        </button>

                        {/* Image Area */}
                        <div style={{
                            position: 'relative',
                            backgroundColor: '#111',
                            width: '100%',
                        }}>
                            {selectedItem.images && selectedItem.images.length > 0 ? (
                                <>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '400px',
                                            cursor: 'zoom-in',
                                            overflow: 'hidden',
                                        }}
                                        onClick={() => setShowLightbox(true)}
                                    >
                                        <img
                                            src={selectedItem.images[carouselIndex]}
                                            alt={selectedItem.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>

                                    {/* Carousel Navigation */}
                                    {selectedItem.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                style={{
                                                    position: 'absolute',
                                                    left: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    padding: '8px',
                                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                                    backdropFilter: 'blur(8px)',
                                                    border: 'none',
                                                    borderRadius: '9999px',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    zIndex: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'background-color 0.2s',
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'; }}
                                            >
                                                <ChevronLeft style={{ width: 24, height: 24 }} />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    padding: '8px',
                                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                                    backdropFilter: 'blur(8px)',
                                                    border: 'none',
                                                    borderRadius: '9999px',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    zIndex: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'background-color 0.2s',
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'; }}
                                            >
                                                <ChevronRight style={{ width: 24, height: 24 }} />
                                            </button>

                                            {/* Dots */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '16px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                display: 'flex',
                                                gap: '6px',
                                                zIndex: 20,
                                            }}>
                                                {selectedItem.images.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCarouselIndex(idx);
                                                        }}
                                                        style={{
                                                            width: idx === carouselIndex ? '24px' : '8px',
                                                            height: '8px',
                                                            borderRadius: '9999px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            backgroundColor: idx === carouselIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                                                            padding: 0,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '300px',
                                    backgroundColor: '#f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#9ca3af',
                                    fontSize: '14px',
                                }}>
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div style={{
                            flex: 1,
                            padding: '24px 28px',
                            overflowY: 'auto',
                            backgroundColor: '#ffffff',
                        }}>
                            <h3 style={{
                                fontSize: '22px',
                                fontWeight: 700,
                                color: '#111827',
                                marginBottom: '8px',
                                lineHeight: 1.3,
                            }}>
                                {selectedItem.title}
                            </h3>

                            {selectedItem.category && (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 12px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#6b7280',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    borderRadius: '9999px',
                                    marginBottom: '16px',
                                }}>
                                    <Tag style={{ width: 12, height: 12 }} />
                                    {selectedItem.category.name}
                                </span>
                            )}

                            <div style={{ marginTop: '16px' }}>
                                {selectedItem.description ? (
                                    <p style={{
                                        color: '#4b5563',
                                        lineHeight: 1.7,
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '14px',
                                        margin: 0,
                                    }}>
                                        {selectedItem.description}
                                    </p>
                                ) : (
                                    <p style={{
                                        color: '#9ca3af',
                                        fontStyle: 'italic',
                                        fontSize: '14px',
                                        margin: 0,
                                    }}>No description available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lightbox Overlay */}
                    {showLightbox && selectedItem.images && selectedItem.images.length > 0 && (
                        <div
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 10000,
                                backgroundColor: 'rgba(0,0,0,0.95)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onClick={() => setShowLightbox(false)}
                        >
                            <button
                                onClick={() => setShowLightbox(false)}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    padding: '12px',
                                    color: 'rgba(255,255,255,0.7)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <X style={{ width: 32, height: 32 }} />
                            </button>

                            <img
                                src={selectedItem.images[carouselIndex]}
                                alt={selectedItem.title}
                                style={{
                                    maxWidth: '95vw',
                                    maxHeight: '95vh',
                                    objectFit: 'contain',
                                    userSelect: 'none',
                                }}
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
                                        style={{
                                            position: 'absolute',
                                            left: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            padding: '16px',
                                            color: 'rgba(255,255,255,0.7)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ChevronLeft style={{ width: 40, height: 40 }} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nextImage();
                                        }}
                                        style={{
                                            position: 'absolute',
                                            right: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            padding: '16px',
                                            color: 'rgba(255,255,255,0.7)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ChevronRight style={{ width: 40, height: 40 }} />
                                    </button>
                                </>
                            )}

                            <div style={{
                                position: 'absolute',
                                bottom: '24px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '14px',
                                fontWeight: 500,
                            }}>
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
