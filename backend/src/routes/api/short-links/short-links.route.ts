import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { AppDataSource } from "../../../database/datasource";
import { ShortUrlEntity } from "../../../database/entity/short-url-entity";
import { BioEntity } from "../../../database/entity/bio-entity";
import z from "zod";

const router = Router();
const shortUrlRepository = AppDataSource.getRepository(ShortUrlEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);

const normalizeSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

router.get("/", authMiddleware, async (req, res) => {
    try {
        const { bioId } = z.object({ bioId: z.string().uuid() }).parse(req.query);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Not Authenticated" });
        }

        const bio = await bioRepository.findOne({ where: { id: bioId, userId } });
        if (!bio) {
            return res.status(404).json({ message: "Bio not found" });
        }

        const shortLinks = await shortUrlRepository.find({
            where: { bio: { id: bioId } },
            order: { createdAt: "DESC" },
        });

        return res.json(shortLinks);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { bioId, title, slug, destinationUrl } = z
            .object({
                bioId: z.string().uuid(),
                title: z.string().min(1).max(120),
                slug: z.string().min(1).max(120),
                destinationUrl: z.string().url(),
            })
            .parse(req.body);

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not Authenticated" });
        }

        const bio = await bioRepository.findOne({ where: { id: bioId, userId } });
        if (!bio) {
            return res.status(404).json({ message: "Bio not found" });
        }

        const normalizedSlug = normalizeSlug(slug);
        if (!normalizedSlug) {
            return res.status(400).json({ message: "Invalid slug" });
        }

        const existing = await shortUrlRepository.findOne({
            where: {
                bio: { id: bioId },
                slug: normalizedSlug,
            },
        });

        if (existing) {
            return res.status(409).json({ message: "Slug already exists for this bio" });
        }

        const shortLink = shortUrlRepository.create({
            bio,
            title: title.trim(),
            slug: normalizedSlug,
            destinationUrl: destinationUrl.trim(),
        });

        const saved = await shortUrlRepository.save(shortLink);
        return res.status(201).json(saved);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

router.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
        const payload = z
            .object({
                title: z.string().min(1).max(120).optional(),
                slug: z.string().min(1).max(120).optional(),
                destinationUrl: z.string().url().optional(),
                isActive: z.boolean().optional(),
            })
            .parse(req.body);

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not Authenticated" });
        }

        const shortLink = await shortUrlRepository.findOne({
            where: { id },
            relations: ["bio"],
        });

        if (!shortLink) {
            return res.status(404).json({ message: "Short link not found" });
        }

        if (shortLink.bio.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (payload.slug) {
            const normalizedSlug = normalizeSlug(payload.slug);
            if (!normalizedSlug) {
                return res.status(400).json({ message: "Invalid slug" });
            }

            const existing = await shortUrlRepository.findOne({
                where: {
                    bio: { id: shortLink.bio.id },
                    slug: normalizedSlug,
                },
            });

            if (existing && existing.id !== shortLink.id) {
                return res.status(409).json({ message: "Slug already exists for this bio" });
            }

            shortLink.slug = normalizedSlug;
        }

        if (payload.title !== undefined) {
            shortLink.title = payload.title.trim();
        }

        if (payload.destinationUrl !== undefined) {
            shortLink.destinationUrl = payload.destinationUrl.trim();
        }

        if (payload.isActive !== undefined) {
            shortLink.isActive = payload.isActive;
        }

        const updated = await shortUrlRepository.save(shortLink);
        return res.json(updated);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Not Authenticated" });
        }

        const shortLink = await shortUrlRepository.findOne({
            where: { id },
            relations: ["bio"],
        });

        if (!shortLink) {
            return res.status(404).json({ message: "Short link not found" });
        }

        if (shortLink.bio.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await shortUrlRepository.remove(shortLink);
        return res.json({ success: true });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;
