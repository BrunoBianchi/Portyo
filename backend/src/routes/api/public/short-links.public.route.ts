import { Router } from "express";
import { AppDataSource } from "../../../database/datasource";
import { ShortUrlEntity } from "../../../database/entity/short-url-entity";
import { BioEntity } from "../../../database/entity/bio-entity";
import z from "zod";

const router = Router();
const shortUrlRepository = AppDataSource.getRepository(ShortUrlEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);

router.get("/resolve/:username/:slug", async (req, res) => {
    try {
        const { username, slug } = z
            .object({
                username: z.string().min(1),
                slug: z.string().min(1),
            })
            .parse(req.params);

        const shortLink = await shortUrlRepository.findOne({
            where: {
                bio: { sufix: username },
                slug: slug.toLowerCase(),
            },
            relations: ["bio"],
        });

        if (!shortLink || !shortLink.isActive) {
            return res.status(404).json({ message: "Short link not found" });
        }

        shortLink.clicks += 1;
        shortLink.lastClickedAt = new Date();
        await shortUrlRepository.save(shortLink);

        return res.json({
            destinationUrl: shortLink.destinationUrl,
            title: shortLink.title,
            slug: shortLink.slug,
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

router.get("/resolve-domain/:domain/:slug", async (req, res) => {
    try {
        const { domain, slug } = z
            .object({
                domain: z.string().min(1),
                slug: z.string().min(1),
            })
            .parse(req.params);

        const bio = await bioRepository.findOne({
            where: { customDomain: domain.toLowerCase() },
        });

        if (!bio) {
            return res.status(404).json({ message: "Bio not found" });
        }

        const shortLink = await shortUrlRepository.findOne({
            where: {
                bio: { id: bio.id },
                slug: slug.toLowerCase(),
            },
        });

        if (!shortLink || !shortLink.isActive) {
            return res.status(404).json({ message: "Short link not found" });
        }

        shortLink.clicks += 1;
        shortLink.lastClickedAt = new Date();
        await shortUrlRepository.save(shortLink);

        return res.json({
            destinationUrl: shortLink.destinationUrl,
            title: shortLink.title,
            slug: shortLink.slug,
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;
