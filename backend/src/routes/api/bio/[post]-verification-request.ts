import { Router } from "express";
import z from "zod";
import { AppDataSource } from "../../../database/datasource";
import { BioEntity } from "../../../database/entity/bio-entity";
import { BioVerificationRequestEntity } from "../../../database/entity/bio-verification-request-entity";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

router.post("/verification-request/:id", ownerMiddleware, async (req, res) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);

    const optionalTrimmed = (minLength: number) =>
        z.preprocess(
            (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
            z.string().min(minLength).optional()
        );

    const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: optionalTrimmed(6),
        description: optionalTrimmed(10)
    }).parse(req.body);

    const bioRepository = AppDataSource.getRepository(BioEntity);
    const requestRepository = AppDataSource.getRepository(BioVerificationRequestEntity);

    const bio = await bioRepository.findOneBy({ id });
    if (!bio) throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);

    if (bio.verified) {
        return res.status(400).json({ message: "Bio already verified" });
    }

    const existing = await requestRepository.findOne({
        where: { bioId: id, status: "pending" }
    });

    if (existing) {
        if (bio.verificationStatus !== "pending") {
            bio.verificationStatus = "pending";
            await bioRepository.save(bio);
        }
        return res.status(200).json({ status: "pending", bio });
    }

    const request = requestRepository.create({
        bioId: id,
        userId: req.user!.id as string,
        name: schema.name,
        email: schema.email,
        phone: schema.phone || "",
        description: schema.description || "",
        status: "pending"
    });

    await requestRepository.save(request);

    bio.verificationStatus = "pending";
    await bioRepository.save(bio);

    return res.status(200).json({ status: "pending", bio });
});

export default router;
