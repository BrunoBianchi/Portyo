import { Request, Response, NextFunction } from "express";
import { instagramService } from "../services/instagram.service";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { logger } from "../shared/utils/logger";
import { IntegrationEntity } from "../database/entity/integration-entity";
import { BioEntity } from "../database/entity/bio-entity";
import { AppDataSource } from "../database/datasource";
import { env } from "../config/env";
import { generateToken, decryptToken, generateRefreshToken } from "../shared/services/jwt.service";
import { createUser, findUserByEmail } from "../shared/services/user.service";
import { BillingService } from "../services/billing.service";
import { triggerAutomation } from "../shared/services/automation.service";
import { AutomationEntity, AutomationNode, AutomationEdge, AutomationExecutionEntity } from "../database/entity/automation-entity";
import { generateBioSummary, generatePostIdeas, type BioSummary } from "../services/auto-post-ai.service";
import { AutoPostScheduleEntity } from "../database/entity/auto-post-schedule-entity";
import { In, MoreThan } from "typeorm";
import axios from "axios";

const PROCESSED_INSTAGRAM_CODES = new Map<string, number>();
const PROCESSING_INSTAGRAM_CODES = new Map<string, number>();
const INSTAGRAM_CODE_TTL_MS = 5 * 60 * 1000;

const IG_USERNAME_EXCLUDE = new Set([
  "p",
  "reel",
  "reels",
  "tv",
  "stories",
  "explore",
  "accounts",
  "developer",
  "about",
  "legal",
  "press",
  "api",
  "directory",
]);

const WORDS_EXCLUDE = new Set([
  "the", "and", "for", "with", "from", "that", "this", "your", "you", "are", "our", "out", "about", "into",
  "para", "com", "sem", "uma", "uns", "umas", "que", "isso", "essa", "este", "você", "voce", "como", "mais",
  "de", "do", "da", "dos", "das", "em", "por", "se", "na", "no", "nas", "nos", "ao", "aos", "até", "ate",
]);

const normalizeTerm = (value: string) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9à-ÿ\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractWords = (text: string) =>
  normalizeTerm(text)
    .split(" ")
    .filter((word) => word.length >= 3 && !WORDS_EXCLUDE.has(word));

const topItems = (items: string[], maxItems = 5): string[] => {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems)
    .map(([item]) => item);
};

const extractInstagramUsernamesFromHtml = (html: string): string[] => {
  const usernames = new Set<string>();
  const regex = /instagram\.com\/(?!p\/|reel\/|reels\/|explore\/|accounts\/|tv\/)([a-zA-Z0-9._]{2,30})\/?/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const username = String(match[1] || "").toLowerCase();
    if (!username || IG_USERNAME_EXCLUDE.has(username)) {
      continue;
    }
    usernames.add(username);
    if (usernames.size >= 30) break;
  }

  return Array.from(usernames);
};

const discoverSimilarInstagramProfiles = async (searchTerms: string[], maxProfiles = 5): Promise<string[]> => {
  const candidates = new Set<string>();

  for (const term of searchTerms.slice(0, 5)) {
    if (candidates.size >= maxProfiles) break;

    try {
      const response = await axios.get("https://duckduckgo.com/html/", {
        params: { q: `site:instagram.com ${term}` },
        timeout: 10000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      const usernames = extractInstagramUsernamesFromHtml(String(response.data || ""));
      for (const username of usernames) {
        candidates.add(username);
        if (candidates.size >= maxProfiles) break;
      }
    } catch {
      // Best effort only
    }
  }

  return Array.from(candidates).slice(0, maxProfiles);
};

const maskValue = (value?: string | null, visible = 8) => {
  if (!value) return "<empty>";
  if (value.length <= visible * 2) return `${value.slice(0, 2)}***${value.slice(-2)}`;
  return `${value.slice(0, visible)}...${value.slice(-visible)}`;
};

const cleanupProcessedInstagramCodes = () => {
  const now = Date.now();
  for (const [processedCode, processedAt] of PROCESSED_INSTAGRAM_CODES.entries()) {
    if (now - processedAt > INSTAGRAM_CODE_TTL_MS) {
      PROCESSED_INSTAGRAM_CODES.delete(processedCode);
    }
  }

  for (const [processingCode, processingAt] of PROCESSING_INSTAGRAM_CODES.entries()) {
    if (now - processingAt > INSTAGRAM_CODE_TTL_MS) {
      PROCESSING_INSTAGRAM_CODES.delete(processingCode);
    }
  }
};

const hasProcessedInstagramCode = (code: string): boolean => {
  cleanupProcessedInstagramCodes();
  return PROCESSED_INSTAGRAM_CODES.has(code);
};

const markProcessedInstagramCode = (code: string) => {
  cleanupProcessedInstagramCodes();
  PROCESSING_INSTAGRAM_CODES.delete(code);
  PROCESSED_INSTAGRAM_CODES.set(code, Date.now());
};

const isProcessingInstagramCode = (code: string): boolean => {
  cleanupProcessedInstagramCodes();
  return PROCESSING_INSTAGRAM_CODES.has(code);
};

const markProcessingInstagramCode = (code: string) => {
  cleanupProcessedInstagramCodes();
  PROCESSING_INSTAGRAM_CODES.set(code, Date.now());
};

const unmarkProcessingInstagramCode = (code: string) => {
  PROCESSING_INSTAGRAM_CODES.delete(code);
};

const getRequestBaseUrl = (req: Request): string => {
  const forwardedProto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim();
  const forwardedHost = (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0]?.trim();
  const proto = forwardedProto || req.protocol;
  const host = forwardedHost || req.get("host");

  if (host) {
    const normalizedHost = host.toLowerCase();
    if (normalizedHost.includes("localhost")) {
      return `${proto}://${host}`;
    }

    if (normalizedHost === "api.portyo.me" || normalizedHost.startsWith("api.portyo.me:")) {
      try {
        const frontendOrigin = new URL(env.FRONTEND_URL).origin;
        return frontendOrigin;
      } catch {
        return `${proto}://portyo.me`;
      }
    }

    return `${proto}://${host}`;
  }

  return env.FRONTEND_URL || env.BACKEND_URL;
};

const normalizeFrontendBaseUrl = (value?: string): string | undefined => {
  if (!value || typeof value !== "string") {
    return undefined;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();

    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".portyo.me") || host === "portyo.me") {
      return parsed.origin;
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const getFrontendBaseUrl = (req: Request, frontendBaseUrlFromState?: string, redirectUriFromState?: string): string => {
  const normalizedStateFrontendBaseUrl = normalizeFrontendBaseUrl(frontendBaseUrlFromState);
  if (normalizedStateFrontendBaseUrl) {
    return normalizedStateFrontendBaseUrl;
  }

  if (redirectUriFromState) {
    try {
      return new URL(redirectUriFromState).origin;
    } catch {
      // ignore parse errors and continue with fallbacks
    }
  }

  const requestBase = getRequestBaseUrl(req);
  if (requestBase.includes("localhost")) {
    return requestBase;
  }

  return env.FRONTEND_URL;
};

const getInstagramRedirectUri = (): string => {
  if (env.INSTAGRAM_REDIRECT_URI) {
    return env.INSTAGRAM_REDIRECT_URI;
  }

  try {
    const frontendOrigin = new URL(env.FRONTEND_URL).origin;
    return `${frontendOrigin}/api/instagram/auth`;
  } catch {
    return "https://portyo.me/api/instagram/auth";
  }
};

const getThreadsRedirectUri = (): string => {
  if (env.THREADS_REDIRECT_URI) {
    return env.THREADS_REDIRECT_URI;
  }

  try {
    const frontendOrigin = new URL(env.FRONTEND_URL).origin;
    return `${frontendOrigin}/api/threads/auth`;
  } catch {
    return "https://portyo.me/api/threads/auth";
  }
};

const getInstagramWebhookVerifyToken = (): string => {
  if (env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    return env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
  }

  return env.SESSION_SECRET;
};

const getInstagramWebhookCallbackUrl = (req: Request): string => {
  if (env.BACKEND_URL) {
    return `${env.BACKEND_URL.replace(/\/$/, "")}/api/instagram/webhook`;
  }

  const forwardedProto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim();
  const forwardedHost = (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0]?.trim();
  const proto = forwardedProto || req.protocol;
  const host = forwardedHost || req.get("host") || "localhost:3000";

  return `${proto}://${host}/api/instagram/webhook`;
};

const resolveIntegrationProviderFromRequest = (
  req: Request,
  queryValue?: unknown,
): "instagram" | "threads" => {
  const fromQuery = String(queryValue || "").toLowerCase();
  if (fromQuery === "threads") {
    return "threads";
  }

  const routePath = `${req.baseUrl || ""} ${req.path || ""} ${req.originalUrl || ""}`.toLowerCase();
  if (routePath.includes("/threads")) {
    return "threads";
  }

  return "instagram";
};

const AUTOREPLY_TEMPLATE_KEY = "instagram_auto_reply";

type PlanTier = "free" | "standard" | "pro";

type InstagramWebhookEventDiagnostics = {
  receivedAt: string;
  status: "processed" | "ignored_no_bio";
  eventType: string;
  accountId: string;
  resolvedBioId: string | null;
  senderId?: string;
  recipientId?: string;
  messagePreview?: string;
  triggerCounts?: {
    eventExecutions: number;
    webhookExecutions: number;
  };
};

const LAST_WEBHOOK_EVENT_BY_BIO = new Map<string, InstagramWebhookEventDiagnostics>();
let LAST_WEBHOOK_EVENT_GLOBAL: InstagramWebhookEventDiagnostics | null = null;

type InstagramAutoReplyConfigInput = {
  automationId?: string;
  ruleName?: string;
  triggerType?: "instagram_comment_received" | "instagram_dm_received";
  keywordMode?: "all" | "specific";
  keywords?: string[];
  dmMessage?: string;
  publicReplyEnabled?: boolean;
  publicReplyMessage?: string;
  fallbackDmMessage?: string;
};

const getPlanTier = async (userId: string): Promise<PlanTier> => {
  const plan = await BillingService.getActivePlan(userId);
  if (plan === "pro") return "pro";
  if (plan === "standard") return "standard";
  return "free";
};

const normalizeAutoReplyConfigInput = (payload: any): Required<InstagramAutoReplyConfigInput> => {
  const triggerType = payload?.triggerType === "instagram_dm_received"
    ? "instagram_dm_received"
    : "instagram_comment_received";

  const keywordMode = payload?.keywordMode === "specific" ? "specific" : "all";
  const keywords = Array.isArray(payload?.keywords)
    ? payload.keywords.map((keyword: any) => String(keyword || "").trim()).filter(Boolean)
    : [];

  return {
    automationId: String(payload?.automationId || "").trim(),
    ruleName: String(payload?.ruleName || "").trim() || "Instagram Auto Reply",
    triggerType,
    keywordMode,
    keywords,
    dmMessage: String(payload?.dmMessage || "").trim() || "Thanks for reaching out! 💜",
    publicReplyEnabled: Boolean(payload?.publicReplyEnabled),
    publicReplyMessage: String(payload?.publicReplyMessage || "").trim(),
    fallbackDmMessage: String(payload?.fallbackDmMessage || "").trim(),
  };
};

const getAutoReplyMaxRulesByPlan = (plan: PlanTier): number => {
  if (plan === "pro") return 5;
  if (plan === "standard") return 3;
  return 1;
};

const validateAutoReplyConfigByPlan = (config: Required<InstagramAutoReplyConfigInput>, plan: PlanTier) => {
  if (plan === "free") {
    if (config.publicReplyEnabled) {
      throw new ApiError(APIErrors.paymentRequiredError, "Public reply requires Standard or Pro.", 402);
    }
    if (config.fallbackDmMessage) {
      throw new ApiError(APIErrors.paymentRequiredError, "Fallback DM requires Pro.", 402);
    }
    if (config.keywords.length > 1) {
      throw new ApiError(APIErrors.paymentRequiredError, "Free plan supports up to 1 keyword.", 402);
    }
  }

  if (plan === "standard") {
    if (config.fallbackDmMessage) {
      throw new ApiError(APIErrors.paymentRequiredError, "Fallback DM requires Pro.", 402);
    }
    if (config.keywords.length > 5) {
      throw new ApiError(APIErrors.paymentRequiredError, "Standard plan supports up to 5 keywords.", 402);
    }
  }

  if (plan === "pro") {
    if (config.keywords.length > 20) {
      throw new ApiError(APIErrors.badRequestError, "Maximum 20 keywords allowed.", 400);
    }
  }
};

const buildAutoReplyWorkflow = (config: Required<InstagramAutoReplyConfigInput>) => {
  const triggerNode: AutomationNode = {
    id: "ig-trigger",
    type: "trigger",
    position: { x: 250, y: 80 },
    data: {
      label: "Instagram Trigger",
      eventType: config.triggerType,
      value: AUTOREPLY_TEMPLATE_KEY,
    },
  };

  const nodes: AutomationNode[] = [triggerNode];
  const edges: AutomationEdge[] = [];

  const dmNode: AutomationNode = {
    id: "ig-dm",
    type: "instagram",
    position: { x: 250, y: 300 },
    data: {
      label: "Send Auto DM",
      actionType: "send_dm",
      recipientId: "{{senderId}}",
      message: config.dmMessage,
    },
  };

  if (config.keywordMode === "specific" && config.keywords.length > 0) {
    const conditionNode: AutomationNode = {
      id: "ig-condition",
      type: "condition",
      position: { x: 250, y: 200 },
      data: {
        label: "Keyword Filter",
        conditionKey: "{{messageText}}",
        conditionOperator: "contains",
        conditionValue: config.keywords[0],
        value: JSON.stringify(config.keywords),
      },
    };

    nodes.push(conditionNode, dmNode);
    edges.push(
      { id: "ig-edge-trigger-condition", source: "ig-trigger", target: "ig-condition" },
      { id: "ig-edge-condition-dm", source: "ig-condition", sourceHandle: "true", target: "ig-dm" }
    );

    if (config.fallbackDmMessage) {
      const fallbackNode: AutomationNode = {
        id: "ig-fallback-dm",
        type: "instagram",
        position: { x: 520, y: 300 },
        data: {
          label: "Fallback DM",
          actionType: "send_dm",
          recipientId: "{{senderId}}",
          message: config.fallbackDmMessage,
        },
      };

      nodes.push(fallbackNode);
      edges.push({ id: "ig-edge-condition-fallback", source: "ig-condition", sourceHandle: "false", target: "ig-fallback-dm" });
    }
  } else {
    nodes.push(dmNode);
    edges.push({ id: "ig-edge-trigger-dm", source: "ig-trigger", target: "ig-dm" });
  }

  if (config.publicReplyEnabled && config.triggerType === "instagram_comment_received") {
    const replyNode: AutomationNode = {
      id: "ig-public-reply",
      type: "instagram",
      position: { x: 250, y: 430 },
      data: {
        label: "Public Reply",
        actionType: "reply_comment",
        commentId: "{{commentId}}",
        message: config.publicReplyMessage || "Thanks for your comment! 💜",
      },
    };

    nodes.push(replyNode);
    edges.push({ id: "ig-edge-dm-public-reply", source: "ig-dm", target: "ig-public-reply" });
  }

  return { nodes, edges };
};

const isInstagramAutoReplyAutomation = (automation: AutomationEntity) => {
  const triggerNode = (automation.nodes || []).find((node) => node.type === "trigger");
  const triggerValue = String((triggerNode?.data as any)?.value || "");
  return triggerValue === AUTOREPLY_TEMPLATE_KEY || triggerValue.startsWith(`${AUTOREPLY_TEMPLATE_KEY}:`);
};

const findInstagramAutoReplyAutomations = async (bioId: string) => {
  const automationRepository = AppDataSource.getRepository(AutomationEntity);
  const automations = await automationRepository.find({ where: { bioId } });

  return automations.filter((automation) => isInstagramAutoReplyAutomation(automation));
};

const ensureBioOwnership = async (bioId: string, userId: string) => {
  const bioRepository = AppDataSource.getRepository(BioEntity);
  const bio = await bioRepository.findOne({ where: { id: bioId, userId } });
  if (!bio) {
    throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
  }
  return bio;
};

const extractAutoReplyConfigFromAutomation = (automation: AutomationEntity) => {
  const triggerNode = (automation.nodes || []).find((node) => node.type === "trigger");
  const dmNode = (automation.nodes || []).find((node) => node.type === "instagram" && node.data?.actionType === "send_dm");
  const replyNode = (automation.nodes || []).find((node) => node.type === "instagram" && node.data?.actionType === "reply_comment");
  const conditionNode = (automation.nodes || []).find((node) => node.type === "condition");
  const fallbackNode = (automation.nodes || []).find((node) => node.type === "instagram" && node.id === "ig-fallback-dm");

  let keywords: string[] = [];
  if (conditionNode?.data?.value) {
    try {
      const parsed = JSON.parse(String(conditionNode.data.value));
      if (Array.isArray(parsed)) {
        keywords = parsed.map((keyword) => String(keyword)).filter(Boolean);
      }
    } catch {
      keywords = [String(conditionNode.data.conditionValue || "")].filter(Boolean);
    }
  }

  return {
    automationId: automation.id,
    ruleName: String(automation.name || "Instagram Auto Reply"),
    active: automation.isActive,
    triggerType: (triggerNode?.data?.eventType as string) || "instagram_comment_received",
    keywordMode: conditionNode ? "specific" : "all",
    keywords,
    dmMessage: String(dmNode?.data?.message || "Thanks for reaching out! 💜"),
    publicReplyEnabled: Boolean(replyNode),
    publicReplyMessage: String(replyNode?.data?.message || ""),
    fallbackDmMessage: String(fallbackNode?.data?.message || ""),
  };
};

const normalizeInstagramWebhookPayload = (payload: any) => {
  const entries = Array.isArray(payload?.entry) ? payload.entry : [];
  const events: Array<{ accountId: string; eventType: string; eventData: Record<string, any> }> = [];

  for (const entry of entries) {
    const accountId = String(entry?.id || "").trim();

    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const field = String(change?.field || "").toLowerCase();
      const value = change?.value || {};

      if (field === "comments") {
        const commentId = String(value?.id || value?.comment_id || "").trim();
        const mediaId = String(value?.media?.id || value?.media_id || "").trim();
        const senderId = String(value?.from?.id || value?.from_id || "").trim();
        const senderUsername = String(value?.from?.username || value?.username || "").trim();
        const commentText = String(value?.text || value?.message || "").trim();

        events.push({
          accountId,
          eventType: "instagram_comment_received",
          eventData: {
            source: "instagram_webhook",
            provider: "instagram",
            eventKind: "comment",
            instagramAccountId: accountId,
            commentId,
            mediaId,
            senderId,
            senderUsername,
            commentText,
            messageText: commentText,
            eventTimestamp: value?.created_time || value?.timestamp || Date.now(),
            rawWebhookValue: value,
          },
        });
      }

      if (field === "messages") {
        const valueMessages = Array.isArray(value?.messages) ? value.messages : [];

        if (valueMessages.length > 0) {
          for (const messageItem of valueMessages) {
            const senderId = String(
              messageItem?.from?.id || value?.from?.id || value?.sender?.id || value?.sender || ""
            ).trim();
            const recipientId = String(
              messageItem?.to?.id || value?.to?.id || value?.recipient?.id || value?.recipient || accountId
            ).trim();
            const messageText = String(
              messageItem?.text?.body || messageItem?.text || value?.message?.text || value?.text || ""
            ).trim();
            const messageId = String(
              messageItem?.id || messageItem?.mid || value?.message?.mid || value?.mid || value?.id || ""
            ).trim();

            events.push({
              accountId: recipientId || accountId,
              eventType: "instagram_dm_received",
              eventData: {
                source: "instagram_webhook",
                provider: "instagram",
                eventKind: "dm",
                instagramAccountId: recipientId || accountId,
                senderId,
                recipientId,
                messageText,
                messageId,
                eventTimestamp: messageItem?.timestamp || value?.timestamp || Date.now(),
                rawWebhookValue: value,
              },
            });
          }
        } else {
          const senderId = String(value?.from?.id || value?.sender?.id || value?.sender || "").trim();
          const recipientId = String(value?.to?.id || value?.recipient?.id || value?.recipient || accountId).trim();
          const messageText = String(value?.message?.text || value?.text || "").trim();
          const messageId = String(value?.message?.mid || value?.mid || value?.id || "").trim();

          events.push({
            accountId: recipientId || accountId,
            eventType: "instagram_dm_received",
            eventData: {
              source: "instagram_webhook",
              provider: "instagram",
              eventKind: "dm",
              instagramAccountId: recipientId || accountId,
              senderId,
              recipientId,
              messageText,
              messageId,
              eventTimestamp: value?.timestamp || Date.now(),
              rawWebhookValue: value,
            },
          });
        }
      }
    }

    const messagingEvents = Array.isArray(entry?.messaging) ? entry.messaging : [];
    for (const messageEvent of messagingEvents) {
      const senderId = String(messageEvent?.sender?.id || "").trim();
      const recipientId = String(messageEvent?.recipient?.id || accountId).trim();
      const messageText = String(
        messageEvent?.message?.text || messageEvent?.message?.body || messageEvent?.postback?.payload || ""
      ).trim();
      const messageId = String(messageEvent?.message?.mid || "").trim();

      events.push({
        accountId: recipientId || accountId,
        eventType: "instagram_dm_received",
        eventData: {
          source: "instagram_webhook",
          provider: "instagram",
          eventKind: "dm",
          instagramAccountId: recipientId || accountId,
          senderId,
          recipientId,
          messageText,
          messageId,
          eventTimestamp: messageEvent?.timestamp || Date.now(),
          rawWebhookValue: messageEvent,
        },
      });
    }
  }

  return events;
};

const findBioIdByInstagramAccountIds = async (accountIds: Array<string | undefined | null>): Promise<string | null> => {
  const integrationRepository = AppDataSource.getRepository(IntegrationEntity);
  const uniqueIds = Array.from(new Set(accountIds.map((id) => String(id || "").trim()).filter(Boolean)));

  for (const accountId of uniqueIds) {
    const integration = await integrationRepository.findOne({
      where: [
        {
          provider: "instagram",
          account_id: accountId,
        },
        {
          name: "instagram",
          account_id: accountId,
        },
        {
          name: "Instagram",
          account_id: accountId,
        },
      ],
      relations: ["bio"],
    });

    if (integration?.bio?.id) {
      return integration.bio.id;
    }
  }

  return null;
};

export const getLatestPosts = async (req: Request, res: Response, next: NextFunction) => {
  const integrationProvider = resolveIntegrationProviderFromRequest(req, req.query.provider);
  const rawUsername = req.params.username;
  if (!rawUsername) {
        next(new ApiError(APIErrors.badRequestError, "Username required", 400));
        return;
    }

  const username = rawUsername
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9._]/g, "")
    .replace(/^\.+|\.+$/g, "");

  if (!username) {
    return res.status(200).json([]);
  }

  try {
    const integrationRepository = AppDataSource.getRepository(IntegrationEntity);
    const integration = await integrationRepository.findOne({
      where: [
        { provider: integrationProvider, name: username },
        { provider: integrationProvider, name: `@${username}` },
      ],
    });

    if (!integration?.account_id || !integration?.accessToken) {
      return res.status(200).json([]);
    }

    const refreshedIntegration = await instagramService.ensureFreshIntegrationAccessToken(
      integration,
      integrationRepository
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const posts = await instagramService.getLatestPostsByConnectedAccount({
      instagramBusinessAccountId: refreshedIntegration.account_id || "",
      accessToken: refreshedIntegration.accessToken || "",
      baseUrl,
      provider: integrationProvider,
    });

    return res.status(200).json(Array.isArray(posts) ? posts : []);
  } catch (error) {
    logger.warn("Instagram public fetch by username failed", {
      provider: integrationProvider,
      username,
      error: (error as any)?.message,
    });
    return res.status(200).json([]);
  }
}

export const getLatestPostsByBioId = async (req: Request, res: Response, next: NextFunction) => {
  const integrationProvider = resolveIntegrationProviderFromRequest(req, req.query.provider);
  const bioId = String(req.params.bioId || "").trim();
  if (!bioId) {
    next(new ApiError(APIErrors.badRequestError, "Bio ID required", 400));
    return;
  }

  try {
    const integrationRepository = AppDataSource.getRepository(IntegrationEntity);
    const integration = await integrationRepository.findOne({
      where: {
        bio: { id: bioId },
        provider: integrationProvider,
      },
      relations: ["bio"],
    });

    if (!integration?.account_id || !integration?.accessToken) {
      return res.status(200).json([]);
    }

    let activeIntegration = integration;
    try {
      activeIntegration = await instagramService.ensureFreshIntegrationAccessToken(
        integration,
        integrationRepository
      );
    } catch (refreshError) {
      logger.warn("Instagram token refresh failed for public feed", {
        bioId,
        provider: integrationProvider,
        error: (refreshError as any)?.message,
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const posts = await instagramService.getLatestPostsByConnectedAccount({
      instagramBusinessAccountId: activeIntegration.account_id || "",
      accessToken: activeIntegration.accessToken || "",
      baseUrl,
      provider: integrationProvider,
    });

    return res.status(200).json(Array.isArray(posts) ? posts : []);
  } catch (error) {
    logger.warn("Instagram public feed by bioId failed", {
      bioId,
      provider: integrationProvider,
      error: (error as any)?.message,
    });
    return res.status(200).json([]);
  }
};

export const getProxyImage = async (req: Request, res: Response, next: NextFunction) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
        next(new ApiError(APIErrors.badRequestError, "URL is required", 400));
        return;
    }

    try {
        const { buffer, contentType } = await instagramService.getProxyImage(url);
        
        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }
        res.setHeader("Access-Control-Allow-Origin", "*");
        
        res.send(buffer);
    } catch (error) {
        next(error);
    }
}

export const getImage = async (req: Request, res: Response, next: NextFunction) => {
    const { shortcode } = req.params;
    if (!shortcode) {
        next(new ApiError(APIErrors.badRequestError, "Shortcode required", 400));
        return;
    }

    try {
        const { buffer, contentType } = await instagramService.getCachedImage(shortcode);
        
        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }
        
        // CORB/CORS fix
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

        // Cache control for the image itself (browser cache)
        res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
        
        res.send(buffer);
    } catch (error) {
        next(error);
    }
}


export const initiateAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mode = req.query.mode === "login" ? "login" : "integration";
  const integrationProvider = resolveIntegrationProviderFromRequest(req, req.query.integrationProvider);
      const redirectUri = integrationProvider === "threads"
        ? getThreadsRedirectUri()
        : getInstagramRedirectUri();
      const frontendBaseUrl = normalizeFrontendBaseUrl(typeof req.query.returnTo === "string" ? req.query.returnTo : undefined)
        || getFrontendBaseUrl(req, undefined, redirectUri);

      console.log("[Instagram OAuth][initiateAuth] Incoming request", {
        mode,
        integrationProvider,
        bioId: req.query.bioId,
        returnTo: req.query.returnTo,
        redirectUri,
        frontendBaseUrl,
        host: req.get("host"),
      });

      if (mode === "login") {
        const state = await generateToken({
          provider: "instagram",
          mode: "login",
          type: "login-state",
          redirectUri,
          frontendBaseUrl,
        });

        const authUrl = instagramService.getLoginAuthUrl(redirectUri);
        const authUrlWithState = `${authUrl}&state=${encodeURIComponent(state)}`;

        console.log("[Instagram OAuth][initiateAuth][login] Generated auth URL", {
          authUrl,
          stateLength: state.length,
          statePreview: maskValue(state, 12),
        });

        if (req.xhr || req.headers.accept?.indexOf('json')! > -1) {
          return res.json({ url: authUrlWithState });
        }

        return res.redirect(authUrlWithState);
      }

      const { bioId } = req.query;
      
      if (!bioId) {
        throw new ApiError(APIErrors.badRequestError, "Bio ID is required", 400);
      }

      if (!req.user?.id) {
        throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);
      }

      const bioRepository = AppDataSource.getRepository(BioEntity);
      const bio = await bioRepository.findOne({
        where: {
          id: String(bioId),
          userId: req.user.id,
        },
      });

      if (!bio) {
        throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
      }

      const state = await generateToken({
        id: req.user.id,
        bioId: bio.id,
        provider: "instagram",
        integrationProvider,
        type: "integration-state",
        mode: "integration",
        redirectUri,
        frontendBaseUrl,
      });
      
      const authUrl = integrationProvider === "threads"
        ? instagramService.getThreadsAuthUrl(redirectUri)
        : instagramService.getAuthUrl(redirectUri);
      const authUrlWithState = `${authUrl}&state=${encodeURIComponent(state)}`;

      console.log("[Instagram OAuth][initiateAuth][integration] Generated auth URL", {
        userId: req.user.id,
        bioId: bio.id,
        authUrl,
        stateLength: state.length,
        statePreview: maskValue(state, 12),
      });
      
      if (req.xhr || req.headers.accept?.indexOf('json')! > -1) {
         return res.json({ url: authUrlWithState });
      }
      
      res.redirect(authUrlWithState);
    } catch (error) {
      next(error);
    }
}

export const handleCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, error, error_reason, error_description, state } = req.query;

      console.log("[Instagram OAuth][callback] Raw query received", {
        hasCode: typeof code === "string",
        codePreview: typeof code === "string" ? maskValue(code, 12) : "<none>",
        error,
        error_reason,
        error_description,
        hasState: typeof state === "string",
        statePreview: typeof state === "string" ? maskValue(state, 12) : "<none>",
      });

      if (!state || typeof state !== "string") {
        throw new ApiError(APIErrors.badRequestError, "State missing", 400);
      }

      const statePayload = await decryptToken(state);
      const mode = (statePayload as any).mode as "login" | "integration" | undefined;
      const provider = (statePayload as any).provider as string | undefined;
      const integrationProvider = (statePayload as any).integrationProvider === "threads" ? "threads" : "instagram";
      const redirectUri = typeof (statePayload as any).redirectUri === "string"
        ? (statePayload as any).redirectUri
        : undefined;
      const frontendBaseUrlFromState = typeof (statePayload as any).frontendBaseUrl === "string"
        ? (statePayload as any).frontendBaseUrl
        : undefined;
      const frontendBaseUrl = getFrontendBaseUrl(req, frontendBaseUrlFromState, redirectUri);

      console.log("[Instagram OAuth][callback] State decoded", {
        mode,
        provider,
        integrationProvider,
        redirectUri,
        frontendBaseUrl,
      });

      if (provider !== "instagram" || !mode) {
        throw new ApiError(APIErrors.badRequestError, "Invalid state", 400);
      }

      if (error) {
        logger.error("Instagram OAuth error", { error, error_reason, error_description, mode });
        if (mode === "login") {
          return res.redirect(`${frontendBaseUrl}/login?error=instagram_auth_failed`);
        }
        return res.redirect(`${frontendBaseUrl}/dashboard/integrations?error=${integrationProvider}_auth_failed`);
      }

      if (!code || typeof code !== "string") {
        throw new ApiError(APIErrors.badRequestError, "Authorization code missing", 400);
      }

      if (mode === "integration" && hasProcessedInstagramCode(code)) {
        logger.info("Instagram callback duplicate detected, skipping code reprocessing", {
          mode,
        });
        return res.redirect(`${frontendBaseUrl}/dashboard/integrations?success=${integrationProvider}_connected`);
      }

      if (mode === "integration" && isProcessingInstagramCode(code)) {
        logger.info("Instagram callback duplicate in-flight detected, skipping code reprocessing", {
          mode,
        });
        return res.redirect(`${frontendBaseUrl}/dashboard/integrations?success=${integrationProvider}_connected`);
      }

      if (mode === "integration") {
        markProcessingInstagramCode(code);
      }

      console.log("[Instagram OAuth][callback] Processing mode", {
        mode,
        codePreview: maskValue(code, 12),
      });

      if (mode === "login") {
        const loginTokenData = await instagramService.exchangeLoginCodeForToken(code, redirectUri);
        const loginProfile = await instagramService.getLoginUserProfile(loginTokenData.accessToken);

        console.log("[Instagram OAuth][callback][login] Token/profile fetched", {
          userId: loginTokenData.userId,
          accessTokenLength: loginTokenData.accessToken?.length || 0,
          accessTokenPreview: maskValue(loginTokenData.accessToken, 12),
          profileId: loginProfile?.id,
          profileUsername: loginProfile?.username,
        });

        const preferredIdentity = loginProfile?.username || loginTokenData.userId || loginProfile?.id || String(Date.now());
        const identitySeed = String(preferredIdentity).toLowerCase();
        const generatedEmail = `${identitySeed.replace(/[^a-z0-9._-]/g, "") || "instagram"}@instagram.portyo.local`;
        const fallbackName = loginProfile?.username
          ? `@${loginProfile.username}`
          : "Instagram User";

        let user = await findUserByEmail(generatedEmail);
        console.log("[Instagram OAuth][callback][login] Lookup user", {
          generatedEmail,
          found: Boolean(user),
        });

        if (!user) {
          user = await createUser({
            email: generatedEmail,
            provider: "instagram",
            fullName: fallbackName,
            verified: true,
            password: "",
          });
        }

        const activePlan = await BillingService.getActivePlan(user.id);

        const payload = {
          id: user.id,
          email: user.email,
          fullname: user.fullName,
          verified: user.verified,
          provider: user.provider,
          createdAt: user.createdAt,
          plan: activePlan,
          onboardingCompleted: user.onboardingCompleted,
        };

        const appAccessToken = await generateToken(payload);
        const appRefreshToken = await generateRefreshToken(user.id);

        console.log("[Instagram OAuth][callback][login] App tokens generated", {
          userId: user.id,
          appAccessTokenLength: appAccessToken.length,
          appAccessTokenPreview: maskValue(appAccessToken, 12),
          appRefreshTokenLength: appRefreshToken.length,
          appRefreshTokenPreview: maskValue(appRefreshToken, 12),
        });

        res.cookie('refreshToken', appRefreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        if (req.session) {
          req.session.user = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            provider: user.provider,
            verified: user.verified,
            plan: activePlan,
            createdAt: user.createdAt,
          } as any;
        }

        const params = new URLSearchParams({ token: appAccessToken });
        if (user.onboardingCompleted === false) {
          params.set("returnTo", "/onboarding");
        }

        return res.redirect(`${frontendBaseUrl}/login?${params.toString()}`);
      }

      const tokenData = integrationProvider === "threads"
        ? await instagramService.exchangeThreadsCodeForToken(code, redirectUri || getThreadsRedirectUri())
        : await instagramService.exchangeCodeForToken(code, redirectUri);

      const normalizedIntegrationAccessToken = typeof tokenData.accessToken === "string"
        ? tokenData.accessToken.trim()
        : "";
      const tokenTypeDetected = normalizedIntegrationAccessToken.startsWith("EAA")
        ? "business"
        : (normalizedIntegrationAccessToken.startsWith("IG") ? "legacy" : "unknown");

      console.log("[Instagram OAuth][callback][integration] Token data received", {
        userId: tokenData.userId,
        instagramBusinessAccountId: tokenData.instagramBusinessAccountId,
        instagramUsername: tokenData.instagramUsername,
        accessTokenLength: tokenData.accessToken?.length || 0,
        accessTokenPreview: maskValue(tokenData.accessToken, 12),
        expiresIn: tokenData.expiresIn,
        tokenTypeDetected,
      });

      const bioId = (statePayload as any).bioId as string | undefined;
      const userId = (statePayload as any).id as string | undefined;

      if (!bioId || !userId) {
        throw new ApiError(APIErrors.badRequestError, "Invalid integration state", 400);
      }

      const bioRepository = AppDataSource.getRepository(BioEntity);
      const integrationRepository = AppDataSource.getRepository(IntegrationEntity);

      const bio = await bioRepository.findOne({ where: { id: bioId, userId } });
      if (!bio) {
         throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
      }

      let integration = await integrationRepository.findOne({
        where: {
          bio: { id: bio.id },
          provider: integrationProvider,
        },
      });

      if (!integration) {
        integration = new IntegrationEntity();
        integration.bio = bio;
        integration.provider = integrationProvider;
      }

      integration.account_id = tokenData.instagramBusinessAccountId;
      integration.name = tokenData.instagramUsername || tokenData.pageName || (integrationProvider === "threads" ? "Threads" : "Instagram");
      integration.accessToken = typeof tokenData.accessToken === "string"
        ? tokenData.accessToken.trim()
        : (tokenData.accessToken ?? undefined);
      integration.refreshToken = typeof tokenData.userToken === "string"
        ? tokenData.userToken.trim()
        : (tokenData.userToken ?? undefined);
      integration.accessTokenExpiresAt = instagramService.computeTokenExpiryDate(tokenData.expiresIn);
      integration.tokenLastRefreshedAt = new Date();
      integration.tokenLastRefreshAttemptAt = null;
      integration.tokenLastRefreshError = null;
      integration.tokenRefreshLockUntil = null;
      
      await integrationRepository.save(integration);

      if (integrationProvider === "instagram") {
        const webhookSubscriptionResult = await instagramService.subscribeAppToInstagramWebhooks({
          instagramBusinessAccountId: tokenData.instagramBusinessAccountId,
          accessToken: integration.accessToken || "",
        });

        console.log("[Instagram OAuth][callback][integration] subscribed_apps result", {
          bioId: bio.id,
          accountId: tokenData.instagramBusinessAccountId,
          success: webhookSubscriptionResult.success,
          subscribedFields: webhookSubscriptionResult.subscribedFields,
          error: webhookSubscriptionResult.success ? undefined : webhookSubscriptionResult.error,
        });
      }

      markProcessedInstagramCode(code);

      console.log("[Instagram OAuth][callback][integration] Integration saved", {
        bioId: bio.id,
        provider: integration.provider,
        accountId: integration.account_id,
        integrationName: integration.name,
        tokenExpiresAt: integration.accessTokenExpiresAt,
        tokenTypeDetected,
      });

      res.redirect(`${frontendBaseUrl}/dashboard/integrations?success=${integrationProvider}_connected`);
    } catch (error) {
      if (typeof req.query.code === "string") {
        unmarkProcessingInstagramCode(req.query.code);
      }
      logger.error("Instagram callback failed", error);
      let callbackMode: "login" | "integration" = "integration";
      let integrationProvider: "instagram" | "threads" = "instagram";
      let frontendBaseUrl = getFrontendBaseUrl(req);
      const state = req.query.state;
      if (typeof state === "string") {
        try {
          const payload = await decryptToken(state);
          const frontendBaseUrlFromState = typeof (payload as any)?.frontendBaseUrl === "string"
            ? (payload as any).frontendBaseUrl
            : undefined;
          const redirectUri = typeof (payload as any)?.redirectUri === "string"
            ? (payload as any).redirectUri
            : undefined;
          frontendBaseUrl = getFrontendBaseUrl(req, frontendBaseUrlFromState, redirectUri);
          integrationProvider = (payload as any)?.integrationProvider === "threads" ? "threads" : "instagram";
          if ((payload as any)?.mode === "login") {
            callbackMode = "login";
          }
        } catch {
          callbackMode = "integration";
        }
      }

      if (callbackMode === "login") {
        return res.redirect(`${frontendBaseUrl}/login?error=instagram_callback_failed`);
      }
      return res.redirect(`${frontendBaseUrl}/dashboard/integrations?error=${integrationProvider}_callback_failed`);
    }
}

export const verifyWebhook = async (req: Request, res: Response) => {
  const mode = String(req.query["hub.mode"] || "");
  const token = String(req.query["hub.verify_token"] || "");
  const challenge = req.query["hub.challenge"];
  const verifyToken = getInstagramWebhookVerifyToken();

  console.log("[Instagram Webhook][verify] Incoming challenge", {
    mode,
    tokenPreview: maskValue(token, 6),
    expectedTokenPreview: maskValue(verifyToken, 6),
    hasChallenge: typeof challenge !== "undefined",
  });

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[Instagram Webhook][verify] Verification success");
    return res.status(200).send(String(challenge || ""));
  }

  console.log("[Instagram Webhook][verify] Verification failed", {
    mode,
    tokenMatched: token === verifyToken,
  });

  return res.sendStatus(403);
};

export const getWebhookConfig = async (req: Request, res: Response) => {
  const callbackUrl = getInstagramWebhookCallbackUrl(req);

  return res.status(200).json({
    callbackUrl,
    object: "instagram",
    requiredFields: ["messages", "comments"],
    optionalFields: ["messaging_postbacks", "message_reactions"],
    verifyTokenConfigured: Boolean(env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN),
    instructions: {
      callbackUrl,
      verifyTokenEnv: "INSTAGRAM_WEBHOOK_VERIFY_TOKEN",
      note: "Use the same verify token set in backend env when subscribing webhook in Meta App Dashboard.",
    },
  });
};

export const getLastWebhookEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
    }

    const bioId = String(req.query.bioId || "").trim();
    if (!bioId) {
      throw new ApiError(APIErrors.badRequestError, "bioId query parameter is required", 400);
    }

    await ensureBioOwnership(bioId, req.user.id);

    const lastEvent = LAST_WEBHOOK_EVENT_BY_BIO.get(bioId) || null;

    return res.status(200).json({
      hasEvent: Boolean(lastEvent),
      event: lastEvent,
      globalFallbackEvent: LAST_WEBHOOK_EVENT_GLOBAL,
    });
  } catch (error) {
    next(error);
  }
};

export const receiveWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    console.log("[Instagram Webhook][receive] Payload received", {
      object: payload?.object,
      entryCount: Array.isArray(payload?.entry) ? payload.entry.length : 0,
    });

    const events = normalizeInstagramWebhookPayload(payload);

    console.log("[Instagram Webhook][receive] Normalized events", {
      totalEvents: events.length,
      eventTypes: events.map((event) => event.eventType),
    });

    if (!events.length) {
      logger.info("[Instagram Webhook] No supported events found in payload");
      return res.status(200).json({ received: true, processed: 0 });
    }

    let processed = 0;
    for (const [index, event] of events.entries()) {
      console.log("[Instagram Webhook][receive] Processing event", {
        index,
        eventType: event.eventType,
        accountId: event.accountId,
        instagramAccountId: event.eventData?.instagramAccountId,
        senderId: event.eventData?.senderId,
        recipientId: event.eventData?.recipientId,
        messagePreview: maskValue(String(event.eventData?.messageText || event.eventData?.commentText || ""), 12),
      });

      const resolvedBioId = await findBioIdByInstagramAccountIds([
        event.accountId,
        event.eventData?.instagramAccountId,
        event.eventData?.recipientId,
      ]);

      console.log("[Instagram Webhook][receive] Bio resolution", {
        eventType: event.eventType,
        accountId: event.accountId,
        resolvedBioId,
      });

      const eventDiagnosticsBase: InstagramWebhookEventDiagnostics = {
        receivedAt: new Date().toISOString(),
        status: resolvedBioId ? "processed" : "ignored_no_bio",
        eventType: event.eventType,
        accountId: String(event.accountId || ""),
        resolvedBioId,
        senderId: event.eventData?.senderId ? String(event.eventData.senderId) : undefined,
        recipientId: event.eventData?.recipientId ? String(event.eventData.recipientId) : undefined,
        messagePreview: maskValue(String(event.eventData?.messageText || event.eventData?.commentText || ""), 12),
      };

      LAST_WEBHOOK_EVENT_GLOBAL = eventDiagnosticsBase;

      if (!resolvedBioId) {
        logger.warn(`[Instagram Webhook] No integration found for account ${event.accountId}`);
        continue;
      }

      const autoReplyAutomations = await findInstagramAutoReplyAutomations(resolvedBioId);
      const autoReplySummary = autoReplyAutomations.map((automation) => ({
        id: automation.id,
        name: automation.name,
        active: automation.isActive,
      }));

      console.log("[Instagram Webhook][receive] Auto-reply state", {
        bioId: resolvedBioId,
        totalRules: autoReplyAutomations.length,
        activeRules: autoReplyAutomations.filter((automation) => automation.isActive).length,
        rules: autoReplySummary,
      });

      const eventData = {
        ...event.eventData,
        bioId: resolvedBioId,
      };

      const eventExecutions = await triggerAutomation(resolvedBioId, event.eventType, eventData);
      const webhookExecutions = await triggerAutomation(resolvedBioId, "webhook_received", eventData);

      console.log("[Instagram Webhook][receive] Trigger results", {
        bioId: resolvedBioId,
        eventType: event.eventType,
        eventExecutions: eventExecutions.length,
        webhookExecutions: webhookExecutions.length,
      });

      LAST_WEBHOOK_EVENT_BY_BIO.set(resolvedBioId, {
        ...eventDiagnosticsBase,
        triggerCounts: {
          eventExecutions: eventExecutions.length,
          webhookExecutions: webhookExecutions.length,
        },
      });

      processed += 1;
    }

    return res.status(200).json({ received: true, processed });
  } catch (error: any) {
    logger.error(`[Instagram Webhook] Processing failed: ${error?.message || error}`);
    return res.status(200).json({ received: true, processed: 0 });
  }
};

export const getAutoReplyConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
    }

    const bioId = String(req.params.bioId || "").trim();
    if (!bioId) {
      throw new ApiError(APIErrors.badRequestError, "Bio ID is required", 400);
    }

    await ensureBioOwnership(bioId, req.user.id);
    const plan = await getPlanTier(req.user.id);

    const maxRules = getAutoReplyMaxRulesByPlan(plan);
    const automations = await findInstagramAutoReplyAutomations(bioId);
    const configs = automations.map(extractAutoReplyConfigFromAutomation);
    const config = configs[0] || {
      automationId: null,
      ruleName: "Instagram Auto Reply",
      active: false,
      triggerType: "instagram_comment_received",
      keywordMode: "all",
      keywords: [],
      dmMessage: "Thanks for reaching out! 💜",
      publicReplyEnabled: false,
      publicReplyMessage: "",
      fallbackDmMessage: "",
    };

    return res.status(200).json({
      plan,
      limits: {
        maxKeywords: plan === "pro" ? 20 : plan === "standard" ? 5 : 1,
        maxRules,
        canUsePublicReply: plan !== "free",
        canUseFallbackDm: plan === "pro",
      },
      usage: {
        totalRules: configs.length,
        remainingRules: Math.max(0, maxRules - configs.length),
      },
      configs,
      config,
    });
  } catch (error) {
    next(error);
  }
};

export const saveAutoReplyConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
    }

    const bioId = String(req.params.bioId || "").trim();
    if (!bioId) {
      throw new ApiError(APIErrors.badRequestError, "Bio ID is required", 400);
    }

    await ensureBioOwnership(bioId, req.user.id);

    const plan = await getPlanTier(req.user.id);
    const config = normalizeAutoReplyConfigInput(req.body || {});
    validateAutoReplyConfigByPlan(config, plan);

    const automationRepository = AppDataSource.getRepository(AutomationEntity);
    const autoReplyAutomations = await findInstagramAutoReplyAutomations(bioId);
    const maxRules = getAutoReplyMaxRulesByPlan(plan);

    let automation: AutomationEntity | null = null;

    if (config.automationId) {
      automation = autoReplyAutomations.find((item) => item.id === config.automationId) || null;
      if (!automation) {
        throw new ApiError(APIErrors.notFoundError, "Auto-reply rule not found", 404);
      }
    } else {
      if (autoReplyAutomations.length >= maxRules) {
        throw new ApiError(APIErrors.paymentRequiredError, `Your plan allows up to ${maxRules} auto-reply rule(s).`, 402);
      }

      automation = automationRepository.create({
        name: config.ruleName || `Instagram Auto Reply ${autoReplyAutomations.length + 1}`,
        bioId,
        isActive: false,
        nodes: [],
        edges: [],
      });

      automation = await automationRepository.save(automation);
    }

    const triggerValue = `${AUTOREPLY_TEMPLATE_KEY}:${automation.id}`;
    const workflow = buildAutoReplyWorkflow(config);
    const triggerNodeIndex = workflow.nodes.findIndex((node) => node.type === "trigger");
    if (triggerNodeIndex >= 0) {
      workflow.nodes[triggerNodeIndex] = {
        ...workflow.nodes[triggerNodeIndex],
        data: {
          ...workflow.nodes[triggerNodeIndex].data,
          value: triggerValue,
        },
      };
    }

    automation.name = config.ruleName || automation.name || "Instagram Auto Reply";
    automation.nodes = workflow.nodes;
    automation.edges = workflow.edges;

    await automationRepository.save(automation);

    return res.status(200).json({
      success: true,
      automationId: automation.id,
      active: automation.isActive,
      plan,
    });
  } catch (error) {
    next(error);
  }
};

export const publishAutoReplyConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
    }

    const bioId = String(req.params.bioId || "").trim();
    if (!bioId) {
      throw new ApiError(APIErrors.badRequestError, "Bio ID is required", 400);
    }

    await ensureBioOwnership(bioId, req.user.id);

    const automationId = String(req.body?.automationId || req.query?.automationId || "").trim();
    const automationRepository = AppDataSource.getRepository(AutomationEntity);
    const autoReplyAutomations = await findInstagramAutoReplyAutomations(bioId);

    const existing = automationId
      ? autoReplyAutomations.find((item) => item.id === automationId) || null
      : autoReplyAutomations[0] || null;

    if (!existing) {
      throw new ApiError(APIErrors.notFoundError, "Auto-reply automation not found", 404);
    }

    existing.isActive = true;
    await automationRepository.save(existing);

    return res.status(200).json({ success: true, automationId: existing.id, active: true });
  } catch (error) {
    next(error);
  }
};

export const getInstagramPostIdeas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
    }

    const bioId = String(req.params.bioId || "").trim();
    if (!bioId) {
      throw new ApiError(APIErrors.badRequestError, "Bio ID is required", 400);
    }

    const bio = await ensureBioOwnership(bioId, req.user.id);
    const plan = await getPlanTier(req.user.id);

    const requestedCount = Number(req.query.count || 5);
    const maxCount = plan === "pro" ? 20 : plan === "standard" ? 10 : 5;
    const count = Math.max(1, Math.min(Number.isFinite(requestedCount) ? requestedCount : 5, maxCount));

    const scheduleRepository = AppDataSource.getRepository(AutoPostScheduleEntity);
    const existingSchedule = await scheduleRepository.findOne({
      where: { bioId, userId: req.user.id },
      order: { updatedAt: "DESC" },
    });

    let summaryData: BioSummary;

    if (existingSchedule?.bioSummary) {
      summaryData = {
        summary: existingSchedule.bioSummary,
        industry: "Instagram Creator",
        expertise: existingSchedule.keywords?.length ? existingSchedule.keywords : ["Instagram", "Content"],
        tone: existingSchedule.tone || "friendly",
        targetAudience: existingSchedule.targetAudience || "Instagram followers",
        uniqueSellingPoints: ["Personal brand", "Direct audience connection"],
        contentPillars: existingSchedule.topics
          ? existingSchedule.topics.split(",").map((topic) => topic.trim()).filter(Boolean).slice(0, 6)
          : ["Social media", "Audience growth", "Content strategy"],
      };
    } else {
      summaryData = await generateBioSummary(bio);
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const searchTerms = topItems([
      ...extractWords(summaryData.industry || ""),
      ...summaryData.expertise.flatMap((item) => extractWords(item)),
      ...summaryData.contentPillars.flatMap((item) => extractWords(item)),
      ...extractWords(summaryData.targetAudience || ""),
    ], 6);

    const similarUsernames = await discoverSimilarInstagramProfiles(searchTerms, 5);

    const similarProfiles: Array<{
      username: string;
      sampleSize: number;
      topKeywords: string[];
      postingSignals: string[];
    }> = [];

    const aggregateSignals: string[] = [];

    for (const username of similarUsernames) {
      try {
        const posts = await instagramService.getLatestPosts(username, baseUrl);
        const sample = Array.isArray(posts) ? posts.slice(0, 3) : [];
        const captions = sample.map((post: any) => String(post?.caption || "")).filter(Boolean);

        const hashtags = captions
          .flatMap((caption) => (caption.match(/#[a-zA-Z0-9_À-ÿ]+/g) || []).map((tag) => tag.replace(/^#/, "").toLowerCase()));

        const words = captions.flatMap((caption) => extractWords(caption));

        const questionPosts = captions.filter((caption) => caption.includes("?")).length;
        const numberedPosts = captions.filter((caption) => /\b\d{1,2}\b/.test(caption)).length;

        const postingSignals: string[] = [];
        if (questionPosts > 0) postingSignals.push("uses_questions");
        if (numberedPosts > 0) postingSignals.push("uses_numbered_hooks");
        if (hashtags.length > 0) postingSignals.push("uses_hashtags");

        aggregateSignals.push(...postingSignals);

        similarProfiles.push({
          username,
          sampleSize: sample.length,
          topKeywords: topItems([...hashtags, ...words], 6),
          postingSignals,
        });
      } catch {
        // Ignore unreachable profile and continue.
      }
    }

    const benchmarkInsights: string[] = [];
    const topSignals = topItems(aggregateSignals, 3);
    if (topSignals.includes("uses_questions")) {
      benchmarkInsights.push("Perfis semelhantes usam perguntas no início da legenda para aumentar comentários.");
    }
    if (topSignals.includes("uses_numbered_hooks")) {
      benchmarkInsights.push("Listas numeradas aparecem com frequência e funcionam bem como gancho rápido.");
    }
    if (topSignals.includes("uses_hashtags")) {
      benchmarkInsights.push("Hashtags de nicho são recorrentes; priorize 3-8 tags específicas por publicação.");
    }

    const ideas = await generatePostIdeas(summaryData, count, {
      similarProfiles,
      benchmarkInsights,
    });

    return res.status(200).json({
      plan,
      count,
      maxCount,
      ideas,
      marketResearch: {
        searchedTerms: searchTerms,
        similarProfiles,
        benchmarkInsights,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInstagramAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
    }

    const bioId = String(req.params.bioId || "").trim();
    if (!bioId) {
      throw new ApiError(APIErrors.badRequestError, "Bio ID is required", 400);
    }

    await ensureBioOwnership(bioId, req.user.id);

    const plan = await getPlanTier(req.user.id);
    const integrationRepository = AppDataSource.getRepository(IntegrationEntity);
    const executionRepository = AppDataSource.getRepository(AutomationExecutionEntity);

    const instagramIntegration = await integrationRepository.findOne({
      where: { bio: { id: bioId }, provider: "instagram" },
    });

    const automations = await findInstagramAutoReplyAutomations(bioId);
    const automationIds = automations.map((automation) => automation.id);

    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const executions = automationIds.length
      ? await executionRepository.find({
          where: {
            automationId: In(automationIds),
            createdAt: MoreThan(fromDate),
          },
          order: { createdAt: "DESC" },
          take: 150,
        })
      : [];

    const statusTotals = {
      completed: executions.filter((execution) => execution.status === "completed").length,
      failed: executions.filter((execution) => execution.status === "failed").length,
      running: executions.filter((execution) => execution.status === "running").length,
    };

    const totalExecutions = executions.length;
    const completionRate = totalExecutions > 0
      ? Math.round((statusTotals.completed / totalExecutions) * 100)
      : 0;

    const triggerCountsMap = new Map<string, number>();
    for (const execution of executions) {
      const triggerType = String(execution.triggerData?.triggerType || "unknown");
      triggerCountsMap.set(triggerType, (triggerCountsMap.get(triggerType) || 0) + 1);
    }

    const topTriggers = Array.from(triggerCountsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trigger, total]) => ({ trigger, total }));

    const lastExecutionAt = executions[0]?.createdAt || null;
    const lastWebhook = LAST_WEBHOOK_EVENT_BY_BIO.get(bioId) || null;

    return res.status(200).json({
      plan,
      integration: {
        connected: Boolean(instagramIntegration),
        accountName: instagramIntegration?.name || null,
        accountId: instagramIntegration?.account_id || null,
        tokenLastRefreshedAt: instagramIntegration?.tokenLastRefreshedAt || null,
      },
      autoReply: {
        totalRules: automations.length,
        activeRules: automations.filter((automation) => automation.isActive).length,
      },
      performance30d: {
        totalExecutions,
        completed: statusTotals.completed,
        failed: statusTotals.failed,
        running: statusTotals.running,
        completionRate,
        lastExecutionAt,
        topTriggers,
      },
      webhook: {
        lastEvent: lastWebhook,
      },
    });
  } catch (error) {
    next(error);
  }
};
