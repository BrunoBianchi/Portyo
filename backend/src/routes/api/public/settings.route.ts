import express from 'express';
import { getSystemSetting } from '../../../shared/services/system-settings.service';

const router = express.Router();

router.get('/announcement', async (req, res) => {
    try {
        const announcement = await getSystemSetting('announcement_bar');
        // Default values if not set
        const defaultAnnouncement = {
            text: "Launch your bio page in seconds!",
            link: "/sign-up",
            isNew: true,
            isVisible: true
        };
        res.json(announcement || defaultAnnouncement);
    } catch (error) {
        console.error("Error fetching announcement:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
