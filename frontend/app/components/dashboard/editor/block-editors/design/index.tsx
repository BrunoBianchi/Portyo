import type { BioBlock } from "~/contexts/bio.context";
import { BlockStyleSettings } from "../../block-style-settings";
import { TextDesignEditor } from "./text-design";
import { ButtonDesignEditor } from "./button-design";
import { SocialsDesignEditor } from "./socials-design";
import { WhatsAppDesignEditor } from "./whatsapp-design";
import { InstagramDesignEditor } from "./instagram-design";
import { YouTubeDesignEditor } from "./youtube-design";
import { SpotifyDesignEditor } from "./spotify-design";
import { QRCodeDesignEditor } from "./qrcode-design";
import { EventDesignEditor } from "./event-design";
import { FeaturedDesignEditor } from "./featured-design";
import { AffiliateDesignEditor } from "./affiliate-design";
import { CalendarDesignEditor } from "./calendar-design";
import { ExperienceDesignEditor } from "./experience-design";
import { ImageDesignEditor } from "./image-design";
import { BlogDesignEditor } from "./blog-design";
import { ProductDesignEditor } from "./product-design";
import { FormDesignEditor } from "./form-design";

export interface BlockDesignEditorProps {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

// Map of block types to their specific design editors
const DesignEditors: Record<string, React.ComponentType<BlockDesignEditorProps>> = {
  text: TextDesignEditor,
  heading: TextDesignEditor,
  button: ButtonDesignEditor,
  socials: SocialsDesignEditor,
  whatsapp: WhatsAppDesignEditor,
  instagram: InstagramDesignEditor,
  youtube: YouTubeDesignEditor,
  spotify: SpotifyDesignEditor,
  qrcode: QRCodeDesignEditor,
  event: EventDesignEditor,
  featured: FeaturedDesignEditor,
  affiliate: AffiliateDesignEditor,
  calendar: CalendarDesignEditor,
  experience: ExperienceDesignEditor,
  image: ImageDesignEditor,
  blog: BlogDesignEditor,
  product: ProductDesignEditor,
  form: FormDesignEditor,
};

/**
 * BlockDesignEditor renders block-type-specific design controls
 * ABOVE the generic BlockStyleSettings (container, border, shadow, animation).
 */
export function BlockDesignEditor({ block, onUpdate }: BlockDesignEditorProps) {
  const SpecificEditor = DesignEditors[block.type];

  return (
    <div className="space-y-6">
      {/* Block-specific design controls */}
      {SpecificEditor && (
        <>
          <SpecificEditor block={block} onUpdate={onUpdate} />
          <div className="h-px bg-black/10" />
        </>
      )}

      {/* Generic container/border/shadow/animation settings */}
      <BlockStyleSettings block={block} onUpdate={onUpdate} />
    </div>
  );
}
