import express from "express";
import routes from "./routes/index";
import { deserializeUser } from "./middlewares/auth.middleware";
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
import { RedisStore } from "connect-redis";
import Redis from "ioredis";

const app = express();
app.set('trust proxy', 1); // Trust Nginx proxy

app.use(helmet());
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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [env.CORS_ORIGIN, "http://localhost:3000", "http://localhost:5173", "https://portyo.me", "https://www.portyo.me", "https://api.portyo.me"];
      const isAllowed = allowedOrigins.includes(origin) || /^http:\/\/.*\.localhost:5173$/.test(origin) || /^https:\/\/.*\.portyo\.me$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
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
// Capture raw body for Stripe webhook verification
app.use(express.json({ 
  limit: '100mb',
  verify: (req, res, buf) => {
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Cookie parser for refresh tokens
app.use(cookieParser());



// ... (existing imports)

// Initialize Redis client using env vars
const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
});

app.use(
  session.default({
    store: new RedisStore({ client: redisClient }),
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Recommended for Redis store to save storage
    cookie: { 
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    },
  })
);

app.use(deserializeUser);

app.use(routes);
app.use(errorMiddleware);

export const InitializateServer = () => {
  const port = env.PORT;
  const server = app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });

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
