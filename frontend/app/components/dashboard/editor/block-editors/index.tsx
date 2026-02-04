import type { BioBlock } from "~/contexts/bio.context";
import { ButtonBlockEditor } from "./button-editor";
import { TextBlockEditor } from "./text-editor";
import { ImageBlockEditor } from "./image-editor";
import { VideoBlockEditor } from "./video-editor.tsx";
import { SocialsBlockEditor } from "./socials-editor";
import { WhatsAppBlockEditor } from "./whatsapp-editor";
import { YouTubeBlockEditor } from "./youtube-editor";
import { SpotifyBlockEditor } from "./spotify-editor";
import { InstagramBlockEditor } from "./instagram-editor";
import { QRCodeBlockEditor } from "./qrcode-editor";
import { TourBlockEditor } from "./tour-editor";
import { ExperienceBlockEditor } from "./experience-editor";
import { MarketingBlockEditor } from "./MarketingBlockEditor";
import { FormBlockEditor } from "./FormBlockEditor";
import { PortfolioBlockEditor } from "./PortfolioBlockEditor";
import { ProductBlockEditor } from "./ProductBlockEditor";
import { BlogBlockEditor } from "./BlogBlockEditor";
import { ButtonGridBlockEditor } from "./button-grid-editor";
import { CalendarBlockEditor } from "./calendar-editor";
import { MapBlockEditor } from "./map-editor";
import { EventBlockEditor } from "./event-editor";
import { FeaturedBlockEditor } from "./featured-editor";
import { AffiliateBlockEditor } from "./affiliate-editor";
import { GenericBlockEditor } from "./generic-editor";

export interface BlockEditorProps {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export const BlockEditors: Record<string, React.ComponentType<BlockEditorProps>> = {
  button: ButtonBlockEditor,
  text: TextBlockEditor,
  heading: TextBlockEditor,
  image: ImageBlockEditor,
  video: VideoBlockEditor,
  socials: SocialsBlockEditor,
  whatsapp: WhatsAppBlockEditor,
  youtube: YouTubeBlockEditor,
  spotify: SpotifyBlockEditor,
  instagram: InstagramBlockEditor,
  qrcode: QRCodeBlockEditor,
  tour: TourBlockEditor,
  experience: ExperienceBlockEditor,
  marketing: MarketingBlockEditor,
  button_grid: ButtonGridBlockEditor,
  calendar: CalendarBlockEditor,
  map: MapBlockEditor,
  event: EventBlockEditor,
  featured: FeaturedBlockEditor,
  affiliate: AffiliateBlockEditor,
  form: FormBlockEditor,
  portfolio: PortfolioBlockEditor,
  product: ProductBlockEditor,
  blog: BlogBlockEditor,
  divider: GenericBlockEditor,
};

export function BlockEditor({ block, onChange }: BlockEditorProps) {
  const EditorComponent = BlockEditors[block.type] || GenericBlockEditor;
  return <EditorComponent block={block} onChange={onChange} />;
}

export * from "./button-editor";
export * from "./text-editor";
export * from "./image-editor";
export * from "./video-editor";
export * from "./socials-editor";
export * from "./whatsapp-editor";
export * from "./youtube-editor";
export * from "./spotify-editor";
export * from "./instagram-editor";
export * from "./qrcode-editor";
export * from "./tour-editor";
export * from "./experience-editor";
export * from "./button-grid-editor";
export * from "./calendar-editor";
export * from "./map-editor";
export * from "./event-editor";
export * from "./featured-editor";
export * from "./affiliate-editor";
export * from "./generic-editor";
export * from "./FormBlockEditor";
export * from "./PortfolioBlockEditor";
export * from "./ProductBlockEditor";
export * from "./BlogBlockEditor";
export * from "./MarketingBlockEditor";
