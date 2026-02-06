# Integration Example: Using the Block System in Portyo Editor

## Quick Start

### 1. Initialize in Root

```typescript
// frontend/app/root.tsx
import { initializeBlocks } from './blocks';

// Call once when app loads
initializeBlocks();
```

### 2. Use in Editor Component

```tsx
// frontend/app/components/editor/BlockEditor.tsx
import { 
  useBlockRenderer, 
  BlockEditorAdapter,
  normalizeBlock 
} from '~/blocks';

interface BlockEditorProps {
  bio: Bio;
  blocks: BioBlock[];
  isEditing: boolean;
}

export function BlockEditor({ bio, blocks, isEditing }: BlockEditorProps) {
  // Use the hook for efficient rendering
  const { 
    renderedBlocks, 
    tokens,
    errors,
    renderSingleBlock 
  } = useBlockRenderer(bio, blocks, { 
    isEditor 
  });

  const handleBlockChange = (blockId: string, newData: any) => {
    // Update block data
    const updatedBlocks = blocks.map(b => 
      b.id === blockId ? { ...b, ...newData } : b
    );
    saveBlocks(updatedBlocks);
  };

  return (
    <div className="editor-container" style={tokens as React.CSSProperties}>
      {renderedBlocks.map(({ id, type, output, block }) => (
        <BlockWrapper key={id} id={id} type={type}>
          {isEditing ? (
            // Edit mode: Use adapter for form generation
            <BlockEditorAdapter
              block={block}
              bio={bio}
              isEditing={true}
              onChange={(newBlock) => handleBlockChange(id, newBlock)}
            />
          ) : (
            // Preview mode: Render HTML directly
            <div 
              className="block-preview"
              dangerouslySetInnerHTML={{ __html: output.html }}
            />
          )}
        </BlockWrapper>
      ))}
      
      {errors.length > 0 && (
        <div className="error-panel">
          {errors.map(e => (
            <div key={e.id} className="error-message">
              Block {e.id}: {e.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Generate Static HTML (for Public Pages)

```typescript
// frontend/app/services/export/html-export.ts
import { generateBioHtml } from '~/blocks';

export async function exportBioToHtml(bio: Bio): Promise<string> {
  const { html, css, js, meta } = generateBioHtml(bio, bio.blocks, {
    includeAnalytics: true,
    includePrefetch: true,
    minify: process.env.NODE_ENV === 'production'
  });

  // Log generation stats
  console.log('HTML Generation:', {
    blocks: meta.blockCount,
    islands: meta.islandCount,
    cssVars: meta.cssVariables
  });

  return `<!DOCTYPE html>
<html>
<head>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${js}</script>
</body>
</html>`;
}
```

### 4. Migration Helper

```typescript
// frontend/app/utils/migrate-bio.ts
import { migrateBlocks, isLegacyBlock } from '~/blocks';

export function migrateBioIfNeeded(bio: Bio): Bio {
  // Check if any blocks need migration
  const needsMigration = bio.blocks.some(isLegacyBlock);
  
  if (!needsMigration) {
    return bio;
  }

  // Migrate all blocks
  const { blocks, errors } = migrateBlocks(bio.blocks);
  
  if (errors.length > 0) {
    console.warn('Migration errors:', errors);
  }

  return {
    ...bio,
    blocks
  };
}
```

## Replacing Legacy Components

### Before (Legacy)

```tsx
// Old approach: Hardcoded block components
import { ButtonEditor } from './button-editor';
import { HeadingEditor } from './heading-editor';

function renderBlock(block: BioBlock) {
  switch (block.type) {
    case 'button': return <ButtonEditor {...block} />;
    case 'heading': return <HeadingEditor {...block} />;
    // ... 20+ more cases
  }
}
```

### After (New System)

```tsx
// New approach: Schema-driven
import { BlockEditorAdapter, normalizeBlock } from '~/blocks';

function renderBlock(block: BioBlock | NewBlock) {
  const normalized = normalizeBlock(block);
  return (
    <BlockEditorAdapter
      block={normalized}
      bio={bio}
      isEditing={true}
      onChange={handleChange}
    />
  );
}
```

## Performance Comparison

| Metric | Legacy | New System |
|--------|--------|------------|
| HTML Generation | 2000+ lines imperative | ~100 lines declarative |
| CSS Output | Inline styles per element | Shared CSS variables |
| JS Bundle (public page) | Full React (~200KB) | Islands only (~5KB) |
| Theme Changes | Regenerate all HTML | Update CSS variables |
| Block Types | Hardcoded | Plugin-based registry |

## Troubleshooting Integration

### Issue: Blocks not appearing

```tsx
// Check if blocks are initialized
import { isBlockSystemReady, registry } from '~/blocks';

useEffect(() => {
  if (!isBlockSystemReady()) {
    console.error('Block system not initialized!');
    console.log('Registered types:', registry.getAllTypes());
  }
}, []);
```

### Issue: Styles not applied

```tsx
// Ensure tokens are applied
import { useThemeTokens } from '~/blocks';

function App({ bio }) {
  // This applies CSS variables to :root
  const { tokens } = useThemeTokens(bio, { applyToRoot: true });
  
  return <Content />;
}
```

### Issue: Legacy blocks breaking

```tsx
// Wrap with error boundary
import { normalizeBlock, isLegacyBlock } from '~/blocks';

function SafeBlock({ block }) {
  try {
    const normalized = normalizeBlock(block);
    return <BlockEditorAdapter block={normalized} />;
  } catch (error) {
    return <ErrorBlock message={error.message} />;
  }
}
```

## Next Steps

1. **Test the integration** in a development environment
2. **Migrate block by block** (don't do all at once)
3. **Monitor error rates** during migration
4. **Update documentation** as you add new block types
5. **Consider creating a migration script** for production data
