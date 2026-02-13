import { Router } from "express";
import { publicGetPollRoute } from "./[get]-get-poll.route";
import { publicVotePollRoute } from "./[post]-vote.route";
import { publicPollResultsRoute } from "./[get]-results.route";

const router = Router();

router.use("/", publicGetPollRoute);
router.use("/", publicVotePollRoute);
router.use("/", publicPollResultsRoute);

export default router;
