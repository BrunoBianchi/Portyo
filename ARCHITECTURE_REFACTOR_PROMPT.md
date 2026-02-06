# The "Portyo" No-Code Architecture Refactor

**Role:** Expert System Architect & Senior React Engineer  
**Context:** Portyo is a Bio-Link/Linktree competitor built with Remix (React Router v7). The current block rendering system is a "Dual Rendering" hybrid:
1. **Editor:** Uses interactive React components.
2. **Public Output:** Uses a string-based `html-generator.ts` (legacy) to produce static HTML.

**Objective:** Standardize the entire system into a single "Unified Rendering Engine" that powers both the Editor (interactive) and the Public View (SSR/Static). This engine must be schema-driven (JSON), support isolated "Islands" of interactivity, and use a Token-based Design System.

---

## The 4 Pillars of the Refactor

### 1. Unified Rendering Engine (React SSR)
**Goal:** Delete `html-generator.ts` and use React for everything.
- **SSR Strategy:** The public pages (`p.$username.tsx`) will simply render the *same* React components used in the editor, but in "readonly" mode.
- **Hydration:** Use `renderToStaticMarkup` for the initial HTML (ultra-fast LCP) and then hydrate *only* interactive parts (Islands).

### 2. Atomic Design System (Tokens)
**Goal:** CSS Custom Properties (Variables) for *everything*.
- **Structure:**
  - `tokens/colors.css`: `--primary`, `--bg-card`, `--text-body`.
  - `tokens/spacing.css`: `--space-xs`, `--space-md`.
  - `tokens/typography.css`: `--font-heading`, `--font-body`.
- **Theming:** A User Theme is just a JSON object mapping these tokens to values. The React root injects these as an inline `<style>` or `style` attribute on the wrapper.

### 3. Islands Architecture (Partial Hydration)
**Goal:** 0kb JS for static blocks (Heading, Text), load JS *only* for interactive ones (Carousel, Form).
- **Implementation:**
  - `static/HeadingBlock.tsx`: Pure HTML/CSS. No client JS.
  - `islands/CarouselBlock.tsx`: Lazy-loaded client component.
  - **Wrapper:** A `<BlockWrapper>` component decides to render statically or hydrate based on the block type.

### 4. Schema-Driven Customization (JSON Schema)
**Goal:** No hardcoded settings forms.
- **Definition:** Every Block (e.g., `InstagramBlock`) exports a `schema`.
- **Auto-Form:** The Editor sidebar reads this schema and *automatically* generates the controls (Inputs, Selects, Toggles).
- **Example:**
```typescript
export const instagramSchema = {
  variation: { 
    type: "select", 
    options: ["grid", "list", "highlight"], 
    label: "Layout Style" 
  },
  username: { type: "text", label: "Instagram Handle" }
};
```

---

## Phase 1: Analysis & Prototype (Instructions for Agent)

1.  **Analyze Current Block Data:** Check `backend/posts.json` or `frontend/app/blocks` to understand the current data shape.
2.  **Create the Core Registry:**
    - Define `BlockDefinition` interface (Component, Schema, defaultData).
    - Implement a simple `BlockRegistry` singleton.
3.  **Prototype the "Button Block" V2:**
    - Create `tokens/button-tokens.ts`.
    - Create `blocks/button/button.schema.ts`.
    - Create `blocks/button/button.component.tsx` (Unified component).
4.  **Demonstrate the "Auto-Form":**
    - Create a test route `/dashboard/architecture-demo`.
    - Render the Button Block.
    - Render a Form generated purely from `button.schema.ts`.
    - Verify that changing the Form updates the Block live.

**Deliverable:** A functional Proof of Concept in `/dashboard/architecture-demo` showing a Schema-driven Button modifying a Token-based Component.
