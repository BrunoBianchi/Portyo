import { Router } from "express";
import z from "zod";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { findBioById } from "../../../shared/services/bio.service";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

router.get("/:id", ownerMiddleware, async (req, res) => {
     const { id } = z.object({ id: z.string() }).parse(req.params);
     const bio = await findBioById(id);

     if (!bio) throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);

     return res.status(200).json(bio);
});

export default router;