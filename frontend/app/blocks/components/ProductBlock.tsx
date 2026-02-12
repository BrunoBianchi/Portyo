/**
 * ProductBlock — renders products with Stripe checkout integration.
 * Layouts: grid, list, carousel. Card styles: default, minimal.
 */
import React, { useEffect, useState } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

interface Product {
    id: string;
    title: string;
    description?: string;
    price: number;
    currency?: string;
    image?: string;
    imageUrl?: string;
    url?: string;
}

export const ProductBlock: React.FC<BlockComponentProps> = ({ block, bioId }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState<string | null>(null);

    const layout = block.productLayout || 'grid';
    const cardStyle = block.productCardStyle || 'default';
    const showPrices = block.productShowPrices !== false;
    const showDescriptions = block.productShowDescriptions !== false;
    const bgColor = block.productBackgroundColor || 'transparent';
    const textColor = block.productTextColor || '#1f2937';
    const accentColor = block.productAccentColor || '#3b82f6';
    const buttonText = block.productButtonText || 'Comprar';

    useEffect(() => {
        if (!bioId) return;
        let cancelled = false;

        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        fetch(`${origin}/api/public/products/${bioId}`)
            .then(r => r.json())
            .then(data => {
                if (!cancelled) {
                    const items = Array.isArray(data) ? data : data?.products || [];
                    setProducts(items);
                }
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [bioId]);

    const formatPrice = (price: number, currency = 'BRL') => {
        try {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(price / 100);
        } catch {
            return `R$ ${(price / 100).toFixed(2)}`;
        }
    };

    const handleBuy = async (productId: string) => {
        if (buying) return;
        setBuying(productId);
        try {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const res = await fetch(`${origin}/api/public/stripe/generate-product-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, bioId }),
            });
            const data = await res.json();
            if (data?.url) {
                window.open(data.url, '_blank', 'width=600,height=700,scrollbars=yes');
            }
        } catch {
            // silently fail
        } finally {
            setBuying(null);
        }
    };

    if (loading) {
        return (
            <BlockWrapper block={block}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{
                            height: '200px', background: '#e5e7eb', borderRadius: '12px',
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                    ))}
                </div>
            </BlockWrapper>
        );
    }

    if (products.length === 0) {
        return (
            <BlockWrapper block={block}>
                <div style={{ textAlign: 'center', padding: '20px', color: textColor, fontSize: '13px' }}>
                    Nenhum produto encontrado
                </div>
            </BlockWrapper>
        );
    }

    const renderProductCard = (product: Product) => {
        const isMinimal = cardStyle === 'minimal';
        const imgSrc = product.image || product.imageUrl;

        return (
            <div key={product.id} style={{
                background: bgColor === 'transparent' ? 'white' : bgColor,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: isMinimal ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
                border: isMinimal ? '1px solid #e5e7eb' : 'none',
                scrollSnapAlign: 'start',
                flexShrink: 0,
                minWidth: layout === 'carousel' ? '200px' : undefined,
            }}>
                {imgSrc && (
                    <div style={{ height: isMinimal ? '120px' : '160px', overflow: 'hidden' }}>
                        <img
                            src={imgSrc}
                            alt={product.title}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                )}
                <div style={{ padding: isMinimal ? '10px' : '12px' }}>
                    <h4 style={{
                        fontSize: isMinimal ? '13px' : '14px',
                        fontWeight: 600, color: textColor, margin: '0 0 4px 0',
                        lineHeight: 1.3,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                        {product.title}
                    </h4>
                    {showDescriptions && product.description && (
                        <p style={{
                            fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0',
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                            {product.description}
                        </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        {showPrices && (
                            <span style={{ fontSize: '15px', fontWeight: 700, color: textColor }}>
                                {formatPrice(product.price, product.currency)}
                            </span>
                        )}
                        <button
                            onClick={() => handleBuy(product.id)}
                            disabled={buying === product.id}
                            style={{
                                padding: '6px 14px',
                                background: accentColor,
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: buying === product.id ? 'wait' : 'pointer',
                                opacity: buying === product.id ? 0.7 : 1,
                                transition: 'opacity 0.2s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {buying === product.id ? '...' : buttonText}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const isCarousel = layout === 'carousel';

    return (
        <BlockWrapper block={block}>
            <div style={isCarousel ? {
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                paddingBottom: '4px',
                scrollbarWidth: 'none',
            } : {
                display: layout === 'grid' ? 'grid' : 'flex',
                gridTemplateColumns: layout === 'grid' ? 'repeat(2, 1fr)' : undefined,
                flexDirection: layout === 'list' ? 'column' : undefined,
                gap: '12px',
            }}>
                {products.map(renderProductCard)}
            </div>
        </BlockWrapper>
    );
};
