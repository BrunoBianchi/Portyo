import { Router, Request, Response } from "express";
import { getQrCodeByIdPublic, trackQrCodeView } from "../../../shared/services/qrcode.service";
import geoip from "geoip-lite";

const router: Router = Router();

// Public track route - no auth required
// Returns the destination URL and tracks analytics
router.post("/:qrcodeId", async (req: Request, res: Response) => {
    try {
        const { qrcodeId } = req.params;
        
        // Get QR code
        const qrCode = await getQrCodeByIdPublic(qrcodeId);
        
        if (!qrCode) {
            return res.status(404).json({ error: "QR Code not found" });
        }
        
        // Extract analytics data
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                   req.socket.remoteAddress || 
                   '';
        
        const geo = geoip.lookup(ip);
        const country = geo?.country || 'Unknown';
        
        const userAgent = req.headers['user-agent'] || '';
        let device = 'Desktop';
        if (/mobile/i.test(userAgent)) {
            device = 'Mobile';
        } else if (/tablet/i.test(userAgent)) {
            device = 'Tablet';
        }
        
        // Track the view with analytics
        await trackQrCodeView(qrcodeId, country, device);
        
        // Trigger Automation
        if (qrCode.bio?.id) {
            const { triggerAutomation } = await import("../../../shared/services/automation.service");
            triggerAutomation(qrCode.bio.id, 'qr_scanned', {
                qrId: qrcodeId,
                qrValue: qrCode.value,
                country,
                device
            }).catch(err => console.error("Failed to trigger QR automation", err));
        }

        // Return the destination URL for frontend redirect
        return res.status(200).json({ 
            url: qrCode.value,
            tracked: true 
        });
        
    } catch (error) {
        console.error("Track error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
