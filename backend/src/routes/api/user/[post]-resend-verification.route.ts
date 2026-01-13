import { Router } from "express";
import z from "zod";
import { AppDataSource } from "../../../database/datasource";
import { UserEntity } from "../../../database/entity/user-entity";
import { VerificationTokenEntity } from "../../../database/entity/verification-token-entity";
import { MailService } from "../../../shared/services/mail.service";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

router.post("/resend-verification", async (req, res, next) => {
    try {
        const { email } = z.object({
            email: z.string().email(),
        }).parse(req.body);

        const userRepository = AppDataSource.getRepository(UserEntity);
        const tokenRepository = AppDataSource.getRepository(VerificationTokenEntity);

        const user = await userRepository.findOne({ where: { email } });
        if (!user) throw new ApiError(APIErrors.notFoundError, "User not found", 404);

        if (user.verified) {
            return res.status(200).json({ message: "Email already verified" });
        }

        // Generate new code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        const token = new VerificationTokenEntity();
        token.userId = user.id;
        token.token = code;
        token.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await tokenRepository.save(token);

        try {
            await MailService.sendVerificationEmail(user.email, code, user.fullName);
        } catch (error) {
            console.error("Failed to send verification email", error);
            throw new ApiError(APIErrors.internalServerError, "Failed to send email", 500);
        }

        res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
        next(error);
    }
});

export default router;
