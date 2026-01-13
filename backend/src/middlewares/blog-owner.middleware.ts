import { NextFunction, Request, Response } from "express";
import { getPostById } from "../shared/services/blog.service";
import z from "zod"
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { PostEntity } from "../database/entity/posts-entity";

export const blogOwnerMiddleware = async(req:Request,res:Response,next:NextFunction)=> {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const post = await getPostById(id) as PostEntity | null;

    if (!post) throw new ApiError(APIErrors.notFoundError, "Post not found", 404);
    
    if (!req.user?.id) throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);

    if(post.user.id != req.user.id) throw new ApiError(APIErrors.authorizationError,"User not authorized",403)
    next()
}
