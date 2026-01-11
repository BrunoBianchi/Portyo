import { AppDataSource } from "../../database/datasource";
import { UserEntity } from "../../database/entity/user-entity";
import { BillingService } from "../../services/billing.service";
import { ApiError, APIErrors } from "../errors/api-error";

const userRepository = AppDataSource.getRepository(UserEntity);

/**
 * Email limits per plan
 */
const EMAIL_LIMITS = {
    free: 0,
    standard: 150,
    pro: 500
};

/**
 * Get the email limit for a specific plan
 */
export const getEmailLimit = (plan: string): number => {
    return EMAIL_LIMITS[plan as keyof typeof EMAIL_LIMITS] || 0;
};

/**
 * Reset email count if we're in a new month
 */
const resetIfNeeded = async (user: UserEntity): Promise<UserEntity> => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    if (!user.emailsLastResetMonth || user.emailsLastResetMonth !== currentMonth) {
        user.emailsSentThisMonth = 0;
        user.emailsLastResetMonth = currentMonth;
        await userRepository.save(user);
    }
    
    return user;
};

/**
 * Check if user can send emails based on their plan and current usage
 * @throws ApiError if limit is reached
 */
export const checkEmailLimit = async (userId: string): Promise<{ canSend: boolean; sent: number; limit: number; plan: string }> => {
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
        throw new ApiError(APIErrors.notFoundError, "User not found", 404);
    }
    
    // Get active plan from billing
    const activePlan = await BillingService.getActivePlan(userId);
    const limit = getEmailLimit(activePlan);
    
    // Reset if needed
    await resetIfNeeded(user);
    
    // Refresh user after potential reset
    const updatedUser = await userRepository.findOne({ where: { id: userId } });
    if (!updatedUser) {
        throw new ApiError(APIErrors.notFoundError, "User not found", 404);
    }
    
    const canSend = updatedUser.emailsSentThisMonth < limit;
    
    if (!canSend) {
        throw new ApiError(
            APIErrors.paymentRequiredError,
            `Email limit reached. Your ${activePlan} plan allows ${limit} emails per month. Upgrade your plan to send more emails.`,
            402
        );
    }
    
    return {
        canSend,
        sent: updatedUser.emailsSentThisMonth,
        limit,
        plan: activePlan
    };
};

/**
 * Increment the email count for a user
 */
export const incrementEmailCount = async (userId: string): Promise<void> => {
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
        throw new ApiError(APIErrors.notFoundError, "User not found", 404);
    }
    
    // Reset if needed
    await resetIfNeeded(user);
    
    // Increment counter
    user.emailsSentThisMonth += 1;
    await userRepository.save(user);
};

/**
 * Get email usage statistics for a user
 */
export const getEmailUsage = async (userId: string): Promise<{ sent: number; limit: number; plan: string }> => {
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
        throw new ApiError(APIErrors.notFoundError, "User not found", 404);
    }
    
    // Get active plan from billing
    const activePlan = await BillingService.getActivePlan(userId);
    const limit = getEmailLimit(activePlan);
    
    // Reset if needed
    await resetIfNeeded(user);
    
    // Refresh user after potential reset
    const updatedUser = await userRepository.findOne({ where: { id: userId } });
    if (!updatedUser) {
        throw new ApiError(APIErrors.notFoundError, "User not found", 404);
    }
    
    return {
        sent: updatedUser.emailsSentThisMonth,
        limit,
        plan: activePlan
    };
};
