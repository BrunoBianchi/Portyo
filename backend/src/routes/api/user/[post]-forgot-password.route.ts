import { Router } from "express";
import { randomUUID } from "crypto";
import z from "zod";
import { AppDataSource } from "../../../database/datasource";
import { UserEntity } from "../../../database/entity/user-entity";
import { PasswordResetEntity } from "../../../database/entity/password-reset-entity";
import { MailService } from "../../../shared/services/mail.service";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

router.post("/forgot-password", async (req, res, next) => {
    try {
        const { email } = z.object({
            email: z.string().email(),
        }).parse(req.body);

        const userRepository = AppDataSource.getRepository(UserEntity);
        const resetRepository = AppDataSource.getRepository(PasswordResetEntity);

        const user = await userRepository.findOne({ where: { email } });
        
        // Always return success to prevent email enumeration
        if (!user) {
            return res.status(200).json({ 
                message: "If an account with that email exists, a password reset link has been sent." 
            });
        }

        // Check if user uses social login
        if (user.provider !== "password") {
            return res.status(400).json({ 
                error: "social_provider",
                message: `This account uses ${user.provider === "gmail" ? "Google" : user.provider} login. Please use that method to sign in.`
            });
        }

        // Delete any existing reset tokens for this user
        await resetRepository.delete({ userId: user.id });

        // Generate secure reset token
        const token = randomUUID();
        
        const resetToken = new PasswordResetEntity();
        resetToken.userId = user.id;
        resetToken.token = token;
        resetToken.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await resetRepository.save(resetToken);

        // Send reset email
        try {
            await MailService.sendPasswordResetEmail(user.email, token, user.fullName);
        } catch (error) {
            console.error("Failed to send password reset email", error);
            throw new ApiError(APIErrors.internalServerError, "Failed to send email", 500);
        }

        res.status(200).json({ 
            message: "If an account with that email exists, a password reset link has been sent." 
        });
    } catch (error) {
        next(error);
    }
});

export default router;
