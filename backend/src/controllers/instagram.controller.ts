import { Request, Response, NextFunction } from "express";
import { instagramService } from "../services/instagram.service";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { logger } from "../shared/utils/logger";
import { IntegrationEntity } from "../database/entity/integration-entity";
import { BioEntity } from "../database/entity/bio-entity";
import { AppDataSource } from "../database/datasource";
import { env } from "../config/env";
import { generateToken, decryptToken, generateRefreshToken } from "../shared/services/jwt.service";
import { createUser, findUserByEmail } from "../shared/services/user.service";
import { BillingService } from "../services/billing.service";

const getRequestBaseUrl = (req: Request): string => {
  const forwardedProto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim();
  const forwardedHost = (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0]?.trim();
  const proto = forwardedProto || req.protocol;
  const host = forwardedHost || req.get("host");

  if (host) {
    const normalizedHost = host.toLowerCase();
    if (normalizedHost.includes("localhost")) {
      return `${proto}://${host}`;
    }

    if (normalizedHost === "api.portyo.me" || normalizedHost.startsWith("api.portyo.me:")) {
      try {
        const frontendOrigin = new URL(env.FRONTEND_URL).origin;
        return frontendOrigin;
      } catch {
        return `${proto}://portyo.me`;
      }
    }

    return `${proto}://${host}`;
  }

  return env.FRONTEND_URL || env.BACKEND_URL;
};

const normalizeFrontendBaseUrl = (value?: string): string | undefined => {
  if (!value || typeof value !== "string") {
    return undefined;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();

    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".portyo.me") || host === "portyo.me") {
      return parsed.origin;
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const getFrontendBaseUrl = (req: Request, frontendBaseUrlFromState?: string, redirectUriFromState?: string): string => {
  const normalizedStateFrontendBaseUrl = normalizeFrontendBaseUrl(frontendBaseUrlFromState);
  if (normalizedStateFrontendBaseUrl) {
    return normalizedStateFrontendBaseUrl;
  }

  if (redirectUriFromState) {
    try {
      return new URL(redirectUriFromState).origin;
    } catch {
      // ignore parse errors and continue with fallbacks
    }
  }

  const requestBase = getRequestBaseUrl(req);
  if (requestBase.includes("localhost")) {
    return requestBase;
  }

  return env.FRONTEND_URL;
};

const getInstagramRedirectUri = (): string => {
  if (env.INSTAGRAM_REDIRECT_URI) {
    return env.INSTAGRAM_REDIRECT_URI;
  }

  try {
    const frontendOrigin = new URL(env.FRONTEND_URL).origin;
    return `${frontendOrigin}/api/instagram/auth`;
  } catch {
    return "https://portyo.me/api/instagram/auth";
  }
};

export const getLatestPosts = async (req: Request, res: Response, next: NextFunction) => {
  const rawUsername = req.params.username;
  if (!rawUsername) {
        next(new ApiError(APIErrors.badRequestError, "Username required", 400));
        return;
    }

  const username = rawUsername
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9._]/g, "")
    .replace(/^\.+|\.+$/g, "");

  if (!username) {
    return res.status(200).json([]);
  }

    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const posts = await instagramService.getLatestPosts(username, baseUrl);
    return res.status(200).json(Array.isArray(posts) ? posts : []);
    } catch (error) {
    logger.warn("Instagram public fetch fallback (returning empty list)", {
      username,
      error: (error as any)?.message,
    });
    return res.status(200).json([]);
    }
}

export const getProxyImage = async (req: Request, res: Response, next: NextFunction) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
        next(new ApiError(APIErrors.badRequestError, "URL is required", 400));
        return;
    }

    try {
        const { buffer, contentType } = await instagramService.getProxyImage(url);
        
        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }
        res.setHeader("Access-Control-Allow-Origin", "*");
        
        res.send(buffer);
    } catch (error) {
        next(error);
    }
}

export const getImage = async (req: Request, res: Response, next: NextFunction) => {
    const { shortcode } = req.params;
    if (!shortcode) {
        next(new ApiError(APIErrors.badRequestError, "Shortcode required", 400));
        return;
    }

    try {
        const { buffer, contentType } = await instagramService.getCachedImage(shortcode);
        
        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }
        
        // CORB/CORS fix
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

        // Cache control for the image itself (browser cache)
        res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
        
        res.send(buffer);
    } catch (error) {
        next(error);
    }
}


export const initiateAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mode = req.query.mode === "login" ? "login" : "integration";
      const redirectUri = getInstagramRedirectUri();
      const frontendBaseUrl = normalizeFrontendBaseUrl(typeof req.query.returnTo === "string" ? req.query.returnTo : undefined)
        || getFrontendBaseUrl(req, undefined, redirectUri);

      if (mode === "login") {
        const state = await generateToken({
          provider: "instagram",
          mode: "login",
          type: "login-state",
          redirectUri,
          frontendBaseUrl,
        });

        const authUrl = instagramService.getAuthUrl(redirectUri);
        const authUrlWithState = `${authUrl}&state=${encodeURIComponent(state)}`;

        if (req.xhr || req.headers.accept?.indexOf('json')! > -1) {
          return res.json({ url: authUrlWithState });
        }

        return res.redirect(authUrlWithState);
      }

      const { bioId } = req.query;
      
      if (!bioId) {
        throw new ApiError(APIErrors.badRequestError, "Bio ID is required", 400);
      }

      if (!req.user?.id) {
        throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);
      }

      const bioRepository = AppDataSource.getRepository(BioEntity);
      const bio = await bioRepository.findOne({
        where: {
          id: String(bioId),
          userId: req.user.id,
        },
      });

      if (!bio) {
        throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
      }

      const state = await generateToken({
        id: req.user.id,
        bioId: bio.id,
        provider: "instagram",
        type: "integration-state",
        mode: "integration",
        redirectUri,
        frontendBaseUrl,
      });
      
      const authUrl = instagramService.getAuthUrl(redirectUri);
      const authUrlWithState = `${authUrl}&state=${encodeURIComponent(state)}`;
      
      if (req.xhr || req.headers.accept?.indexOf('json')! > -1) {
         return res.json({ url: authUrlWithState });
      }
      
      res.redirect(authUrlWithState);
    } catch (error) {
      next(error);
    }
}

export const handleCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, error, error_reason, error_description, state } = req.query;

      if (!state || typeof state !== "string") {
        throw new ApiError(APIErrors.badRequestError, "State missing", 400);
      }

      const statePayload = await decryptToken(state);
      const mode = (statePayload as any).mode as "login" | "integration" | undefined;
      const provider = (statePayload as any).provider as string | undefined;
      const redirectUri = typeof (statePayload as any).redirectUri === "string"
        ? (statePayload as any).redirectUri
        : undefined;
      const frontendBaseUrlFromState = typeof (statePayload as any).frontendBaseUrl === "string"
        ? (statePayload as any).frontendBaseUrl
        : undefined;
      const frontendBaseUrl = getFrontendBaseUrl(req, frontendBaseUrlFromState, redirectUri);

      if (provider !== "instagram" || !mode) {
        throw new ApiError(APIErrors.badRequestError, "Invalid state", 400);
      }

      if (error) {
        logger.error("Instagram OAuth error", { error, error_reason, error_description, mode });
        if (mode === "login") {
          return res.redirect(`${frontendBaseUrl}/login?error=instagram_auth_failed`);
        }
        return res.redirect(`${frontendBaseUrl}/dashboard/integrations?error=instagram_auth_failed`);
      }

      if (!code || typeof code !== "string") {
        throw new ApiError(APIErrors.badRequestError, "Authorization code missing", 400);
      }

      const tokenData = await instagramService.exchangeCodeForToken(code, redirectUri);

      if (mode === "login") {
        const identitySeed = String(tokenData.userId || tokenData.instagramUsername || tokenData.pageId || Date.now()).toLowerCase();
        const generatedEmail = `${identitySeed.replace(/[^a-z0-9._-]/g, "") || "instagram"}@instagram.portyo.local`;
        const fallbackName = tokenData.instagramUsername || tokenData.pageName || "Instagram User";

        let user = await findUserByEmail(generatedEmail);
        if (!user) {
          user = await createUser({
            email: generatedEmail,
            provider: "instagram",
            fullName: fallbackName,
            verified: true,
            password: "",
          });
        }

        const activePlan = await BillingService.getActivePlan(user.id);

        const payload = {
          id: user.id,
          email: user.email,
          fullname: user.fullName,
          verified: user.verified,
          provider: user.provider,
          createdAt: user.createdAt,
          plan: activePlan,
          onboardingCompleted: user.onboardingCompleted,
        };

        const appAccessToken = await generateToken(payload);
        const appRefreshToken = await generateRefreshToken(user.id);

        res.cookie('refreshToken', appRefreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        if (req.session) {
          req.session.user = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            provider: user.provider,
            verified: user.verified,
            plan: activePlan,
            createdAt: user.createdAt,
          } as any;
        }

        const params = new URLSearchParams({ token: appAccessToken });
        if (user.onboardingCompleted === false) {
          params.set("returnTo", "/onboarding");
        }

        return res.redirect(`${frontendBaseUrl}/login?${params.toString()}`);
      }

      const bioId = (statePayload as any).bioId as string | undefined;
      const userId = (statePayload as any).id as string | undefined;

      if (!bioId || !userId) {
        throw new ApiError(APIErrors.badRequestError, "Invalid integration state", 400);
      }

      const bioRepository = AppDataSource.getRepository(BioEntity);
      const integrationRepository = AppDataSource.getRepository(IntegrationEntity);

      const bio = await bioRepository.findOne({ where: { id: bioId, userId } });
      if (!bio) {
         throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
      }

      let integration = await integrationRepository.findOne({
        where: {
          bio: { id: bio.id },
          provider: "instagram",
        },
      });

      if (!integration) {
        integration = new IntegrationEntity();
        integration.bio = bio;
        integration.provider = "instagram";
      }

      integration.account_id = tokenData.instagramBusinessAccountId;
      integration.name = tokenData.instagramUsername || tokenData.pageName || "Instagram";
      integration.accessToken = tokenData.accessToken;
      integration.refreshToken = tokenData.userToken;
      
      await integrationRepository.save(integration);

      res.redirect(`${frontendBaseUrl}/dashboard/integrations?success=instagram_connected`);
    } catch (error) {
      logger.error("Instagram callback failed", error);
      let callbackMode: "login" | "integration" = "integration";
      let frontendBaseUrl = getFrontendBaseUrl(req);
      const state = req.query.state;
      if (typeof state === "string") {
        try {
          const payload = await decryptToken(state);
          const frontendBaseUrlFromState = typeof (payload as any)?.frontendBaseUrl === "string"
            ? (payload as any).frontendBaseUrl
            : undefined;
          const redirectUri = typeof (payload as any)?.redirectUri === "string"
            ? (payload as any).redirectUri
            : undefined;
          frontendBaseUrl = getFrontendBaseUrl(req, frontendBaseUrlFromState, redirectUri);
          if ((payload as any)?.mode === "login") {
            callbackMode = "login";
          }
        } catch {
          callbackMode = "integration";
        }
      }

      if (callbackMode === "login") {
        return res.redirect(`${frontendBaseUrl}/login?error=instagram_callback_failed`);
      }
      return res.redirect(`${frontendBaseUrl}/dashboard/integrations?error=instagram_callback_failed`);
    }
}
