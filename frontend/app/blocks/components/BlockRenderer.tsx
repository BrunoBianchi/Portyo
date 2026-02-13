/**
 * BlockRenderer — central switch component that maps BioBlock type
 * to the correct React block component.
 *
 * Usage:
 *   {blocks.map(block => (
 *     <BlockRenderer key={block.id} block={block} bioId={bioId} />
 *   ))}
 */
import React, { lazy, Suspense } from 'react';
import type { BioBlock } from '~/contexts/bio.context';
import type { BlockComponentProps } from './types';
import type { GlobalButtonStyle } from './types';

// Eagerly loaded — tiny, always visible
import { HeadingBlock } from './HeadingBlock';
import { TextBlock } from './TextBlock';
import { DividerBlock } from './DividerBlock';
import { ButtonBlock } from './ButtonBlock';
import { ImageBlock } from './ImageBlock';
import { SocialsBlock } from './SocialsBlock';

// Lazily loaded — heavier or less common
const VideoBlock = lazy(() => import('./VideoBlock').then(m => ({ default: m.VideoBlock })));
const SpotifyBlock = lazy(() => import('./SpotifyBlock').then(m => ({ default: m.SpotifyBlock })));
const MapBlock = lazy(() => import('./MapBlock').then(m => ({ default: m.MapBlock })));
const EventBlock = lazy(() => import('./EventBlock').then(m => ({ default: m.EventBlock })));
const ExperienceBlock = lazy(() => import('./ExperienceBlock').then(m => ({ default: m.ExperienceBlock })));
const WhatsAppBlock = lazy(() => import('./WhatsAppBlock').then(m => ({ default: m.WhatsAppBlock })));
const FeaturedBlock = lazy(() => import('./FeaturedBlock').then(m => ({ default: m.FeaturedBlock })));
const AffiliateBlock = lazy(() => import('./AffiliateBlock').then(m => ({ default: m.AffiliateBlock })));
const TourBlock = lazy(() => import('./TourBlock').then(m => ({ default: m.TourBlock })));
const ButtonGridBlock = lazy(() => import('./ButtonGridBlock').then(m => ({ default: m.ButtonGridBlock })));
const CalendarBlock = lazy(() => import('./CalendarBlock').then(m => ({ default: m.CalendarBlock })));
const QRCodeBlock = lazy(() => import('./QRCodeBlock').then(m => ({ default: m.QRCodeBlock })));
const InstagramBlock = lazy(() => import('./InstagramBlock').then(m => ({ default: m.InstagramBlock })));
const YouTubeBlock = lazy(() => import('./YouTubeBlock').then(m => ({ default: m.YouTubeBlock })));
const BlogBlock = lazy(() => import('./BlogBlock').then(m => ({ default: m.BlogBlock })));
const ProductBlock = lazy(() => import('./ProductBlock').then(m => ({ default: m.ProductBlock })));
const FormBlock = lazy(() => import('./FormBlock').then(m => ({ default: m.FormBlock })));
const PollBlock = lazy(() => import('./PollBlock').then(m => ({ default: m.PollBlock })));
const PortfolioBlock = lazy(() => import('./PortfolioBlock').then(m => ({ default: m.PortfolioBlock })));
const MarketingBlock = lazy(() => import('./MarketingBlock').then(m => ({ default: m.MarketingBlock })));
const SponsoredLinksBlock = lazy(() => import('./SponsoredLinksBlock').then(m => ({ default: m.SponsoredLinksBlock })));

export interface BlockRendererProps {
    block: BioBlock;
    bioId?: string;
    /** Global accent color from the bio theme */
    accentColor?: string;
    /** Global button design settings from bio Design page */
    globalButtonStyle?: GlobalButtonStyle;
}

/** Map block type → component */
const BLOCK_MAP: Record<string, React.ComponentType<BlockComponentProps>> = {
    heading: HeadingBlock,
    text: TextBlock,
    divider: DividerBlock,
    button: ButtonBlock,
    image: ImageBlock,
    socials: SocialsBlock,
};

/** Lazy-loaded block components wrapped in Suspense */
const LAZY_BLOCK_MAP: Record<string, React.LazyExoticComponent<React.ComponentType<BlockComponentProps>>> = {
    video: VideoBlock,
    spotify: SpotifyBlock,
    map: MapBlock,
    event: EventBlock,
    experience: ExperienceBlock,
    whatsapp: WhatsAppBlock,
    featured: FeaturedBlock,
    affiliate: AffiliateBlock,
    tour: TourBlock,
    button_grid: ButtonGridBlock,
    calendar: CalendarBlock,
    qrcode: QRCodeBlock,
    instagram: InstagramBlock,
    youtube: YouTubeBlock,
    blog: BlogBlock,
    product: ProductBlock,
    form: FormBlock,
    poll: PollBlock,
    portfolio: PortfolioBlock,
    marketing: MarketingBlock,
    sponsored_links: SponsoredLinksBlock,
};

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, bioId, accentColor, globalButtonStyle }) => {
    const props = { block, bioId, accentColor, globalButtonStyle };

    // Check eagerly loaded blocks first
    const EagerComponent = BLOCK_MAP[block.type];
    if (EagerComponent) {
        return <EagerComponent {...props} />;
    }

    // Check lazily loaded blocks
    const LazyComponent = LAZY_BLOCK_MAP[block.type];
    if (LazyComponent) {
        return (
            <Suspense fallback={<div style={{ minHeight: '40px' }} />}>
                <LazyComponent {...props} />
            </Suspense>
        );
    }

    // Unknown block type — render nothing in production, warn in dev
    if (process.env.NODE_ENV === 'development') {
        return (
            <div style={{
                padding: '8px 12px',
                background: '#fef3c7',
                border: '1px dashed #f59e0b',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#92400e',
            }}>
                ⚠ Unknown block type: <strong>{block.type}</strong>
            </div>
        );
    }

    return null;
};

export default BlockRenderer;
