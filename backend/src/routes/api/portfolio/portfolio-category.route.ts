import express from 'express';
import { AppDataSource } from '../../../database/datasource';
import { PortfolioCategoryEntity } from '../../../database/entity/portfolio-category-entity';
import { BioEntity } from '../../../database/entity/bio-entity';
import { requireAuth } from '../../../middlewares/auth.middleware';
import { z } from 'zod';

const router = express.Router();
const categoryRepository = AppDataSource.getRepository(PortfolioCategoryEntity);
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
 * GET /portfolio/categories/:bioId - Get all categories for a bio (public)
 */
router.get('/:bioId', async (req, res) => {
    try {
        const categories = await categoryRepository.find({
            where: { bioId: req.params.bioId },
            order: { order: 'ASC', createdAt: 'ASC' }
        });
        res.json(categories);
    } catch (error) {
        console.error("Error fetching portfolio categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * POST /portfolio/categories/:bioId - Create a new category (auth required)
 */
router.post('/:bioId', requireAuth, async (req, res) => {
    try {
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await checkBioOwnership(req.params.bioId, userId);

        const schema = z.object({
            name: z.string().min(1).max(100)
        });

        const data = schema.parse(req.body);

        // Get max order
        const maxOrderResult = await categoryRepository
            .createQueryBuilder('cat')
            .where('cat.bioId = :bioId', { bioId: req.params.bioId })
            .select('MAX(cat.order)', 'maxOrder')
            .getRawOne();
        
        const newOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

        const category = categoryRepository.create({
            name: data.name,
            order: newOrder,
            bioId: req.params.bioId
        });

        await categoryRepository.save(category);
        res.status(201).json(category);
    } catch (error: any) {
        console.error("Error creating portfolio category:", error);
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * PUT /portfolio/categories/:bioId/:id - Update a category (auth required)
 */
router.put('/:bioId/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await checkBioOwnership(req.params.bioId, userId);

        const category = await categoryRepository.findOne({
            where: { id: req.params.id, bioId: req.params.bioId }
        });

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        const schema = z.object({
            name: z.string().min(1).max(100).optional(),
            order: z.number().optional()
        });

        const data = schema.parse(req.body);

        if (data.name !== undefined) category.name = data.name;
        if (data.order !== undefined) category.order = data.order;

        await categoryRepository.save(category);
        res.json(category);
    } catch (error: any) {
        console.error("Error updating portfolio category:", error);
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * DELETE /portfolio/categories/:bioId/:id - Delete a category (auth required)
 */
router.delete('/:bioId/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await checkBioOwnership(req.params.bioId, userId);

        const category = await categoryRepository.findOne({
            where: { id: req.params.id, bioId: req.params.bioId }
        });

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        await categoryRepository.remove(category);
        res.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting portfolio category:", error);
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
