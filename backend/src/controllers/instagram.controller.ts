import { Request, Response, NextFunction } from "express";
import { instagramService } from "../services/instagram.service";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { logger } from "../shared/utils/logger";
import { IntegrationEntity } from "../database/entity/integration-entity";
import { BioEntity } from "../database/entity/bio-entity";
import { AppDataSource } from "../database/datasource";
import { env } from "../config/env";
import { generateToken, decryptToken } from "../shared/services/jwt.service";

export const getLatestPosts = async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params;
    if (!username) {
        next(new ApiError(APIErrors.badRequestError, "Username required", 400));
        return;
    }

    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const posts = await instagramService.getLatestPosts(username, baseUrl);
        res.json(posts);
    } catch (error) {
        next(error);
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
      });
      
      const authUrl = instagramService.getAuthUrl();
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

      if (error) {
        logger.error("Instagram OAuth error", { error, error_reason, error_description });
        return res.redirect(`${env.FRONTEND_URL}/dashboard/integrations?error=instagram_auth_failed`);
      }

      if (!code || typeof code !== "string") {
        throw new ApiError(APIErrors.badRequestError, "Authorization code missing", 400);
      }

      if (!state || typeof state !== "string") {
        throw new ApiError(APIErrors.badRequestError, "State missing", 400);
      }

      const statePayload = await decryptToken(state);
      const bioId = (statePayload as any).bioId as string | undefined;
      const userId = (statePayload as any).id as string | undefined;
      const provider = (statePayload as any).provider as string | undefined;

      if (!bioId || !userId || provider !== "instagram") {
        throw new ApiError(APIErrors.badRequestError, "Invalid state", 400);
      }

      const tokenData = await instagramService.exchangeCodeForToken(code);

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

      res.redirect(`${env.FRONTEND_URL}/dashboard/integrations?success=instagram_connected`);
    } catch (error) {
      logger.error("Instagram callback failed", error);
      res.redirect(`${env.FRONTEND_URL}/dashboard/integrations?error=instagram_callback_failed`);
    }
}
