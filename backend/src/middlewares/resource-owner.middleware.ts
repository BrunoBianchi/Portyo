import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { findBioById } from "../shared/services/bio.service";
import { getPostById } from "../shared/services/blog.service";
import { BioEntity } from "../database/entity/bio-entity";
import { PostEntity } from "../database/entity/posts-entity";

type ResourceType = "bio" | "post";

interface ResourceConfig {
    type: ResourceType;
    paramName?: string;
}

/**
 * Factory function that creates a middleware to verify resource ownership.
 * Supports different resource types with consistent authorization logic.
 * 
 * @example
 * // For Bio resources
 * router.post("/update/:id", requireResourceOwner({ type: "bio" }), handler);
 * 
 * // For Post/Blog resources
 * router.delete("/:postId", requireResourceOwner({ type: "post", paramName: "postId" }), handler);
 */
export const requireResourceOwner = (config: ResourceConfig) => {
    const { type, paramName = "id" } = config;

    return async (req: Request, res: Response, next: NextFunction) => {
        // Validate param exists
        const schema = z.object({ [paramName]: z.string() });
        const params = schema.parse(req.params);
        const resourceId = params[paramName];

        // Get current user ID
        const userId = req.user?.id ?? req.session?.user?.id;
        if (!userId) {
            throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
        }

        // Fetch and validate resource ownership based on type
        switch (type) {
            case "bio": {
                const bio = await findBioById(resourceId) as BioEntity | null;
                if (!bio) {
                    throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
                }
                if (bio.userId !== userId) {
                    throw new ApiError(APIErrors.authorizationError, "User not authorized", 403);
                }
                break;
            }
            case "post": {
                const post = await getPostById(resourceId) as PostEntity | null;
                if (!post) {
                    throw new ApiError(APIErrors.notFoundError, "Post not found", 404);
                }
                if (post.user.id !== userId) {
                    throw new ApiError(APIErrors.authorizationError, "User not authorized", 403);
                }
                break;
            }
            default:
                throw new ApiError(APIErrors.internalServerError, `Unknown resource type: ${type}`, 500);
        }

        next();
    };
};

// Pre-configured middleware instances for convenience
export const requireBioOwner = requireResourceOwner({ type: "bio" });
export const requirePostOwner = requireResourceOwner({ type: "post" });
