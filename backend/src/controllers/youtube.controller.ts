import { Request, Response, NextFunction } from "express";
import { youtubeService } from "../services/youtube.service";

export const getLatestVideos = async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params;
    const { url } = req.query;

    try {
        const videos = await youtubeService.getLatestVideos(username, url as string);
        res.json(videos);
    } catch (error) {
        next(error);
    }
}
