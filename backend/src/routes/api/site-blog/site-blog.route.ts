import { Router } from "express";
import getPosts from "./[get]-posts.route";
import createPost from "./[post]-post.route";
import updatePost from "./[put]-post.route";
import deletePost from "./[delete]-post.route";

const router: Router = Router();
router.use(getPosts);
router.use(createPost);
router.use(updatePost);
router.use(deletePost);

export default router;
