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

/**
 * Service for integrating blocks with other dashboard features
 */
export const BlockIntegrationService = {
  // Forms
  async getForms(bioId: string): Promise<Form[]> {
    try {
      const response = await api.get(`/form/bios/${bioId}/forms`);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch forms:", error);
      return [];
    }
  },

  async getFormById(formId: string): Promise<Form | null> {
    try {
      const response = await api.get(`/form/forms/${formId}`);
      return response.data || null;
    } catch (error) {
      console.error("Failed to fetch form:", error);
      return null;
    }
  },

  // Portfolio
  async getPortfolioItems(bioId: string): Promise<PortfolioItem[]> {
    try {
      const response = await api.get(`/portfolio/${bioId}`);
      return response.data?.items || [];
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
      const response = await api.get(`/autopost/bio/${bioId}/status`);
      return response.data || null;
    } catch (error) {
      console.error("Failed to fetch autopost status:", error);
      return null;
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
