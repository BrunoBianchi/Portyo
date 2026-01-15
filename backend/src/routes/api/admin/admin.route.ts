import express from 'express';
import { updateSystemSetting } from '../../../shared/services/system-settings.service';
import { requireAdmin, ADMIN_EMAIL } from '../../../middlewares/admin.middleware';
import { requireAuth } from '../../../middlewares/auth.middleware';
import * as AdminService from '../../../shared/services/admin.service';
import { z } from 'zod';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

/**
 * GET /admin/stats - Get admin dashboard statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await AdminService.getAdminStats();
        res.json(stats);
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * GET /admin/users - List all users with pagination and search
 */
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const search = req.query.search as string;
        const sortBy = (req.query.sortBy as string) || 'createdAt';
        const sortOrder = ((req.query.sortOrder as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';

        const result = await AdminService.getAllUsers(page, limit, search, sortBy, sortOrder);
        res.json(result);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * GET /admin/users/:id - Get single user details
 */
router.get('/users/:id', async (req, res) => {
    try {
        const user = await AdminService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * POST /admin/users/:id/ban - Ban or unban a user
 */
router.post('/users/:id/ban', async (req, res) => {
    try {
        const schema = z.object({
            isBanned: z.boolean()
        });
        const { isBanned } = schema.parse(req.body);
        
        const user = await AdminService.setUserBanStatus(req.params.id, isBanned);
        res.json({ 
            success: true, 
            user: {
                id: user.id,
                email: user.email,
                isBanned: user.isBanned
            }
        });
    } catch (error: any) {
        console.error("Error updating ban status:", error);
        res.status(error.statusCode || 500).json({ error: error.message || "Internal Server Error" });
    }
});

/**
 * POST /admin/users/:id/plan - Set user plan with optional duration
 */
router.post('/users/:id/plan', async (req, res) => {
    try {
        const schema = z.object({
            plan: z.enum(['free', 'standard', 'pro']),
            durationDays: z.number().min(0).optional()
        });
        const { plan, durationDays } = schema.parse(req.body);
        
        const result = await AdminService.setUserPlan(req.params.id, plan, durationDays);
        res.json({ 
            success: true, 
            user: {
                id: req.params.id,
                plan: result.plan,
                planExpiresAt: result.planExpiresAt
            }
        });
    } catch (error: any) {
        console.error("Error updating user plan:", error);
        res.status(error.statusCode || 500).json({ error: error.message || "Internal Server Error" });
    }
});

/**
 * DELETE /admin/users/:id - Delete a user
 */
router.delete('/users/:id', async (req, res) => {
    try {
        await AdminService.deleteUser(req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        res.status(error.statusCode || 500).json({ error: error.message || "Internal Server Error" });
    }
});

/**
 * POST /admin/announcement - Update announcement bar
 */
router.post('/announcement', async (req, res) => {
    try {
        const { text, link, badge, isNew, isVisible, bgColor, textColor, fontSize, textAlign } = req.body;
        
        if (typeof text !== 'string' || typeof link !== 'string') {
             return res.status(400).json({ error: "Invalid payload" });
        }

        const value = { 
            text, 
            link, 
            badge: badge || (isNew ? 'new' : 'none'),
            isVisible: !!isVisible,
            bgColor: bgColor || '#000000',
            textColor: textColor || '#ffffff',
            fontSize: fontSize || '14',
            textAlign: textAlign || 'left'
        };
        await updateSystemSetting('announcement_bar', value);

        res.json({ success: true, value });
    } catch (error) {
        console.error("Error updating announcement:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
