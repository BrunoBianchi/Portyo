import { AppDataSource } from "../../database/datasource";
import { SponsoredClickEntity } from "../../database/entity/sponsored-click-entity";
import { SponsoredAdoptionEntity } from "../../database/entity/sponsored-adoption-entity";
import { SponsoredOfferEntity } from "../../database/entity/sponsored-offer-entity";
import { ApiError, APIErrors } from "../errors/api-error";
import * as crypto from "crypto";
import geoip from "geoip-lite";
import { MoreThan } from "typeorm";

const ClickRepository = AppDataSource.getRepository(SponsoredClickEntity);
const AdoptionRepository = AppDataSource.getRepository(SponsoredAdoptionEntity);
const OfferRepository = AppDataSource.getRepository(SponsoredOfferEntity);

// ---------------------------------------------------------------------------
// Bot / Crawler User-Agent blacklist (Google Ads-style)
// ---------------------------------------------------------------------------
const BOT_UA_PATTERNS = [
    /bot/i, /crawl/i, /spider/i, /scrape/i, /headless/i, /phantom/i,
    /selenium/i, /puppeteer/i, /playwright/i, /wget/i, /curl/i,
    /python-requests/i, /httpx/i, /axios/i, /node-fetch/i, /go-http/i,
    /java\//i, /libwww/i, /apache-httpclient/i, /okhttp/i,
    /googlebot/i, /bingbot/i, /yandex/i, /baiduspider/i,
    /facebookexternalhit/i, /twitterbot/i, /slurp/i, /duckduckbot/i,
    /ia_archiver/i, /ahrefsbot/i, /semrushbot/i, /dotbot/i,
    /rogerbot/i, /mj12bot/i, /blexbot/i, /petalbot/i,
];

function isBot(userAgent: string): boolean {
    if (!userAgent || userAgent.length < 10) return true;          // Empty / suspiciously short
    if (!/mozilla|chrome|safari|firefox|edge|opera|okhttp/i.test(userAgent)) return true; // No real browser token
    return BOT_UA_PATTERNS.some(p => p.test(userAgent));
}

function hashIp(ip: string): string {
    return crypto.createHash("sha256").update(ip).digest("hex");
}

/** Compound fingerprint: combines IP hash + UA hash for network+device dedup */
function compoundFingerprint(ipHash: string, userAgent: string): string {
    return crypto.createHash("sha256").update(`${ipHash}:${userAgent}`).digest("hex");
}

function parseDevice(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return "Mobile";
    if (/tablet/i.test(userAgent)) return "Tablet";
    return "Desktop";
}

function parseBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) return "Chrome";
    if (/firefox/i.test(userAgent)) return "Firefox";
    if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return "Safari";
    if (/edge/i.test(userAgent)) return "Edge";
    if (/opera|opr/i.test(userAgent)) return "Opera";
    return "Unknown";
}

export interface TrackClickResult {
    success: boolean;
    redirectUrl: string;
    valid: boolean;
    reason?: string;
}

export async function trackClick(
    trackingCode: string,
    ip: string,
    userAgent: string,
    fingerprint?: string,
    referrer?: string,
    sessionId?: string,
): Promise<TrackClickResult> {
    // Find adoption
    const adoption = await AdoptionRepository.findOne({
        where: { trackingCode, status: "active" },
        relations: ["offer"],
    });

    if (!adoption || !adoption.offer) {
        throw new ApiError(APIErrors.notFoundError, "Link not found", 404);
    }

    const offer = adoption.offer;
    const redirectUrl = offer.linkUrl;

    // Check offer is still active
    if (offer.status !== "active") {
        return { success: true, redirectUrl, valid: false, reason: "Offer not active" };
    }

    // Check budget
    if (offer.totalBudget && Number(offer.totalSpent) >= Number(offer.totalBudget)) {
        return { success: true, redirectUrl, valid: false, reason: "Budget exhausted" };
    }

    // Mock IP for localhost
    if (ip === "::1" || ip === "127.0.0.1" || ip.includes("192.168.") || ip === "::ffff:127.0.0.1") {
        const mockIps = ["8.8.8.8", "200.147.67.142", "85.214.132.117", "185.230.125.1"];
        ip = mockIps[Math.floor(Math.random() * mockIps.length)];
    }

    const ipHash = hashIp(ip);
    const deviceUaHash = compoundFingerprint(ipHash, userAgent);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);

    // ── Fraud check 0: Bot / Crawler detection ──────────────────────────
    if (isBot(userAgent)) {
        await saveInvalidClick(adoption, offer, ipHash, fingerprint, ip, userAgent, referrer, sessionId, "Bot/crawler detected");
        return { success: true, redirectUrl, valid: false, reason: "Bot/crawler detected" };
    }

    // ── Fraud check 1: Click velocity — same IP clicked ANY link < 30s ago ──
    const veryRecentClick = await ClickRepository.findOne({
        where: {
            ipHash,
            createdAt: MoreThan(thirtySecondsAgo),
        },
        order: { createdAt: "DESC" },
    });

    if (veryRecentClick) {
        await saveInvalidClick(adoption, offer, ipHash, fingerprint, ip, userAgent, referrer, sessionId, "Click velocity too fast (<30s)");
        return { success: true, redirectUrl, valid: false, reason: "Click velocity too fast" };
    }

    // ── Fraud check 2: Same IP + same adoption within 24h ───────────────
    const recentIpClick = await ClickRepository.findOne({
        where: {
            adoptionId: adoption.id,
            ipHash,
            createdAt: MoreThan(twentyFourHoursAgo),
        },
    });

    if (recentIpClick) {
        await saveInvalidClick(adoption, offer, ipHash, fingerprint, ip, userAgent, referrer, sessionId, "Duplicate IP within 24h");
        return { success: true, redirectUrl, valid: false, reason: "Duplicate IP within 24h" };
    }

    // ── Fraud check 3: More than 3 clicks from same IP across all offers in 1h ──
    const recentIpClicksCount = await ClickRepository.count({
        where: {
            ipHash,
            createdAt: MoreThan(oneHourAgo),
        },
    });

    if (recentIpClicksCount >= 3) {
        await saveInvalidClick(adoption, offer, ipHash, fingerprint, ip, userAgent, referrer, sessionId, "Rate limit exceeded (3/hour)");
        return { success: true, redirectUrl, valid: false, reason: "Rate limit exceeded (3/hour)" };
    }

    // ── Fraud check 4: Same fingerprint + same adoption within 24h ──────
    if (fingerprint) {
        const recentFpClick = await ClickRepository.findOne({
            where: {
                adoptionId: adoption.id,
                fingerprint,
                createdAt: MoreThan(twentyFourHoursAgo),
            },
        });

        if (recentFpClick) {
            await saveInvalidClick(adoption, offer, ipHash, fingerprint, ip, userAgent, referrer, sessionId, "Duplicate fingerprint within 24h");
            return { success: true, redirectUrl, valid: false, reason: "Duplicate fingerprint within 24h" };
        }
    }

    // ── Fraud check 5: Compound dedup — same IP+UA on same adoption in 24h ──
    const compoundClick = await ClickRepository.findOne({
        where: {
            adoptionId: adoption.id,
            sessionId: deviceUaHash, // reuse sessionId column for compound check
            createdAt: MoreThan(twentyFourHoursAgo),
            isValid: true,
        },
    });

    // Only block if no explicit fingerprint already matched (compound is fallback)
    if (compoundClick && !fingerprint) {
        await saveInvalidClick(adoption, offer, ipHash, fingerprint, ip, userAgent, referrer, sessionId, "Compound IP+UA duplicate");
        return { success: true, redirectUrl, valid: false, reason: "Compound IP+UA duplicate" };
    }

    // ── Fraud check 6: Same session clicking multiple offers rapidly (5 min) ──
    if (sessionId) {
        const sessionClicksCount = await ClickRepository.count({
            where: {
                sessionId,
                createdAt: MoreThan(fiveMinutesAgo),
            },
        });

        if (sessionClicksCount >= 3) {
            await saveInvalidClick(adoption, offer, ipHash, fingerprint, ip, userAgent, referrer, sessionId, "Session click-spam (3+ in 5min)");
            return { success: true, redirectUrl, valid: false, reason: "Session click-spam" };
        }
    }

    // ── Fraud check 7: Daily cap — max 10 valid clicks from same IP across all offers ──
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const dailyIpClicks = await ClickRepository.count({
        where: {
            ipHash,
            isValid: true,
            createdAt: MoreThan(todayStart),
        },
    });

    if (dailyIpClicks >= 10) {
        await saveInvalidClick(adoption, offer, ipHash, fingerprint, ip, userAgent, referrer, sessionId, "Daily IP cap exceeded (10/day)");
        return { success: true, redirectUrl, valid: false, reason: "Daily IP cap exceeded" };
    }

    // GeoIP
    const geo = geoip.lookup(ip);
    const country = geo?.country || null;
    const city = geo?.city || null;

    // Valid click — save and increment
    const click = new SponsoredClickEntity();
    click.adoptionId = adoption.id;
    click.offerId = offer.id;
    click.ipHash = ipHash;
    click.fingerprint = fingerprint;
    click.country = country || undefined;
    click.city = city || undefined;
    click.device = parseDevice(userAgent);
    click.browser = parseBrowser(userAgent);
    click.referrer = referrer;
    click.earnedAmount = Number(offer.cpcRate);
    click.isValid = true;
    click.sessionId = sessionId || deviceUaHash; // Store compound hash as fallback session

    await ClickRepository.save(click);

    // Increment adoption stats
    await AdoptionRepository.increment({ id: adoption.id }, "totalClicks", 1);
    await AdoptionRepository.createQueryBuilder()
        .update(SponsoredAdoptionEntity)
        .set({ totalEarnings: () => `"totalEarnings" + ${Number(offer.cpcRate)}` })
        .where("id = :id", { id: adoption.id })
        .execute();

    // Increment offer stats
    await OfferRepository.increment({ id: offer.id }, "totalClicks", 1);
    await OfferRepository.createQueryBuilder()
        .update(SponsoredOfferEntity)
        .set({ totalSpent: () => `"totalSpent" + ${Number(offer.cpcRate)}` })
        .where("id = :id", { id: offer.id })
        .execute();

    // Check if budget is exhausted after this click
    const updatedOffer = await OfferRepository.findOne({ where: { id: offer.id } });
    if (updatedOffer && updatedOffer.totalBudget && Number(updatedOffer.totalSpent) >= Number(updatedOffer.totalBudget)) {
        updatedOffer.status = "exhausted";
        await OfferRepository.save(updatedOffer);
    }

    return { success: true, redirectUrl, valid: true };
}

async function saveInvalidClick(
    adoption: SponsoredAdoptionEntity,
    offer: SponsoredOfferEntity,
    ipHash: string,
    fingerprint: string | undefined,
    ip: string,
    userAgent: string,
    referrer: string | undefined,
    sessionId: string | undefined,
    invalidReason: string,
): Promise<void> {
    try {
        const geo = geoip.lookup(ip);

        const click = new SponsoredClickEntity();
        click.adoptionId = adoption.id;
        click.offerId = offer.id;
        click.ipHash = ipHash;
        click.fingerprint = fingerprint;
        click.country = geo?.country || undefined;
        click.city = geo?.city || undefined;
        click.device = parseDevice(userAgent);
        click.browser = parseBrowser(userAgent);
        click.referrer = referrer;
        click.earnedAmount = 0;
        click.isValid = false;
        click.sessionId = sessionId;
        click.invalidReason = invalidReason;

        await ClickRepository.save(click);
    } catch (err) {
        // Never let audit logging break the redirect flow
        console.error("[SponsoredClick] Failed to save invalid click:", err);
    }
}

export async function getClickStatsForAdoption(adoptionId: string, days: number = 30): Promise<{
    totalClicks: number;
    validClicks: number;
    invalidClicks: number;
    clicksByDay: { date: string; clicks: number }[];
    clicksByCountry: { country: string; clicks: number }[];
    clicksByDevice: { device: string; clicks: number }[];
}> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const totalClicks = await ClickRepository.count({ where: { adoptionId } });
    const validClicks = await ClickRepository.count({ where: { adoptionId, isValid: true } });
    const invalidClicks = totalClicks - validClicks;

    // Clicks by day
    const clicksByDay = await ClickRepository.createQueryBuilder("click")
        .select("DATE(click.createdAt)", "date")
        .addSelect("COUNT(*)", "clicks")
        .where("click.adoptionId = :id", { id: adoptionId })
        .andWhere("click.isValid = true")
        .andWhere("click.createdAt >= :since", { since })
        .groupBy("DATE(click.createdAt)")
        .orderBy("DATE(click.createdAt)", "ASC")
        .getRawMany();

    // Clicks by country
    const clicksByCountry = await ClickRepository.createQueryBuilder("click")
        .select("click.country", "country")
        .addSelect("COUNT(*)", "clicks")
        .where("click.adoptionId = :id", { id: adoptionId })
        .andWhere("click.isValid = true")
        .andWhere("click.country IS NOT NULL")
        .groupBy("click.country")
        .orderBy("clicks", "DESC")
        .limit(10)
        .getRawMany();

    // Clicks by device
    const clicksByDevice = await ClickRepository.createQueryBuilder("click")
        .select("click.device", "device")
        .addSelect("COUNT(*)", "clicks")
        .where("click.adoptionId = :id", { id: adoptionId })
        .andWhere("click.isValid = true")
        .groupBy("click.device")
        .getRawMany();

    return { totalClicks, validClicks, invalidClicks, clicksByDay, clicksByCountry, clicksByDevice };
}
