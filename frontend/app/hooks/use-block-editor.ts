import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BioBlock } from "~/contexts/bio.context";

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

interface UseBlockEditorOptions {
  initialBlocks?: BioBlock[];
  onSave?: (blocks: BioBlock[]) => Promise<void>;
  key?: string;
}

interface UseBlockEditorReturn {
  blocks: BioBlock[];
  history: BioBlock[][];
  canUndo: boolean;
  addBlock: (type: BioBlock["type"], defaultTitle?: string, variation?: string) => BioBlock;
  updateBlock: (id: string, updates: Partial<BioBlock>) => void;
  deleteBlock: (id: string) => void;
  reorderBlocks: (newOrder: BioBlock[]) => void;
  undo: () => void;
  getBlockById: (id: string) => BioBlock | undefined;
  replaceBlock: (id: string, newBlock: BioBlock) => void;
  setBlocks: React.Dispatch<React.SetStateAction<BioBlock[]>>;
}

export function useBlockEditor(options: UseBlockEditorOptions = {}): UseBlockEditorReturn {
  const { initialBlocks = [], onSave, key } = options;

  const isVariation = (current: string | undefined, expected: string) => current === expected;
  
  const [blocks, setBlocks] = useState<BioBlock[]>(initialBlocks);
  const [history, setHistory] = useState<BioBlock[][]>([]);
  const historyRef = useRef(history);
  const blocksRef = useRef(blocks);
  const prevKeyRef = useRef(key);



  // Reset state when key changes (e.g. switching bios)
  useEffect(() => {
    if (key && key !== prevKeyRef.current) {
      setBlocks(initialBlocks);
      setHistory([]);
      historyRef.current = [];
      blocksRef.current = initialBlocks;
      prevKeyRef.current = key;
    }
  }, [key, initialBlocks]);
  
  // Keep refs in sync
  useEffect(() => {
    historyRef.current = history;
  }, [history]);
  
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const saveToHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-19), blocksRef.current]); // Keep last 20 states
  }, []);

  const addBlock = useCallback((type: BioBlock["type"], defaultTitle = "Novo Bloco", variation?: string): BioBlock => {
    const baseBlock: BioBlock = {
      id: makeId(),
      type,
    };

    const newBlock: BioBlock = (() => {
      switch (type) {
        case "heading":
          return {
            ...baseBlock,
            title: defaultTitle,
            body: "",
            align: "center",
            fontSize: "32px",
            fontWeight: "800",
            textColor: "#0f172a",
          };
        case "text":
          return {
            ...baseBlock,
            body: "",
            align: "center",
            fontSize: "16px",
            fontWeight: "500",
            textColor: "#475569",
          };
        case "button":
          if (isVariation(variation, "button-gradient")) {
            return {
              ...baseBlock,
              title: "Acessar agora",
              href: "https://",
              accent: "#7c3aed",
              textColor: "#ffffff",
              buttonStyle: "gradient",
              buttonShape: "pill",
            };
          }

          if (isVariation(variation, "button-neon")) {
            return {
              ...baseBlock,
              title: "Ver oferta",
              href: "https://",
              accent: "#22c55e",
              textColor: "#052e16",
              buttonStyle: "neon",
              buttonShape: "rounded",
            };
          }

          return {
            ...baseBlock,
            title: defaultTitle,
            href: "https://",
            accent: "#111827",
            textColor: "#ffffff",
            buttonStyle: "solid",
            buttonShape: "rounded",
          };
        case "button_grid":
          return {
            ...baseBlock,
            gridItems: [],
          };
        case "image":
          return {
            ...baseBlock,
            mediaUrl: "",
          };
        case "video":
          return {
            ...baseBlock,
            mediaUrl: "",
          };
        case "youtube":
          return {
            ...baseBlock,
            youtubeUrl: "",
            youtubeVariation: variation as any || "full-channel",
          };
        case "spotify":
          return {
            ...baseBlock,
            spotifyUrl: "",
            spotifyCompact: false,
            spotifyVariation: variation as any || "artist-profile",
          };
        case "socials":
          return {
            ...baseBlock,
            socials: {},
            socialsLayout: "row",
            socialsVariation: variation as any || "icon-grid",
          };
        case "divider":
          return {
            ...baseBlock,
          };
        case "qrcode":
          if (isVariation(variation, "qr-multiple")) {
            return {
              ...baseBlock,
              qrCodeLayout: "multiple",
              qrCodeValue: "",
              qrCodeColor: "#111827",
              qrCodeBgColor: "#FFFFFF",
              qrCodeItems: [],
            };
          }

          if (isVariation(variation, "qr-grid")) {
            return {
              ...baseBlock,
              qrCodeLayout: "grid",
              qrCodeValue: "",
              qrCodeColor: "#111827",
              qrCodeBgColor: "#FFFFFF",
              qrCodeItems: [],
            };
          }

          return {
            ...baseBlock,
            qrCodeLayout: "single",
            qrCodeValue: "",
            qrCodeColor: "#000000",
            qrCodeBgColor: "#FFFFFF",
            qrCodeItems: [],
          };
        case "calendar":
          return {
            ...baseBlock,
            calendarTitle: "",
            calendarUrl: "",
            calendarColor: "#ffffff",
            calendarTextColor: "#1f2937",
            calendarAccentColor: "#2563eb",
          };
        case "map":
          return {
            ...baseBlock,
            mapTitle: "",
            mapAddress: "",
          };
        case "event":
          return {
            ...baseBlock,
            eventTitle: "",
            eventDate: "",
            eventButtonText: "",
            eventButtonUrl: "",
            eventColor: "#111827",
            eventTextColor: "#ffffff",
          };
        case "form":
          if (isVariation(variation, "form-signup")) {
            return {
              ...baseBlock,
              formId: "",
              formBackgroundColor: "#eff6ff",
              formTextColor: "#1e3a8a",
            };
          }

          return {
            ...baseBlock,
            formId: "",
            formBackgroundColor: "#ffffff",
            formTextColor: "#1f2937",
          };
        case "poll":
          if (isVariation(variation, "poll-research")) {
            return {
              ...baseBlock,
              pollId: "",
              pollBackgroundColor: "#f8fafc",
              pollTextColor: "#334155",
            };
          }

          return {
            ...baseBlock,
            pollId: "",
            pollBackgroundColor: "#ffffff",
            pollTextColor: "#1f2937",
          };
        case "portfolio":
          if (isVariation(variation, "portfolio-minimal")) {
            return {
              ...baseBlock,
              portfolioTitle: "Projetos",
              blockBackground: "#ffffff",
              blockBorderRadius: 12,
              blockBorderWidth: 1,
              blockBorderColor: "#e5e7eb",
              blockPadding: 16,
            };
          }

          return {
            ...baseBlock,
            portfolioTitle: "Portfólio em destaque",
            blockBackground: "#f8fafc",
            blockBorderRadius: 16,
            blockPadding: 20,
          };
        case "experience":
          if (isVariation(variation, "experience-clean")) {
            return {
              ...baseBlock,
              experienceTitle: "Resumo profissional",
              experiences: [],
              experienceRoleColor: "#111827",
              experienceTextColor: "#4b5563",
              experienceLineColor: "#e5e7eb",
              blockBackground: "#ffffff",
              blockBorderRadius: 14,
              blockPadding: 16,
            };
          }

          return {
            ...baseBlock,
            experienceTitle: "Minha jornada",
            experiences: [],
            experienceRoleColor: "#0f172a",
            experienceTextColor: "#334155",
            experienceLineColor: "#bae6fd",
            blockBackground: "#f8fafc",
            blockBorderRadius: 16,
            blockPadding: 18,
          };
        case "tour":
          return {
            ...baseBlock,
            tourTitle: "",
            tours: [],
          };
        case "blog":
          if (isVariation(variation, "blog-editorial")) {
            return {
              ...baseBlock,
              blogLayout: "magazine",
              blogCardStyle: "featured",
              blogPostCount: 4,
              blogBackgroundColor: "#ffffff",
              blogTextColor: "#334155",
              blogTitleColor: "#0f172a",
              blogDateColor: "#64748b",
              blogTagBackgroundColor: "#f1f5f9",
              blogTagTextColor: "#0f172a",
            };
          }

          if (isVariation(variation, "blog-minimal")) {
            return {
              ...baseBlock,
              blogLayout: "list",
              blogCardStyle: "minimal",
              blogPostCount: 5,
              blogShowImages: false,
              blogBackgroundColor: "#ffffff",
              blogTextColor: "#475569",
              blogTitleColor: "#111827",
              blogDateColor: "#94a3b8",
              blogTagBackgroundColor: "#f8fafc",
              blogTagTextColor: "#334155",
            };
          }

          return {
            ...baseBlock,
            blogLayout: "carousel",
            blogCardStyle: "featured",
            blogPostCount: 3,
            blogBackgroundColor: "#ffffff",
            blogTextColor: "#1f2937",
            blogTitleColor: "#111827",
            blogDateColor: "#9ca3af",
            blogTagBackgroundColor: "#f3f4f6",
            blogTagTextColor: "#111827",
          };
        case "product":
          if (isVariation(variation, "product-minimal")) {
            return {
              ...baseBlock,
              products: [],
              productLayout: "list",
              productCardStyle: "minimal",
              productShowDescriptions: false,
              productBackgroundColor: "#ffffff",
              productTextColor: "#111827",
              productAccentColor: "#111827",
              productButtonText: "Comprar",
            };
          }

          if (isVariation(variation, "product-carousel")) {
            return {
              ...baseBlock,
              products: [],
              productLayout: "carousel",
              productCardStyle: "default",
              productBackgroundColor: "#ffffff",
              productTextColor: "#1f2937",
              productAccentColor: "#7c3aed",
              productButtonText: "Ver produto",
            };
          }

          return {
            ...baseBlock,
            products: [],
            productLayout: "grid",
            productCardStyle: "default",
            productBackgroundColor: "#ffffff",
            productTextColor: "#1f2937",
            productAccentColor: "#000000",
            productButtonText: "View Product",
          };
        case "featured":
          return {
            ...baseBlock,
            featuredTitle: "",
            featuredPrice: "",
            featuredImage: "",
            featuredUrl: "",
            featuredColor: "#1f4d36",
            featuredTextColor: "#ffffff",
          };
        case "affiliate":
          return {
            ...baseBlock,
            affiliateTitle: "",
            affiliateCode: "",
            affiliateImage: "",
            affiliateUrl: "",
            affiliateColor: "#ffffff",
            affiliateTextColor: "#1f2937",
          };
        case "marketing":
          if (isVariation(variation, "marketing-compact")) {
            return {
              ...baseBlock,
              marketingId: "",
              marketingLayout: "compact",
              marketingShowImage: false,
              marketingShowButton: true,
            };
          }

          return {
            ...baseBlock,
            marketingId: "",
            marketingLayout: "banner",
            marketingShowImage: true,
            marketingShowButton: true,
          };
        case "sponsored_links":
          return {
            ...baseBlock,
            title: "Links patrocinados",
          };
        case "whatsapp":
          return {
            ...baseBlock,
            whatsappNumber: "",
            whatsappMessage: "",
            whatsappStyle: "solid",
            whatsappShape: "pill",
            accent: "#25D366",
            textColor: "#ffffff",
            whatsappVariation: variation as any || "direct-button",
          };
        case "instagram":
          return {
            ...baseBlock,
            instagramUsername: "",
            instagramDisplayType: "grid",
            instagramTextColor: "#000000",
            instagramTextPosition: "bottom",
            instagramShowText: true,
            instagramVariation: variation as any || "grid-shop",
          };
        case "threads":
          return {
            ...baseBlock,
            threadsUsername: "",
            threadsDisplayType: "grid",
            threadsTextColor: "#111111",
            threadsTextPosition: "bottom",
            threadsShowText: true,
            threadsVariation: variation as any || "thread-grid",
          };
        default:
          return {
            ...baseBlock,
            title: type === "button" ? defaultTitle : "",
          };
      }
    })();

    saveToHistory();
    setBlocks((prev) => [newBlock, ...prev]);
    
    return newBlock;
  }, [saveToHistory]);

  const updateBlock = useCallback((id: string, updates: Partial<BioBlock>) => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === id);
      if (index === -1) return prev;
      
      const newBlocks = [...prev];
      newBlocks[index] = { ...newBlocks[index], ...updates };
      return newBlocks;
    });
  }, []);

  const deleteBlock = useCallback((id: string) => {
    saveToHistory();
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, [saveToHistory]);

  const reorderBlocks = useCallback((newOrder: BioBlock[]) => {
    saveToHistory();
    setBlocks(newOrder);
  }, [saveToHistory]);

  const undo = useCallback(() => {
    const currentHistory = historyRef.current;
    if (currentHistory.length === 0) return;
    
    const previous = currentHistory[currentHistory.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setBlocks(previous);
  }, []);

  const getBlockById = useCallback((id: string) => {
    return blocks.find((b) => b.id === id);
  }, [blocks]);

  const replaceBlock = useCallback((id: string, newBlock: BioBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? newBlock : b)));
  }, []);

  const canUndo = history.length > 0;

  return useMemo(
    () => ({
      blocks,
      history,
      canUndo,
      addBlock,
      updateBlock,
      deleteBlock,
      reorderBlocks,
      undo,
      getBlockById,
      replaceBlock,
      setBlocks,
    }),
    [blocks, history, canUndo, addBlock, updateBlock, deleteBlock, reorderBlocks, undo, getBlockById, replaceBlock]
  );
}
