import { Router } from "express";
import { addEmail } from "../../../shared/services/email.service";
import { z } from "zod";
import { activityService } from "../../../services/activity.service";
import { ActivityType } from "../../../database/entity/activity-entity";

const router: Router = Router();

router.post("/subscribe/:id", async (req, res) => {
    try {
        const { id } = z.object({ id: z.string() }).parse(req.params);
        const { email } = z.object({ email: z.string().email() }).parse(req.body);

        const result = await addEmail(email, id);
        
        // Log activity
        await activityService.logActivity(id, ActivityType.SUBSCRIBE, `New subscriber: ${email}`, { email });

        res.status(201).json(result);
    } catch (error: any) {
        // If email already exists (409), we can treat it as success for the public user to avoid leaking info, 
        // or return the error. For now, let's return the error but maybe the frontend handles it gracefully.
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

export default router;
