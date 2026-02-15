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
  private readonly threadsClientId = env.THREADS_CLIENT_ID || env.INSTAGRAM_CLIENT_ID;
  private readonly threadsClientSecret = env.THREADS_CLIENT_SECRET || env.INSTAGRAM_CLIENT_SECRET;
  private readonly threadsOAuthScopes =
    env.THREADS_OAUTH_SCOPES || "threads_basic,threads_content_publish,threads_delete";
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
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_comments",
      "instagram_manage_messages",
      "pages_show_list",
      "pages_read_engagement",
    ];
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: resolvedRedirectUri,
      response_type: "code",
      scope: scopes.join(","),
    });
    const url = `https://www.facebook.com/${this.graphVersion}/dialog/oauth?${params.toString()}`;
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

  public getThreadsAuthUrl(redirectUri: string) {
    if (!this.threadsClientId) {
      throw new ApiError(APIErrors.internalServerError, "Threads Client ID not configured", 500);
    }

    const params = new URLSearchParams({
      client_id: this.threadsClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: this.threadsOAuthScopes,
    });

    const url = `https://threads.net/oauth/authorize?${params.toString()}`;
    console.log("[Threads OAuth][service][integration] Built auth URL", {
      redirectUri,
      clientIdPreview: this.maskValue(this.threadsClientId, 6),
      scopes: this.threadsOAuthScopes,
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

    const businessExchangeErrors: Array<{ redirectUri: string; error: any }> = [];
    for (const candidateRedirectUri of redirectUriCandidates) {
      try {
        console.log("[Instagram OAuth][service][integration] Trying Facebook Business exchange", {
          candidateRedirectUri,
        });

        const fbTokenResponse = await axios.get(
          `https://graph.facebook.com/${this.graphVersion}/oauth/access_token`,
          {
            params: {
              client_id: this.clientId,
              client_secret: this.clientSecret,
              redirect_uri: candidateRedirectUri,
              code: cleanCode,
            },
          }
        );

        const facebookUserAccessToken = fbTokenResponse.data?.access_token as string | undefined;
        const expiresIn = fbTokenResponse.data?.expires_in as number | undefined;

        if (!facebookUserAccessToken) {
          throw new Error("Missing Facebook user access token");
        }

        const pagesResponse = await axios.get(
          `https://graph.facebook.com/${this.graphVersion}/me/accounts`,
          {
            params: {
              fields: "id,name,access_token,instagram_business_account{id,username}",
              access_token: facebookUserAccessToken,
            },
          }
        );

        const pages = Array.isArray(pagesResponse.data?.data) ? pagesResponse.data.data : [];
        const pageWithInstagram = pages.find((page: any) => {
          const igAccountId = page?.instagram_business_account?.id || page?.instagram_business_account;
          return Boolean(igAccountId && page?.access_token);
        });

        if (!pageWithInstagram) {
          throw new Error("No Facebook Page with instagram_business_account found");
        }

        const instagramBusinessAccountId = String(
          pageWithInstagram.instagram_business_account?.id || pageWithInstagram.instagram_business_account
        );
        const instagramUsername =
          pageWithInstagram.instagram_business_account?.username ||
          pageWithInstagram.username ||
          null;
        const pageAccessToken = String(pageWithInstagram.access_token || "").trim();

        if (!instagramBusinessAccountId || !pageAccessToken) {
          throw new Error("Invalid Instagram Business account mapping from Facebook page");
        }

        logger.info("Instagram Business OAuth exchange succeeded", {
          redirectUriUsed: candidateRedirectUri,
          pageId: pageWithInstagram.id,
          pageName: pageWithInstagram.name,
          instagramBusinessAccountId,
          instagramUsername,
        });

        return {
          accessToken: pageAccessToken,
          userToken: facebookUserAccessToken,
          userId: instagramBusinessAccountId,
          instagramBusinessAccountId,
          instagramUsername,
          pageId: String(pageWithInstagram.id || ""),
          pageName: pageWithInstagram.name || null,
          expiresIn,
        };
      } catch (businessError: any) {
        const normalizedError = businessError?.response?.data || businessError?.message || businessError;
        console.log("[Instagram OAuth][service][integration] Facebook Business exchange failed", {
          candidateRedirectUri,
          error: normalizedError,
        });
        businessExchangeErrors.push({
          redirectUri: candidateRedirectUri,
          error: normalizedError,
        });
      }
    }

    logger.warn("Instagram Business OAuth exchange failed for all redirect URIs, falling back to legacy Instagram exchange", {
      candidatesTried: redirectUriCandidates,
      businessExchangeErrors,
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

      // --- MODIFICAÇÃO TEMPORÁRIA (BYPASS LONG-LIVED TOKEN) ---
      // Como a Meta está barrando a geração do token longo devido à falta de verificação do App,
      // as linhas abaixo foram comentadas para usarmos o short-lived token diretamente no banco.
      // Quando a verificação/MEI for aprovada, basta descomentar esse bloco e apagar o console.log substituto.
      
      /*
      const longLivedToken = await this.exchangeForLongLivedToken(userAccessToken);
      userAccessToken = longLivedToken.accessToken;
      expiresIn = longLivedToken.expiresIn ?? expiresIn;

      console.log("[Instagram OAuth][service][integration] Long-lived token exchanged", {
        accessTokenLength: userAccessToken?.length || 0,
        accessTokenPreview: this.maskValue(userAccessToken, 12),
        expiresIn,
      });
      */

      // Console.log substituto para o ambiente de testes atual:
      console.log("[Instagram OAuth][service][integration] Utilizando Short-Lived Token (Bypass temporário)", {
        accessTokenLength: userAccessToken?.length || 0,
        accessTokenPreview: this.maskValue(userAccessToken, 12),
        expiresIn,
        note: "O token expirará em 1 hora. Renovações automáticas não funcionarão."
      });
      // ---------------------------------------------------------

      let instagramUserId = userId;
      let instagramUsername = null;

      try {
        console.log("[Instagram OAuth][service][integration] Buscando perfil do usuário...");

        const profileCandidates: Array<{ url: string; fields: string }> = [
          { url: `https://graph.instagram.com/${this.graphVersion}/me`, fields: "id,username" },
          { url: "https://graph.instagram.com/me", fields: "id,username" },
          { url: `https://graph.instagram.com/${this.graphVersion}/me`, fields: "user_id,username" },
          { url: "https://graph.instagram.com/me", fields: "user_id,username" },
        ];

        let profilePayload: any = null;
        for (const candidate of profileCandidates) {
          try {
            const profileResponse = await axios.get(candidate.url, {
              params: {
                fields: candidate.fields,
                access_token: userAccessToken,
              },
            });
            profilePayload = profileResponse.data;
            if (profilePayload) break;
          } catch (candidateError: any) {
            const candidateErr = candidateError?.response?.data;
            const candidateErrMsg = typeof candidateErr === "object"
              ? JSON.stringify(candidateErr)
              : (candidateErr || candidateError?.message);
            logger.warn(`[Instagram OAuth][service][integration] Profile candidate failed | url=${candidate.url} fields=${candidate.fields} error=${candidateErrMsg}`);
          }
        }

        if (profilePayload) {
          instagramUserId = profilePayload?.id
            ? String(profilePayload.id)
            : (profilePayload?.user_id ? String(profilePayload.user_id) : userId);
          instagramUsername = profilePayload?.username || null;

          console.log("[Instagram OAuth][service][integration] Profile resolved", {
            profileId: instagramUserId,
            profileUsername: instagramUsername,
          });
        }
      } catch (profileError: any) {
        const errorDetails = profileError?.response?.data
          ? JSON.stringify(profileError.response.data)
          : profileError?.message;
        console.warn(
          "[Instagram OAuth][service][integration] Aviso: Falha ao buscar username do perfil. Ignorando erro e salvando token.",
          errorDetails
        );
      }

      if (!instagramUserId) {
        throw new ApiError(APIErrors.badRequestError, "Could not resolve Instagram account ID", 400);
      }

      logger.info("Instagram OAuth exchange succeeded", {
        redirectUriUsed: resolvedRedirectUri,
        instagramUserId,
        instagramUsername,
        usedLongLivedToken: false,
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

  public async exchangeThreadsCodeForToken(code: string, redirectUri: string) {
    if (!this.threadsClientId || !this.threadsClientSecret) {
      throw new ApiError(APIErrors.internalServerError, "Threads credentials not configured", 500);
    }

    const cleanCode = code.replace(/#_$/, "").replace(/#$/, "").trim();

    try {
      const tokenBody = new URLSearchParams({
        client_id: this.threadsClientId,
        client_secret: this.threadsClientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code: cleanCode,
      });

      const tokenResponse = await axios.post(
        "https://graph.threads.net/oauth/access_token",
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
      const expiresIn = tokenPayload?.expires_in as number | undefined;

      if (!accessToken) {
        throw new ApiError(APIErrors.badRequestError, "Missing access token from Threads OAuth", 400);
      }

      let threadsUserId: string | null = tokenPayload?.user_id ? String(tokenPayload.user_id) : null;
      let threadsUsername: string | null = null;

      try {
        const profileResponse = await axios.get("https://graph.threads.net/v1.0/me", {
          params: {
            fields: "id,username",
            access_token: accessToken,
          },
        });

        threadsUserId = profileResponse.data?.id ? String(profileResponse.data.id) : threadsUserId;
        threadsUsername = profileResponse.data?.username || null;
      } catch (profileError: any) {
        logger.warn("Threads profile fetch failed after OAuth", {
          error: profileError?.response?.data || profileError?.message,
        });
      }

      if (!threadsUserId) {
        throw new ApiError(APIErrors.badRequestError, "Could not resolve Threads account ID", 400);
      }

      return {
        accessToken,
        userToken: accessToken,
        userId: threadsUserId,
        instagramBusinessAccountId: threadsUserId,
        instagramUsername: threadsUsername,
        pageId: null,
        pageName: null,
        expiresIn,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error("Threads OAuth exchange failed", {
        error: error?.response?.data || error?.message,
      });
      throw new ApiError(APIErrors.badRequestError, "Failed to authenticate with Threads", 400);
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

  public async subscribeAppToInstagramWebhooks(params: {
    instagramBusinessAccountId: string;
    accessToken: string;
    subscribedFields?: string[];
  }) {
    const { instagramBusinessAccountId, accessToken } = params;
    const normalizedAccessToken = String(accessToken || "").trim();
    const fields = (params.subscribedFields && params.subscribedFields.length > 0)
      ? params.subscribedFields
      : ["messages", "comments", "message_reactions", "messaging_postbacks"];

    if (!instagramBusinessAccountId || !normalizedAccessToken) {
      throw new ApiError(APIErrors.badRequestError, "Missing instagram account ID or access token for webhook subscription", 400);
    }

    const prefersInstagramGraph = normalizedAccessToken.startsWith("IG");

    if (prefersInstagramGraph) {
      logger.info("Skipping Instagram subscribed_apps for IG token that is not webhook-capable", {
        instagramBusinessAccountId,
      });
      return {
        success: false,
        subscribedFields: fields,
        error: "Token type does not support subscribed_apps",
      };
    }

    const graphCandidates = prefersInstagramGraph
      ? [
          `https://graph.instagram.com/${this.graphVersion}`,
          `https://graph.facebook.com/${this.graphVersion}`,
        ]
      : [
          `https://graph.facebook.com/${this.graphVersion}`,
          `https://graph.instagram.com/${this.graphVersion}`,
        ];

    try {
      let response: any = null;
      let usedGraphBase = graphCandidates[0];

      for (const graphBase of graphCandidates) {
        try {
          response = await axios.post(
            `${graphBase}/${instagramBusinessAccountId}/subscribed_apps`,
            null,
            {
              params: {
                access_token: normalizedAccessToken,
                subscribed_fields: fields.join(","),
              },
            }
          );
          usedGraphBase = graphBase;
          break;
        } catch (candidateError: any) {
          const candidateErr = candidateError?.response?.data;
          const candidateErrMsg = typeof candidateErr === "object"
            ? JSON.stringify(candidateErr)
            : (candidateErr || candidateError?.message);
          logger.warn(`Instagram subscribed_apps candidate failed | base=${graphBase} status=${candidateError?.response?.status} error=${candidateErrMsg}`);
        }
      }

      if (!response) {
        throw new Error("All subscribed_apps endpoint candidates failed");
      }

      logger.info("Instagram subscribed_apps success", {
        instagramBusinessAccountId,
        subscribedFields: fields,
        usedGraphBase,
        response: response.data,
      });

      return {
        success: true,
        subscribedFields: fields,
        usedGraphBase,
        response: response.data,
      };
    } catch (error: any) {
      const errData = error?.response?.data;
      const errMsg = typeof errData === "object" ? JSON.stringify(errData) : (errData || error?.message);
      logger.warn(`Instagram subscribed_apps failed | accountId=${instagramBusinessAccountId} status=${error?.response?.status} error=${errMsg}`);
      return {
        success: false,
        subscribedFields: fields,
        error: errMsg,
      };
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

  public async getLatestPostsByConnectedAccount(params: {
    instagramBusinessAccountId: string;
    accessToken: string;
    baseUrl: string;
    provider?: "instagram" | "threads";
  }) {
    const { instagramBusinessAccountId, accessToken, baseUrl } = params;
    const provider = params.provider === "threads" ? "threads" : "instagram";
    const accountId = String(instagramBusinessAccountId || "").trim();
    const normalizedAccessToken = String(accessToken || "").trim();

    if (!normalizedAccessToken) {
      return [];
    }

    const cacheSlug = `account:${accountId}`;
    const CACHE_KEY_POSTS = `${provider}:posts:${cacheSlug}`;
    const CACHE_KEY_LAST_UPDATED = `${provider}:last_updated:${cacheSlug}`;
    const CACHE_WINDOW_MS = 12 * 60 * 60 * 1000;

    let cachedPostsStr: string | null = null;
    let lastUpdatedStr: string | null = null;

    try {
      [cachedPostsStr, lastUpdatedStr] = await Promise.all([
        redisClient.get(CACHE_KEY_POSTS),
        redisClient.get(CACHE_KEY_LAST_UPDATED),
      ]);

      const lastUpdated = lastUpdatedStr ? parseInt(lastUpdatedStr, 10) : 0;
      const isStale = Date.now() - lastUpdated > CACHE_WINDOW_MS;

      if (cachedPostsStr && !isStale) {
        return JSON.parse(cachedPostsStr);
      }

      let mediaItems: any[] = [];

      const feedCandidates = provider === "threads"
        ? [
            {
              url: `https://graph.threads.net/v1.0/${accountId}/threads`,
              fields: "id,text,media_type,media_url,thumbnail_url,permalink,timestamp",
            },
            {
              url: `https://graph.threads.net/${this.graphVersion}/${accountId}/threads`,
              fields: "id,text,media_type,media_url,thumbnail_url,permalink,timestamp",
            },
          ]
        : [
            {
              url: `https://graph.instagram.com/${this.graphVersion}/me/media`,
              fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
            },
            {
              url: "https://graph.instagram.com/me/media",
              fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
            },
            ...(accountId
              ? [
                  {
                    url: `https://graph.instagram.com/${this.graphVersion}/${accountId}/media`,
                    fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
                  },
                  {
                    url: `https://graph.facebook.com/${this.graphVersion}/${accountId}/media`,
                    fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
                  },
                ]
              : []),
          ];

      for (const candidate of feedCandidates) {
        try {
          const response = await axios.get(candidate.url, {
            params: {
              fields: candidate.fields,
              limit: 9,
              access_token: normalizedAccessToken,
            },
          });

          mediaItems = Array.isArray(response.data?.data) ? response.data.data : [];
          if (mediaItems.length > 0) {
            break;
          }
        } catch (candidateError: any) {
          const errData = candidateError?.response?.data;
          const errMsg = typeof errData === "object" ? JSON.stringify(errData) : (errData || candidateError?.message);
          logger.warn(`${provider} media candidate failed | url=${candidate.url} accountId=${accountId || "me"} status=${candidateError?.response?.status} error=${errMsg}`);
        }
      }

      const rawPosts = mediaItems
        .filter((item) => {
          const mediaType = String(item?.media_type || "").toUpperCase();
          return mediaType === "IMAGE" || mediaType === "CAROUSEL_ALBUM" || mediaType === "VIDEO";
        })
        .slice(0, 3)
        .map((item) => {
          const mediaUrl = item?.thumbnail_url || item?.media_url;
          return {
            id: item?.id,
            url: item?.permalink || "#",
            originalImageUrl: mediaUrl,
            caption: item?.caption || item?.text || "",
          };
        })
        .filter((post) => post.id && post.originalImageUrl);

      if (rawPosts.length === 0) {
        if (cachedPostsStr) {
          return JSON.parse(cachedPostsStr);
        }
        return [];
      }

      const processedPosts = await this.processAndCachePosts(rawPosts, cacheSlug, baseUrl, provider);
      return processedPosts;
    } catch (error: any) {
      logger.error(`${provider} connected feed fetch failed`, {
        accountId,
        error: error?.response?.data || error?.message,
      });

      if (cachedPostsStr) {
        return JSON.parse(cachedPostsStr);
      }

      throw error;
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
             const scrapedItems = await this.scrapeHtml(username, baseUrl); 
             edges = scrapedItems.map(item => ({
                 node: {
                     id: item.id,
                     shortcode: item.id,
                     display_url: item.imageUrl.replace(`${baseUrl}/api/public/instagram/proxy?url=`, '').replace(/%26/g, '&').replace(/%3D/g, '=').replace(/%2F/g, '/').replace(/%3A/g, ':').replace(/%3F/g, '?'), 
                  }
             }));
          }
      } catch (e) {
            logger.warn("Instagram API failed fully, trying HTML scraping");
             const scraped = await this.scrapeHtml(username, baseUrl);
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

  private async processAndCachePosts(
    posts: any[],
    username: string,
    baseUrl: string,
    provider: "instagram" | "threads" = "instagram"
  ) {
      const CACHE_KEY_POSTS = `${provider}:posts:${username}`;
      const CACHE_KEY_LAST_UPDATED = `${provider}:last_updated:${username}`;
      const IMAGE_TTL = 30 * 24 * 60 * 60; // 30 days
      const POSTS_TTL = 7 * 24 * 60 * 60; // 7 days (posts structure)

      const processed = await Promise.all(posts.map(async (post) => {
          try {
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
                 
                 const processedBuffer = await sharp(buffer)
                    .resize(600, 600, { fit: 'cover' }) 
                    .jpeg({ quality: 80 })
                    .toBuffer();

                 await redisClient.set(imageKey, processedBuffer, 'EX', IMAGE_TTL);
             }

             return {
                 ...post,
                 imageUrl: `${baseUrl}/api/instagram/image/${post.id}`, // New local route
                 originalImageUrl: undefined
             };

          } catch (e) {
              logger.error(`Failed to process image for post ${post.id}`, e);
              return {
                  ...post,
                  imageUrl: post.originalImageUrl || post.imageUrl 
              };
          }
      }));

      // Cache the result
      await redisClient.set(CACHE_KEY_POSTS, JSON.stringify(processed), 'EX', POSTS_TTL);
      await redisClient.set(CACHE_KEY_LAST_UPDATED, Date.now().toString(), 'EX', POSTS_TTL);

      return processed;
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