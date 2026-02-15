import { useState, useEffect, useCallback, useRef } from "react";
import {
  BlockIntegrationService,
  type Form,
  type Poll,
  type PortfolioItem,
  type PortfolioCategory,
  type Product,
  type MarketingSlot,
  type BlogPost,
  type BookingSettings,
  type QRCodeItem,
  type ShortLinkItem,
  type InstagramPost,
  type YouTubeVideo,
} from "~/services/block-integration.service";

interface UseBlockIntegrationOptions {
  bioId: string | null;
  enabled?: boolean;
}

// Hook for Polls
export function usePolls({ bioId, enabled = true }: UseBlockIntegrationOptions) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPolls = useCallback(async () => {
    if (!bioId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await BlockIntegrationService.getPolls(bioId);
      setPolls(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [bioId]);

  useEffect(() => {
    if (enabled && bioId) {
      fetchPolls();
    }
  }, [enabled, bioId, fetchPolls]);

  const getPollById = useCallback(
    (pollId: string) => {
      return polls.find((p) => p.id === pollId) || null;
    },
    [polls]
  );

  return { polls, isLoading, error, refetch: fetchPolls, getPollById };
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

// Hook for Booking Settings
export function useBookingSettings({
  bioId,
  enabled = true,
}: UseBlockIntegrationOptions) {
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!bioId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await BlockIntegrationService.getBookingSettings(bioId);
      setSettings(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [bioId]);

  useEffect(() => {
    if (enabled && bioId) {
      fetchSettings();
    }
  }, [enabled, bioId, fetchSettings]);

  const isConfigured = settings !== null && settings.availability != null && Object.keys(settings.availability).length > 0;

  const availableDays = settings?.availability
    ? Object.keys(settings.availability).filter(
        (day) => settings.availability[day]?.length > 0
      )
    : [];

  return {
    settings,
    isLoading,
    error,
    refetch: fetchSettings,
    isConfigured,
    availableDays,
  };
}

// Hook for QR Codes
export function useQRCodes({
  bioId,
  enabled = true,
}: UseBlockIntegrationOptions) {
  const [qrcodes, setQrcodes] = useState<QRCodeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchQRCodes = useCallback(async () => {
    if (!bioId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await BlockIntegrationService.getQRCodes(bioId);
      setQrcodes(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [bioId]);

  useEffect(() => {
    if (enabled && bioId) {
      fetchQRCodes();
    }
  }, [enabled, bioId, fetchQRCodes]);

  const getQRCodeById = useCallback(
    (id: string) => {
      return qrcodes.find((q) => q.id === id) || null;
    },
    [qrcodes]
  );

  return {
    qrcodes,
    isLoading,
    error,
    refetch: fetchQRCodes,
    getQRCodeById,
  };
}

export function useShortLinks({
  bioId,
  enabled = true,
}: UseBlockIntegrationOptions) {
  const [shortLinks, setShortLinks] = useState<ShortLinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchShortLinks = useCallback(async () => {
    if (!bioId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await BlockIntegrationService.getShortLinks(bioId);
      setShortLinks(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [bioId]);

  useEffect(() => {
    if (enabled && bioId) {
      fetchShortLinks();
    }
  }, [enabled, bioId, fetchShortLinks]);

  const getShortLinkById = useCallback(
    (id: string) => {
      return shortLinks.find((item) => item.id === id) || null;
    },
    [shortLinks]
  );

  return {
    shortLinks,
    isLoading,
    error,
    refetch: fetchShortLinks,
    getShortLinkById,
  };
}

// Hook for Instagram Preview (debounced)
export function useInstagramPreview(bioId: string | null, enabled = true) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!enabled || !bioId) {
      setPosts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const data = await BlockIntegrationService.getInstagramPostsByBioId(bioId);
        setPosts(data);
      } catch (err) {
        setError(err as Error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [bioId, enabled]);

  return { posts, isLoading, error };
}

export function useThreadsPreview(bioId: string | null, enabled = true) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!enabled || !bioId) {
      setPosts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const data = await BlockIntegrationService.getThreadsPostsByBioId(bioId);
        setPosts(data);
      } catch (err) {
        setError(err as Error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [bioId, enabled]);

  return { posts, isLoading, error };
}

// Hook for YouTube Preview (debounced)
export function useYouTubePreview(url: string, enabled = true) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const isValidUrl =
    url && (url.includes("youtube.com") || url.includes("youtu.be"));

  useEffect(() => {
    if (!enabled || !isValidUrl) {
      setVideos([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const data = await BlockIntegrationService.getYouTubeVideos(url);
        setVideos(data);
      } catch (err) {
        setError(err as Error);
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [url, enabled, isValidUrl]);

  return { videos, isLoading, error };
}

// Combined hook for all integrations
export function useBlockIntegrations(bioId: string | null) {
  const forms = useForms({ bioId });
  const polls = usePolls({ bioId });
  const portfolio = usePortfolio({ bioId });
  const products = useProducts({ bioId });
  const marketing = useMarketingSlots({ bioId });
  const blog = useBlogPosts({ bioId });
  const bookingSettings = useBookingSettings({ bioId });
  const qrcodes = useQRCodes({ bioId });
  const shortLinks = useShortLinks({ bioId });

  const isLoadingAny =
    forms.isLoading ||
    polls.isLoading ||
    portfolio.isLoading ||
    products.isLoading ||
    marketing.isLoading ||
    blog.isLoading ||
    bookingSettings.isLoading ||
    qrcodes.isLoading ||
    shortLinks.isLoading;

  const refreshAll = useCallback(() => {
    forms.refetch();
    polls.refetch();
    portfolio.refetch();
    products.refetch();
    marketing.refetch();
    blog.refetch();
    bookingSettings.refetch();
    qrcodes.refetch();
    shortLinks.refetch();
  }, [forms, polls, portfolio, products, marketing, blog, bookingSettings, qrcodes, shortLinks]);

  return {
    forms,
    polls,
    portfolio,
    products,
    marketing,
    blog,
    bookingSettings,
    qrcodes,
    shortLinks,
    isLoadingAny,
    refreshAll,
  };
}
