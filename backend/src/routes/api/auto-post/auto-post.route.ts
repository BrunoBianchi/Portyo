import { Router } from "express";
import getSchedule from "./[get]-schedule.route";
import createSchedule from "./[post]-schedule.route";
import toggleSchedule from "./[patch]-toggle.route";
import deleteScheduleRoute from "./[delete]-schedule.route";
import getStats from "./[get]-stats.route";
import generateSummary from "./[post]-generate-summary.route";
import previewPost from "./[post]-preview.route";
import generateMetadata from "./[post]-generate-metadata.route";

const router: Router = Router();

router.use(getSchedule);
router.use(createSchedule);
router.use(toggleSchedule);
router.use(deleteScheduleRoute);
router.use(getStats);
router.use(generateSummary);
router.use(previewPost);
router.use(generateMetadata);

export default router;
