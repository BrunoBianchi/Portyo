# Block Integration Selectors

Este diretório contém componentes para conectar blocos do editor com outras funcionalidades do dashboard (forms, produtos, portfólio, marketing, blog).

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Block Editors                             │
│  (FormBlockEditor, ProductBlockEditor, etc.)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Integration Selectors                           │
│  (FormSelector, ProductSelector, PortfolioSelector, etc.)   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 Custom Hooks                                 │
│  (useForms, useProducts, usePortfolio, etc.)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Integration Service                             │
│        (BlockIntegrationService)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Dashboard APIs                                  │
│  (/api/forms, /api/products, /api/portfolio, etc.)          │
└─────────────────────────────────────────────────────────────┘
```

## Componentes

### Selectores Simples

- **FormSelector**: Seleciona um formulário do dashboard
- **MarketingSlotSelector**: Seleciona um slot de marketing

### Selectores de Coleção

- **ProductSelector**: Seleciona múltiplos produtos (com suporte a multi-seleção)
- **PortfolioSelector**: Seleciona múltiplos itens de portfólio (com filtro por categoria)
- **BlogPostSelector**: Seleciona múltiplos posts do blog

### Configuradores de Bloco

- **ProductCollectionSelector**: Configura um bloco de coleção de produtos (layout, exibição, ordenação)
- **PortfolioGallerySelector**: Configura um bloco de galeria de portfólio (layout, colunas, exibição)

## Como Usar

### 1. Em um Editor de Bloco

```tsx
import { FormSelector } from "../integration-selectors";

function FormBlockEditor({ block, onChange }) {
  const handleFormSelect = (form) => {
    onChange({
      formId: form?.id,
      formName: form?.name,
    });
  };

  return (
    <FormSelector
      bioId={block.bioId}
      selectedFormId={block.formId}
      onSelect={handleFormSelect}
    />
  );
}
```

### 2. Usando Hooks Diretamente

```tsx
import { useProducts } from "~/hooks/use-block-integration";

function MyComponent({ bioId }) {
  const { products, isLoading, error } = useProducts({ bioId });
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <ProductList products={products} />;
}
```

### 3. Usando o Serviço Diretamente

```tsx
import { BlockIntegrationService } from "~/services/block-integration.service";

async function loadData(bioId) {
  const forms = await BlockIntegrationService.getForms(bioId);
  const products = await BlockIntegrationService.getProducts(bioId);
  return { forms, products };
}
```

## Adicionando uma Nova Integração

### Passo 1: Adicionar Tipos

Adicione os tipos no arquivo `block-integration.service.ts`:

```typescript
export interface NewFeature {
  id: string;
  name: string;
  // ... outros campos
}
```

### Passo 2: Adicionar Métodos no Serviço

```typescript
async getNewFeatures(bioId: string): Promise<NewFeature[]> {
  try {
    const response = await api.get(`/new-feature/bio/${bioId}`);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch new features:", error);
    return [];
  }
}
```

### Passo 3: Criar Hook

No arquivo `use-block-integration.ts`:

```typescript
export function useNewFeatures({ bioId, enabled = true }: UseBlockIntegrationOptions) {
  const [features, setFeatures] = useState<NewFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchFeatures = useCallback(async () => {
    if (!bioId) return;
    setIsLoading(true);
    const data = await BlockIntegrationService.getNewFeatures(bioId);
    setFeatures(data);
    setIsLoading(false);
  }, [bioId]);
  
  useEffect(() => {
    if (enabled && bioId) fetchFeatures();
  }, [enabled, bioId, fetchFeatures]);
  
  return { features, isLoading, refetch: fetchFeatures };
}
```

### Passo 4: Criar Componente Selector

Crie um novo arquivo em `integration-selectors/`:

```tsx
// new-feature-selector.tsx
import { useNewFeatures } from "~/hooks/use-block-integration";

interface NewFeatureSelectorProps {
  bioId: string | null;
  selectedId?: string;
  onSelect: (feature: NewFeature | null) => void;
}

export function NewFeatureSelector({ bioId, selectedId, onSelect }: NewFeatureSelectorProps) {
  const { features, isLoading } = useNewFeatures({ bioId });
  // ... implementação
}
```

### Passo 5: Exportar no Index

Adicione no `integration-selectors/index.ts`:

```typescript
export { NewFeatureSelector } from "./new-feature-selector";
```

### Passo 6: Adicionar Traduções

Adicione as traduções no arquivo `dashboard.json`:

```json
{
  "editor": {
    "blockIntegration": {
      "newFeature": {
        "title": "Nova Funcionalidade",
        "select": "Selecionar",
        "empty": "Nenhum item encontrado",
        "create": "Criar novo",
        "manage": "Gerenciar"
      }
    }
  }
}
```

### Passo 7: Criar Editor de Bloco

Crie um novo editor em `block-editors/`:

```tsx
// NewFeatureBlockEditor.tsx
import { NewFeatureSelector } from "../integration-selectors";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function NewFeatureBlockEditor({ block, onChange }: Props) {
  const handleSelect = (feature) => {
    onChange({ newFeatureId: feature?.id });
  };

  return (
    <NewFeatureSelector
      bioId={block.bioId}
      selectedId={block.newFeatureId}
      onSelect={handleSelect}
    />
  );
}
```

### Passo 8: Registrar Editor

Atualize `block-editors/index.tsx`:

```typescript
import { NewFeatureBlockEditor } from "./NewFeatureBlockEditor";

export const BlockEditors = {
  // ... outros editores
  new_feature: NewFeatureBlockEditor,
};
```

## Considerações

1. **Performance**: Os hooks usam cache e apenas recarregam quando `bioId` muda
2. **Erros**: Todos os componentes têm estados de erro e vazio
3. **Loading**: Estados de carregamento são exibidos durante fetch
4. **Mobile**: Todos os componentes são responsivos
5. **Acessibilidade**: Botões têm aria-labels, checkboxes são acessíveis

## Testes

Antes de adicionar uma nova integração, verifique:

1. A API existe e retorna dados no formato esperado
2. O usuário tem permissão para acessar esses dados
3. O tratamento de erros está adequado
4. O estado vazio é bem apresentado
5. A integração funciona em dispositivos móveis
