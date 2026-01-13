import { NextFunction, Request, Response } from "express";
import { findBioById } from "../shared/services/bio.service";
import { formService } from "../services/form.service";
import z from "zod"
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { BioEntity } from "../database/entity/bio-entity";

export const verifyBioOwner = async(req:Request, res:Response, next:NextFunction)=> {
    const { bioId } = z.object({ bioId: z.string() }).parse(req.params);
    const bio = await findBioById(bioId) as BioEntity | null;

    if (!bio) throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
    
    if (!req.user?.id) throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
    
    if(bio.userId != req.user.id) throw new ApiError(APIErrors.authorizationError,"User not authorized",403)
    next()
}

export const verifyFormOwner = async(req:Request, res:Response, next:NextFunction)=> {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const form = await formService.findOne(id);
    
    if (!form) throw new ApiError(APIErrors.notFoundError, "Form not found", 404);

    if (!req.user?.id) throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
    
    // We need to fetch bio to check owner, or if form service returns bioId/userId
    // formService.findOne uses "relations: ['bio']" so form.bio should be available if we ensure it
    // But let's check what formService returns.
    // If it returns standard FormEntity, it has bio relation.
    
    // Assuming form has bioId or bio loaded. Ideally we check bio ownership.
    // Let's verify bio ownership via form.bioId
    
    const bio = await findBioById(form.bioId) as BioEntity | null;
     if (!bio) throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
     
    if(bio.userId != req.user.id) throw new ApiError(APIErrors.authorizationError,"User not authorized",403)
     next()
}
