# Portyo Auto Post AI - Agent Documentation

## Overview

O sistema de Auto Post do Portyo utiliza BAML (Basic Augmented Markup Language) e TOON (Tools for Orchestration and Optimization of Narratives) para gerar conteúdo de blog variado, nunca repetitivo, focado em temas de **Link in Bio** e engajamento.

## Arquitetura de Conteúdo

### Content Pillars (Pilares de Conteúdo)

O sistema rotaciona entre 6 pilares principais para garantir variedade:

```
PILLAR_ROTATION = [
  "educational",      # Tutoriais, guias, how-to
  "trend_analysis",   # Análises de tendências
  "case_studies",     # Casos de sucesso
  "tools_tech",       # Ferramentas e tecnologia
  "strategy",         # Estratégias avançadas
  "engagement",       # Conteúdo viral/engajamento
]
```

### Temas Dinâmicos (Nunca Repetidos)

Cada pilar contém 50+ subtemas únicos. O sistema usa um **Content Hash Tracker** para garantir que o mesmo tema não seja usado em um período de 90 dias.

#### Educational (Educativo)
- Como criar um link in bio que converte
- Guia completo de otimização de perfil
- Tutorial de analytics para iniciantes
- Como usar CTAs efetivamente
- Design de landing pages simplificado
- Integração com e-commerce
- [+45 temas variados...]

#### Trend Analysis (Análise de Tendências)
- O futuro do link in bio em 2025
- Tendências de social commerce
- Micro-influenciadores vs macro
- A evolução do Instagram Shopping
- Novas plataformas emergentes
- [+45 temas variados...]

#### Case Studies (Estudos de Caso)
- Como [Creator X] dobrou suas vendas
- Estratégia de lançamento de produto
- Transformação de perfil pessoal em marca
- Case: de 0 a 10k seguidores em 3 meses
- [+45 temas variados...]

#### Tools & Tech (Ferramentas)
- Comparativo: Portyo vs Linktree vs Beacons
- Ferramentas de design para não-designers
- Automação de marketing digital
- Integrações essenciais para creators
- [+45 temas variados...]

#### Strategy (Estratégia)
- Funil de vendas para creators
- Segmentação de audiência avançada
- A/B testing para links
- Retargeting estratégico
- [+45 temas variados...]

#### Engagement (Engajamento)
- Psicologia do click: o que faz pessoas clicarem
- Storytelling em bio descriptions
- Criando urgência sem ser spam
- Conteúdo que viraliza organicamente
- [+45 temas variados...]

## BAML Schema

```baml
// Content Generation Configuration
class ContentConfig {
  pillar string @description("Content pillar: educational|trend_analysis|case_studies|tools_tech|strategy|engagement")
  theme string @description("Specific theme from theme library")
  angle string @description("Unique angle/approach for this content")
  target_audience string @description("Primary audience segment")
  engagement_goal string @description("click|share|comment|convert")
  content_format string @description("listicle|how_to|case_study|comparison|opinion|news"
}

class GeneratedContent {
  title string @description("SEO-optimized title, 50-60 chars")
  title_en string? @description("English version if bilingual")
  slug string @description("URL-friendly slug")
  
  meta_description string @description("150-160 chars")
  meta_description_en string? @description("English meta")
  
  content string @description("Full markdown content")
  content_en string? @description("English content if bilingual")
  
  keywords string @description("Comma-separated keywords")
  keywords_en string? @description("English keywords")
  
  // Engagement Optimization
  hook string @description("First paragraph designed to hook readers")
  ctas string[] @description("Array of call-to-actions used")
  internal_links string[] @description("Suggested internal links")
  
  // Content Metrics
  word_count int
  reading_time int @description("Minutes to read"
  
  // SEO/GEO/AEO Scores
  seo_score float @description("0-100")
  geo_score float @description("0-100")
  aeo_score float @description("0-100")
  engagement_score float @description("Predicted engagement 0-100"
  
  // Detailed Metrics
  seo_metrics SEOMetrics
  geo_metrics GEOMetrics
  aeo_metrics AEOMetrics
  engagement_metrics EngagementMetrics
  
  // Improvement tracking
  improvement_suggestions string[]
  content_hash string @description("SHA256 hash of theme+angle for uniqueness tracking")
}

class SEOMetrics {
  title_optimization float
  meta_description_score float
  content_structure float
  keyword_density float
  readability float
  internal_linking float
  image_optimization float
}

class GEOMetrics {
  entity_recognition float
  answer_optimization float
  structured_data_readiness float
  authority_signals float
  context_clarity float
}

class AEOMetrics {
  answer_relevance float
  direct_answer_score float
  question_optimization float
  voice_search_score float
  clarity_score float
}

class EngagementMetrics {
  emotional_trigger_score float
  curiosity_gap_score float
  social_proof_score float
  urgency_score float
  shareability_score float
}
```

## TOON Orchestration

### Content Generation Pipeline

```
STAGE 1: Theme Selection (TOON Selector)
├── Input: Schedule config, History (90 dias), Pillar rotation
├── Process: 
│   ├── Filter used themes (Content Hash Tracker)
│   ├── Apply pillar rotation logic
│   ├── Select random angle variation
│   └── Determine engagement goal
└── Output: ContentConfig object

STAGE 2: Research Simulation (TOON Researcher)
├── Input: ContentConfig
├── Process:
│   ├── Generate topical authority signals
│   ├── Create entity relationships
│   ├── Identify key statistics/facts
│   └── Determine unique insights
└── Output: Research Context

STAGE 3: Content Generation (TOON Writer)
├── Input: ContentConfig, Research Context
├── Process:
│   ├── Generate hook (AIDA framework)
│   ├── Create body with H2/H3 structure
│   ├── Insert strategic CTAs
│   ├── Add internal link placeholders
│   └── Write conclusion with CTA
└── Output: Raw Content

STAGE 4: Optimization (TOON Optimizer)
├── Input: Raw Content
├── Process:
│   ├── Calculate all scores
│   ├── Verify SEO requirements
│   ├── Check engagement factors
│   ├── Ensure no repetition vs history
│   └── Generate improvement suggestions
└── Output: GeneratedContent

STAGE 5: Validation (TOON Validator)
├── Input: GeneratedContent
├── Process:
│   ├── Verify content hash uniqueness
│   ├── Check plagiarism signals
│   ├── Validate metric thresholds
│   └── Confirm engagement optimization
└── Output: Final Content or Retry
```

## Prompt Templates Dinâmicos

### Template Base (BAML Function)

```baml
function GenerateBlogPost(
    config: ContentConfig,
    history: string[],  // Previous content hashes
    brand_voice: string
) -> GeneratedContent {
    client Groq
    
    prompt #"
    Você é {{ brand_voice }}, um escritor especialista em conteúdo digital e marketing.
    
    === CONFIGURAÇÃO DE CONTEÚDO ===
    Pilar: {{ config.pillar }}
    Tema: {{ config.theme }}
    Ângulo Único: {{ config.angle }}
    Público-Alvo: {{ config.target_audience }}
    Objetivo de Engajamento: {{ config.engagement_goal }}
    Formato: {{ config.content_format }}
    
    === HISTÓRICO (NÃO REPETIR) ===
    {{ history }}
    
    === REGRAS DE ENGAGEMENT ===
    1. Hook: Primeiro parágrafo deve prender atenção imediatamente
    2. AIDA: Siga framework Attention-Interest-Desire-Action
    3. CTAs: Mínimo 3 call-to-actions estratégicos
    4. Social Proof: Inclua prova social quando relevante
    5. Urgência: Crie senso de oportunidade sem ser agressivo
    6. Escaneabilidade: Use bullets, negrito, listas
    
    === SEO/GEO/AEO REQUIREMENTS ===
    1. Título: 50-60 chars, com palavra-chave principal
    2. Meta Description: 150-160 chars, com CTA
    3. Estrutura: H1 > H2 > H3 hierárquico
    4. Keywords: Densidade natural, variações semânticas
    5. GEO: Entidades claras, otimização para IA
    6. AEO: Respostas diretas em 40-60 palavras
    7. Voice Search: Perguntas em linguagem natural
    
    === FORMATO DE RESPOSTA (JSON) ===
    {
        "title": "...",
        "slug": "...",
        "meta_description": "...",
        "content": "# Título\n\nParágrafo hook...\n\n## H2 Tópico\n\nConteúdo...",
        "keywords": "...",
        "hook": "...",
        "ctas": [...],
        "internal_links": [...],
        // ... all fields from GeneratedContent
    }
    "#
    
    retry 3
}
```

## Sistema Anti-Repetição

### Content Hash Tracker

```typescript
// Redis key pattern
const CONTENT_HASH_KEY = "site:autopost:content_hashes:{user_id}";

// Hash generation
const generateContentHash = (pillar: string, theme: string, angle: string): string => {
    return crypto.createHash('sha256')
        .update(`${pillar}:${theme}:${angle}`)
        .digest('hex')
        .substring(0, 16);
};

// Uniqueness check
const isThemeUnique = async (hash: string, userId: string): Promise<boolean> => {
    const exists = await redisClient.sismember(
        CONTENT_HASH_KEY.replace('{user_id}', userId),
        hash
    );
    return !exists;
};

// Store used hash
const storeContentHash = async (hash: string, userId: string): Promise<void> => {
    await redisClient.sadd(CONTENT_HASH_KEY.replace('{user_id}', userId), hash);
    // Expire after 90 days
    await redisClient.expire(CONTENT_HASH_KEY.replace('{user_id}', userId), 90 * 24 * 60 * 60);
};
```

## Temas por Pilar (Biblioteca Completa)

### PILLAR: Educational (50 temas)

```yaml
educational_themes:
  - id: edu_001
    title: "Como Criar um Link in Bio que Converte"
    angles:
      - "Psicologia das cores no seu link"
      - "Anatomia de um CTA perfeito"
      - "Erros comuns que matam conversões"
      - "Teste A/B para iniciantes"
      
  - id: edu_002
    title: "Guia Completo de Analytics para Criadores de Conteúdo"
    angles:
      - "Métricas que realmente importam"
      - "Como interpretar taxa de clique"
      - "Dashboard simplificado"
      - "Ferramentas gratuitas essenciais"
      
  - id: edu_003
    title: "Otimização de Perfil: Do Básico ao Avançado"
    angles:
      - "Bio que vende em 150 caracteres"
      - "Foto de perfil profissional"
      - "Destaques estratégicos"
      - "Nome de usuário SEO-friendly"
      
  # ... 47 mais temas
```

### PILLAR: Trend Analysis (50 temas)

```yaml
trend_analysis_themes:
  - id: trend_001
    title: "O Futuro do Link in Bio: Tendências para 2025"
    angles:
      - "Integração com IA generativa"
      - "Comercialização social avançada"
      - "Personalização em tempo real"
      - "Previsões baseadas em dados"
      
  - id: trend_002
    title: "Social Commerce: A Revolução das Vendas Sociais"
    angles:
      - "Instagram Shopping vs TikTok Shop"
      - "Live commerce no Brasil"
      - "Micro-moments de compra"
      - "Influência autêntica"
      
  # ... 48 mais temas
```

### PILLAR: Case Studies (50 temas)

```yaml
case_study_themes:
  - id: case_001
    title: "Como Maria Doe Dobrou suas Vendas em 30 Dias"
    angles:
      - "Estratégia de lançamento"
      - "Otimização de conversão"
      - "Engajamento comunitário"
      - "Resultados mensuráveis"
      
  - id: case_002
    title: "De 0 a 10k: A Jornada de um Criador Digital"
    angles:
      - "Estratégia de conteúdo"
      - "Monetização gradual"
      - "Construção de audiência"
      - "Lições aprendidas"
      
  # ... 48 mais temas
```

### PILLAR: Tools & Tech (50 temas)

```yaml
tools_tech_themes:
  - id: tools_001
    title: "Comparativo Completo: Portyo vs Concorrência"
    angles:
      - "Análise de recursos"
      - "Preço-benefício"
      - "Facilidade de uso"
      - "Suporte ao cliente"
      
  - id: tools_002
    title: "Ferramentas de Design para Não-Designers"
    angles:
      - "Canva avançado"
      - "Templates prontos"
      - "Cores e tipografia"
      - "Consistência visual"
      
  # ... 48 mais temas
```

### PILLAR: Strategy (50 temas)

```yaml
strategy_themes:
  - id: strat_001
    title: "Funil de Vendas para Criadores de Conteúdo"
    angles:
      - "Top of funnel: Atração"
      - "Middle of funnel: Engajamento"
      - "Bottom of funnel: Conversão"
      - "Retenção e advocacy"
      
  - id: strat_002
    title: "Segmentação de Audiência Avançada"
    angles:
      - "Personas detalhadas"
      - "Jornada do cliente"
      - "Personalização em escala"
      - "Testes de segmento"
      
  # ... 48 mais temas
```

### PILLAR: Engagement (50 temas)

```yaml
engagement_themes:
  - id: eng_001
    title: "Psicologia do Click: O que Faz Pessoas Clicarem"
    angles:
      - "Padrões de atenção visual"
      - "Copywriting persuasivo"
      - "Prova social efetiva"
      - "Urgência e escassez"
      
  - id: eng_002
    title: "Storytelling que Converte em Bio Descriptions"
    angles:
      - "Estrutura narrativa"
      - "Conflito e resolução"
      - "Emoção vs lógica"
      - "Mini-stories efetivos"
      
  # ... 48 mais temas
```

## Engajamento: Métricas e Otimização

### Métricas de Engajamento

```typescript
interface EngagementMetrics {
    // Métricas primárias
    click_through_rate: number;      // Taxa de clique no link
    time_on_page: number;            // Tempo médio na página
    scroll_depth: number;            // Profundidade de scroll
    social_shares: number;           // Compartilhamentos sociais
    
    // Métricas secundárias
    return_visits: number;           // Visitas de retorno
    comment_rate: number;            // Taxa de comentários
    conversion_rate: number;         // Taxa de conversão
    bounce_rate: number;             // Taxa de rejeição
}
```

### Fatores de Engajamento no Conteúdo

1. **Curiosity Gap**: Deixar perguntas não respondidas para manter leitura
2. **Pattern Interrupts**: Quebrar padrões com formatação ou storytelling
3. **Open Loops**: Introduzir conceitos que serão resolvidos depois
4. **Social Proof**: Dados, casos, testemunhos que validam argumentos
5. **Specificity**: Números específicos aumentam credibilidade
6. **Future Pacing**: Fazer leitor imaginar resultado positivo

### Configurações de Engajamento no Schedule

```typescript
interface EngagementConfig {
    // Objetivo principal
    primary_goal: 'clicks' | 'shares' | 'comments' | 'conversions' | 'read_time';
    
    // Segmento emocional
    emotional_trigger: 'curiosity' | 'fear' | 'desire' | 'urgency' | 'belonging';
    
    // Formato otimizado para objetivo
    content_format: 
        | 'listicle'      // Ótimo para shares
        | 'how_to'        // Ótimo para SEO/read time
        | 'case_study'    // Ótimo para conversão
        | 'comparison'    // Ótimo para decisão de compra
        | 'opinion'       // Ótimo para comentários
        | 'news'          // Ótimo para freshness/recency
        | 'story'         // Ótimo para conexão emocional
        | 'data_study'    // Ótimo para autoridade/backlinks
    ;
    
    // CTA primário
    primary_cta: 'read_more' | 'try_portyo' | 'share' | 'comment' | 'download';
}
```

## Integração com Sistema Principal

### Fluxo de Geração

```typescript
// 1. Selecionar configuração de engajamento
const engagementConfig = selectEngagementConfig(schedule);

// 2. Gerar ContentConfig via TOON
const contentConfig = await toonOrchestrator.generateConfig({
    pillar: getNextPillar(schedule),
    engagementGoal: engagementConfig.primary_goal,
    history: await getContentHistory(schedule.userId),
});

// 3. Verificar unicidade
const contentHash = generateContentHash(
    contentConfig.pillar,
    contentConfig.theme,
    contentConfig.angle
);

if (!await isThemeUnique(contentHash, schedule.userId)) {
    // Retry com novo ângulo ou tema
    return retryWithVariation();
}

// 4. Gerar conteúdo via BAML
const generatedContent = await baml.GenerateBlogPost({
    config: contentConfig,
    history: await getRecentThemes(schedule.userId),
    brand_voice: "Portyo Content Strategist"
});

// 5. Validar e armazenar
if (generatedContent.engagement_score >= 75) {
    await storeContentHash(contentHash, schedule.userId);
    return generatedContent;
} else {
    return retryWithOptimization();
}
```

## Configurações Avançadas

### Schedule Entity - Novos Campos

```typescript
interface SiteAutoPostScheduleEntity {
    // ... existing fields ...
    
    // Engajamento
    engagementConfig: EngagementConfig;
    
    // Rotação de pilares
    currentPillar: string;
    pillarRotation: string[];  // Ordem personalizada
    
    // Temas excluídos (manualmente)
    excludedThemes: string[];
    
    // Temas favoritos (prioridade)
    favoriteThemes: string[];
    
    // Variações de ângulo
    angleVariations: number;  // Quantas variações tentar antes de mudar tema
    
    // Limiar de qualidade
    minEngagementScore: number;  // Score mínimo para publicar
    minSeoScore: number;
    minGeoScore: number;
    minAeoScore: number;
    
    // Tom de voz expandido
    voicePersonality: {
        trait: 'authoritative' | 'friendly' | 'edgy' | 'professional' | 'casual';
        humorLevel: 0-10;
        formality: 0-10;
        enthusiasm: 0-10;
    };
}
```

## Monitoramento e Melhoria Contínua

### Métricas de Performance por Pilar

```
Dashboard de Analytics:
├── Educational
│   ├── Avg Read Time: 4:30
│   ├── Share Rate: 12%
│   └── SEO Score: 88
├── Trend Analysis
│   ├── Avg Read Time: 3:45
│   ├── Share Rate: 18%
│   └── Freshness Score: 95
├── Case Studies
│   ├── Avg Read Time: 5:20
│   ├── Conversion Rate: 8%
│   └── Trust Score: 92
└── ... outros pilares
```

### Loop de Feedback

1. Analisar métricas de posts publicados
2. Identificar pilares/ângulos com melhor performance
3. Ajustar pesos na seleção de temas
4. Atualizar prompt templates com aprendizados
5. Refinar regras de engajamento

---

**Nota**: Este documento deve ser atualizado mensalmente com novos temas, ângulos e aprendizados de performance.
