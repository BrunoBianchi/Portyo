import { api } from "./api";

export type InstagramAutoReplyPlan = "free" | "standard" | "pro";

export interface InstagramAutoReplyConfig {
  automationId: string | null;
  ruleName?: string;
  active: boolean;
  triggerType: "instagram_comment_received" | "instagram_dm_received";
  keywordMode: "all" | "specific";
  keywords: string[];
  dmMessage: string;
  publicReplyEnabled: boolean;
  publicReplyMessage: string;
  fallbackDmMessage: string;
}

export interface InstagramAutoReplyPayload {
  automationId?: string;
  ruleName?: string;
  triggerType: "instagram_comment_received" | "instagram_dm_received";
  keywordMode: "all" | "specific";
  keywords: string[];
  dmMessage: string;
  publicReplyEnabled: boolean;
  publicReplyMessage?: string;
  fallbackDmMessage?: string;
}

export interface InstagramAutoReplyResponse {
  plan: InstagramAutoReplyPlan;
  limits: {
    maxKeywords: number;
    maxRules: number;
    canUsePublicReply: boolean;
    canUseFallbackDm: boolean;
  };
  usage: {
    totalRules: number;
    remainingRules: number;
  };
  configs: InstagramAutoReplyConfig[];
  config: InstagramAutoReplyConfig;
}

export interface InstagramPostIdea {
  title: string;
  angle: string;
  keywords: string[];
}

export interface InstagramPostIdeasResponse {
  plan: InstagramAutoReplyPlan;
  count: number;
  maxCount: number;
  ideas: InstagramPostIdea[];
}

export interface InstagramWebhookConfigResponse {
  callbackUrl: string;
  object: "instagram";
  requiredFields: string[];
  optionalFields: string[];
  verifyTokenConfigured: boolean;
  instructions: {
    callbackUrl: string;
    verifyTokenEnv: string;
    note: string;
  };
}

export interface InstagramLastWebhookEvent {
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
}

export interface InstagramLastWebhookEventResponse {
  hasEvent: boolean;
  event: InstagramLastWebhookEvent | null;
  globalFallbackEvent: InstagramLastWebhookEvent | null;
}

export const getInstagramAutoReplyConfig = async (bioId: string): Promise<InstagramAutoReplyResponse> => {
  const response = await api.get(`/instagram/auto-reply/${bioId}`);
  return response.data;
};

export const saveInstagramAutoReplyConfig = async (
  bioId: string,
  payload: InstagramAutoReplyPayload
): Promise<{ success: boolean; automationId: string; active: boolean; plan: InstagramAutoReplyPlan }> => {
  const response = await api.put(`/instagram/auto-reply/${bioId}`, payload);
  return response.data;
};

export const publishInstagramAutoReplyConfig = async (
  bioId: string,
  automationId?: string
): Promise<{ success: boolean; automationId: string; active: boolean }> => {
  const response = await api.post(`/instagram/auto-reply/${bioId}/publish`, automationId ? { automationId } : {});
  return response.data;
};

export const getInstagramPostIdeas = async (
  bioId: string,
  count = 5
): Promise<InstagramPostIdeasResponse> => {
  const response = await api.get(`/instagram/post-ideas/${bioId}`, { params: { count } });
  return response.data;
};

export const getInstagramWebhookConfig = async (): Promise<InstagramWebhookConfigResponse> => {
  const response = await api.get(`/instagram/webhook/config`);
  return response.data;
};

export const getInstagramLastWebhookEvent = async (bioId: string): Promise<InstagramLastWebhookEventResponse> => {
  const response = await api.get(`/instagram/webhook/last`, { params: { bioId } });
  return response.data;
};
