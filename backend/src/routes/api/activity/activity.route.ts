import { Router, Request, Response } from "express";
import { activityService } from "../../../services/activity.service";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const { bioId, limit } = req.query;
        
        if (!bioId) {
            return res.status(400).json({ message: "Bio ID is required" });
        }

        const activities = await activityService.getRecentActivities(
            bioId as string, 
            limit ? parseInt(limit as string) : 5
        );
        
        return res.json(activities);
    } catch (error) {
        console.error("Error fetching activities:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
