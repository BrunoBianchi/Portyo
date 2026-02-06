/**
 * Calendar Block Renderer
 * Uses React hydration — renders a booking placeholder that loads the BookingWidget.
 */
import React, { Suspense, lazy } from "react";
import { BlockSection } from "./utils";

const BookingWidget = lazy(() =>
  import("~/components/bio/booking-widget").then((m) => ({ default: m.BookingWidget }))
);

interface CalendarBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const CalendarBlock: React.FC<CalendarBlockProps> = ({ block, bio }) => {
  const title = block.title || "Book a Call";
  const description = block.description || block.subtitle || "";
  const bioId = bio.id;

  if (!bioId) return null;

  return (
    <BlockSection block={block}>
      <Suspense
        fallback={
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              background: "#fff",
              borderRadius: "24px",
              border: "1px solid #F3F4F6",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                border: "2px solid #111827",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
          </div>
        }
      >
        <BookingWidget bioId={bioId} title={title} description={description} />
      </Suspense>
    </BlockSection>
  );
};

export default CalendarBlock;
