// BAML Client Configuration
// Defines the LLM clients to be used for different functions

client<llm> GPT4 {
  provider openai
  options {
    model "gpt-4o"
    temperature 0.7
    max_tokens 8192
  }
}

client<llm> GPT4oMini {
  provider openai
  options {
    model "gpt-4o-mini"
    temperature 0.5
    max_tokens 4096
  }
}

client<llm> GroqLlama {
  provider openai
  options {
    model "llama-3.3-70b-versatile"
    base_url "https://api.groq.com/openai/v1"
    api_key env.GROQ_API_KEY
    temperature 0.7
    max_tokens 8192
  }
}

client<llm> GroqLlamaFast {
  provider openai
  options {
    model "llama-3.3-70b-versatile"
    base_url "https://api.groq.com/openai/v1"
    api_key env.GROQ_API_KEY
    temperature 0.4
    max_tokens 4096
  }
}
