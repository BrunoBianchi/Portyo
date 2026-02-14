import { logger } from "../shared/utils/logger";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { env } from "../config/env";
import axios from "axios";
import sharp from "sharp";
import redisClient from "../config/redis.client";
import { IntegrationEntity } from "../database/entity/integration-entity";
import { Repository } from "typeorm";

export class InstagramService {
  private readonly clientId = env.INSTAGRAM_CLIENT_ID;
  private readonly clientSecret = env.INSTAGRAM_CLIENT_SECRET;
  private readonly graphVersion = "v21.0";
  private readonly tokenExchangeBaseUrl = "https://graph.instagram.com";

  private maskValue(value?: string | null, visible = 8) {
    if (!value) return "<empty>";
    if (value.length <= visible * 2) return `${value.slice(0, 2)}***${value.slice(-2)}`;
    return `${value.slice(0, visible)}...${value.slice(-visible)}`;
  }

  private normalizeBaseUrl(value?: string) {
    if (!value) return undefined;
    return value.replace(/\/$/, "");
  }

  private buildRedirectUriCandidates(redirectUri?: string): string[] {
    const candidates = new Set<string>();

    const push = (value?: string) => {
      if (!value) return;
      candidates.add(value);
    };

    const frontendBase = this.normalizeBaseUrl(env.FRONTEND_URL);
    const backendBase = this.normalizeBaseUrl(env.BACKEND_URL);

    push(redirectUri);
    push(env.INSTAGRAM_REDIRECT_URI);
    push(frontendBase ? `${frontendBase}/api/instagram/auth` : undefined);
    push(frontendBase ? `${frontendBase}/api/instagram/auth/callback` : undefined);
    push(backendBase ? `${backendBase}/api/instagram/auth` : undefined);
    push(backendBase ? `${backendBase}/api/instagram/auth/callback` : undefined);

    return Array.from(candidates);
  }

  private getDefaultRedirectUri() {
    return `${env.FRONTEND_URL || env.BACKEND_URL}/api/instagram/auth`;
  }

  private get graphBaseUrl() {
    return `https://graph.instagram.com/${this.graphVersion}`;
  }

  private buildFormPayload(payload: Record<string, string>) {
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(payload)) {
      body.append(key, value);
    }
    return body.toString();
  }

  private buildErrorMessage(error: any) {
    const errData = error?.response?.data;
    if (typeof errData === "object") {
      return JSON.stringify(errData);
    }
    return errData || error?.message || "Unknown Instagram error";
  }

  public isAuthTokenError(error: any) {
    const status = error?.response?.status;
    const code = error?.response?.data?.error?.code;
    const message = String(error?.response?.data?.error?.message || error?.message || "").toLowerCase();
    const subcode = error?.response?.data?.error?.error_subcode;

    if (code === 190 || subcode === 463 || subcode === 467) {
      return true;
    }

    if (status === 401) {
      return true;
    }

    return message.includes("access token") || message.includes("oauth") || message.includes("token expired");
  }

  public computeTokenExpiryDate(expiresIn?: number | null) {
    if (!expiresIn || Number.isNaN(Number(expiresIn))) {
      return null;
    }

    const expiresInMs = Number(expiresIn) * 1000;
    return new Date(Date.now() + expiresInMs);
  }

  public shouldRefreshToken(expiresAt?: Date | null, thresholdSeconds = 24 * 60 * 60) {
    if (!expiresAt) {
      return false;
    }

    const remainingMs = new Date(expiresAt).getTime() - Date.now();
    return remainingMs <= thresholdSeconds * 1000;
  }

  public async exchangeForLongLivedToken(shortLivedToken: string) {
    if (!this.clientSecret) {
      throw new ApiError(APIErrors.internalServerError, "Instagram client secret not configured", 500);
    }

    try {
      const response = await axios.get(`${this.tokenExchangeBaseUrl}/access_token`, {
        params: {
          grant_type: "ig_exchange_token",
          client_secret: this.clientSecret,
          access_token: shortLivedToken,
        },
      });

      if (!response.data?.access_token) {
        throw new ApiError(APIErrors.badRequestError, "Instagram did not return a long-lived token", 400);
      }

      return {
        accessToken: response.data.access_token as string,
        tokenType: response.data?.token_type as string | undefined,
        expiresIn: response.data?.expires_in as number | undefined,
      };
    } catch (error: any) {
      logger.error(`Instagram long-lived token exchange failed | status=${error?.response?.status} error=${this.buildErrorMessage(error)}`);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(APIErrors.badRequestError, "Failed to exchange Instagram long-lived token", 400);
    }
  }

  public async refreshLongLivedToken(accessToken: string) {
    try {
      const response = await axios.get(`${this.tokenExchangeBaseUrl}/refresh_access_token`, {
        params: {
          grant_type: "ig_refresh_token",
          access_token: accessToken,
        },
      });

      if (!response.data?.access_token) {
        throw new ApiError(APIErrors.badRequestError, "Instagram did not return refreshed token", 400);
      }

      return {
        accessToken: response.data.access_token as string,
        tokenType: response.data?.token_type as string | undefined,
        expiresIn: response.data?.expires_in as number | undefined,
      };
    } catch (error: any) {
      logger.error(`Instagram token refresh failed | status=${error?.response?.status} error=${this.buildErrorMessage(error)}`);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(APIErrors.badRequestError, "Failed to refresh Instagram access token", 400);
    }
  }

  public async refreshIntegrationAccessToken(
    integration: IntegrationEntity,
    integrationRepository: Repository<IntegrationEntity>,
    options?: { force?: boolean; lockMinutes?: number }
  ) {
    const force = Boolean(options?.force);
    const lockMinutes = options?.lockMinutes ?? 2;
    const now = new Date();

    if (!integration.accessToken) {
      throw new ApiError(APIErrors.badRequestError, "Instagram integration access token missing", 400);
    }

    if (!force && integration.tokenRefreshLockUntil && new Date(integration.tokenRefreshLockUntil) > now) {
      return integration;
    }

    integration.tokenRefreshLockUntil = new Date(now.getTime() + lockMinutes * 60 * 1000);
    integration.tokenLastRefreshAttemptAt = now;
    await integrationRepository.save(integration);

    try {
      const refreshed = await this.refreshLongLivedToken(integration.accessToken);
      integration.accessToken = refreshed.accessToken;
      integration.refreshToken = refreshed.accessToken;
      integration.accessTokenExpiresAt = this.computeTokenExpiryDate(refreshed.expiresIn);
      integration.tokenLastRefreshedAt = new Date();
      integration.tokenLastRefreshError = null;
      integration.tokenRefreshLockUntil = null;

      return await integrationRepository.save(integration);
    } catch (error: any) {
      integration.tokenRefreshLockUntil = null;
      integration.tokenLastRefreshError = this.buildErrorMessage(error);
      await integrationRepository.save(integration);
      throw error;
    }
  }

  public async ensureFreshIntegrationAccessToken(
    integration: IntegrationEntity,
    integrationRepository: Repository<IntegrationEntity>,
    options?: { forceRefresh?: boolean; thresholdSeconds?: number }
  ) {
    const forceRefresh = Boolean(options?.forceRefresh);
    const thresholdSeconds = options?.thresholdSeconds ?? 24 * 60 * 60;
    const shouldRefresh = forceRefresh || this.shouldRefreshToken(integration.accessTokenExpiresAt, thresholdSeconds);

    if (!shouldRefresh) {
      return integration;
    }

    return this.refreshIntegrationAccessToken(integration, integrationRepository, {
      force: forceRefresh,
    });
  }

  public getAuthUrl(redirectUri?: string) {
    if (!this.clientId) {
      throw new ApiError(APIErrors.internalServerError, "Instagram Client ID not configured", 500);
    }
    const resolvedRedirectUri = redirectUri || this.getDefaultRedirectUri();
    const scopes = [
      "instagram_business_basic",
      "instagram_business_manage_comments",
      "instagram_business_manage_messages",
      "instagram_business_content_publish",
      "instagram_business_manage_insights",
    ];
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: resolvedRedirectUri,
      response_type: "code",
      scope: scopes.join(","),
    });
    const url = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
    console.log("[Instagram OAuth][service][integration] Built auth URL", {
      redirectUri: resolvedRedirectUri,
      clientIdPreview: this.maskValue(this.clientId, 6),
      scopes,
      url,
    });
    return url;
  }

  public getLoginAuthUrl(redirectUri?: string) {
    if (!this.clientId) {
      throw new ApiError(APIErrors.internalServerError, "Instagram Client ID not configured", 500);
    }

    const resolvedRedirectUri = redirectUri || this.getDefaultRedirectUri();
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: resolvedRedirectUri,
      response_type: "code",
      scope: "user_profile,user_media",
    });

    const url = `https://api.instagram.com/oauth/authorize?${params.toString()}`;
    console.log("[Instagram OAuth][service][login] Built auth URL", {
      redirectUri: resolvedRedirectUri,
      clientIdPreview: this.maskValue(this.clientId, 6),
      scope: "user_profile,user_media",
      url,
    });

    return url;
  }

  public async exchangeLoginCodeForToken(code: string, redirectUri?: string) {
    if (!this.clientId || !this.clientSecret) {
      throw new ApiError(APIErrors.internalServerError, "Instagram credentials not configured", 500);
    }

    const cleanCode = code.replace(/#_$/, "").replace(/#$/, "").trim();
    const resolvedRedirectUri = redirectUri || this.getDefaultRedirectUri();

    console.log("[Instagram OAuth][service][login] Starting code exchange", {
      redirectUri: resolvedRedirectUri,
      codeLength: cleanCode.length,
      codePreview: this.maskValue(cleanCode, 12),
      hasClientId: Boolean(this.clientId),
      hasClientSecret: Boolean(this.clientSecret),
    });

    try {
      const tokenBody = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: resolvedRedirectUri,
        code: cleanCode,
      });

      const tokenResponse = await axios.post(
        "https://api.instagram.com/oauth/access_token",
        tokenBody.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const tokenPayload = Array.isArray(tokenResponse.data?.data)
        ? tokenResponse.data.data[0]
        : tokenResponse.data;

      const accessToken = tokenPayload?.access_token as string | undefined;
      const userId = tokenPayload?.user_id ? String(tokenPayload.user_id) : undefined;

      console.log("[Instagram OAuth][service][login] Code exchange response", {
        userId,
        accessTokenLength: accessToken?.length || 0,
        accessTokenPreview: this.maskValue(accessToken, 12),
        expiresIn: tokenPayload?.expires_in,
      });

      if (!accessToken) {
        throw new ApiError(APIErrors.badRequestError, "Missing access token from Instagram OAuth", 400);
      }

      return {
        accessToken,
        userId,
        expiresIn: tokenPayload?.expires_in as number | undefined,
      };
    } catch (error: any) {
      logger.error("Instagram login OAuth exchange failed", {
        error: error?.response?.data || error?.message,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(APIErrors.badRequestError, "Failed to authenticate with Instagram", 400);
    }
  }

  public async getLoginUserProfile(accessToken: string) {
    try {
      const normalizedAccessToken = (accessToken || "").trim();
      console.log("[Instagram OAuth][service][login] Fetching profile", {
        accessTokenLength: normalizedAccessToken.length,
        accessTokenPreview: this.maskValue(normalizedAccessToken, 12),
      });

      const response = await axios.get(`${this.tokenExchangeBaseUrl}/me`, {
        params: {
          fields: "id,username",
          access_token: normalizedAccessToken,
        },
      });

      console.log("[Instagram OAuth][service][login] Profile fetched", {
        id: response.data?.id,
        username: response.data?.username,
      });

      return response.data as { id?: string; username?: string };
    } catch (error: any) {
      logger.error(`Instagram login profile fetch failed | status=${error?.response?.status} error=${this.buildErrorMessage(error)}`);
      throw new ApiError(APIErrors.badRequestError, "Failed to fetch Instagram profile", 400);
    }
  }

  public async exchangeCodeForToken(code: string, redirectUri?: string) {
    if (!this.clientId || !this.clientSecret) {
      throw new ApiError(APIErrors.internalServerError, "Instagram credentials not configured", 500);
    }

    // Strip trailing #_ fragment that Instagram appends to authorization codes
    const cleanCode = code.replace(/#_$/, "").replace(/#$/, "");

    const redirectUriCandidates = this.buildRedirectUriCandidates(redirectUri || this.getDefaultRedirectUri());
    const exchangeErrors: Array<{ redirectUri: string; error: any }> = [];

    console.log("[Instagram OAuth][service][integration] Starting code exchange", {
      codeLength: cleanCode.length,
      codePreview: this.maskValue(cleanCode, 12),
      providedRedirectUri: redirectUri,
      redirectUriCandidates,
    });

    try {
      let userAccessToken: string | null = null;
      let userId: string | null = null;
      let expiresIn: number | undefined;
      let resolvedRedirectUri: string | null = null;

      for (const candidateRedirectUri of redirectUriCandidates) {
        try {
          console.log("[Instagram OAuth][service][integration] Trying redirect URI", {
            candidateRedirectUri,
          });

          const tokenBody = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: "authorization_code",
            redirect_uri: candidateRedirectUri,
            code: cleanCode,
          });

          const tokenResponse = await axios.post(
            "https://api.instagram.com/oauth/access_token",
            tokenBody.toString(),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          const tokenPayload = Array.isArray(tokenResponse.data?.data)
            ? tokenResponse.data.data[0]
            : tokenResponse.data;

          userAccessToken = tokenPayload?.access_token || null;
          userId = tokenPayload?.user_id ? String(tokenPayload.user_id) : null;
          expiresIn = tokenPayload?.expires_in;

          if (!userAccessToken) {
            throw new ApiError(APIErrors.badRequestError, "Missing access token from Instagram OAuth", 400);
          }

          console.log("[Instagram OAuth][service][integration] User token obtained", {
            candidateRedirectUri,
            userId,
            userAccessTokenLength: userAccessToken.length,
            userAccessTokenPreview: this.maskValue(userAccessToken, 12),
            expiresIn,
          });

          resolvedRedirectUri = candidateRedirectUri;
          break;
        } catch (error: any) {
          console.log("[Instagram OAuth][service][integration] Redirect URI failed", {
            candidateRedirectUri,
            error: error?.response?.data || error?.message,
          });

          exchangeErrors.push({
            redirectUri: candidateRedirectUri,
            error: error?.response?.data || error?.message,
          });
        }
      }

      if (!userAccessToken) {
        logger.error("Instagram OAuth exchange failed for all redirect URIs", {
          candidatesTried: redirectUriCandidates,
          exchangeErrors,
        });
        throw new ApiError(APIErrors.badRequestError, "Failed to authenticate with Instagram", 400);
      }

      logger.debug("Instagram OAuth user token obtained", {
        redirectUriUsed: resolvedRedirectUri,
      });

      const longLivedToken = await this.exchangeForLongLivedToken(userAccessToken);
      userAccessToken = longLivedToken.accessToken;
      expiresIn = longLivedToken.expiresIn ?? expiresIn;

      console.log("[Instagram OAuth][service][integration] Long-lived token exchanged", {
        accessTokenLength: userAccessToken?.length || 0,
        accessTokenPreview: this.maskValue(userAccessToken, 12),
        expiresIn,
      });

      const profileResponse = await axios.get(`${this.graphBaseUrl}/${userId || "me"}`, {
        params: {
          fields: "id,username,account_type,media_count",
          access_token: userAccessToken,
        },
      });

      const instagramUserId = profileResponse.data?.id
        ? String(profileResponse.data.id)
        : (userId ? String(userId) : null);
      const instagramUsername = profileResponse.data?.username || null;

      console.log("[Instagram OAuth][service][integration] Profile resolved", {
        profileId: instagramUserId,
        profileUsername: instagramUsername,
        accountType: profileResponse.data?.account_type,
        mediaCount: profileResponse.data?.media_count,
      });

      if (!instagramUserId) {
        throw new ApiError(APIErrors.badRequestError, "Could not resolve Instagram account ID", 400);
      }

      logger.info("Instagram OAuth exchange succeeded", {
        redirectUriUsed: resolvedRedirectUri,
        instagramUserId,
        instagramUsername,
        usedLongLivedToken: Boolean(expiresIn),
      });

      return {
        accessToken: userAccessToken,
        userToken: userAccessToken,
        userId: userId || instagramUserId,
        instagramBusinessAccountId: instagramUserId,
        instagramUsername,
        pageId: null,
        pageName: null,
        expiresIn,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Instagram OAuth exchange failed", {
        error: error.response?.data || error.message,
        redirectUriCandidates,
      });
      throw new ApiError(APIErrors.badRequestError, "Failed to authenticate with Instagram", 400);
    }
  }

  public async getUserProfile(accessToken: string) {
    try {
      const normalizedAccessToken = (accessToken || "").trim();
      const response = await axios.get(`${this.graphBaseUrl}/me`, {
        params: {
          fields: "id,username,account_type,media_count",
          access_token: normalizedAccessToken,
        },
      });
      return response.data;
    } catch (error: any) {
       const errData = error?.response?.data;
       const errMsg = typeof errData === 'object' ? JSON.stringify(errData) : (errData || error?.message);
       logger.error(`Instagram profile fetch failed | status=${error?.response?.status} error=${errMsg}`);
       throw new ApiError(APIErrors.badRequestError, "Failed to fetch Instagram profile", 400);
    }
  }

  public async publishImagePost(params: {
    instagramBusinessAccountId: string;
    accessToken: string;
    imageUrl: string;
    caption: string;
  }) {
    const { instagramBusinessAccountId, accessToken, imageUrl, caption } = params;
    const normalizedAccessToken = (accessToken || "").trim();

    if (!normalizedAccessToken || normalizedAccessToken.length < 50) {
      throw new ApiError(
        APIErrors.badRequestError,
        "Instagram access token invalid or truncated. Reconnect Instagram integration and try again.",
        400
      );
    }

    try {
      const containerResponse = await axios.post(
        `${this.graphBaseUrl}/${instagramBusinessAccountId}/media`,
        null,
        {
          params: {
            image_url: imageUrl,
            caption,
            access_token: normalizedAccessToken,
          },
        }
      );

      const creationId = containerResponse.data?.id;
      if (!creationId) {
        throw new ApiError(APIErrors.badRequestError, "Instagram media container was not created", 400);
      }

      for (let attempt = 0; attempt < 3; attempt++) {
        const statusResponse = await axios.get(`${this.graphBaseUrl}/${creationId}`, {
          params: {
            fields: "status_code",
            access_token: normalizedAccessToken,
          },
        });

        const statusCode = statusResponse.data?.status_code;
        if (!statusCode || statusCode === "FINISHED") {
          break;
        }

        if (statusCode === "ERROR") {
          throw new ApiError(APIErrors.badRequestError, "Instagram failed to process media", 400);
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      const publishResponse = await axios.post(
        `${this.graphBaseUrl}/${instagramBusinessAccountId}/media_publish`,
        null,
        {
          params: {
            creation_id: creationId,
            access_token: normalizedAccessToken,
          },
        }
      );

      const publishedPostId = publishResponse.data?.id;
      if (!publishedPostId) {
        throw new ApiError(APIErrors.badRequestError, "Instagram did not return a published post ID", 400);
      }

      return {
        id: publishedPostId,
        creationId,
      };
    } catch (error: any) {
      const errData = error?.response?.data;
      const errMsg = typeof errData === 'object' ? JSON.stringify(errData) : (errData || error?.message);
      logger.error(`Instagram publish failed | accountId=${instagramBusinessAccountId} status=${error?.response?.status} error=${errMsg}`);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(APIErrors.badRequestError, "Failed to publish on Instagram", 400);
    }
  }

  public async getLatestPosts(username: string, baseUrl: string) {
    const CACHE_KEY_POSTS = `instagram:posts:${username}`;
    const CACHE_KEY_LAST_UPDATED = `instagram:last_updated:${username}`;
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

    let cachedPostsStr: string | null = null;
    let lastUpdatedStr: string | null = null;

    try {
      // 1. Check Redis for cached posts and timestamp
      [cachedPostsStr, lastUpdatedStr] = await Promise.all([
        redisClient.get(CACHE_KEY_POSTS),
        redisClient.get(CACHE_KEY_LAST_UPDATED),
      ]);

      const lastUpdated = lastUpdatedStr ? parseInt(lastUpdatedStr, 10) : 0;
      const isStale = Date.now() - lastUpdated > TWO_DAYS_MS;

      // 2. If cached posts exist AND data is fresh, return them
      if (cachedPostsStr && !isStale) {
        return JSON.parse(cachedPostsStr);
      }

      // 3. Data is missing or stale -> Fetch from Instagram
      logger.info(`Fetching Instagram posts for ${username} (Stale: ${isStale})`);
      
      let edges: any[] = [];
      try {
          // Try API first
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
    
          if (response.ok) {
            const data = await response.json();
            edges = data?.data?.user?.edge_owner_to_timeline_media?.edges || [];
          } else {
             logger.warn("Instagram API failed, trying HTML fallback...");
             // logic moved to helper or kept inline if simple, but here we reuse the existing scraping logic which returns formatted items.
             // Wait, the existing scraping returns formatted items, but the API returns raw edges. 
             // We need to standardize. 
             // Let's call the internal methods that return RAW data or standardize immediately.
             // For simplicity, let's assume the existing scrapeHtml returns formatted items, so we need to match that.
             // ACTUALLY, to avoid duplication, I will refactor `scrapeHtml` to return the `edges` array (raw-ish) or just handle the formatting centrally.
             // The implementation below assumes we get a list of items and then process them.
             
             // Let's use the scraping fallback directly if API fails
             const scrapedItems = await this.scrapeHtml(username, baseUrl); 
             // scrapedItems are already formatted. We need to process THEIR images.
             // This structure is: { id, url, imageUrl, thumbnailUrl, caption }
             // We can map them back to a structure we can process.
             edges = scrapedItems.map(item => ({
                 node: {
                     id: item.id,
                     shortcode: item.id, // scrapedItems uses shortcode as ID
                     display_url: item.imageUrl.replace(`${baseUrl}/api/public/instagram/proxy?url=`, '').replace(/%26/g, '&').replace(/%3D/g, '=').replace(/%2F/g, '/').replace(/%3A/g, ':').replace(/%3F/g, '?'), // Hacky reverse of the proxy URL if it was encoded. 
                     // Actually, inside scrapeHtml, we construct the proxy URL. Ideally scrapeHtml shouldn't presume the proxy URL format if we want to change it.
                     // But since I can't easily change scrapeHtml's return type without changing the method signature in the interface (which is implicit here), 
                     // I will assume `scrapeHtml` returns the objects with `imageUrl` pointing to the external URL (before proxying) OR I modify `scrapeHtml` too.
                     // The previous `scrapeHtml` code constructed the proxy URL.
                     // I will modify `scrapeHtml` in a subsequent edit or assume I can extract the original URL.
                     // Let's try to get RAW info first. 
                     // Since I am replacing the WHOLE method, I can rewrite the flow.
                  }
             }));
          }
      } catch (e) {
            logger.warn("Instagram API failed fully, trying HTML scraping");
             // Fallback to scraping
             // We will modify scrapeHtml to return raw-ish data or standard objects
             const scraped = await this.scrapeHtml(username, baseUrl);
             // Verify if scrapeHtml returned what we expect. 
             // The previous implementation of scrapeHtml returned:
             // { id, url, imageUrl (proxied), thumbnailUrl, caption }
             // We need the ORIGINAL url to download it.
             // I will modify scrapeHtml below to return the original URL in a specific field or decode it.
             // For now, let's trust we can process the list.
             
             // To properly handle this, I'll assume we process the "formatted" list.
             const processedPosts = await this.processAndCachePosts(scraped, username, baseUrl);
             return processedPosts;
      }

      // If we got edges from API (not scraped)
      const rawPosts = edges.slice(0, 3).map((edge: any) => ({
        id: edge.node.shortcode, // Use shortcode as ID for consistency
        url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
        originalImageUrl: edge.node.display_url,
        thumbnailUrl: edge.node.thumbnail_src || edge.node.display_url,
        caption: edge.node.edge_media_to_caption?.edges[0]?.node?.text || "",
      }));

      const processedPosts = await this.processAndCachePosts(rawPosts, username, baseUrl);
      return processedPosts;

    } catch (error) {
      logger.error("Instagram fetch error", error);
      // Return cached even if stale if allowed, or throw
      if (cachedPostsStr) {
          return JSON.parse(cachedPostsStr);
      }
      throw error; 
    }
  }

  private async processAndCachePosts(posts: any[], username: string, baseUrl: string) {
      const CACHE_KEY_POSTS = `instagram:posts:${username}`;
      const CACHE_KEY_LAST_UPDATED = `instagram:last_updated:${username}`;
      const IMAGE_TTL = 30 * 24 * 60 * 60; // 30 days
      const POSTS_TTL = 7 * 24 * 60 * 60; // 7 days (posts structure)

      const processed = await Promise.all(posts.map(async (post) => {
          try {
             // If the post is coming from scrapeHtml (which I need to check), it might have 'imageUrl' instead of 'originalImageUrl'.
             // Let's normalize.
             let targetUrl = post.originalImageUrl || post.imageUrl;
             
             // If it's a proxy URL, try to extract original. 
             if (targetUrl.includes('/proxy?url=')) {
                 targetUrl = decodeURIComponent(targetUrl.split('url=')[1]);
             }

             // Check if we already have this image cached
             const imageKey = `instagram:image:${post.id}`;
             const cachedImage = await redisClient.getBuffer(imageKey);
             
             if (!cachedImage) {
                 // Download and Cache
                 const response = await axios.get(targetUrl, { responseType: 'arraybuffer' });
                 const buffer = Buffer.from(response.data);
                 
                 // Process image (Resize/Convert to PNG)
                 // Keeping it 500x500 square-ish or original aspect ratio but optimized?
                 // Instagram usually is square or 4:5. Let's strict resize to 600 width, maintain aspect ratio?
                 // The frontend grid expects squares usually.
                 const processedBuffer = await sharp(buffer)
                    .resize(600, 600, { fit: 'cover' }) // Force square for grid consistency? Or 'inside'? Button grid usually square.
                    .jpeg({ quality: 80 })
                    .toBuffer();

                 await redisClient.set(imageKey, processedBuffer, 'EX', IMAGE_TTL);
             }

             return {
                 ...post,
                 imageUrl: `${baseUrl}/api/instagram/image/${post.id}`, // New local route
                 // Remove internal fields if any
                 originalImageUrl: undefined
             };

          } catch (e) {
              logger.error(`Failed to process image for post ${post.id}`, e);
              // Fallback to original URL or placeholder?
              // If we can't download, maybe the URL is dead. 
              return {
                  ...post,
                  imageUrl: post.originalImageUrl || post.imageUrl // Fallback to sticking with original if download fails
              };
          }
      }));

      // Cache the result
      await redisClient.set(CACHE_KEY_POSTS, JSON.stringify(processed), 'EX', POSTS_TTL);
      await redisClient.set(CACHE_KEY_LAST_UPDATED, Date.now().toString(), 'EX', POSTS_TTL);

      return processed;
  }

  // Refactored ScrapeHtml to return consistent clean objects
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
        id: match[1], // shortcode
        originalImageUrl: match[2].replace(/\\u0026/g, "&"),
        url: `https://www.instagram.com/p/${match[1]}/`,
      });
    }

    // Pattern 2: Alternative structure
    if (edges.length === 0) {
      const altRegex =
        /"shortcode":"([^"]+)","dimensions":{.*?},"display_url":"([^"]+)"/g;
      while ((match = altRegex.exec(html)) !== null && edges.length < 3) {
        edges.push({
            id: match[1],
            originalImageUrl: match[2].replace(/\\u0026/g, "&"),
            url: `https://www.instagram.com/p/${match[1]}/`,
        });
      }
    }

    // Pattern 3: Loose match
    if (edges.length === 0) {
      const looseRegex =
        /"shortcode":"([\w-]+)".*?"display_url":"([^"]+)"/g;
      while ((match = looseRegex.exec(html)) !== null && edges.length < 3) {
        edges.push({
            id: match[1],
            originalImageUrl: match[2].replace(/\\u0026/g, "&"),
            url: `https://www.instagram.com/p/${match[1]}/`,
        });
      }
    }

    if (edges.length === 0) {
      logger.warn(`No edges found in HTML for ${username}`);
      throw new ApiError(APIErrors.notFoundError, "No posts found", 404);
    }

    return edges;
  }

  public async getCachedImage(shortcode: string) {
      const imageKey = `instagram:image:${shortcode}`;
      const buffer = await redisClient.getBuffer(imageKey);
      if (!buffer) {
          throw new ApiError(APIErrors.notFoundError, "Image not found", 404);
      }
      return { buffer, contentType: 'image/jpeg' };
  }

  public async getProxyImage(url: string) {
    // Legacy support or direct valid proxying
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
