/**
 * Experience Block Renderer
 */
import React from "react";
import { BlockSection, escapeHtml } from "./utils";

interface ExperienceBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const ExperienceBlock: React.FC<ExperienceBlockProps> = ({ block }) => {
  const title = block.title || "Experience";
  const experiences: Array<{
    company: string;
    role: string;
    period: string;
    description?: string;
  }> = block.experiences || [];

  if (experiences.length === 0) return null;

  return (
    <BlockSection block={block}>
      <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", margin: "0 0 20px 0" }}>
        {title}
      </h3>
      <div
        style={{
          position: "relative",
          paddingLeft: "24px",
          borderLeft: "2px solid #E5E7EB",
        }}
      >
        {experiences.map((exp, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              paddingBottom: i < experiences.length - 1 ? "24px" : "0",
            }}
          >
            {/* Timeline dot */}
            <div
              style={{
                position: "absolute",
                left: "-29px",
                top: "4px",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: i === 0 ? "#111827" : "#D1D5DB",
                border: "2px solid #fff",
              }}
            />
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "16px",
                backgroundColor: "#F9FAFB",
                border: "1px solid #F3F4F6",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827", marginBottom: "2px" }}>
                {exp.role}
              </div>
              <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px" }}>
                {exp.company}
                {exp.period && <span style={{ marginLeft: "8px", opacity: 0.7 }}>• {exp.period}</span>}
              </div>
              {exp.description && (
                <div style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.5, marginTop: "8px" }}>
                  {exp.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </BlockSection>
  );
};

export default ExperienceBlock;
