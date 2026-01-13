import { Request, Response } from "express";
import { AppDataSource } from "../database/datasource";
import { SitePostEntity } from "../database/entity/site-post-entity";
import { UserEntity } from "../database/entity/user-entity";
import { logger } from "../shared/utils/logger";
import { ApiError, APIErrors } from "../shared/errors/api-error";

const sitePostRepository = AppDataSource.getRepository(SitePostEntity);
const userRepository = AppDataSource.getRepository(UserEntity);

export const createSitePost = async (req: Request, res: Response) => {
    try {
        const { title, content, thumbnail, keywords, status, scheduledAt } = req.body;
        const userId = req.user!.id;

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new ApiError(APIErrors.notFoundError, "User not found", 404);
        }

        const post = new SitePostEntity();
        post.title = title;
        post.content = content;
        post.thumbnail = thumbnail;
        post.keywords = keywords;
        post.status = status || "draft";
        post.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
        post.user = user;

        await sitePostRepository.save(post);

        return res.status(201).json(post);
    } catch (error) {
        logger.error("Error creating site post", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getSitePosts = async (req: Request, res: Response) => {
    try {
        const posts = await sitePostRepository.find({
            order: { createdAt: "DESC" },
            // relations: ["user"] // Optional if we want author info
        });
        return res.json(posts);
    } catch (error) {
        logger.error("Error fetching site posts", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateSitePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, thumbnail, keywords, status, scheduledAt } = req.body;

        const post = await sitePostRepository.findOneBy({ id });
        if (!post) {
            throw new ApiError(APIErrors.notFoundError, "Post not found", 404);
        }

        if (title) post.title = title;
        if (content) post.content = content;
        if (thumbnail !== undefined) post.thumbnail = thumbnail;
        if (keywords) post.keywords = keywords;
        if (status) post.status = status;
        if (scheduledAt !== undefined) post.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

        await sitePostRepository.save(post);

        return res.json(post);
    } catch (error) {
        logger.error("Error updating site post", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteSitePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await sitePostRepository.delete(id);
        
        if (result.affected === 0) {
            throw new ApiError(APIErrors.notFoundError, "Post not found", 404);
        }

        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        logger.error("Error deleting site post", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getPublicSitePosts = async (req: Request, res: Response) => {
    try {
        const posts = await sitePostRepository.find({
            where: {
                status: "published"
            },
            order: {
                createdAt: "DESC"
            }
        });
        
        // Filter scheduled posts
        const now = new Date();
        const visiblePosts = posts.filter(p => !p.scheduledAt || p.scheduledAt <= now);

        return res.json(visiblePosts);
    } catch (error) {
        logger.error("Error fetching public site posts", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getPublicSitePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const post = await sitePostRepository.findOne({
            where: {
                id,
                status: "published"
            }
        });

        if (!post) {
            throw new ApiError(APIErrors.notFoundError, "Post not found", 404);
        }

        return res.json(post);
    } catch (error) {
        logger.error("Error fetching public site post", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
