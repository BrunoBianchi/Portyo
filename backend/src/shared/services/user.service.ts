import { UserType } from "../types/user.type";
import { AppDataSource } from "../../database/datasource";
import { UserEntity } from "../../database/entity/user-entity";
import { generateToken } from "./jwt.service";
import bcrypt from "bcrypt"
import { ApiError, APIErrors } from "../errors/api-error";

const repository = AppDataSource.getRepository(UserEntity);

export const findUserByEmail = async (email: string): Promise<UserType | null> => {
    return (await repository.findOneBy({ email })) as UserType || null
}

export const findUserByEmailWithoutPassword = async (email: string): Promise<Partial<UserType> | null> => {
    const user = (await repository.findOneBy({ email })) as UserType || null
    return user ? {
        email: user.email,
        id: user.id,
        provider: user.provider,
        plan: user.plan,
        verified: user.verified,
        fullName: user.fullName
    } as Partial<UserType> : null;
}

export const findUserById = async (id: string): Promise<UserType | null> => {
    return (await repository.findOneBy({ id })) as UserType || null;
}

export const createUser = async (user: Partial<UserType>): Promise<UserType> => {
    const userExist = await findUserByEmail(user.email!);
    if (userExist != null) {
        throw new ApiError(APIErrors.conflictError, "User already exist", 409);
    }
    const newUser = repository.create(user);
    return await repository.save(newUser);
}

export const createNewUser = async (user: Partial<UserType>): Promise<Object | Error> => {
    const savedUser = await createUser(user);
    
    // Add 7-day Standard Trial
    await BillingService.createBilling(savedUser.id, 'standard', 7, 0);
    
    const payload = {
        id: savedUser.id,
        email: savedUser.email,
        fullname: savedUser.fullName,
        verified: savedUser.verified,
        provider: savedUser.provider,
        createdAt: savedUser.createdAt,
        plan: 'standard' // User starts with standard trial
    }
    return {
        token: await generateToken({ ...payload }),
        user: payload
    }
}

import { BillingService } from "../../services/billing.service";

export const login = async (password: string, email: string): Promise<Object | Error> => {
    const user = await findUserByEmail(email)
    if (!user) throw new ApiError(APIErrors.unauthorizedError, "Invalid Credentials", 401);
    if (user.provider !== "password" || !user.password) throw new ApiError(APIErrors.unauthorizedError, "Invalid Credentials", 401);
    const isValidLogin = await bcrypt.compare(password, user.password);
    
    // Compute active plan dynamically
    const activePlan = await BillingService.getActivePlan(user.id);
    
    const payload = {
        id: user.id,
        email: user.email,
        fullname: user.fullName,
        verified: user.verified,
        provider: user.provider,
        createdAt: user.createdAt,
        plan: activePlan
    }
    if (!isValidLogin) throw new ApiError(APIErrors.unauthorizedError, "Invalid Credentials", 401);

    return {
        token: await generateToken({ ...payload }),
        user: payload
    }
}