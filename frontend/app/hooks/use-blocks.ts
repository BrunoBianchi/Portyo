import { useState, useCallback, useRef, useEffect } from "react";
import type { BioBlock } from "~/contexts/bio.context";

interface UseBlocksOptions {
  initialBlocks?: BioBlock[];
  onSave?: (blocks: BioBlock[]) => Promise<void>;
  maxHistory?: number;
}

interface UseBlocksReturn {
  blocks: BioBlock[];
  setBlocks: (blocks: BioBlock[]) => void;
  addBlock: (type: BioBlock["type"], position?: number) => BioBlock;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updates: Partial<BioBlock>) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  reorderBlocks: (newOrder: BioBlock[]) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  historyLength: number;
  hasChanges: boolean;
  resetChanges: () => void;
}

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

const getDefaultBlockData = (type: BioBlock["type"]): Partial<BioBlock> => {
  const defaults: Record<string, Partial<BioBlock>> = {
    button: {
      title: "Novo Link",
      href: "",
      buttonStyle: "solid",
      buttonShape: "rounded",
    },
    heading: {
      title: "Título",
      align: "center",
    },
    text: {
      body: "Digite seu texto aqui...",
      align: "left",
    },
    image: {
      mediaUrl: "",
      alt: "",
    },
    socials: {
      socialsLayout: "row",
      socialsLabel: false,
    },
    divider: {},
    youtube: {
      youtubeUrl: "",
    },
    spotify: {
      spotifyUrl: "",
    },
    instagram: {
      instagramUsername: "",
    },
    threads: {
      threadsUsername: "",
      threadsVariation: "thread-grid",
    },
    whatsapp: {
      whatsappNumber: "",
      whatsappMessage: "Olá! Quero falar com você.",
    },
    qrcode: {
      qrCodeValue: "",
    },
    tour: {
      tourTitle: "Próximos Shows",
      tours: [],
    },
    marketing: {
      marketingId: "",
    },
    experience: {
      experienceTitle: "Experiência",
      experiences: [],
    },
    button_grid: {
      gridItems: [],
    },
    form: {
      formId: "",
    },
    portfolio: {
      portfolioTitle: "Portfólio",
    },
    calendar: {
      calendarTitle: "Agendar",
    },
    map: {
      mapTitle: "Localização",
    },
    event: {
      eventTitle: "Evento",
    },
    featured: {
      featuredTitle: "Destaque",
    },
    affiliate: {
      affiliateTitle: "Oferta",
    },
    blog: {},
    product: {},
    video: {
      mediaUrl: "",
    },
    sponsored_links: {
      title: "Sponsored Links",
      visible: true,
    },
  };

  return defaults[type] || {};
};

export function useBlocks(options: UseBlocksOptions = {}): UseBlocksReturn {
  const { initialBlocks = [], onSave, maxHistory = 50 } = options;

  const [blocks, setBlocksState] = useState<BioBlock[]>(initialBlocks);
  const [hasChanges, setHasChanges] = useState(false);
  
  // History management
  const [history, setHistory] = useState<BioBlock[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoingRef = useRef(false);

  // Track initial blocks for change detection
  const initialBlocksRef = useRef(JSON.stringify(initialBlocks));

  const setBlocks = useCallback((newBlocks: BioBlock[] | ((prev: BioBlock[]) => BioBlock[])) => {
    setBlocksState((prev) => {
      const nextBlocks = typeof newBlocks === "function" ? newBlocks(prev) : newBlocks;
      
      // Check if there are changes
      const hasChanged = JSON.stringify(nextBlocks) !== initialBlocksRef.current;
      setHasChanges(hasChanged);

      // Add to history (debounced)
      if (!isUndoingRef.current) {
        setHistory((prevHistory) => {
          const newHistory = prevHistory.slice(0, historyIndex + 1);
          newHistory.push(nextBlocks);
          if (newHistory.length > maxHistory) {
            newHistory.shift();
          }
          return newHistory;
        });
        setHistoryIndex((prev) => Math.min(prev + 1, maxHistory - 1));
      }
      isUndoingRef.current = false;

      return nextBlocks;
    });
  }, [historyIndex, maxHistory]);

  const addBlock = useCallback((type: BioBlock["type"], position?: number, variation?: string): BioBlock => {
    const newBlock: BioBlock = {
      id: makeId(),
      type,
      ...getDefaultBlockData(type),
    };

    // Apply variation if provided
    if (variation) {
      console.log(`[DEBUG] Adding block type=${type} with variation=${variation}`);
      if (type === "instagram") {
        newBlock.instagramVariation = variation as any;
      } else if (type === "threads") {
        newBlock.threadsVariation = variation as any;
      } else if (type === "youtube") {
        newBlock.youtubeVariation = variation as any;
      } else if (type === "spotify") {
        newBlock.spotifyVariation = variation as any;
      } else if (type === "socials") {
        newBlock.socialsVariation = variation as any;
      } else if (type === "whatsapp") {
        newBlock.whatsappVariation = variation as any;
      }
      console.log(`[DEBUG] New block created:`, newBlock);
    }

    setBlocks((prev) => {
      const index = position ?? prev.length;
      const newBlocks = [...prev];
      newBlocks.splice(index, 0, newBlock);
      return newBlocks;
    });

    return newBlock;
  }, [setBlocks]);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, [setBlocks]);

  const updateBlock = useCallback((id: string, updates: Partial<BioBlock>) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  }, [setBlocks]);

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks((prev) => {
      const newBlocks = [...prev];
      const [moved] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, moved);
      return newBlocks;
    });
  }, [setBlocks]);

  const reorderBlocks = useCallback((newOrder: BioBlock[]) => {
    setBlocks(newOrder);
  }, [setBlocks]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoingRef.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBlocksState(history[newIndex]);
      setHasChanges(JSON.stringify(history[newIndex]) !== initialBlocksRef.current);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoingRef.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBlocksState(history[newIndex]);
      setHasChanges(JSON.stringify(history[newIndex]) !== initialBlocksRef.current);
    }
  }, [history, historyIndex]);

  const resetChanges = useCallback(() => {
    initialBlocksRef.current = JSON.stringify(blocks);
    setHasChanges(false);
  }, [blocks]);

  // Auto-save effect
  useEffect(() => {
    if (!onSave || !hasChanges) return;

    const timeout = setTimeout(() => {
      onSave(blocks);
      resetChanges();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [blocks, hasChanges, onSave, resetChanges]);

  return {
    blocks,
    setBlocks,
    addBlock,
    removeBlock,
    updateBlock,
    moveBlock,
    reorderBlocks,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    undo,
    redo,
    historyLength: history.length,
    hasChanges,
    resetChanges,
  };
}
