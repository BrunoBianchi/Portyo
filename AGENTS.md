# Portyo Auto Post System - Agent Documentation

## Overview

The Auto Post system is an AI-powered content generation and scheduling platform that creates SEO, GEO, and AEO-optimized blog posts automatically. It leverages Groq AI (llama-3.3-70b) for content generation with advanced optimization metrics.

## Architecture

### Core Components

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│   AI Service    │
│  (React/Router) │◀────│   (Express)      │◀────│   (Groq)        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  AutoPostContext│     │  Schedule Entity │     │  Bio Summary    │
│  Dashboard UI   │     │  Log Entity      │     │  Post Generator │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Key Entities

#### AutoPostScheduleEntity
- **frequency**: daily | weekly | biweekly | monthly
- **preferredTime**: "HH:mm" format (default: "09:00")
- **startDate**: Date when cron should begin
- **topics**: User-defined content themes
- **keywords**: SEO keywords array
- **targetAudience**: Description of ideal readers
- **tone**: writing style (professional, casual, creative, etc.)
- **postLength**: short | medium | long
- **isActive**: Enable/disable scheduling
- **bioSummary**: AI-generated bio understanding
- **preferredTime**: Custom posting time

#### AutoPostLogEntity
- Tracks every generated/published/failed post
- Stores SEO/GEO/AEO metrics
- Contains generated content preview
- Links to published PostEntity

### SEO/GEO/AEO Scoring System

#### SEO Metrics (0-100)
- **Title Optimization**: Length, keywords, click-worthiness
- **Meta Description**: Length, relevance, CTA
- **Content Structure**: Headers, paragraphs, lists
- **Keyword Density**: Primary & semantic keywords
- **Readability**: Flesch Reading Ease score
- **Internal Linking**: Link opportunities count
- **Image Alt Text**: Accessibility & SEO
- **URL Structure**: Slug quality

#### GEO Metrics (0-100) - Generative Engine Optimization
- **Entity Recognition**: Clear entities for AI understanding
- **Answer Optimization**: Direct answer potential
- **Structured Data**: Schema markup readiness
- **Authority Signals**: Expertise demonstration
- **Context Clarity**: Topic disambiguation
- **Conversational Value**: Q&A potential
- **Featured Snippet Potential**: List/table structure

#### AEO Metrics (0-100) - Answer Engine Optimization
- **Answer Relevance**: How well content answers user queries
- **Direct Answer Score**: Presence of concise 40-60 word answers
- **Question Optimization**: Use of question-based headers (H2/H3)
- **Voice Search Score**: Natural language patterns for voice assistants
- **Clarity Score**: Clear, unambiguous information presentation
- **Conciseness Score**: Brevity without losing important details
- **Factual Accuracy**: Verifiable claims and data points

#### Content Quality Metrics
- **Originality Score**: Uniqueness vs. web content
- **Depth Score**: Comprehensive coverage
- **Engagement Potential**: Shareability metrics
- **Freshness Score**: Trending topic alignment

### Content Format

Posts are stored in **Markdown format** in the database:
- Clean, portable format
- Easy to edit and version control
- Rendered to HTML on the frontend using `MarkdownRenderer` component

Example markdown structure:
```markdown
# Main Title (H1)

## Section Header (H2)

### Subsection (H3)

Regular paragraph with **bold** and *italic* text.

- Bullet list item
- Another item

1. Numbered list
2. Second item

> Blockquote for important quotes

| Table | Column |
|-------|--------|
| Data  | Value  |
```

### API Endpoints

```typescript
// Schedule Management
POST   /api/auto-post              // Create/update schedule
GET    /api/auto-post/:bioId       // Get schedule
DELETE /api/auto-post/:bioId       // Delete schedule
PATCH  /api/auto-post/toggle       // Activate/deactivate

// Analytics & Preview
GET    /api/auto-post/:bioId/stats // Get stats + recent logs
POST   /api/auto-post/preview      // Generate preview post
POST   /api/auto-post/generate-summary // Analyze bio

// Cron Job (Internal)
POST   /api/internal/auto-post/run // Trigger posting (cron)
```

### Content Generation Flow

1. **Bio Analysis** (`generateBioSummary`)
   - Extracts expertise, tone, industry
   - Creates audience persona
   - Cached for 30 days

2. **Post Generation** (`generateAutoPost`)
   - Uses bio summary + schedule config
   - Generates SEO/GEO/AEO optimized content
   - Returns full metrics
   - Content stored in Markdown format

3. **Publishing** (`processSchedule`)
   - Validates monthly limits (10 posts/month Pro)
   - Creates PostEntity with markdown content
   - Updates nextPostDate based on frequency
   - Logs all metrics (SEO, GEO, AEO)

### Cron Behavior

```typescript
// Runs every minute (configured in deployment)
// Finds schedules where:
// - isActive = true
// - nextPostDate < now (or null for new schedules)
// - startDate <= now (or null)
// - postsThisMonth < MAX_POSTS_PER_MONTH

// After publishing:
// nextPostDate = calculateNextPostDate(frequency, preferredTime)
```

### Frontend State Management

```typescript
// AutoPostContext
interface AutoPostContextType {
    schedule: AutoPostSchedule | null;
    stats: AutoPostStats | null;
    loading: boolean;
    generatingSummary: boolean;
    generatingPreview: boolean;
    
    // Actions
    createSchedule: (data: Partial<AutoPostSchedule>) => Promise<AutoPostSchedule>;
    updateSchedule: (data: Partial<AutoPostSchedule>) => Promise<AutoPostSchedule>;
    toggleSchedule: (isActive: boolean) => Promise<void>;
    deleteSchedule: () => Promise<void>;
    generateSummary: () => Promise<BioSummary>;
    generatePreview: (config: Partial<AutoPostSchedule>) => Promise<PreviewResult>;
}
```

### Markdown Rendering

The `MarkdownRenderer` component (`frontend/app/components/markdown-renderer.tsx`) handles:
- Converting markdown to styled HTML
- Syntax highlighting for code blocks
- Responsive tables
- Proper heading hierarchy
- Styled blockquotes and lists

Usage:
```tsx
import { MarkdownRenderer } from "~/components/markdown-renderer";

<MarkdownRenderer content={postContent} />
```

## Development Guidelines

### Adding New Metrics
1. Update `GeneratedPost` interface in `auto-post-ai.service.ts`
2. Add corresponding fields to `AutoPostLogEntity`
3. Update frontend types in `auto-post.context.tsx`
4. Modify AI prompt to generate metric
5. Store in database via `auto-post.service.ts`
6. Display in dashboard component

### Modifying Schedule Logic
1. Update entity in `auto-post-schedule-entity.ts`
2. Update service in `auto-post.service.ts`
3. Update route validation schema
4. Update frontend types and form

### AI Prompt Engineering
- Always use `response_format: { type: "json_object" }`
- Include example structure in prompt
- Set appropriate temperature (0.5-0.8)
- Handle parsing errors gracefully
- Content must be generated in **Markdown format** (not HTML)

### Adding AEO Requirements
When modifying prompts, include:
- Direct answers within 40-60 words
- Question-based headers (H2/H3)
- Featured snippet opportunities (lists, tables)
- Voice search optimization
- Factual, verifiable content

## Security Considerations

- All routes protected with `authMiddleware`
- Pro feature: `isUserPro` middleware
- User can only access own schedules
- Bio ownership verified on all operations

## Rate Limits

- Content Generation: 10 posts/month (Pro plan)
- Bio Summary: Regenerated only after 30 days
- Preview Generation: Unlimited

## Environment Variables

```bash
# Required
GROQ_API_KEY=gsk_...              # AI service
DB_HOST/PORT/USERNAME/PASSWORD    # Database

# Optional
MAX_POSTS_PER_MONTH=10            # Default: 10
```

## Testing Checklist

- [ ] Create schedule with all fields
- [ ] Update schedule (frequency, time, startDate)
- [ ] Generate preview with metrics display (SEO, GEO, AEO)
- [ ] Toggle schedule on/off
- [ ] Verify cron respects startDate
- [ ] Check monthly limit enforcement
- [ ] Verify SEO/GEO/AEO scores in logs
- [ ] Test preferred time calculation
- [ ] Confirm markdown rendering in preview
- [ ] Check AEO suggestions display
