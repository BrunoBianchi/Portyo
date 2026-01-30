import { UserType } from "../types/user.type";
import { AppDataSource } from "../../database/datasource";
import { UserEntity } from "../../database/entity/user-entity";
import { generateToken, generateRefreshToken } from "./jwt.service";
import { VerificationTokenEntity } from "../../database/entity/verification-token-entity";
import { MailService } from "./mail.service";
import bcrypt from "bcrypt"
import { ApiError, APIErrors } from "../errors/api-error";
import { BillingService } from "../../services/billing.service";
import { notificationService } from "../../services/notification.service";

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

    // If password provider, generate verification token
    if (savedUser.provider === "password" && !savedUser.verified) {
        const tokenRepository = AppDataSource.getRepository(VerificationTokenEntity);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        const token = new VerificationTokenEntity();
        token.userId = savedUser.id;
        token.token = code;
        token.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await tokenRepository.save(token);

        try {
            await MailService.sendVerificationEmail(savedUser.email, code, savedUser.fullName);
        } catch (error) {
            console.error("Failed to send verification email", error);
        }
    }
    
    // Add 7-day Standard Trial (email signup)
    await BillingService.ensureStandardTrial(savedUser.id, 7);
    const activePlan = await BillingService.getActivePlan(savedUser.id);

    // Create welcome notification
    try {
        await notificationService.createWelcomeNotification(savedUser.id);
    } catch (error) {
        console.error("Failed to create welcome notification:", error);
    }
    
    const payload = {
        id: savedUser.id,
        email: savedUser.email,
        fullname: savedUser.fullName,
        verified: savedUser.verified,
        provider: savedUser.provider,
        createdAt: savedUser.createdAt,
        plan: activePlan,
        onboardingCompleted: savedUser.onboardingCompleted
    }
    return {
        token: await generateToken({ ...payload }),
        refreshToken: await generateRefreshToken(savedUser.id),
        user: payload
    }
}

export const login = async (password: string, email: string): Promise<Object | Error> => {
    const user = await findUserByEmail(email)
    if (!user) throw new ApiError(APIErrors.unauthorizedError, "Invalid Credentials", 401);
    if (user.provider !== "password" || !user.password) throw new ApiError(APIErrors.unauthorizedError, "Invalid Credentials", 401);
    const isValidLogin = await bcrypt.compare(password, user.password);
    
    if (!isValidLogin) throw new ApiError(APIErrors.unauthorizedError, "Invalid Credentials", 401);

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

    return {
        token: await generateToken({ ...payload }),
        refreshToken: await generateRefreshToken(user.id),
        user: payload
    }
}