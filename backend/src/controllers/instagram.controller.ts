import { Request, Response, NextFunction } from "express";
import { instagramService } from "../services/instagram.service";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { logger } from "../shared/utils/logger";
import { IntegrationEntity } from "../database/entity/integration-entity";
import { BioEntity } from "../database/entity/bio-entity";
import { AppDataSource } from "../database/datasource";
import { env } from "../config/env";

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
        
        res.send(buffer);
    } catch (error) {
        next(error);
    }
}


export const initiateAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bioId } = req.query;
      
      if (!bioId) {
        throw new ApiError(APIErrors.badRequestError, "Bio ID is required", 400);
      }
      
      const authUrl = instagramService.getAuthUrl();
      const authUrlWithState = `${authUrl}&state=${bioId}`;
      
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

      const bioId = state as string;
      if (!bioId) {
         throw new ApiError(APIErrors.badRequestError, "State (bioId) missing", 400);
      }

      const tokenData = await instagramService.exchangeCodeForToken(code);
      
      // Get User Profile
      // const profile = await instagramService.getUserProfile(tokenData.accessToken);

      const bioRepository = AppDataSource.getRepository(BioEntity);
      const integrationRepository = AppDataSource.getRepository(IntegrationEntity);

      const bio = await bioRepository.findOne({ where: { id: bioId } });
      if (!bio) {
         throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
      }

      let integration = await integrationRepository.findOne({ 
        where: { 
          bio: { id: bio.id },
          provider: "instagram",
          account_id: tokenData.userId.toString()
        } 
      });

      if (!integration) {
        integration = new IntegrationEntity();
        integration.bio = bio;
        integration.provider = "instagram";
      }

      integration.account_id = tokenData.userId.toString();
      integration.name = "Instagram"; 
      integration.accessToken = tokenData.accessToken;
      
      await integrationRepository.save(integration);

      res.redirect(`${env.FRONTEND_URL}/dashboard/integrations?success=instagram_connected`);
    } catch (error) {
      logger.error("Instagram callback failed", error);
      res.redirect(`${env.FRONTEND_URL}/dashboard/integrations?error=instagram_callback_failed`);
    }
}
