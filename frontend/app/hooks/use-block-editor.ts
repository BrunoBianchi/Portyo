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
  addBlock: (type: BioBlock["type"], defaultTitle?: string) => BioBlock;
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

  const addBlock = useCallback((type: BioBlock["type"], defaultTitle = "Novo Bloco"): BioBlock => {
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
          };
        case "spotify":
          return {
            ...baseBlock,
            spotifyUrl: "",
            spotifyCompact: false,
          };
        case "socials":
          return {
            ...baseBlock,
            socials: {},
            socialsLayout: "row",
          };
        case "divider":
          return {
            ...baseBlock,
          };
        case "qrcode":
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
          return {
            ...baseBlock,
            formId: "",
            formBackgroundColor: "#ffffff",
            formTextColor: "#1f2937",
          };
        case "portfolio":
          return {
            ...baseBlock,
            portfolioTitle: "",
          };
        case "experience":
          return {
            ...baseBlock,
            experienceTitle: "",
            experiences: [],
            experienceRoleColor: "#111827",
            experienceTextColor: "#374151",
            experienceLineColor: "#e5e7eb",
          };
        case "tour":
          return {
            ...baseBlock,
            tourTitle: "",
            tours: [],
          };
        case "blog":
          return {
            ...baseBlock,
            blogLayout: "grid",
            blogCardStyle: "modern",
            blogPostCount: 3,
            blogBackgroundColor: "#ffffff",
            blogTextColor: "#1f2937",
            blogTitleColor: "#111827",
            blogDateColor: "#9ca3af",
            blogTagBackgroundColor: "#f3f4f6",
            blogTagTextColor: "#111827",
          };
        case "product":
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
          return {
            ...baseBlock,
            marketingId: "",
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
          };
        case "instagram":
          return {
            ...baseBlock,
            instagramUsername: "",
            instagramDisplayType: "grid",
            instagramTextColor: "#000000",
            instagramTextPosition: "bottom",
            instagramShowText: true,
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
