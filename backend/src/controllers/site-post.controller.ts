import { Request, Response } from "express";
import { AppDataSource } from "../database/datasource";
import { SitePostEntity } from "../database/entity/site-post-entity";
import { UserEntity } from "../database/entity/user-entity";
import { logger } from "../shared/utils/logger";
import { ApiError, APIErrors } from "../shared/errors/api-error";

const sitePostRepository = AppDataSource.getRepository(SitePostEntity);
const userRepository = AppDataSource.getRepository(UserEntity);

const toSlug = (value: string): string => {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

const getCanonicalSlug = (post: SitePostEntity, lang: string): string => {
    const isPt = lang === "pt";
    const localizedTitle = isPt
        ? (post.titlePt || post.titleEn || post.title)
        : (post.titleEn || post.titlePt || post.title);

    const slug = localizedTitle ? toSlug(localizedTitle) : "";
    if (slug) return slug;

    return `post-${post.id.slice(0, 8)}`;
};

export const createSitePost = async (req: Request, res: Response) => {
    try {
        const {
            title,
            content,
            thumbnail,
            keywords,
            status,
            scheduledAt,
            language,
            titleEn,
            titlePt,
            contentEn,
            contentPt,
            keywordsEn,
            keywordsPt,
        } = req.body;
        const userId = req.user!.id;

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new ApiError(APIErrors.notFoundError, "User not found", 404);
        }

        const post = new SitePostEntity();
        post.title = title || titleEn || titlePt || "";
        post.content = content || contentEn || contentPt || "";
        post.thumbnail = thumbnail;
        post.keywords = keywords || keywordsEn || keywordsPt || "";
        post.titleEn = titleEn || (language === "en" ? title : null) || null;
        post.titlePt = titlePt || (language === "pt" ? title : null) || null;
        post.contentEn = contentEn || (language === "en" ? content : null) || null;
        post.contentPt = contentPt || (language === "pt" ? content : null) || null;
        post.keywordsEn = keywordsEn || (language === "en" ? keywords : null) || null;
        post.keywordsPt = keywordsPt || (language === "pt" ? keywords : null) || null;
        post.status = status || "draft";
        post.language = language || "en";
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
        const {
            title,
            content,
            thumbnail,
            keywords,
            status,
            scheduledAt,
            language,
            titleEn,
            titlePt,
            contentEn,
            contentPt,
            keywordsEn,
            keywordsPt,
        } = req.body;

        const post = await sitePostRepository.findOneBy({ id });
        if (!post) {
            throw new ApiError(APIErrors.notFoundError, "Post not found", 404);
        }

        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;
        if (thumbnail !== undefined) post.thumbnail = thumbnail;
        if (keywords !== undefined) post.keywords = keywords;
        if (status) post.status = status;
        if (language) post.language = language;
        if (scheduledAt !== undefined) post.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
        if (titleEn !== undefined) post.titleEn = titleEn;
        if (titlePt !== undefined) post.titlePt = titlePt;
        if (contentEn !== undefined) post.contentEn = contentEn;
        if (contentPt !== undefined) post.contentPt = contentPt;
        if (keywordsEn !== undefined) post.keywordsEn = keywordsEn;
        if (keywordsPt !== undefined) post.keywordsPt = keywordsPt;

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
        const lang = req.query.lang as string || 'en';
        
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

        const localizedPosts = visiblePosts
            .map((post) => {
                const isPt = lang === "pt";
                const title = isPt ? post.titlePt : post.titleEn ?? post.title;
                const content = isPt ? post.contentPt : post.contentEn ?? post.content;
                const keywords = isPt ? post.keywordsPt : post.keywordsEn ?? post.keywords;
                const slug = getCanonicalSlug(post, lang);

                if (!title || !content) return null;

                return {
                    ...post,
                    title,
                    content,
                    keywords,
                    slug,
                };
            })
            .filter(Boolean);

        return res.json(localizedPosts);
    } catch (error) {
        logger.error("Error fetching public site posts", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getPublicSitePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const lang = req.query.lang as string || 'en';

        let post = await sitePostRepository.findOne({
            where: {
                id,
                status: "published"
            }
        });

        if (!post) {
            const publishedPosts = await sitePostRepository.find({
                where: { status: "published" },
                order: { createdAt: "DESC" }
            });

            const now = new Date();
            post = publishedPosts.find((candidate) => {
                if (candidate.scheduledAt && candidate.scheduledAt > now) return false;
                const canonicalSlug = getCanonicalSlug(candidate, lang);
                return canonicalSlug === id;
            }) || null;
        }

        if (!post) {
            throw new ApiError(APIErrors.notFoundError, "Post not found", 404);
        }

        const isPt = lang === "pt";
        const title = isPt ? post.titlePt : post.titleEn ?? post.title;
        const content = isPt ? post.contentPt : post.contentEn ?? post.content;
        const keywords = isPt ? post.keywordsPt : post.keywordsEn ?? post.keywords;

        if (!title || !content) {
            throw new ApiError(APIErrors.notFoundError, "Post not found", 404);
        }

        const currentViews = post.views || 0;
        await sitePostRepository.increment({ id: post.id }, "views", 1);
        const views = currentViews + 1;

        return res.json({
            ...post,
            title,
            content,
            keywords,
            slug: getCanonicalSlug(post, lang),
            views,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.code).json({ message: error.message });
        }
        logger.error("Error fetching public site post", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
