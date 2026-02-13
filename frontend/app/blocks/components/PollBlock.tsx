import React, { lazy, Suspense } from "react";
import type { BlockComponentProps } from "./types";
import { BlockWrapper } from "./BlockWrapper";

const PollWidget = lazy(() =>
  import("~/components/bio/poll-widget").then((m) => ({
    default: m.PollWidget,
  }))
);

export const PollBlock: React.FC<BlockComponentProps> = ({ block }) => {
  const pollId = block.pollId;
  const bgColor = block.pollBackgroundColor || "#ffffff";
  const textColor = block.pollTextColor || "#1f2937";

  if (!pollId) {
    return (
      <BlockWrapper block={block}>
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#9ca3af",
            fontSize: "13px",
          }}
        >
          Enquete não configurada
        </div>
      </BlockWrapper>
    );
  }

  return (
    <BlockWrapper block={block}>
      <Suspense
        fallback={
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "13px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            Carregando enquete...
          </div>
        }
      >
        <PollWidget pollId={pollId} backgroundColor={bgColor} textColor={textColor} />
      </Suspense>
    </BlockWrapper>
  );
};
