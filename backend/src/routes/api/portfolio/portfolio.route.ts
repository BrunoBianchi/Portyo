import express from 'express';
import multer from 'multer';
import path from 'path';
import { AppDataSource } from '../../../database/datasource';
import { PortfolioItemEntity } from '../../../database/entity/portfolio-item-entity';
import { BioEntity } from '../../../database/entity/bio-entity';
import { requireAuth } from '../../../middlewares/auth.middleware';
import { z } from 'zod';
import { processPortfolioImage } from '../../../services/image.service';

const router = express.Router();
const portfolioRepository = AppDataSource.getRepository(PortfolioItemEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);

// Multer config for image uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

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
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const categoryId = req.query.categoryId as string;

        if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
             const where: any = { bioId: req.params.bioId };
             if (categoryId && categoryId !== 'null' && categoryId !== 'undefined') {
                 where.categoryId = categoryId;
             }

             const [items, total] = await portfolioRepository.findAndCount({
                where,
                relations: ['category'],
                order: { order: 'ASC', createdAt: 'ASC' },
                skip: (page - 1) * limit,
                take: limit
            });

            return res.json({
                data: items,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }

        const items = await portfolioRepository.find({
            where: { bioId: req.params.bioId },
            relations: ['category'],
            order: { order: 'ASC', createdAt: 'ASC' }
        });
        res.json(items);
    } catch (error) {
        console.error("Error fetching portfolio items:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * POST /portfolio/:bioId/upload - Upload portfolio image (auth required)
 */
router.post('/:bioId/upload', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await checkBioOwnership(req.params.bioId, userId);

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const imageUrl = await processPortfolioImage(req.file.buffer, userId);
        res.json({ url: imageUrl });
    } catch (error: any) {
        console.error("Error uploading portfolio image:", error);
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
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
            description: z.string().max(5000).optional().nullable().or(z.literal('')),
            images: z.array(z.string()).optional().default([]),
            categoryId: z.string().uuid().optional().nullable(),
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
            images: data.images || [],
            categoryId: data.categoryId || null,
            order: newOrder,
            bioId: req.params.bioId
        });

        await portfolioRepository.save(item);
        
        // Reload with category relation
        const savedItem = await portfolioRepository.findOne({
            where: { id: item.id },
            relations: ['category']
        });
        
        res.status(201).json(savedItem);
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
            description: z.string().max(5000).optional().nullable().or(z.literal('')),
            images: z.array(z.string()).optional(),
            categoryId: z.string().uuid().optional().nullable(),
            order: z.number().optional()
        });

        const data = schema.parse(req.body);

        if (data.title !== undefined) item.title = data.title;
        if (data.description !== undefined) item.description = data.description || null;
        if (data.images !== undefined) item.images = data.images;
        if (data.categoryId !== undefined) item.categoryId = data.categoryId;
        if (data.order !== undefined) item.order = data.order;

        await portfolioRepository.save(item);
        
        // Reload with category relation
        const savedItem = await portfolioRepository.findOne({
            where: { id: item.id },
            relations: ['category']
        });
        
        res.json(savedItem);
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
