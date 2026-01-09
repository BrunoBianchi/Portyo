import { AppDataSource } from "../../database/datasource";
import { UserEntity } from "../../database/entity/user-entity";

const userRepository = AppDataSource.getRepository(UserEntity);

export const isUserPro = async (userId: string): Promise<boolean> => {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) return false;
    return user.plan === "pro";
};
