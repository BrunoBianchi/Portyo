import { z } from "zod";
import * as dotenv from "@dotenvx/dotenvx";
import * as path from "path";

// Load .env from src directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Database
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().default("5432"),
  DB_USERNAME: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  DB_DATABASE: z.string().default("portyo"),
  DB_SSL: z.string().transform((val) => val === "true").default(false),
  DB_CA: z.string().optional(),
  
  // Security
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters for security"),
  
  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),

  // CORS
  CORS_ORIGIN: z.string().default("https://portyo.me"),

  // Google
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Mailgun (for email automation)
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_API_SECRET: z.string().optional(),
  MAILGUN_DOMAIN: z.string().default("portyo.me"),
  MAILGUN_FROM_EMAIL: z.string().default("Portyo <noreply@portyo.me>"),
  MAILGUN_BASE_URL: z.string().optional(),

  // SMTP (for system emails)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Frontend
  FRONTEND_URL: z.string().default("https://portyo.me"),
  BACKEND_URL: z.string().default("https://api.portyo.me"),

  // Custom Domains / SSL
  CUSTOM_DOMAIN_DEPLOYMENT_DIR: z.string().optional(),
  CUSTOM_DOMAIN_ADD_SCRIPT_PATH: z.string().optional(),
  CUSTOM_DOMAIN_CNAME_TARGET: z.string().default("cname.portyo.me"),
  CUSTOM_DOMAIN_CERTBOT_EMAIL: z.string().default("admin@portyo.me"),
  CUSTOM_DOMAIN_REQUIRE_CNAME_ONLY: z.string().transform((val) => val !== "false").default(true),
  SAAS_BASE_DOMAIN: z.string().default("portyo.me"),
  COMPANY_SUBDOMAIN: z.string().default("company.portyo.me"),

  // Redis
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.any().transform((val) => Number(val)).default(6379),
  REDIS_USERNAME: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // AI - Multiple API Keys for rotation/fallback
  // Primary: Z.AI (GLM 4.7)
  Z_AI_API_KEY: z.string().optional(),
  Z_AI_MODEL: z.string().default("glm-4.7"),
  Z_AI_BASE_URL: z.string().default("https://api.z.ai/v1"),
  
  // Fallback: Groq
  GROQ_API_KEY: z.string().optional(),
  GROQ_API_KEY_1: z.string().optional(),
  GROQ_API_KEY_2: z.string().optional(),
  GROQ_MODEL: z.string().default("moonshotai/kimi-k2-instruct-0905"),

  // Instagram
  INSTAGRAM_CLIENT_ID: z.string().optional(),
  INSTAGRAM_CLIENT_SECRET: z.string().optional(),
  INSTAGRAM_REDIRECT_URI: z.string().optional(),
  INSTAGRAM_WEBHOOK_VERIFY_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
console.log("Instagram Client ID loaded:", !!env.INSTAGRAM_CLIENT_ID);
