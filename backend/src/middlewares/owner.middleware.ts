import { NextFunction, Request, Response } from "express";
import { findBioById } from "../shared/services/bio.service";
import z from "zod"
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { BioEntity } from "../database/entity/bio-entity";
export const ownerMiddleware = async(req:Request,res:Response,next:NextFunction)=> {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const bio = await findBioById(id) as BioEntity | null;

    if (!bio) throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
    if(bio.userId != req.session.user!.id) throw new ApiError(APIErrors.authorizationError,"User not authorized",403)
    next()
}