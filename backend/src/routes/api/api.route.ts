import { Router } from "express";
import userRoute from "./user/user.route"
import bioRoute from "./bio/bio.route"
import blogRoute from "./blog/blog.route"
import publicBioRoute from "./public/bio.public.route"
import instagramRoute from "./instagram/instagram.route"
import youtubeRoute from "./youtube/youtube.route"
import publicEmailRoute from "./public/email.public.route"
import publicBlogRoute from "./public/blog.public.route"
import publicProductsRoute from "./public/products.public.route"
import QrRoute from "./qrcode/qrcode.route"
import emailRoute from "./email/email.route"
import stripeRoute from "./stripe/stripe.route"
import generateProductLinkRoute from "./stripe/[post]-generate-product-link"
import webhookRoute from "./stripe/[post]-webhook.route"
import integrationRoute from "./integration/integration.route"
import formRoute from "./form/form.route"
import publicFormRoute from "./public/form/form.route"
import { authMiddleware } from "../../middlewares/auth.middleware";
import googleRoute from "../api/google/google.route"
import googleAnalyticsRoute from "./google-analytics/google-analytics.route"
import activityRoute from "./activity/activity.route"
import automationRoute from "./automation/automation.route"
import analyticsOverviewRoute from "./analytics/[get]-overview.route"
import analyticsSalesRoute from "./analytics/[get]-sales.route"
import analyticsGeoStatsRoute from "./analytics/[get]-geo-stats.route"
import automationTriggerRoute from "./public/automation-trigger.route"
import publicTrackRoute from "./public/[post]-track.public.route"
import publicEventsRoute from "./public/events.public.route"
import templateRoute from "./templates/template.route"
import bookingRoute from "./bookings/booking.route"
import publicBookingRoute from "./public/booking.public.route"
import redirectRoute from "./redirect/[get]-redirect.route"

import googleCalendarRoute from "./google-calendar/google-calendar.route";

import imageRoute from "./images/image.route";

import siteBlogRoute from "./site-blog/site-blog.route"
import publicSiteBlogRoute from "./public/site-blog.public.route"

const router: Router = Router();
// Specific routes first
router.use('/images', imageRoute);
router.use('/user', userRoute); // Assuming userRoute doesn't have wildcards at root? Better check.
router.use('/blog', blogRoute);
router.use('/site-blog', siteBlogRoute);

import publicBiosRoute from "./public/bios.public.route"

// ... existing imports ...

router.use('/public/bio', publicBioRoute)
router.use('/public/bios', publicBiosRoute)
router.use('/instagram', instagramRoute)
router.use('/public/instagram', instagramRoute)
router.use('/public/youtube', youtubeRoute)
router.use('/public/email', publicEmailRoute)
router.use('/public/blog', publicBlogRoute)
import publicSettingsRoute from "./public/settings.route"
import adminRoute from "./admin/admin.route"

router.use('/public/site-blog', publicSiteBlogRoute)
router.use('/public/settings', publicSettingsRoute)
router.use('/public/products', publicProductsRoute)

router.use('/admin', adminRoute)
router.use('/public/stripe', generateProductLinkRoute)
router.use('/public/stripe', webhookRoute)
router.use('/public/automation', automationTriggerRoute)
router.use('/public/events', publicEventsRoute)
router.use('/public/bookings', publicBookingRoute)
router.use('/public', publicTrackRoute)
router.use('/redirect', redirectRoute)
router.use('/public/forms', publicFormRoute)

router.use('/qrcode/',authMiddleware ,QrRoute)
router.use('/email', authMiddleware, emailRoute)
router.use('/stripe', authMiddleware, stripeRoute)
router.use('/integration', authMiddleware, integrationRoute)
router.use('/form', authMiddleware, formRoute)
router.use('/automation', authMiddleware, automationRoute)
router.use('/analytics', authMiddleware, analyticsOverviewRoute)
router.use('/analytics', authMiddleware, analyticsSalesRoute)
router.use('/analytics', authMiddleware, analyticsGeoStatsRoute)
router.use('/google',googleRoute)
router.use('/activity', authMiddleware, activityRoute)
router.use('/google-analytics', googleAnalyticsRoute)
router.use('/google-calendar', googleCalendarRoute)
router.use('/templates', authMiddleware, templateRoute)
router.use('/bookings', authMiddleware, bookingRoute)

import onboardingRoute from "./onboarding/onboarding.route"
router.use('/onboarding', onboardingRoute)

import portfolioRoute from "./portfolio/portfolio.route"
import portfolioCategoryRoute from "./portfolio/portfolio-category.route"
router.use('/portfolio', portfolioRoute)
router.use('/portfolio/categories', portfolioCategoryRoute)

// Bio Route (likely contains wildcard /:id) should be last
router.use('/bio', authMiddleware, bioRoute);

import uploadFontRoute from "./user/[post]-upload-font.route"
router.use('/user/upload-font', uploadFontRoute)

import fontRoute from "./fonts/font.route"
router.use('/fonts', fontRoute)

export default router;
