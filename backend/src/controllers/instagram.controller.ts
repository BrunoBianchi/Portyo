import { Request, Response, NextFunction } from "express";
import { instagramService } from "../services/instagram.service";
import { ApiError, APIErrors } from "../shared/errors/api-error";

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

