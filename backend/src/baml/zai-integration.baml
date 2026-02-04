// BAML Configuration for Z.AI (GLM 4.7) Integration
// Primary AI provider with Groq fallback

// ==================== CLIENT CONFIGURATION ====================

class ZAIConfig {
    api_key string @description("Z.AI API key from env")
    base_url string @default("https://api.z.ai/v1")
    model string @default("glm-4.7") @description("GLM 4.7 without deep think for speed")
    timeout_ms int @default(30000)
    max_retries int @default(2)
}

class GroqFallbackConfig {
    enabled bool @default(true)
    model string @default("llama-3.3-70b-versatile")
    trigger_on_error bool @default(true)
    trigger_on_busy bool @default(true)
    busy_threshold int @default(20) @description("Queue size threshold")
}

class QueueConfig {
    redis_key string @default("zai:queue")
    processing_key string @default("zai:processing")
    batch_size int @default(10)
    delay_ms int @default(500) @description("Delay between batches")
    max_wait_ms int @default(120000) @description("Max wait for result")
    poll_interval_ms int @default(500)
}

class AIProviderConfig {
    primary ZAIConfig
    fallback GroqFallbackConfig
    queue QueueConfig
}

// ==================== REQUEST/RESPONSE SCHEMAS ====================

enum AIProvider {
    ZAI
    GROQ
    CACHE
}

class ZAIRequest {
    id string @description("Unique request ID")
    messages Message[]
    model string
    temperature float @default(0.7)
    max_tokens int @default(2000)
    response_format ResponseFormat?
    priority int @default(5) @description("1-10, higher = more priority"
    retry_count int @default(0)
    timeout_ms int @default(30000)
}

class Message {
    role string @description("system|user|assistant")
    content string
}

class ResponseFormat {
    type string @description("json_object|text"
}

class ZAIResponse {
    id string
    content string
    model string
    usage TokenUsage?
    success bool
    error string?
    provider AIProvider
    processing_time_ms int
    retry_count int @default(0)
}

class TokenUsage {
    prompt_tokens int
    completion_tokens int
    total_tokens int
}

// ==================== QUEUE STATUS ====================

class QueueStats {
    queued int @description("Number of items in queue")
    processing int @description("Number of items being processed")
    total int @description("Total pending items"
    is_busy bool @description("True if queue exceeds threshold"
}

// ==================== BAML FUNCTIONS FOR Z.AI ====================

function ZAIChatCompletion(
    request: ZAIRequest,
    config: AIProviderConfig
) -> ZAIResponse {
    client ZAI
    
    prompt #"
    {{ _.role("system") }}
    Process this chat completion request using Z.AI GLM 4.7.
    If Z.AI fails or queue is busy, fallback to Groq.
    
    {{ _.role("user") }}
    Request ID: {{ request.id }}
    Model: {{ request.model }}
    Messages: {{ request.messages }}
    Temperature: {{ request.temperature }}
    Max Tokens: {{ request.max_tokens }}
    Priority: {{ request.priority }}
    "#
    
    retry 2
}

function ZAIBatchProcess(
    requests: ZAIRequest[],
    config: AIProviderConfig
) -> ZAIResponse[] {
    client ZAI
    
    prompt #"
    Process batch of {{ requests.length }} requests in parallel.
    Use Z.AI for all if queue not busy, else use Groq.
    Maintain order of responses.
    "#
}

function CheckQueueStatus(
    config: QueueConfig
) -> QueueStats {
    client Redis
    
    prompt #"
    Get current queue statistics from Redis:
    - ZCARD {{ config.redis_key }}
    - SCARD {{ config.processing_key }}
    - Calculate is_busy based on threshold
    "#
}

function EnqueueRequest(
    request: ZAIRequest,
    config: QueueConfig
) -> string {
    client Redis
    
    prompt #"
    Add request to Redis sorted set with score:
    - Score = timestamp + (10 - priority) * 1000
    - Key = {{ config.redis_key }}
    - Value = JSON.stringify(request)
    Return request ID.
    "#
}

function DequeueAndProcess(
    config: QueueConfig,
    batch_size: int
) -> ZAIResponse[] {
    client Redis, ZAI
    
    prompt #"
    1. Get batch from Redis: ZRANGE {{ config.redis_key }} 0 {{ batch_size - 1 }}
    2. Remove from queue: ZREM for each item
    3. Process each with Z.AI in parallel
    4. Store results in Redis with TTL
    5. Return responses
    "#
}

// ==================== TOON STAGE FUNCTIONS ====================

class TOONStage {
    name string @description("selector|researcher|writer|optimizer|validator"
    queue_key string
    processor string
}

class TOONRequest {
    id string
    stage TOONStage
    config BAMLContentConfig
    voice BAMLVoiceConfig
    used_hashes string[]
    brand_context string
    priority int
    retry_count int
    max_retries int
    created_at int
}

class TOONResult {
    id string
    stage string
    success bool
    data any?
    error string?
    provider AIProvider
    processing_time_ms int
}

function TOONSubmitStage(
    request: TOONRequest,
    stage: TOONStage
) -> string {
    client Redis
    
    prompt #"
    Submit request to TOON stage queue:
    1. Set stage in request
    2. Calculate score: timestamp + (10 - priority) * 1000
    3. ZADD to {{ stage.queue_key }}
    4. Return request ID
    "#
}

function TOONProcessStage(
    stage: TOONStage,
    requests: TOONRequest[],
    ai_config: AIProviderConfig
) -> TOONResult[] {
    client ZAI, Redis
    
    prompt #"
    Process batch of TOON requests for stage {{ stage.name }}:
    1. For each request, call appropriate AI based on stage
    2. Use Z.AI if available, else Groq
    3. Store results in Redis
    4. Queue to next stage if not final
    5. Return results
    "#
}

function TOONWaitForCompletion(
    request_id: string,
    timeout_ms: int,
    poll_interval_ms: int
) -> TOONResult {
    client Redis
    
    prompt #"
    Poll Redis for TOON completion:
    1. Check result keys for all stages
    2. If validator result exists, return it
    3. If any stage failed, return error
    4. Timeout after {{ timeout_ms }}ms
    "#
}

// ==================== BATCH CONTENT GENERATION ====================

class BatchContentRequest {
    id string
    schedule_id string
    content_summary SiteContentSummary
    voice_config BAMLVoiceConfig
    priority int
}

class BatchContentResult {
    id string
    content GeneratedSitePost?
    success bool
    error string?
    provider AIProvider
    processing_time_ms int
}

function GenerateBatchContentBAML(
    requests: BatchContentRequest[],
    ai_config: AIProviderConfig
) -> BatchContentResult[] {
    client ZAI, Groq
    
    prompt #"
    Generate content for {{ requests.length }} items:
    1. Check Z.AI queue status
    2. If not busy, use Z.AI batch processing
    3. If busy, fallback to Groq for all
    4. Return results in same order as requests
    "#
}

// ==================== CONFIGURATION ====================

default config AIProviderConfig = {
    primary: {
        api_key: "${Z_AI_API_KEY}",
        base_url: "https://api.z.ai/v1",
        model: "glm-4.7",
        timeout_ms: 30000,
        max_retries: 2
    },
    fallback: {
        enabled: true,
        model: "llama-3.3-70b-versatile",
        trigger_on_error: true,
        trigger_on_busy: true,
        busy_threshold: 20
    },
    queue: {
        redis_key: "zai:queue",
        processing_key: "zai:processing",
        batch_size: 10,
        delay_ms: 500,
        max_wait_ms: 120000,
        poll_interval_ms: 500
    }
}

// ==================== TESTS ====================

test ZAIIntegration {
    functions [ZAIChatCompletion, CheckQueueStatus]
    
    test_case single_completion {
        input {
            request {
                id "test_001"
                messages [
                    { role: "system", content: "You are a helpful assistant." }
                    { role: "user", content: "Hello, how are you?" }
                ]
                model "glm-4.7"
                temperature 0.7
                max_tokens 100
                priority 5
            }
            config default.config
        }
        
        expect {
            success true
            provider ZAI
            content not_empty
        }
    }
    
    test_case queue_status {
        input {
            config default.config.queue
        }
        
        expect {
            queued >= 0
            processing >= 0
            is_busy boolean
        }
    }
}

test TOONOrchestration {
    functions [TOONSubmitStage, TOONProcessStage]
    
    test_case selector_stage {
        input {
            request {
                id "toon_001"
                config {
                    pillar "educational"
                    theme "test theme"
                    target_audience "test"
                }
                priority 5
            }
            stage {
                name "selector"
                queue_key "toon:selector"
            }
        }
        
        expect {
            success true
            data.theme_id not_empty
        }
    }
}
