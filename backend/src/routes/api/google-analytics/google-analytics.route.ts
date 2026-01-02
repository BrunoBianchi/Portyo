import { Router } from "express";
import authRoute from "./[get]-auth.route";
import callbackRoute from "./[get]-callback.route";
import propertiesRoute from "./[get]-properties.route";
import selectPropertyRoute from "./[post]-select-property.route";
import dataRoute from "./[get]-data.route";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const router: Router = Router();

// Public route for callback (Google calls this)
router.use("/callback", callbackRoute);

// Protected routes
router.use("/auth", authMiddleware, authRoute);
router.use("/properties", authMiddleware, propertiesRoute);
router.use("/select-property", authMiddleware, selectPropertyRoute);
router.use("/data", authMiddleware, dataRoute);

export default router;
