import { Router } from "express";
import * as bcrypt from "bcrypt";
import z from "zod";
import { AppDataSource } from "../../../database/datasource";
import { UserEntity } from "../../../database/entity/user-entity";
import { PasswordResetEntity } from "../../../database/entity/password-reset-entity";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

// Password validation schema
const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");

router.post("/reset-password", async (req, res, next) => {
    try {
        const { token, password, confirmPassword } = z.object({
            token: z.string().uuid(),
            password: passwordSchema,
            confirmPassword: z.string(),
        }).parse(req.body);

        // Check passwords match
        if (password !== confirmPassword) {
            throw new ApiError(APIErrors.badRequestError, "Passwords do not match", 400);
        }

        const userRepository = AppDataSource.getRepository(UserEntity);
        const resetRepository = AppDataSource.getRepository(PasswordResetEntity);

        // Find the reset token
        const resetToken = await resetRepository.findOne({ 
            where: { token },
            relations: ["user"]
        });

        if (!resetToken) {
            throw new ApiError(APIErrors.badRequestError, "Invalid or expired reset link", 400);
        }

        // Check if token is expired
        if (resetToken.expiresAt < new Date()) {
            await resetRepository.delete({ id: resetToken.id });
            throw new ApiError(APIErrors.badRequestError, "Reset link has expired. Please request a new one.", 400);
        }

        // Get the user
        const user = await userRepository.findOne({ where: { id: resetToken.userId } });
        if (!user) {
            throw new ApiError(APIErrors.notFoundError, "User not found", 404);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update user password
        user.password = hashedPassword;
        await userRepository.save(user);

        // Delete all reset tokens for this user
        await resetRepository.delete({ userId: user.id });

        res.status(200).json({ 
            message: "Password has been reset successfully. You can now log in with your new password." 
        });
    } catch (error) {
        next(error);
    }
});

// Validate token endpoint (optional - to check if token is valid before showing form)
router.get("/validate-reset-token", async (req, res, next) => {
    try {
        const { token } = z.object({
            token: z.string().uuid(),
        }).parse(req.query);

        const resetRepository = AppDataSource.getRepository(PasswordResetEntity);

        const resetToken = await resetRepository.findOne({ where: { token } });

        if (!resetToken) {
            return res.status(400).json({ valid: false, error: "Invalid reset link" });
        }

        if (resetToken.expiresAt < new Date()) {
            await resetRepository.delete({ id: resetToken.id });
            return res.status(400).json({ valid: false, error: "Reset link has expired" });
        }

        res.status(200).json({ valid: true });
    } catch (error) {
        next(error);
    }
});

export default router;
