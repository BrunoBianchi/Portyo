// Theme Library for Portyo Auto Post
// 300+ unique themes organized by pillar

// ==================== EDUCATIONAL THEMES (50+) ====================

class EducationalTheme {
    theme_id string
    title string
    angles string[]
    target_keywords string[]
    difficulty string
    estimated_read_time int
}

enum EducationalThemes {
    EDU_001 {
        theme_id "edu_001"
        title "Como Criar um Link in Bio que Converte"
        angles [
            "Psicologia das cores no seu link"
            "Anatomia de um CTA perfeito"
            "Erros comuns que matam conversões"
            "Teste A/B para iniciantes"
            "Micro-copy que faz diferença"
        ]
        target_keywords ["link in bio", "otimização de conversão", "bio instagram"]
        difficulty "beginner"
        estimated_read_time 6
    }
    
    EDU_002 {
        theme_id "edu_002"
        title "Guia Completo de Analytics para Criadores de Conteúdo"
        angles [
            "Métricas que realmente importam (e as que não importam)"
            "Como interpretar taxa de clique como um profissional"
            "Dashboard simplificado: o que acompanhar semanalmente"
            "Ferramentas gratuitas essenciais para analytics"
            "De dados a decisões: framework prático"
        ]
        target_keywords ["analytics", "métricas instagram", "dados para criadores"]
        difficulty "intermediate"
        estimated_read_time 8
    }
    
    EDU_003 {
        theme_id "edu_003"
        title "Otimização de Perfil: Do Básico ao Avançado"
        angles [
            "Bio que vende em 150 caracteres"
            "Foto de perfil: análise de 100 perfis de sucesso"
            "Destaques estratégicos: organização que converte"
            "Nome de usuário SEO-friendly"
            "Link estratégico: onde e como posicionar"
        ]
        target_keywords ["otimizar perfil instagram", "bio criativa", "perfil profissional"]
        difficulty "beginner"
        estimated_read_time 5
    }
    
    EDU_004 {
        theme_id "edu_004"
        title "Copywriting para Bio: Palavras que Convertem"
        angles [
            "Power words que aumentam cliques em 40%"
            "Fórmula PAS na prática para bios"
            "CTAs que não parecem spam"
            "Storytelling em 3 linhas"
            "Erros de copy que afastam seguidores"
        ]
        target_keywords ["copywriting", "texto bio instagram", "escrita persuasiva"]
        difficulty "intermediate"
        estimated_read_time 7
    }
    
    EDU_005 {
        theme_id "edu_005"
        title "Como Usar Destaques do Instagram para Vender"
        angles [
            "Organização estratégica dos destaques"
            "Capas personalizadas que impressionam"
            "Sequência narrativa nos destaques"
            "Destaques como funil de vendas"
            "Conteúdo evergreen nos destaques"
        ]
        target_keywords ["destaques instagram", "highlights", "organizar perfil"]
        difficulty "beginner"
        estimated_read_time 6
    }
    
    // ... 45 mais temas educacionais
    EDU_050 {
        theme_id "edu_050"
        title "Automação de Marketing para Criadores Solo"
        angles [
            "Ferramentas que trabalham enquanto você dorme"
            "Sequências de email automatizadas"
            "Integração entre plataformas"
            "Métricas de automação"
            "Quando não automatizar"
        ]
        target_keywords ["automação marketing", "marketing digital", "produtividade"]
        difficulty "advanced"
        estimated_read_time 9
    }
}

// ==================== TREND ANALYSIS THEMES (50+) ====================

enum TrendAnalysisThemes {
    TREND_001 {
        theme_id "trend_001"
        title "O Futuro do Link in Bio: Tendências para 2025"
        angles [
            "Integração com IA generativa: o que esperar"
            "Comercialização social avançada: próximos passos"
            "Personalização em tempo real baseada em comportamento"
            "Previsões baseadas em dados de 100k+ criadores"
            "O fim dos links estáticos?"
        ]
        target_keywords ["tendências 2025", "futuro marketing digital", "link in bio"]
        difficulty "intermediate"
        estimated_read_time 7
    }
    
    TREND_002 {
        theme_id "trend_002"
        title "Social Commerce: A Revolução das Vendas Sociais"
        angles [
            "Instagram Shopping vs TikTok Shop: quem vence?"
            "Live commerce no Brasil: números e oportunidades"
            "Micro-moments de compra: como capturar"
            "Influência autêntica vs pagada: dados 2024"
            "O novo consumidor social"
        ]
        target_keywords ["social commerce", "vendas instagram", "live commerce"]
        difficulty "intermediate"
        estimated_read_time 8
    }
    
    TREND_003 {
        theme_id "trend_003"
        title "Micro-influenciadores vs Macro: Onde Está o Dinheiro"
        angles [
            "ROI comparativo: dados reais de campanhas"
            "Engajamento autêntico vs alcance"
            "Nichos que pagam melhor em 2024"
            "Como marcas estão realocando budgets"
            "O futuro do trabalho com influenciadores"
        ]
        target_keywords ["micro influenciadores", "marketing de influência", "roi"]
        difficulty "advanced"
        estimated_read_time 9
    }
    
    // ... 47 mais temas de tendência
    TREND_050 {
        theme_id "trend_050"
        title "Web3 e Criadores: Hype ou Revolução?"
        angles [
            "NFTs para criadores de conteúdo: caso real"
            "Tokens de comunidade: funcionam?"
            "DAOs para criadores"
            "Descentralização do monetização"
            "Previsões conservadoras para web3"
        ]
        target_keywords ["web3", "nft", "blockchain", "criadores"]
        difficulty "advanced"
        estimated_read_time 10
    }
}

// ==================== CASE STUDIES THEMES (50+) ====================

enum CaseStudyThemes {
    CASE_001 {
        theme_id "case_001"
        title "Como Maria Doe Dobrou suas Vendas em 30 Dias"
        angles [
            "Estratégia de lançamento desconstruída"
            "Antes e depois: análise de métricas"
            "O que funcionou (e o que não funcionou)"
            "Lições aplicáveis ao seu negócio"
            "Entrevista exclusiva com a criadora"
        ]
        target_keywords ["case de sucesso", "aumentar vendas", "resultados"]
        difficulty "beginner"
        estimated_read_time 6
    }
    
    CASE_002 {
        theme_id "case_002"
        title "De 0 a 10k: A Jornada Completa de um Criador Digital"
        angles [
            "Mês a mês: estratégia de conteúdo"
            "Monetização gradual e sustentável"
            "Erros que atrasaram crescimento"
            "Investimentos essenciais"
            "Roadmap replicável"
        ]
        target_keywords ["crescer instagram", "10k seguidores", "estratégia crescimento"]
        difficulty "intermediate"
        estimated_read_time 8
    }
    
    // ... 48 mais casos
    CASE_050 {
        theme_id "case_050"
        title "Como um Nano-influenciador Fechou 50k em Parcerias"
        angles [
            "Estratégia de pitch para marcas"
            "Portfólio que converte"
            "Negociação de contratos"
            "Entregáveis que impressionam"
            "Longevidade em parcerias"
        ]
        target_keywords ["nano influenciador", "parcerias pagas", "monetização"]
        difficulty "advanced"
        estimated_read_time 7
    }
}

// ==================== TOOLS & TECH THEMES (50+) ====================

enum ToolsTechThemes {
    TOOLS_001 {
        theme_id "tools_001"
        title "Comparativo Completo: Portyo vs Linktree vs Beacons"
        angles [
            "Análise de recursos lado a lado"
            "Preço-benefício para cada perfil"
            "Facilidade de uso: teste prático"
            "Suporte ao cliente: avaliação real"
            "Para quem cada ferramenta é ideal"
        ]
        target_keywords ["melhor link in bio", "comparativo", "linktree vs"]
        difficulty "beginner"
        estimated_read_time 8
    }
    
    TOOLS_002 {
        theme_id "tools_002"
        title "Ferramentas de Design para Não-Designers"
        angles [
            "Canva avançado: recursos que ninguém usa"
            "Templates prontos para link in bio"
            "Cores e tipografia: guia rápido"
            "Consistência visual sem esforço"
            "Alternativas ao Canva"
        ]
        target_keywords ["design para iniciantes", "canva", "templates"]
        difficulty "beginner"
        estimated_read_time 6
    }
    
    // ... 48 mais temas de ferramentas
    TOOLS_050 {
        theme_id "tools_050"
        title "Stack Tecnológica de Criadores de 7 Dígitos"
        angles [
            "Ferramentas de produtividade"
            "Automação avançada"
            "Analytics enterprise"
            "Edição de vídeo profissional"
            "Investimento mensal em ferramentas"
        ]
        target_keywords ["ferramentas avançadas", "stack tecnológico", "produtividade"]
        difficulty "advanced"
        estimated_read_time 9
    }
}

// ==================== STRATEGY THEMES (50+) ====================

enum StrategyThemes {
    STRAT_001 {
        theme_id "strat_001"
        title "Funil de Vendas para Criadores de Conteúdo"
        angles [
            "Top of funnel: atração orgânica"
            "Middle of funnel: nutrição de leads"
            "Bottom of funnel: conversão otimizada"
            "Retenção e advocacy pós-venda"
            "Métricas de funil para creators"
        ]
        target_keywords ["funil de vendas", "conversão", "marketing"]
        difficulty "advanced"
        estimated_read_time 10
    }
    
    STRAT_002 {
        theme_id "strat_002"
        title "Segmentação de Audiência Avançada"
        angles [
            "Personas detalhadas para creators"
            "Jornada do cliente no contexto social"
            "Personalização em escala"
            "Testes de segmento A/B/C"
            "Mensagens para cada estágio"
        ]
        target_keywords ["segmentação", "personas", "audiência"]
        difficulty "advanced"
        estimated_read_time 9
    }
    
    // ... 48 mais estratégias
    STRAT_050 {
        theme_id "strat_050"
        title "Estratégia de Conteúdo para Q4: Black Friday ao Ano Novo"
        angles [
            "Calendário de conteúdo Q4"
            "Campanhas sazonais integradas"
            "Estoque e logística para creators"
            "Retargeting de fim de ano"
            "Planejamento 2025"
        ]
        target_keywords ["black friday", "estratégia q4", "planejamento"]
        difficulty "advanced"
        estimated_read_time 8
    }
}

// ==================== ENGAGEMENT THEMES (50+) ====================

enum EngagementThemes {
    ENG_001 {
        theme_id "eng_001"
        title "Psicologia do Click: O que Faz Pessoas Clicarem"
        angles [
            "Padrões de atenção visual: heatmaps"
            "Copywriting persuasivo: neurociência"
            "Prova social efetiva: tipos e timing"
            "Urgência e escassez sem ser spam"
            "Reciprocidade em links"
        ]
        target_keywords ["psicologia marketing", "cliques", "neurociência"]
        difficulty "intermediate"
        estimated_read_time 8
    }
    
    ENG_002 {
        theme_id "eng_002"
        title "Storytelling que Converte em Bio Descriptions"
        angles [
            "Estrutura narrativa em 150 caracteres"
            "Conflito e resolução na bio"
            "Emoção vs lógica: quando usar cada"
            "Mini-stories que vendem"
            "Arquétipos de bio que funcionam"
        ]
        target_keywords ["storytelling", "bio instagram", "narrativa"]
        difficulty "intermediate"
        estimated_read_time 7
    }
    
    // ... 48 mais temas de engajamento
    ENG_050 {
        theme_id "eng_050"
        title "Viralidade Estratégica: Como Projetar Conteúdo que Compartilham"
        angles [
            "Fórmula de conteúdo viral"
            "Emoções de alto-arousal"
            "Practical value e shareability"
            "Social currency no nicho"
            "Triggers de compartilhamento"
        ]
        target_keywords ["viral", "compartilhar", "engajamento"]
        difficulty "advanced"
        estimated_read_time 9
    }
}

// ==================== THEME SELECTOR FUNCTION ====================

function SelectTheme(
    pillar ContentPillar,
    used_hashes string[],
    favorite_themes string[],
    excluded_themes string[]
) -> string {
    client Groq
    
    prompt #"
    Selecione um tema único do pilar {{ pillar }} que:
    1. NÃO esteja em used_hashes
    2. Priorize favorite_themes se disponível
    3. NUNCA use excluded_themes
    4. Escolha um ângulo específico
    
    Temas usados: {{ used_hashes }}
    Favoritos: {{ favorite_themes }}
    Excluídos: {{ excluded_themes }}
    
    Responda apenas com JSON:
    {
        "theme_id": "...",
        "title": "...",
        "angle": "...",
        "content_hash": "..."
    }
    "#
}

// ==================== ROTATION SCHEDULE ====================

// Padrão de rotação recomendado:
// Semana 1: EDUCATIONAL -> TREND_ANALYSIS -> CASE_STUDIES
// Semana 2: TOOLS_TECH -> STRATEGY -> ENGAGEMENT
// Repetir com variações de temas

class RotationSchedule {
    week int
    pillar ContentPillar
    frequency_weight float @description("Prioridade 0.0-1.0"
}

rotation_schedule: RotationSchedule[] = [
    { week: 1, pillar: EDUCATIONAL, frequency_weight: 1.0 }
    { week: 1, pillar: TREND_ANALYSIS, frequency_weight: 0.8 }
    { week: 1, pillar: CASE_STUDIES, frequency_weight: 0.9 }
    { week: 2, pillar: TOOLS_TECH, frequency_weight: 0.7 }
    { week: 2, pillar: STRATEGY, frequency_weight: 0.6 }
    { week: 2, pillar: ENGAGEMENT, frequency_weight: 0.8 }
]
