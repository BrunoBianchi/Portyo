import { UserType } from "../types/user.type";
import { AppDataSource } from "../../database/datasource";
import { UserEntity } from "../../database/entity/user-entity";
import { generateToken } from "./jwt.service";
import bcrypt from "bcrypt"
import { is } from "zod/v4/locales";
import { ApiError, APIErrors } from "../errors/api-error";

const repository = AppDataSource.getRepository(UserEntity);
export const findUserByEmail = async (email: string): Promise<UserType | null> => {
    return (await repository.findOneBy({ email })) as UserType || null;
}

export const createNewUser = async (user: Partial<UserType>): Promise<Object | Error> => {
    const userExist = await findUserByEmail(user.email!);
    if (userExist) {
        throw new ApiError(APIErrors.conflictError, "User already exist", 409);
    } else {
        const newUser = await repository.create(user);
        await repository.save(newUser) as UserType;
        const payload = {
            id: user.id,
            email: user.email,

            fullname: user.fullName,
            verified: user.verified,
            provider: user.provider,
            createdAt: user.createdAt
        }
        return {
            token: await generateToken({ ...payload }),
            user: payload
        }
    }
}

export const login = async (password: string, email: string): Promise<Object | Error> => {
    const user = await findUserByEmail(email)
    if (!user) throw new ApiError(APIErrors.unauthorizedError, "Invalid Credentials", 401);
    const isValidLogin = await bcrypt.compare(password, user.password);
    const payload = {
        id: user.id,
        email: user.email,
        fullname: user.fullName,

        verified: user.verified,
        provider: user.provider,
        createdAt: user.createdAt
    }
    if (!isValidLogin) throw new ApiError(APIErrors.unauthorizedError, "Invalid Credentials", 401);
    
    return {
        token: await generateToken({ ...payload }),
        user: payload
    }
}