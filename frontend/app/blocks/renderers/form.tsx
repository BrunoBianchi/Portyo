/**
 * Form Block Renderer
 */
import React, { Suspense, lazy } from "react";
import { BlockSection } from "./utils";

const FormWidget = lazy(() =>
  import("~/components/bio/form-widget").then((m) => ({ default: m.FormWidget }))
);

interface FormBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const FormBlock: React.FC<FormBlockProps> = ({ block, bio }) => {
  const formId = block.formId || block.id;
  const bgColor = block.bgColor;
  const textColor = block.textColor;
  const bioId = bio.id;

  if (!formId || !bioId) return null;

  return (
    <BlockSection block={block}>
      <Suspense
        fallback={
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              background: bgColor || "#ffffff",
              borderRadius: "24px",
              color: textColor || "#1f2937",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            Loading form...
          </div>
        }
      >
        <FormWidget
          formId={formId}
          bioId={bioId}
          backgroundColor={bgColor}
          textColor={textColor}
        />
      </Suspense>
    </BlockSection>
  );
};

export default FormBlock;
