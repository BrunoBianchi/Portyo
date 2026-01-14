import { Router } from "express";
import * as bcrypt from "bcrypt";
import z from "zod";
import { AppDataSource } from "../../../database/datasource";
import { UserEntity } from "../../../database/entity/user-entity";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router: Router = Router();

// Password validation schema
const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");

router.post("/change-password", requireAuth, async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = z.object({
            currentPassword: z.string().min(1, "Current password is required"),
            newPassword: passwordSchema,
            confirmPassword: z.string(),
        }).parse(req.body);

        // Check passwords match
        if (newPassword !== confirmPassword) {
            throw new ApiError(APIErrors.badRequestError, "Passwords do not match", 400);
        }

        const userId = req.user?.id;
        if (!userId) {
            throw new ApiError(APIErrors.unauthorizedError, "Not authenticated", 401);
        }

        const userRepository = AppDataSource.getRepository(UserEntity);

        // Get the user
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new ApiError(APIErrors.notFoundError, "User not found", 404);
        }

        // Check if user has password provider (not social login)
        if (user.provider !== 'password') {
            throw new ApiError(
                APIErrors.badRequestError, 
                `Your account uses ${user.provider} login. Password change is not available for social login accounts.`, 
                400
            );
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
        if (!isPasswordValid) {
            throw new ApiError(APIErrors.badRequestError, "Current password is incorrect", 400);
        }

        // Check if new password is different from current
        const isSamePassword = await bcrypt.compare(newPassword, user.password || '');
        if (isSamePassword) {
            throw new ApiError(APIErrors.badRequestError, "New password must be different from current password", 400);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update user password
        user.password = hashedPassword;
        await userRepository.save(user);

        res.status(200).json({ 
            message: "Password has been changed successfully." 
        });
    } catch (error) {
        next(error);
    }
});

export default router;
