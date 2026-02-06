/**
 * Block Renderer Registry
 *
 * Maps block types to their React renderer components.
 * This replaces the monolithic blockToHtml if/else chain with lazy-loaded React components.
 */
import React, { Suspense, lazy } from "react";

// Eager-load the most common blocks for performance
import { HeadingBlock } from "./heading";
import { TextBlock } from "./text";
import { ButtonBlock } from "./button";
import { DividerBlock } from "./divider";
import { ImageBlock } from "./image";

// Lazy-load less common blocks
const SocialsBlock = lazy(() => import("./socials"));
const VideoBlock = lazy(() => import("./video"));
const SpotifyBlock = lazy(() => import("./spotify"));
const WhatsAppBlock = lazy(() => import("./whatsapp"));
const QRCodeBlock = lazy(() => import("./qrcode"));
const ExperienceBlock = lazy(() => import("./experience"));
const EventBlock = lazy(() => import("./event"));
const MapBlock = lazy(() => import("./map"));
const FeaturedBlock = lazy(() => import("./featured"));
const AffiliateBlock = lazy(() => import("./affiliate"));
const TourBlock = lazy(() => import("./tour"));
const ButtonGridBlock = lazy(() => import("./button-grid"));
const CalendarBlock = lazy(() => import("./calendar"));
const FormBlock = lazy(() => import("./form"));
const PortfolioBlock = lazy(() => import("./portfolio"));
const MarketingBlock = lazy(() => import("./marketing"));
const BlogBlock = lazy(() => import("./blog"));
const InstagramBlock = lazy(() => import("./instagram"));
const YouTubeBlock = lazy(() => import("./youtube"));
const ProductBlock = lazy(() => import("./product"));

// ─── Renderer Map ───────────────────────────────────────────────────────────

type BlockRenderer = React.FC<{ block: Record<string, any>; bio: Record<string, any> }>;

const EAGER_RENDERERS: Record<string, BlockRenderer> = {
  heading: HeadingBlock,
  text: TextBlock,
  button: ButtonBlock,
  divider: DividerBlock,
  image: ImageBlock,
};

const LAZY_RENDERERS: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  socials: SocialsBlock,
  video: VideoBlock,
  spotify: SpotifyBlock,
  whatsapp: WhatsAppBlock,
  qrcode: QRCodeBlock,
  experience: ExperienceBlock,
  event: EventBlock,
  map: MapBlock,
  featured: FeaturedBlock,
  affiliate: AffiliateBlock,
  tour: TourBlock,
  button_grid: ButtonGridBlock,
  calendar: CalendarBlock,
  form: FormBlock,
  portfolio: PortfolioBlock,
  marketing: MarketingBlock,
  blog: BlogBlock,
  instagram: InstagramBlock,
  youtube: YouTubeBlock,
  product: ProductBlock,
};

// ─── Render Function ────────────────────────────────────────────────────────

/**
 * Render a single block by type.
 * Returns null for unknown block types.
 */
export const RenderBlock: React.FC<{
  block: Record<string, any>;
  bio: Record<string, any>;
}> = React.memo(({ block, bio }) => {
  const type = block.type;

  // Try eager renderers first
  const EagerRenderer = EAGER_RENDERERS[type];
  if (EagerRenderer) {
    return <EagerRenderer block={block} bio={bio} />;
  }

  // Try lazy renderers
  const LazyRenderer = LAZY_RENDERERS[type];
  if (LazyRenderer) {
    return (
      <Suspense fallback={<div style={{ minHeight: "40px" }} />}>
        <LazyRenderer block={block} bio={bio} />
      </Suspense>
    );
  }

  // Unknown block type — render nothing
  return null;
});

RenderBlock.displayName = "RenderBlock";

/**
 * Render a list of blocks.
 */
export const RenderBlocks: React.FC<{
  blocks: Array<Record<string, any>>;
  bio: Record<string, any>;
}> = React.memo(({ blocks, bio }) => {
  if (!blocks || blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} bio={bio} />
      ))}
    </>
  );
});

RenderBlocks.displayName = "RenderBlocks";

// ─── Exports ────────────────────────────────────────────────────────────────

export {
  HeadingBlock,
  TextBlock,
  ButtonBlock,
  DividerBlock,
  ImageBlock,
};

export default RenderBlock;
