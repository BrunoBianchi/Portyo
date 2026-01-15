import { logger } from "../shared/utils/logger";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { env } from "../config/env";
import axios from "axios";

export class InstagramService {
  private readonly clientId = env.INSTAGRAM_CLIENT_ID;
  private readonly clientSecret = env.INSTAGRAM_CLIENT_SECRET;
  private readonly redirectUri = `${env.BACKEND_URL}/api/instagram/auth/callback`;

  public getAuthUrl() {
    if (!this.clientId) {
      throw new ApiError(APIErrors.internalServerError, "Instagram Client ID not configured", 500);
    }
    const scopes = ["instagram_basic", "instagram_manage_messages"];
    const url = `https://api.instagram.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${scopes.join(",")}&response_type=code`;
    return url;
  }

  public async exchangeCodeForToken(code: string) {
    if (!this.clientId || !this.clientSecret) {
      throw new ApiError(APIErrors.internalServerError, "Instagram credentials not configured", 500);
    }

    try {
      // 1. Exchange short-lived code for short-lived access token
      const params = new URLSearchParams();
      params.append("client_id", this.clientId);
      params.append("client_secret", this.clientSecret);
      params.append("grant_type", "authorization_code");
      params.append("redirect_uri", this.redirectUri);
      params.append("code", code);

      const response = await axios.post(
        "https://api.instagram.com/oauth/access_token",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { access_token, user_id } = response.data;

      // 2. Exchange short-lived token for long-lived token
      const longLivedResponse = await axios.get(
        "https://graph.instagram.com/access_token",
        {
          params: {
            grant_type: "ig_exchange_token",
            client_secret: this.clientSecret,
            access_token: access_token,
          },
        }
      );

      return {
        accessToken: longLivedResponse.data.access_token,
        userId: user_id, // Note: For Basic Display this is different from Graph API ID, but for our scopes it should be fine or mapped.
        expiresIn: longLivedResponse.data.expires_in
      };
    } catch (error: any) {
      logger.error("Instagram OAuth exchange failed", { error: error.response?.data || error.message });
      throw new ApiError(APIErrors.badRequestError, "Failed to authenticate with Instagram", 400);
    }
  }

  public async getUserProfile(accessToken: string) {
    try {
      const response = await axios.get("https://graph.instagram.com/me", {
        params: {
          fields: "id,username,account_type,media_count",
          access_token: accessToken,
        },
      });
      return response.data;
    } catch (error: any) {
       logger.error("Instagram profile fetch failed", { error: error.response?.data || error.message });
       throw new ApiError(APIErrors.badRequestError, "Failed to fetch Instagram profile", 400);
    }
  }

  public async getLatestPosts(username: string, baseUrl: string) {
    try {
      // Try to fetch using the web_profile_info endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "X-IG-App-ID": "936619743392459",
            "X-Requested-With": "XMLHttpRequest",
            Referer: `https://www.instagram.com/${username}/`,
            "Accept-Language": "en-US,en;q=0.9",
          },
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.warn("Instagram API failed, trying HTML fallback...");
        return await this.scrapeHtml(username, baseUrl);
      }

      const data = await response.json();
      const edges =
        data?.data?.user?.edge_owner_to_timeline_media?.edges || [];

      return edges.slice(0, 3).map((edge: any) => ({
        id: edge.node.id,
        url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
        imageUrl: `${baseUrl}/api/public/instagram/proxy?url=${encodeURIComponent(
          edge.node.display_url
        )}`,
        thumbnailUrl: edge.node.thumbnail_src,
        caption:
          edge.node.edge_media_to_caption?.edges[0]?.node?.text || "",
      }));
    } catch (error) {
      logger.error("Instagram API error", error);
      // Fallback to scraping if API fails completely (e.g. network error)
      return await this.scrapeHtml(username, baseUrl);
    }
  }

  private async scrapeHtml(username: string, baseUrl: string) {
    const htmlResponse = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!htmlResponse.ok) {
      throw new ApiError(
        APIErrors.internalServerError,
        `HTML fetch failed: ${htmlResponse.status}`,
        500
      );
    }

    const html = await htmlResponse.text();

    if (html.includes("Login • Instagram")) {
      logger.warn("Instagram redirected to login page");
      throw new ApiError(
        APIErrors.unauthorizedError,
        "Instagram requires login (profile might be private or rate limited)",
        401
      );
    }

    const edges: any[] = [];
    let match;

    // Pattern 1: Standard GraphImage structure
    const regex =
      /"node":{"__typename":"GraphImage".*?"shortcode":"([^"]+)".*?"display_url":"([^"]+)"/g;
    while ((match = regex.exec(html)) !== null && edges.length < 3) {
      edges.push({
        node: {
          shortcode: match[1],
          display_url: match[2].replace(/\\u0026/g, "&"),
        },
      });
    }

    // Pattern 2: Alternative structure (dimensions)
    if (edges.length === 0) {
      const altRegex =
        /"shortcode":"([^"]+)","dimensions":{.*?},"display_url":"([^"]+)"/g;
      while ((match = altRegex.exec(html)) !== null && edges.length < 3) {
        edges.push({
          node: {
            shortcode: match[1],
            display_url: match[2].replace(/\\u0026/g, "&"),
          },
        });
      }
    }

    // Pattern 3: Loose match
    if (edges.length === 0) {
      const looseRegex =
        /"shortcode":"([\w-]+)".*?"display_url":"([^"]+)"/g;
      while ((match = looseRegex.exec(html)) !== null && edges.length < 3) {
        edges.push({
          node: {
            shortcode: match[1],
            display_url: match[2].replace(/\\u0026/g, "&"),
          },
        });
      }
    }

    if (edges.length === 0) {
      logger.warn(
        `No edges found in HTML. Title: ${
          html.match(/<title>(.*?)<\/title>/)?.[1]
        }`
      );
      throw new ApiError(APIErrors.notFoundError, "No posts found", 404);
    }

    return edges.map((edge: any) => ({
      id: edge.node.shortcode,
      url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
      imageUrl: `${baseUrl}/api/public/instagram/proxy?url=${encodeURIComponent(
        edge.node.display_url
      )}`,
      thumbnailUrl: edge.node.display_url,
      caption: "",
    }));
  }

  public async getProxyImage(url: string) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        throw new ApiError(
          APIErrors.badRequestError,
          "Failed to fetch image",
          response.status
        );
      }

      const contentType = response.headers.get("content-type");
      const arrayBuffer = await response.arrayBuffer();
      return { buffer: Buffer.from(arrayBuffer), contentType };
    } catch (error) {
      logger.error("Proxy error:", error);
      throw new ApiError(
        APIErrors.internalServerError,
        "Proxy error",
        500
      );
    }
  }
}

export const instagramService = new InstagramService();
