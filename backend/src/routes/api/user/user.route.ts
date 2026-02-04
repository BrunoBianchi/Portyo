import { Router } from "express";
import createNewUserRoute from "./[post]-create-new-user.route";
import meRoute from "./[get]-me.route"
import loginRoute from "./[post]-login.route"
import uploadPhotoRoute from "./[post]-upload-photo.route"
import billingHistoryRoute from "./[get]-billing-history.route"
import emailUsageRoute from "./[get]-email-usage.route"
import refreshTokenRoute from "./[post]-refresh-token.route"
import uploadBlogThumbnailRoute from "./[post]-upload-blog-thumbnail.route";
import uploadProductImageRoute from "./[post]-upload-product-image.route";
import uploadBlockImageRoute from "./[post]-upload-block-image.route";
import uploadFaviconRoute from "./[post]-upload-favicon.route";
import uploadOgImageRoute from "./[post]-upload-og-image.route";
import uploadBioLogoRoute from "./[post]-upload-bio-logo.route";
import uploadResumeRoute from "./[post]-upload-resume.route";

import logoutRoute from "./[post]-logout.route"

import verifyEmailRoute from "./[post]-verify-email.route";
import resendVerificationRoute from "./[post]-resend-verification.route";
import forgotPasswordRoute from "./[post]-forgot-password.route";
import resetPasswordRoute from "./[post]-reset-password.route";
import changePasswordRoute from "./[post]-change-password.route";

import parseResumeRoute from "./[post]-parse-resume-experiences.route";

const router: Router = Router();
router.use(createNewUserRoute);
router.use("/me", meRoute);
router.use(loginRoute)
router.use(logoutRoute)
router.use("/upload-photo", uploadPhotoRoute);
router.use("/upload-bio-logo", uploadBioLogoRoute);
router.use("/upload-blog-thumbnail", uploadBlogThumbnailRoute);
router.use("/upload-product-image", uploadProductImageRoute);
router.use("/upload-block-image", uploadBlockImageRoute);
router.use("/upload-favicon", uploadFaviconRoute);
router.use("/upload-og-image", uploadOgImageRoute);
router.use("/upload-resume", uploadResumeRoute);
router.use(parseResumeRoute);
router.use("/billing", billingHistoryRoute)
router.use(emailUsageRoute)
router.use(refreshTokenRoute)
router.use(verifyEmailRoute)
router.use(resendVerificationRoute)
router.use(forgotPasswordRoute)
router.use(resetPasswordRoute)
router.use(changePasswordRoute)

export default router;