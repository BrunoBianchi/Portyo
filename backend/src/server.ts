import express from "express";
import routes from "./routes/index";
import { deserializeUser } from "./middlewares/auth.middleware";
import { customDomainMiddleware } from "./middlewares/custom-domain.middleware";
import * as session from "express-session";
import { errorMiddleware } from "./middlewares/error.middleware";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { logger } from "./shared/utils/logger";
import { sendOnboardingNudges } from "./shared/services/onboarding-nudge.service";
import schedule from "node-schedule";
// Sessions: keep in-memory store; Redis is used only for images/bio cache.

const app = express();
app.set('trust proxy', 1); // Trust Nginx proxy

// Helmet configuration - security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false, // Allow embedding resources from other origins
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://connect.facebook.net", "https://storage.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.portyo.me", "https://www.google-analytics.com", "https://www.googletagmanager.com"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://open.spotify.com", "https://www.google.com", "https://calendar.google.com"],
      workerSrc: ["'self'", "blob:"],
      mediaSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use(compression());


const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.http(JSON.stringify(logObject));
      },
    },
  })
);

// CORS configuration - validate origins against known domains
const allowedOrigins = [
  'https://portyo.me',
  'https://www.portyo.me',
  'https://api.portyo.me',
  ...(env.NODE_ENV !== 'production' ? ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'] : []),
];

// Cache validated custom domains for 5 minutes to avoid DB queries on every request
let customDomainCache: Set<string> = new Set();
let customDomainCacheExpiry = 0;
const CUSTOM_DOMAIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const isAllowedOrigin = async (origin: string): Promise<boolean> => {
  // Check static allowlist first
  if (allowedOrigins.includes(origin)) return true;
  
  // Check subdomain match (including *.localhost for dev)
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.portyo.me')) return true;
    // Allow *.localhost subdomains in development (e.g. company.localhost:5173)
    if (env.NODE_ENV !== 'production' && url.hostname.endsWith('.localhost')) return true;
  } catch (_) {
    // Invalid URL — not allowed
    return false;
  }
  
  // Check custom domains with cache
  const now = Date.now();
  if (now > customDomainCacheExpiry) {
    try {
      const { CustomDomainService } = await import('./shared/services/custom-domain.service');
      const { CustomDomainStatus } = await import('./database/entity/custom-domain-entity');
      const activeDomains = await CustomDomainService.listAllDomains(CustomDomainStatus.ACTIVE);
      customDomainCache = new Set(
        activeDomains.map((d: any) => `https://${d.domain}`)
          .concat(activeDomains.map((d: any) => `https://www.${d.domain}`))
      );
      customDomainCacheExpiry = now + CUSTOM_DOMAIN_CACHE_TTL;
    } catch (err) {
      logger.error('Failed to refresh CORS custom domain cache', err as any);
      // Keep stale cache on error
    }
  }
  
  return customDomainCache.has(origin);
};

app.use(
  cors({
    origin: async (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);
      
      const allowed = await isAllowedOrigin(origin);
      if (allowed) {
        return callback(null, origin);
      }
      
      // Reject unknown origins
      logger.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    exposedHeaders: ["Content-Length", "Content-Range"],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: "Too many requests, please try again later.",
    });
  },
});

// Stricter rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts, please try again later." },
});

app.use(limiter);

// Extend Express Request to include rawBody
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

// Body parsers with size limits to prevent DoS attacks
// 10MB is generous for JSON API payloads; images use multipart/form-data with separate limits
// Capture raw body for Stripe webhook verification
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser for refresh tokens
app.use(cookieParser());

app.use(
  session.default({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: 'lax', // CSRF protection: cookies only sent on same-site requests + top-level navigations
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    },
  })
);

app.use(deserializeUser);

// Middleware para detectar domínios personalizados
// Deve vir antes das rotas para identificar o domínio correto
app.use(customDomainMiddleware);

app.use(routes);
app.use(errorMiddleware);

import { CronService } from "./services/cron.service";

// ...

export const InitializateServer = () => {
  const port = env.PORT;
  const server = app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    
    // Initialize Cron Jobs
    CronService.init();
  });

  const runNudgeJob = async () => {
    try {
      await sendOnboardingNudges();
    } catch (error) {
      logger.error("Onboarding nudge job failed", error as any);
    }
  };

  schedule.scheduleJob("0 */1 * * *", runNudgeJob);
  setTimeout(runNudgeJob, 30 * 1000);

  const shutdown = () => {
    logger.info("Shutting down server...");
    server.close(() => {
      logger.info("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

// Export auth limiter for use in auth routes
export { authLimiter, app };
