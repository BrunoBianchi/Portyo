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
  
  // Security
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters for security"),
  
  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // Google
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Mailgun (for email automation)
  MAILGUN_API_SECRET: z.string().optional(),
  MAILGUN_DOMAIN: z.string().default("portyo.me"),
  MAILGUN_FROM_EMAIL: z.string().default("Portyo <noreply@portyo.me>"),
  MAILGUN_BASE_URL: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Frontend
  FRONTEND_URL: z.string().default("http://localhost:5173"),
});

export const env = envSchema.parse(process.env);
