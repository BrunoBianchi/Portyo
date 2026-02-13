import { NextFunction, Request, Response } from "express";
import z from "zod";
import { findBioById } from "../shared/services/bio.service";
import { pollService } from "../services/poll.service";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { BioEntity } from "../database/entity/bio-entity";

export const verifyPollBioOwner = async (req: Request, res: Response, next: NextFunction) => {
    const { bioId } = z.object({ bioId: z.string() }).parse(req.params);
    const bio = await findBioById(bioId) as BioEntity | null;

    if (!bio) throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
    if (!req.user?.id) throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
    if (bio.userId !== req.user.id) throw new ApiError(APIErrors.authorizationError, "User not authorized", 403);
    next();
};

export const verifyPollOwner = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const poll = await pollService.findOne(id);

    if (!poll) throw new ApiError(APIErrors.notFoundError, "Poll not found", 404);
    if (!req.user?.id) throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);

    const bio = await findBioById(poll.bioId) as BioEntity | null;
    if (!bio) throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
    if (bio.userId !== req.user.id) throw new ApiError(APIErrors.authorizationError, "User not authorized", 403);
    next();
};
