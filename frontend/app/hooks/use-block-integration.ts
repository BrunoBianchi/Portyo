import { useState, useEffect, useCallback } from "react";
import {
  BlockIntegrationService,
  type Form,
  type PortfolioItem,
  type PortfolioCategory,
  type Product,
  type MarketingSlot,
  type BlogPost,
} from "~/services/block-integration.service";

interface UseBlockIntegrationOptions {
  bioId: string | null;
  enabled?: boolean;
}

// Hook for Forms
export function useForms({ bioId, enabled = true }: UseBlockIntegrationOptions) {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchForms = useCallback(async () => {
    if (!bioId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await BlockIntegrationService.getForms(bioId);
      setForms(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [bioId]);

  useEffect(() => {
    if (enabled && bioId) {
      fetchForms();
    }
  }, [enabled, bioId, fetchForms]);

  const getFormById = useCallback(
    (formId: string) => {
      return forms.find((f) => f.id === formId) || null;
    },
    [forms]
  );

  return { forms, isLoading, error, refetch: fetchForms, getFormById };
}

// Hook for Portfolio
export function usePortfolio({
  bioId,
  enabled = true,
}: UseBlockIntegrationOptions) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!bioId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [itemsData, categoriesData] = await Promise.all([
        BlockIntegrationService.getPortfolioItems(bioId),
        BlockIntegrationService.getPortfolioCategories(bioId),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [bioId]);

  useEffect(() => {
    if (enabled && bioId) {
      fetchData();
    }
  }, [enabled, bioId, fetchData]);

  const getItemById = useCallback(
    (itemId: string) => {
      return items.find((i) => i.id === itemId) || null;
    },
    [items]
  );

  const getItemsByCategory = useCallback(
    (categoryId: string) => {
      return items.filter((i) => i.categoryId === categoryId);
    },
    [items]
  );

  return {
    items,
    categories,
    isLoading,
    error,
    refetch: fetchData,
    getItemById,
    getItemsByCategory,
  };
}

// Hook for Products
export function useProducts({
  bioId,
  enabled = true,
}: UseBlockIntegrationOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!bioId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await BlockIntegrationService.getProducts(bioId);
      setProducts(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [bioId]);

  useEffect(() => {
    if (enabled && bioId) {
      fetchProducts();
    }
  }, [enabled, bioId, fetchProducts]);

  const getProductById = useCallback(
    (productId: string) => {
      return products.find((p) => p.id === productId) || null;
    },
    [products]
  );

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
    getProductById,
  };
}

// Hook for Marketing Slots
export function useMarketingSlots({
  bioId,
  enabled = true,
}: UseBlockIntegrationOptions) {
  const [slots, setSlots] = useState<MarketingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSlots = useCallback(async () => {
    if (!bioId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await BlockIntegrationService.getMarketingSlots(bioId);
      setSlots(data.filter((s) => s.isActive));
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [bioId]);

  useEffect(() => {
    if (enabled && bioId) {
      fetchSlots();
    }
  }, [enabled, bioId, fetchSlots]);

  const getSlotById = useCallback(
    (slotId: string) => {
      return slots.find((s) => s.id === slotId) || null;
    },
    [slots]
  );

  return { slots, isLoading, error, refetch: fetchSlots, getSlotById };
}

// Hook for Blog Posts
export function useBlogPosts({
  bioId,
  enabled = true,
  limit = 5,
}: UseBlockIntegrationOptions & { limit?: number }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!bioId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await BlockIntegrationService.getBlogPosts(bioId, limit);
      setPosts(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [bioId, limit]);

  useEffect(() => {
    if (enabled && bioId) {
      fetchPosts();
    }
  }, [enabled, bioId, fetchPosts]);

  const getPostById = useCallback(
    (postId: string) => {
      return posts.find((p) => p.id === postId) || null;
    },
    [posts]
  );

  return {
    posts,
    isLoading,
    error,
    refetch: fetchPosts,
    getPostById,
  };
}

// Combined hook for all integrations
export function useBlockIntegrations(bioId: string | null) {
  const forms = useForms({ bioId });
  const portfolio = usePortfolio({ bioId });
  const products = useProducts({ bioId });
  const marketing = useMarketingSlots({ bioId });
  const blog = useBlogPosts({ bioId });

  const isLoadingAny =
    forms.isLoading ||
    portfolio.isLoading ||
    products.isLoading ||
    marketing.isLoading ||
    blog.isLoading;

  const refreshAll = useCallback(() => {
    forms.refetch();
    portfolio.refetch();
    products.refetch();
    marketing.refetch();
    blog.refetch();
  }, [forms, portfolio, products, marketing, blog]);

  return {
    forms,
    portfolio,
    products,
    marketing,
    blog,
    isLoadingAny,
    refreshAll,
  };
}
