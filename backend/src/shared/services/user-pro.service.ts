import { AppDataSource } from "../../database/datasource";
import { UserEntity } from "../../database/entity/user-entity";

const userRepository = AppDataSource.getRepository(UserEntity);

/**
 * Checks if user has a paid plan (standard or pro)
 * @param userId - The user's ID
 * @returns true if user has standard or pro plan, false otherwise
 */
export const isUserPro = async (userId: string): Promise<boolean> => {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) return false;
    
    // Normalize to lowercase and check if NOT free
    const userPlan = (user.plan || "free").toLowerCase();
    return userPlan !== "free";
};
