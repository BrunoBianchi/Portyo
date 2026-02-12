import { Router } from "express";
import z from "zod";
import { createNewUser, findUserByEmail } from "../../../shared/services/user.service";
import { createNewBio, findBioBySufix } from "../../../shared/services/bio.service";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";
import { AppDataSource } from "../../../database/datasource";
import { UserEntity } from "../../../database/entity/user-entity";

const router: Router = Router();

// Password strength schema: min 8 chars, uppercase, lowercase, number
const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");

router.post("/", async (req, res, next) => {
    try {
        const body = z.object({
            email: z.string().email("Invalid email format"),
            fullname: z.string().min(2, "Full name is required"),
            sufix: z.string().min(1, "Username suffix is required").optional(),
            password: passwordSchema,
        }).parse(req.body);

        // Pre-check for conflicts before creating anything
        if (await findUserByEmail(body.email)) {
            throw new ApiError(APIErrors.conflictError, "User already exist", 409);
        }

        // If sufix is taken, auto-generate a unique one by appending random numbers
        let finalSufix = body.sufix;
        if (finalSufix && await findBioBySufix(finalSufix)) {
            const baseSufix = finalSufix;
            let attempts = 0;
            while (await findBioBySufix(finalSufix) && attempts < 10) {
                finalSufix = `${baseSufix}-${Math.floor(Math.random() * 9000) + 1000}`;
                attempts++;
            }
        }

        const authentification = await createNewUser({
            email: body.email,
            fullName: body.fullname,
            password: body.password,
            provider: "password",
            verified: false,
        });

        // Try to create bio; if it fails, rollback the user to avoid "zombie" users
        let bio = null;
        if (finalSufix) {
            try {
                bio = await createNewBio(finalSufix, body.email);
            } catch (bioError) {
                // Rollback: remove the just-created user so retries don't get "User already exist"
                try {
                    const userId = (authentification as any).user?.id;
                    if (userId) {
                        const userRepository = AppDataSource.getRepository(UserEntity);
                        await userRepository.delete(userId);
                    }
                } catch (_rollbackErr) {
                    // Best-effort rollback
                }
                throw bioError;
            }
        }

        const payload = { authentification, bio };
        res.status(201).json(payload);
    } catch (error) {
        next(error);
    }
});

export default router;