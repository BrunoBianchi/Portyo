import { Router } from "express";
import createPollRoute from "./[post]-create-poll.route";
import listPollsRoute from "./[get]-list-polls.route";
import getPollRoute from "./[get]-get-poll.route";
import updatePollRoute from "./[patch]-update-poll.route";
import deletePollRoute from "./[delete]-delete-poll.route";
import getPollResultsRoute from "./[get]-get-results.route";

const router = Router();

router.use("/", createPollRoute);
router.use("/", listPollsRoute);
router.use("/", getPollRoute);
router.use("/", updatePollRoute);
router.use("/", deletePollRoute);
router.use("/", getPollResultsRoute);

export default router;
