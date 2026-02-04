// BAML Configuration for Portyo Content Generation
// Basic Augmented Markup Language for structured AI outputs

// ==================== ENUMS ====================

enum ContentPillar {
    EDUCATIONAL
    TREND_ANALYSIS
    CASE_STUDIES
    TOOLS_TECH
    STRATEGY
    ENGAGEMENT
}

enum EngagementGoal {
    CLICKS
    SHARES
    COMMENTS
    CONVERSIONS
    READ_TIME
}

enum ContentFormat {
    LISTICLE
    HOW_TO
    CASE_STUDY
    COMPARISON
    OPINION
    NEWS
    STORY
    DATA_STUDY
}

enum EmotionalTrigger {
    CURIOSITY
    FEAR
    DESIRE
    URGENCY
    BELONGING
    ACHIEVEMENT
}

enum VoiceTrait {
    AUTHORITATIVE
    FRIENDLY
    EDGY
    PROFESSIONAL
    CASUAL
    INSPIRATIONAL
}

// ==================== CLASSES ====================

class ContentConfig {
    pillar ContentPillar @description("Content pillar category")
    theme string @description("Specific theme from theme library")
    angle string @description("Unique angle/approach for this content")
    target_audience string @description("Primary audience segment")
    engagement_goal EngagementGoal @description("Primary engagement objective")
    content_format ContentFormat @description("Format optimized for the goal")
    emotional_trigger EmotionalTrigger @description("Primary emotional driver")
    word_count_target int @description("Target word count: 800-2500")
    language string @description("Primary language: pt|en")
    bilingual bool @description("Generate both PT and EN versions")
}

class SEOMetrics {
    seo_score float @description("Overall SEO score 0-100")
    title_optimization float @description("Title optimization 0-100")
    meta_description_score float @description("Meta description quality 0-100")
    content_structure float @description("Heading structure quality 0-100")
    keyword_density float @description("Natural keyword usage 0-100")
    readability float @description("Readability score 0-100")
    internal_linking float @description("Internal linking quality 0-100")
}

class GEOMetrics {
    geo_score float @description("Overall GEO score 0-100")
    entity_recognition float @description("Clear entity definitions 0-100")
    answer_optimization float @description("Answer-friendly content 0-100")
    structured_data_readiness float @description("Schema markup readiness 0-100")
    authority_signals float @description("Authority demonstration 0-100")
    context_clarity float @description("Context disambiguation 0-100")
}

class AEOMetrics {
    aeo_score float @description("Overall AEO score 0-100")
    answer_relevance float @description("Answer relevance to queries 0-100")
    direct_answer_score float @description("Direct answer presence 0-100")
    question_optimization float @description("Question-based headers 0-100")
    voice_search_score float @description("Voice search optimization 0-100")
    clarity_score float @description("Information clarity 0-100")
    conciseness_score float @description("Brevity without loss 0-100")
}

class EngagementMetrics {
    engagement_score float @description("Predicted engagement 0-100")
    emotional_trigger_score float @description("Emotional resonance 0-100")
    curiosity_gap_score float @description("Curiosity maintenance 0-100")
    social_proof_score float @description("Social proof integration 0-100")
    urgency_score float @description("Urgency without spam 0-100")
    shareability_score float @description("Share potential 0-100")
    cta_effectiveness float @description("CTA persuasiveness 0-100")
}

class GeneratedContent {
    // Core Content
    title string @description("SEO-optimized title, 50-60 chars")
    title_en string? @description("English version if bilingual")
    slug string @description("URL-friendly slug with keywords")
    
    meta_description string @description("Compelling meta description 150-160 chars")
    meta_description_en string? @description("English meta if bilingual"
    
    content string @description("Full markdown content with proper structure")
    content_en string? @description("English content if bilingual"
    
    keywords string @description("Comma-separated keywords, 5-10 terms")
    keywords_en string? @description("English keywords if bilingual"
    
    // Engagement Elements
    hook string @description("First paragraph designed to hook readers immediately")
    ctas string[] @description("Array of call-to-actions used in content")
    internal_links string[] @description("Suggested internal link placeholders")
    social_proof_elements string[] @description("Data points, testimonials, case mentions"
    
    // Content Stats
    word_count int @description("Actual word count")
    reading_time int @description("Estimated reading time in minutes"
    paragraph_count int @description("Number of paragraphs")
    heading_count int @description("Number of H2/H3 headings"
    
    // Scores
    seo_metrics SEOMetrics
    geo_metrics GEOMetrics
    aeo_metrics AEOMetrics
    engagement_metrics EngagementMetrics
    
    // Improvement tracking
    improvement_suggestions string[] @description("Suggestions for next posts")
    content_hash string @description("SHA256 hash for uniqueness tracking")
    pillar ContentPillar @description("Pillar used for this content")
    theme_id string @description("Theme identifier from library"
}

class VoiceConfig {
    trait VoiceTrait @description("Primary voice characteristic")
    humor_level int @description("Humor level 0-10, 0=serious, 10=very funny"
    formality int @description("Formality 0-10, 0=casual, 10=formal"
    enthusiasm int @description("Enthusiasm 0-10, 0=reserved, 10=very excited"
    use_emoji bool @description("Whether to use emojis in content")
    sentence_style string @description("short|medium|long|varied"
}

class ThemeLibrary {
    pillar ContentPillar
    theme_id string
    title_template string @description("Template for generating titles")
    angles string[] @description("Possible angles for this theme")
    related_themes string[] @description("Related theme IDs for linking"
    difficulty_level string @description("beginner|intermediate|advanced"
    evergreen bool @description("Whether theme is time-independent"
}

// ==================== FUNCTIONS ====================

function GenerateBlogPost(
    config: ContentConfig,
    voice: VoiceConfig,
    used_hashes: string[],
    brand_context: string
) -> GeneratedContent {
    client Groq
    
    prompt #"
    {{ _.role("system") }}
    
    Você é um escritor de conteúdo especialista em marketing digital, SEO e engajamento. 
    Sua voz: {{ voice.trait }} (humor: {{ voice.humor_level }}/10, formalidade: {{ voice.formality }}/10, entusiasmo: {{ voice.enthusiasm }}/10)
    
    {{ _.role("user") }}
    
    === CONTEXTO DA MARCA ===
    {{ brand_context }}
    
    === CONFIGURAÇÃO DO CONTEÚDO ===
    - Pilar: {{ config.pillar }}
    - Tema: {{ config.theme }}
    - Ângulo: {{ config.angle }}
    - Público: {{ config.target_audience }}
    - Objetivo: {{ config.engagement_goal }}
    - Formato: {{ config.content_format }}
    - Gatilho Emocional: {{ config.emotional_trigger }}
    - Palavras: ~{{ config.word_count_target }}
    - Idioma: {{ config.language }}
    - Bilíngue: {{ config.bilingual }}
    
    === TEMAS JÁ USADOS (NUNCA REPETIR) ===
    {{ used_hashes }}
    
    === FRAMEWORK DE ENGAGEMENT ===
    
    1. HOOK (Primeiros 150 caracteres):
       - Use: {{ config.emotional_trigger }} como gatilho principal
       - Crie Curiosity Gap imediatamente
       - Prometa valor específico e mensurável
    
    2. ESTRUTURA AIDA:
       - Attention: Headline impactante + Hook agressivo
       - Interest: Problema/Contexto relevante
       - Desire: Solução/Benefícios com prova social
       - Action: CTA claro e irresistível
    
    3. CTAs ESTRATÉGICOS (Mínimo 3):
       - CTA #1: Após o hook (micro-conversão)
       - CTA #2: Meio do conteúdo (engajamento)
       - CTA #3: Conclusão (conversão principal)
    
    4. ELEMENTOS DE ENGAGEMENT:
       - Pattern Interrupts: Varie formatação a cada 300 palavras
       - Open Loops: Introduza conceitos, resolva depois
       - Social Proof: Dados, estatísticas, casos reais
       - Specificity: Números exatos (ex: "47%", "em 3 dias")
       - Future Pacing: "Imagine quando..."
    
    === SEO/GEO/AEO CHECKLIST ===
    
    SEO:
    - Título: 50-60 chars, palavra-chave no início
    - Meta: 150-160 chars, CTA incluso
    - Headers: H1 (título) > H2 (seções) > H3 (subtópicos)
    - Keywords: Densidade 1-2%, variações semânticas
    - Parágrafos: Máximo 3-4 linhas para escaneabilidade
    
    GEO (Para IA entender):
    - Entidades claras: [Nome], [Marca], [Produto]
    - Relacionamentos explícitos entre conceitos
    - Definições em destaque para featured snippets
    - Structured data ready: datas, autores, categorias
    
    AEO (Answer Engine):
    - Respostas diretas em 40-60 palavras
    - Perguntas em H2 ("Como...", "O que...", "Por que...")
    - Listas numeradas para passo-a-passo
    - Tabelas para comparações
    - Voice search friendly: linguagem natural
    
    === FORMATO DE RESPOSTA ===
    
    Responda APENAS com JSON válido, sem markdown, sem explicações:
    
    {
        "title": "...",
        "title_en": "...",
        "slug": "...",
        "meta_description": "...",
        "meta_description_en": "...",
        "content": "# Título Principal\\n\\nHook inicial poderoso...\\n\\n## H2 Seção\\n\\nConteúdo...\\n\\n### H3 Subseção\\n\\n- Bullet point\\n- Outro ponto",
        "content_en": "...",
        "keywords": "...",
        "keywords_en": "...",
        "hook": "Primeiro parágrafo exato",
        "ctas": ["CTA 1", "CTA 2", "CTA 3"],
        "internal_links": ["[LINK: texto]"],
        "social_proof_elements": ["Estatística X", "Caso Y"],
        "word_count": 1200,
        "reading_time": 6,
        "paragraph_count": 15,
        "heading_count": 8,
        "seo_metrics": {
            "seo_score": 88,
            "title_optimization": 92,
            "meta_description_score": 90,
            "content_structure": 88,
            "keyword_density": 85,
            "readability": 87,
            "internal_linking": 82
        },
        "geo_metrics": {
            "geo_score": 86,
            "entity_recognition": 88,
            "answer_optimization": 85,
            "structured_data_readiness": 87,
            "authority_signals": 84,
            "context_clarity": 86
        },
        "aeo_metrics": {
            "aeo_score": 84,
            "answer_relevance": 86,
            "direct_answer_score": 83,
            "question_optimization": 85,
            "voice_search_score": 84,
            "clarity_score": 87,
            "conciseness_score": 82
        },
        "engagement_metrics": {
            "engagement_score": 89,
            "emotional_trigger_score": 90,
            "curiosity_gap_score": 88,
            "social_proof_score": 85,
            "urgency_score": 82,
            "shareability_score": 87,
            "cta_effectiveness": 91
        },
        "improvement_suggestions": ["sugestão 1", "sugestão 2"],
        "content_hash": "sha256_hash_aqui",
        "pillar": "{{ config.pillar }}",
        "theme_id": "theme_id_aqui"
    }
    "#
    
    retry 3
}

function GenerateContentIdea(
    pillar: ContentPillar,
    used_themes: string[],
    trending_topics: string[]
) -> ThemeLibrary {
    client Groq
    
    prompt #"
    Gere uma ideia de conteúdo única para o pilar: {{ pillar }}
    
    Temas já usados (NÃO REPETIR):
    {{ used_themes }}
    
    Tópicos em tendência (opcional):
    {{ trending_topics }}
    
    Responda com JSON:
    {
        "pillar": "{{ pillar }}",
        "theme_id": "unique_id",
        "title_template": "Template de título com {placeholder}",
        "angles": ["ângulo 1", "ângulo 2", "ângulo 3", "ângulo 4"],
        "related_themes": ["id_relacionado_1", "id_relacionado_2"],
        "difficulty_level": "beginner|intermediate|advanced",
        "evergreen": true|false
    }
    "#
}

function OptimizeForEngagement(
    content: string,
    current_metrics: EngagementMetrics,
    target_goal: EngagementGoal
) -> string {
    client Groq
    
    prompt #"
    Otimize este conteúdo para máximo engajamento com objetivo: {{ target_goal }}
    
    Métricas atuais:
    {{ current_metrics }}
    
    Conteúdo:
    {{ content }}
    
    INSTRUÇÕES:
    1. Melhore o hook para prender imediatamente
    2. Adicione pattern interrupts a cada 300 palavras
    3. Fortaleça CTAs para objetivo {{ target_goal }}
    4. Adicione elementos de urgência/prova social
    5. Melhore escaneabilidade com formatação
    
    Responda apenas com o conteúdo otimizado em markdown.
    "#
}

function CalculateContentUniqueness(
    new_content: string,
    previous_contents: string[]
) -> float {
    client Groq
    
    prompt #"
    Compare o novo conteúdo com conteúdos anteriores e retorne um score de unicidade 0-100.
    
    Considere:
    - Tópicos cobertos
    - Ângulo/abordagem
    - Exemplos usados
    - Estrutura narrativa
    
    Novo conteúdo:
    {{ new_content }}
    
    Conteúdos anteriores:
    {{ previous_contents }}
    
    Responda apenas com o número (ex: 87).
    "#
}

// ==================== TESTS ====================

test GenerateBlogPost {
    functions [GenerateBlogPost]
    
    test_case educational_post {
        input {
            config {
                pillar EDUCATIONAL
                theme "Como Criar um Link in Bio que Converte"
                angle "Psicologia das cores no seu link"
                target_audience "Criadores de conteúdo iniciantes"
                engagement_goal CONVERSIONS
                content_format HOW_TO
                emotional_trigger DESIRE
                word_count_target 1200
                language "pt"
                bilingual false
            }
            voice {
                trait FRIENDLY
                humor_level 4
                formality 5
                enthusiasm 7
                use_emoji true
                sentence_style "varied"
            }
            used_hashes []
            brand_context "Portyo é uma plataforma de link in bio que ajuda criadores a monetizar seu conteúdo."
        }
    }
}
