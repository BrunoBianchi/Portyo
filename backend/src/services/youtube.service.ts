import { logger } from "../shared/utils/logger";
import { ApiError, APIErrors } from "../shared/errors/api-error";

export class YoutubeService {
  public async getLatestVideos(username?: string, url?: string) {
    let targetUrl = "";

    if (url && typeof url === "string") {
      targetUrl = url;
    } else if (username) {
      const handle = username.startsWith("@") ? username : `@${username}`;
      targetUrl = `https://www.youtube.com/${handle}`;
    } else {
      throw new ApiError(
        APIErrors.badRequestError,
        "Username or URL required",
        400
      );
    }

    try {
      const channelPageResponse = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!channelPageResponse.ok) {
        throw new ApiError(
          APIErrors.notFoundError,
          "Failed to fetch channel page",
          channelPageResponse.status
        );
      }

      const channelPageText = await channelPageResponse.text();

      let channelIdMatch = channelPageText.match(/"channelId":"(UC[\w-]+)"/);

      if (!channelIdMatch) {
        channelIdMatch = channelPageText.match(
          /<meta itemprop="channelId" content="(UC[\w-]+)"/
        );
      }

      if (!channelIdMatch) {
        channelIdMatch = channelPageText.match(/"externalId":"(UC[\w-]+)"/);
      }

      if (!channelIdMatch) {
        channelIdMatch = channelPageText.match(/"browseId":"(UC[\w-]+)"/);
      }

      if (!channelIdMatch) {
        logger.warn(`Failed to find channel ID for URL: ${targetUrl}`);
        throw new ApiError(APIErrors.notFoundError, "Channel ID not found", 404);
      }

      const channelId = channelIdMatch[1];
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

      const rssResponse = await fetch(rssUrl);
      if (!rssResponse.ok) {
        throw new ApiError(
          APIErrors.internalServerError,
          "Failed to fetch RSS feed",
          rssResponse.status
        );
      }

      const rssText = await rssResponse.text();
      const entries = rssText.split("<entry>").slice(1);

      return entries.slice(0, 3).map((entry) => {
        const idMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
        const titleMatch = entry.match(/<title>(.*?)<\/title>/);
        const id = idMatch ? idMatch[1] : "";

        return {
          id: id,
          url: `https://www.youtube.com/watch?v=${id}`,
          imageUrl: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
          title: titleMatch ? titleMatch[1] : "",
        };
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("YouTube error:", error);
      throw new ApiError(
        APIErrors.internalServerError,
        "Internal server error",
        500
      );
    }
  }
}

export const youtubeService = new YoutubeService();
