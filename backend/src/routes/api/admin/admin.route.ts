import express from 'express';
import { updateSystemSetting } from '../../../shared/services/system-settings.service';

const router = express.Router();

const ADMIN_EMAIL = 'bruno2002.raiado@gmail.com';

router.post('/announcement', async (req, res) => {
    try {
        // Auth check
        if (!req.session?.user || req.session.user.email !== ADMIN_EMAIL) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const { text, link, isNew, isVisible } = req.body;
        
        // Validation simple
        if (typeof text !== 'string' || typeof link !== 'string') {
             return res.status(400).json({ error: "Invalid payload" });
        }

        const value = { text, link, isNew: !!isNew, isVisible: !!isVisible };
        await updateSystemSetting('announcement_bar', value);

        res.json({ success: true, value });
    } catch (error) {
        console.error("Error updating announcement:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
