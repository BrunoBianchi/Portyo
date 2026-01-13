import { Router } from "express";
import z from "zod";
import { AppDataSource } from "../../../database/datasource";
import { UserEntity } from "../../../database/entity/user-entity";
import { VerificationTokenEntity } from "../../../database/entity/verification-token-entity";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

router.post("/verify-email", async (req, res, next) => {
    try {
        const { email, code } = z.object({
            email: z.string().email(),
            code: z.string().length(6),
        }).parse(req.body);

        const userRepository = AppDataSource.getRepository(UserEntity);
        const tokenRepository = AppDataSource.getRepository(VerificationTokenEntity);

        const user = await userRepository.findOne({ where: { email } });
        if (!user) throw new ApiError(APIErrors.notFoundError, "User not found", 404);

        if (user.verified) {
            return res.status(200).json({ message: "Email already verified" });
        }

        const token = await tokenRepository.findOne({
            where: {
                userId: user.id,
                token: code,
            },
            order: { expiresAt: "DESC" } // Get latest if duplicates exist?
        });

        if (!token) {
            throw new ApiError(APIErrors.badRequestError, "Invalid code", 400);
        }

        if (token.expiresAt < new Date()) {
            throw new ApiError(APIErrors.badRequestError, "Code expired", 400);
        }

        // Verify user
        user.verified = true;
        await userRepository.save(user);

        // Clean up tokens
        await tokenRepository.delete({ userId: user.id });

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        next(error);
    }
});

export default router;
