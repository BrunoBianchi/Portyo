import { api } from "./api";

// Form types
export interface Form {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  responsesCount?: number;
}

export interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
}

export interface PollOption {
  id: string;
  label: string;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  isActive: boolean;
  votes?: number;
  allowMultipleChoices?: boolean;
  requireName?: boolean;
  requireEmail?: boolean;
  showResultsPublic?: boolean;
}

export interface ShortLinkItem {
  id: string;
  title: string;
  slug: string;
  destinationUrl: string;
  clicks: number;
  isActive: boolean;
  createdAt: string;
}

// Portfolio types
export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  categoryId?: string;
  order: number;
}

export interface PortfolioCategory {
  id: string;
  name: string;
  order: number;
}

// Marketing types
export interface MarketingSlot {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  price?: number;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

// Blog types
export interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  publishedAt: string;
  coverImage?: string;
}

// Booking types
export interface BookingSettings {
  bioId: string;
  updatesPaused: boolean;
  durationMinutes: number;
  availability: Record<string, string[]>; // e.g. { "mon": ["09:00-12:00", "14:00-17:00"] }
  blockedDates: string[]; // ISO date strings "YYYY-MM-DD"
}

// QR Code types
export interface QRCodeItem {
  id: string;
  value: string;
  clicks: number;
  views: number;
  country?: string;
  device?: string;
  lastScannedAt?: string;
}

// Instagram types
export interface InstagramPost {
  id: string;
  url: string;
  imageUrl: string;
}

// YouTube types
export interface YouTubeVideo {
  id: string;
  url: string;
  imageUrl: string;
  title?: string;
}

/**
 * Service for integrating blocks with other dashboard features
 */
export const BlockIntegrationService = {
  // Forms
  async getForms(bioId: string): Promise<Form[]> {
    try {
      const response = await api.get(`/form/bios/${bioId}/forms`);
      const forms = Array.isArray(response.data) ? response.data : [];
      return forms.map((form: any) => ({
        id: form.id,
        name: form.name || form.title || "Untitled Form",
        description: form.description || undefined,
        fields: Array.isArray(form.fields) ? form.fields : [],
        responsesCount: typeof form.submissions === "number" ? form.submissions : form.responsesCount,
      }));
    } catch (error) {
      console.error("Failed to fetch forms:", error);
      return [];
    }
  },

  async getFormById(formId: string): Promise<Form | null> {
    try {
      const response = await api.get(`/form/forms/${formId}`);
      const form = response.data;
      if (!form) return null;
      return {
        id: form.id,
        name: form.name || form.title || "Untitled Form",
        description: form.description || undefined,
        fields: Array.isArray(form.fields) ? form.fields : [],
        responsesCount: typeof form.submissions === "number" ? form.submissions : form.responsesCount,
      };
    } catch (error) {
      console.error("Failed to fetch form:", error);
      return null;
    }
  },

  // Polls
  async getPolls(bioId: string): Promise<Poll[]> {
    try {
      const response = await api.get(`/poll/bios/${bioId}/polls`);
      const polls = Array.isArray(response.data) ? response.data : [];
      return polls.map((poll: any) => ({
        id: poll.id,
        title: poll.title || "Untitled Poll",
        description: poll.description || undefined,
        options: Array.isArray(poll.options) ? poll.options : [],
        isActive: Boolean(poll.isActive),
        votes: typeof poll.votes === "number" ? poll.votes : 0,
        allowMultipleChoices: Boolean(poll.allowMultipleChoices),
        requireName: Boolean(poll.requireName),
        requireEmail: Boolean(poll.requireEmail),
        showResultsPublic: Boolean(poll.showResultsPublic),
      }));
    } catch (error) {
      console.error("Failed to fetch polls:", error);
      return [];
    }
  },

  async getPollById(pollId: string): Promise<Poll | null> {
    try {
      const response = await api.get(`/poll/polls/${pollId}`);
      const poll = response.data;
      if (!poll) return null;
      return {
        id: poll.id,
        title: poll.title || "Untitled Poll",
        description: poll.description || undefined,
        options: Array.isArray(poll.options) ? poll.options : [],
        isActive: Boolean(poll.isActive),
        votes: typeof poll.votes === "number" ? poll.votes : 0,
        allowMultipleChoices: Boolean(poll.allowMultipleChoices),
        requireName: Boolean(poll.requireName),
        requireEmail: Boolean(poll.requireEmail),
        showResultsPublic: Boolean(poll.showResultsPublic),
      };
    } catch (error) {
      console.error("Failed to fetch poll:", error);
      return null;
    }
  },

  // Portfolio
  async getPortfolioItems(bioId: string): Promise<PortfolioItem[]> {
    try {
      const response = await api.get(`/portfolio/${bioId}`);
      const payload = response.data;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : [];

      return items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        imageUrl: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : undefined,
        categoryId: item.categoryId || undefined,
        order: typeof item.order === "number" ? item.order : 0,
      }));
    } catch (error) {
      console.error("Failed to fetch portfolio items:", error);
      return [];
    }
  },

  async getPortfolioCategories(bioId: string): Promise<PortfolioCategory[]> {
    try {
      const response = await api.get(`/portfolio/categories/${bioId}`);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch portfolio categories:", error);
      return [];
    }
  },

  // Marketing Slots
  async getMarketingSlots(bioId: string): Promise<MarketingSlot[]> {
    try {
      const response = await api.get(`/marketing/bio/${bioId}/slots`);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch marketing slots:", error);
      return [];
    }
  },

  async getMarketingSlotById(slotId: string): Promise<MarketingSlot | null> {
    try {
      const response = await api.get(`/marketing/slots/${slotId}`);
      return response.data || null;
    } catch (error) {
      console.error("Failed to fetch marketing slot:", error);
      return null;
    }
  },

  // Products
  async getProducts(bioId: string): Promise<Product[]> {
    try {
      const response = await api.get(`/stripe/products`, {
        params: { bioId }
      });
      
      const products = response.data || [];
      
      // Map Stripe product format to our Product interface
      return products.map((product: any) => ({
        id: product.id,
        name: product.name || product.title,
        description: product.description,
        price: product.default_price?.unit_amount 
          ? product.default_price.unit_amount / 100 
          : product.price || 0,
        imageUrl: product.images?.[0] || product.image || product.imageUrl,
        category: product.metadata?.category || product.category,
      }));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return [];
    }
  },

  async getProductById(productId: string): Promise<Product | null> {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data || null;
    } catch (error) {
      console.error("Failed to fetch product:", error);
      return null;
    }
  },

  // Blog Posts
  async getBlogPosts(bioId: string, limit?: number): Promise<BlogPost[]> {
    try {
      const response = await api.get(`/blog/${bioId}`, {
        params: { limit },
      });
      
      const posts = response.data || [];
      
      return posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || post.content?.substring(0, 100),
        publishedAt: post.scheduledAt || post.createdAt,
        coverImage: post.thumbnail || post.coverImage, // handle both just in case
        slug: post.slug
      }));
    } catch (error) {
      console.error("Failed to fetch blog posts:", error);
      return [];
    }
  },

  // Automation / Autopost
  async getAutoPostStatus(bioId: string): Promise<{
    isActive: boolean;
    lastPost?: string;
    nextPost?: string;
  } | null> {
    try {
      const response = await api.get(`/auto-post/${bioId}`);
      const schedule = response.data;

      if (!schedule) {
        return null;
      }

      return {
        isActive: Boolean(schedule.isActive),
        nextPost: schedule.nextPostDate,
      };
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status === 404) {
        return {
          isActive: false,
        };
      }
      console.error("Failed to fetch autopost status:", error);
      return null;
    }
  },

  // Booking Settings
  async getBookingSettings(bioId: string): Promise<BookingSettings | null> {
    try {
      const response = await api.get(`/bookings/settings/${bioId}`);
      return response.data || null;
    } catch (error) {
      console.error("Failed to fetch booking settings:", error);
      return null;
    }
  },

  // QR Codes
  async getQRCodes(bioId: string): Promise<QRCodeItem[]> {
    try {
      const response = await api.get(`/qrcode/${bioId}`);
      const items = response.data || [];
      return items.map((item: any) => ({
        id: item.id,
        value: item.value,
        clicks: item.clicks || 0,
        views: item.views || 0,
        country: item.country,
        device: item.device,
        lastScannedAt: item.lastScannedAt,
      }));
    } catch (error) {
      console.error("Failed to fetch QR codes:", error);
      return [];
    }
  },

  // Short Links
  async getShortLinks(bioId: string): Promise<ShortLinkItem[]> {
    try {
      const response = await api.get(`/short-links`, { params: { bioId } });
      const items = Array.isArray(response.data) ? response.data : [];
      return items.map((item: any) => ({
        id: item.id,
        title: item.title || "Untitled link",
        slug: item.slug,
        destinationUrl: item.destinationUrl,
        clicks: Number(item.clicks || 0),
        isActive: Boolean(item.isActive),
        createdAt: item.createdAt,
      }));
    } catch (error) {
      console.error("Failed to fetch short links:", error);
      return [];
    }
  },

  // Instagram Posts
  async getInstagramPostsByBioId(bioId: string): Promise<InstagramPost[]> {
    try {
      const response = await api.get(`/public/instagram/feed/${encodeURIComponent(bioId)}`);
      const data = response.data;
      const items = Array.isArray(data) ? data : data?.posts || [];
      return items.slice(0, 3).map((post: any) => ({
        id: post.id || post.shortcode,
        url: post.url,
        imageUrl: post.imageUrl,
      }));
    } catch (error) {
      console.error("Failed to fetch Instagram posts:", error);
      return [];
    }
  },

  async getThreadsPostsByBioId(bioId: string): Promise<InstagramPost[]> {
    try {
      const response = await api.get(`/public/threads/feed/${encodeURIComponent(bioId)}`);
      const data = response.data;
      const items = Array.isArray(data) ? data : data?.posts || [];
      return items.slice(0, 3).map((post: any) => ({
        id: post.id || post.shortcode,
        url: post.url,
        imageUrl: post.imageUrl,
      }));
    } catch (error) {
      console.error("Failed to fetch Threads posts:", error);
      return [];
    }
  },

  // YouTube Videos
  async getYouTubeVideos(url: string): Promise<YouTubeVideo[]> {
    try {
      const response = await api.get(`/public/youtube/fetch`, {
        params: { url },
      });
      const data = response.data;
      const items = Array.isArray(data) ? data : data?.videos || [];
      return items.slice(0, 3).map((video: any) => ({
        id: video.id,
        url: video.url,
        imageUrl: video.imageUrl,
        title: video.title,
      }));
    } catch (error) {
      console.error("Failed to fetch YouTube videos:", error);
      return [];
    }
  },

  // Analytics
  async getBlockAnalytics(
    bioId: string,
    blockId: string,
    period: "7d" | "30d" | "90d" = "30d"
  ): Promise<{
    views: number;
    clicks: number;
    ctr: number;
  } | null> {
    try {
      const response = await api.get(
        `/analytics/bio/${bioId}/block/${blockId}`,
        { params: { period } }
      );
      return response.data || null;
    } catch (error) {
      console.error("Failed to fetch block analytics:", error);
      return null;
    }
  },

  // Validate block configuration
  async validateBlockConfig(
    blockType: string,
    config: Record<string, any>
  ): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const response = await api.post(`/blocks/validate`, {
        type: blockType,
        config,
      });
      return response.data || { valid: true };
    } catch (error) {
      console.error("Failed to validate block config:", error);
      return { valid: false, errors: ["Validation failed"] };
    }
  },
};

export default BlockIntegrationService;
