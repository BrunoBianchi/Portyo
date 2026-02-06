import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { BlogPostSelector } from "../integration-selectors";
import BioContext, { type BioBlock } from "~/contexts/bio.context";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
  bioId?: string;
}

export function BlogBlockEditor({ block, onChange, bioId }: Props) {
  const { t } = useTranslation("dashboard");
  const { bio } = useContext(BioContext);

  // Use prop bioId, then block.bioId, then context bio.id
  const effectiveBioId = bioId || block.bioId || bio?.id || null;

  const handlePostsSelect = (posts: { id: string }[]) => {
    onChange({
      blogPostIds: posts.map((p) => p.id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Blog Posts Selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">
          {t("editor.blockIntegration.blog.title")}
        </label>
        <BlogPostSelector
          bioId={effectiveBioId}
          selectedPostIds={block.blogPostIds}
          onSelect={handlePostsSelect}
        />
      </div>

      {/* Display Options */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">
          {t("editor.blockItem.common.options")}
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.blogShowImages !== false}
            onChange={(e) =>
              onChange({ blogShowImages: e.target.checked })
            }
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">
            Mostrar imagens
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.blogShowDates !== false}
            onChange={(e) =>
              onChange({ blogShowDates: e.target.checked })
            }
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">
            Mostrar datas
          </span>
        </label>
      </div>
    </div>
  );
}
