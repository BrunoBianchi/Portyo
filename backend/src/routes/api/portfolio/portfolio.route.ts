import express from 'express';
import { AppDataSource } from '../../../database/datasource';
import { PortfolioItemEntity } from '../../../database/entity/portfolio-item-entity';
import { BioEntity } from '../../../database/entity/bio-entity';
import { requireAuth } from '../../../middlewares/auth.middleware';
import { z } from 'zod';

const router = express.Router();
const portfolioRepository = AppDataSource.getRepository(PortfolioItemEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);

// Helper to check bio ownership
const checkBioOwnership = async (bioId: string, userId: string) => {
    const bio = await bioRepository.findOne({ where: { id: bioId, userId } });
    if (!bio) {
        throw { status: 404, message: "Bio not found or access denied" };
    }
    return bio;
};

/**
 * GET /portfolio/:bioId - Get all portfolio items for a bio (public)
 */
router.get('/:bioId', async (req, res) => {
    try {
        const items = await portfolioRepository.find({
            where: { bioId: req.params.bioId },
            order: { order: 'ASC', createdAt: 'ASC' }
        });
        res.json(items);
    } catch (error) {
        console.error("Error fetching portfolio items:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * POST /portfolio/:bioId - Create a new portfolio item (auth required)
 */
router.post('/:bioId', requireAuth, async (req, res) => {
    try {
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await checkBioOwnership(req.params.bioId, userId);

        const schema = z.object({
            title: z.string().min(1).max(200),
            description: z.string().max(5000).optional(),
            image: z.string().url().optional().nullable(),
            order: z.number().optional()
        });

        const data = schema.parse(req.body);

        // Get max order for this bio
        const maxOrderResult = await portfolioRepository
            .createQueryBuilder('item')
            .where('item.bioId = :bioId', { bioId: req.params.bioId })
            .select('MAX(item.order)', 'maxOrder')
            .getRawOne();
        
        const newOrder = data.order ?? ((maxOrderResult?.maxOrder ?? -1) + 1);

        const item = portfolioRepository.create({
            title: data.title,
            description: data.description || null,
            image: data.image || null,
            order: newOrder,
            bioId: req.params.bioId
        });

        await portfolioRepository.save(item);
        res.status(201).json(item);
    } catch (error: any) {
        console.error("Error creating portfolio item:", error);
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * PUT /portfolio/:bioId/:id - Update a portfolio item (auth required)
 */
router.put('/:bioId/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await checkBioOwnership(req.params.bioId, userId);

        const item = await portfolioRepository.findOne({
            where: { id: req.params.id, bioId: req.params.bioId }
        });

        if (!item) {
            return res.status(404).json({ error: "Portfolio item not found" });
        }

        const schema = z.object({
            title: z.string().min(1).max(200).optional(),
            description: z.string().max(5000).optional().nullable(),
            image: z.string().url().optional().nullable(),
            order: z.number().optional()
        });

        const data = schema.parse(req.body);

        if (data.title !== undefined) item.title = data.title;
        if (data.description !== undefined) item.description = data.description;
        if (data.image !== undefined) item.image = data.image;
        if (data.order !== undefined) item.order = data.order;

        await portfolioRepository.save(item);
        res.json(item);
    } catch (error: any) {
        console.error("Error updating portfolio item:", error);
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * DELETE /portfolio/:bioId/:id - Delete a portfolio item (auth required)
 */
router.delete('/:bioId/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await checkBioOwnership(req.params.bioId, userId);

        const item = await portfolioRepository.findOne({
            where: { id: req.params.id, bioId: req.params.bioId }
        });

        if (!item) {
            return res.status(404).json({ error: "Portfolio item not found" });
        }

        await portfolioRepository.remove(item);
        res.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting portfolio item:", error);
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * PUT /portfolio/:bioId/reorder - Reorder portfolio items (auth required)
 */
router.put('/:bioId/reorder', requireAuth, async (req, res) => {
    try {
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await checkBioOwnership(req.params.bioId, userId);

        const schema = z.object({
            items: z.array(z.object({
                id: z.string().uuid(),
                order: z.number()
            }))
        });

        const { items } = schema.parse(req.body);

        // Update each item's order
        for (const { id, order } of items) {
            await portfolioRepository.update(
                { id, bioId: req.params.bioId },
                { order }
            );
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error("Error reordering portfolio items:", error);
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
