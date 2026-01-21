import React, { memo, useState, useEffect, useContext } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import BioContext, { type BioBlock } from "~/contexts/bio.context";
import { api } from "~/services/api";
import { Loader2, CreditCard, Calendar as CalendarIcon, Upload as UploadIcon } from "lucide-react";
import toast from "react-hot-toast";
import type { QrCode } from "~/services/qrcode.service";
import {
  DragHandleIcon,
  HeadingIcon,
  TextIcon,
  ButtonIcon,
  ImageIcon,
  SocialsIcon,
  VideoIcon,
  DividerIcon,
  DefaultIcon,
  TrashIcon,
  ChevronDownIcon,
  XIcon,
  PlusIcon,
  QrCodeIcon,
  FormIcon,
  TrendingUpIcon,
  WhatsAppIcon
} from "~/components/shared/icons";
import { ColorPicker } from "./ColorPicker";
import { FormInput, FormTextarea } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { ImageUpload } from "./image-upload";

interface BlockItemProps {
  block: BioBlock;
  index: number;
  isExpanded: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  dragItem: { source: "palette" | "canvas"; type?: BioBlock["type"]; id?: string } | null;
  isLocked?: boolean;
  onToggleExpand: (id: string) => void;
  onRemove: (id: string) => void;
  onChange: (id: string, key: keyof BioBlock, value: any) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnter: (e: React.DragEvent, id: string) => void;
  onTouchDragStart?: (event: React.TouchEvent) => void;
  availableQrCodes?: QrCode[];
  onCreateQrCode?: () => void;
}

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);


// Block type accent colors for visual differentiation
const getBlockTypeAccent = (type: string): { bg: string; text: string; border: string } => {
  const accents: Record<string, { bg: string; text: string; border: string }> = {
    heading: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
    text: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
    button: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
    button_grid: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
    image: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
    video: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
    socials: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
    divider: { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" },
    qrcode: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
    spotify: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
    instagram: { bg: "bg-fuchsia-50", text: "text-fuchsia-600", border: "border-fuchsia-200" },
    youtube: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
    blog: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
    product: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
    tour: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
    event: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
    calendar: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200" },
    map: { bg: "bg-lime-50", text: "text-lime-600", border: "border-lime-200" },
    form: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
    portfolio: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
    marketing: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
    whatsapp: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
    experience: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200" },
  };
  return accents[type] || { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" };
};

// Get a preview snippet for block content
const getBlockPreview = (block: BioBlock, t: TFunction): string => {
  switch (block.type) {
    case 'button':
      return block.href ? new URL(block.href).hostname.replace('www.', '') : t("dashboard.editor.blockItem.preview.noUrl");
    case 'heading':
    case 'text':
      return block.body?.substring(0, 40) || '';
    case 'image':
    case 'video':
      return block.mediaUrl ? t("dashboard.editor.blockItem.preview.mediaAttached") : t("dashboard.editor.blockItem.preview.noMedia");
    case 'socials': {
      const count = Object.values(block.socials || {}).filter(Boolean).length;
      return count
        ? t("dashboard.editor.blockItem.preview.links", { count })
        : t("dashboard.editor.blockItem.preview.noLinks");
    }
    case 'qrcode':
      return block.qrCodeValue
        ? t("dashboard.editor.blockItem.preview.qrConfigured")
        : t("dashboard.editor.blockItem.preview.noQrValue");
    case 'form':
      return block.formId
        ? t("dashboard.editor.blockItem.preview.formSelected")
        : t("dashboard.editor.blockItem.preview.noFormSelected");
    case 'portfolio':
      return block.portfolioTitle || t("dashboard.editor.blockItem.preview.portfolioFallback");
    case 'experience': {
      const count = block.experiences?.length || 0;
      return count
        ? t("dashboard.editor.blockItem.preview.experienceCount", { count })
        : t("dashboard.editor.blockItem.preview.noExperience");
    }
    case 'marketing':
      return block.marketingId
        ? t("dashboard.editor.blockItem.preview.slotConnected")
        : t("dashboard.editor.blockItem.preview.noSlotSelected");
    case 'whatsapp':
      if (!block.whatsappNumber) return t("dashboard.editor.blockItem.preview.noWhatsappNumber");
      return block.whatsappNumber.trim().startsWith("+")
        ? block.whatsappNumber
        : `+${block.whatsappNumber}`;
    default:
      return '';
  }
};

const getBlockTypeLabel = (type: string, t: TFunction): string => {
  const fallback = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  return t(`dashboard.editor.blockItem.blockTypes.${type}`, { defaultValue: fallback });
};

const FormBlockConfig = ({ block, onChange, bioId }: { block: BioBlock; onChange: (key: keyof BioBlock, value: any) => void; bioId?: string }) => {
  const { t } = useTranslation();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bioId) return;
    setLoading(true);
    api.get(`/form/bios/${bioId}/forms`)
      .then(res => setForms(res.data))
      .catch(err => console.error("Failed to fetch forms", err))
      .finally(() => setLoading(false));
  }, [bioId]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{t("dashboard.editor.blockItem.form.helper")}</p>

      <div>
        <label className="text-xs font-medium text-gray-700 mb-1.5 block">{t("dashboard.editor.blockItem.form.selectLabel")}</label>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            {t("dashboard.editor.blockItem.form.loading")}
          </div>
        ) : forms.length === 0 ? (
          <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
            {t("dashboard.editor.blockItem.form.empty")}
          </div>
        ) : (
          <select
            value={block.formId || ""}
            onChange={(e) => onChange("formId", e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
          >
            <option value="">{t("dashboard.editor.blockItem.form.placeholder")}</option>
            {forms.map(form => (
              <option key={form.id} value={form.id}>
                {form.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ColorPicker
          label={t("dashboard.editor.blockItem.common.background")}
          value={block.formBackgroundColor || "#ffffff"}
          onChange={(val) => onChange("formBackgroundColor", val)}
        />
        <ColorPicker
          label={t("dashboard.editor.blockItem.common.textColor")}
          value={block.formTextColor || "#1f2937"}
          onChange={(val) => onChange("formTextColor", val)}
        />
      </div>

    </div>
  );
};

const MarketingBlockConfig = ({ block, onChange, bioId, isLocked }: { block: BioBlock; onChange: (key: keyof BioBlock, value: any) => void; bioId?: string; isLocked?: boolean }) => {
  const { t } = useTranslation();
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bioId) return;
    setLoading(true);
    // Fetch user slots (API usually returns slots for the logged in user)
    // We should ideally filter by bioId if the API returns all user slots, or just show all user slots.
    // Given the endpoint is /marketing/slots/, it likely returns all slots for the user.
    // Let's filter by bioId to be safe and avoiding showing slots from other bios.
    api.get("/marketing/slots/")
      .then(res => {
        const userSlots = res.data;
        // Filter to only show slots for this bio
        const bioSlots = userSlots.filter((s: any) => s.bioId === bioId);
        const filteredSlots = bioSlots.filter((s: any) => s.status === 'available' || s.id === block.marketingId);
        setSlots(filteredSlots);
      })
      .catch(err => console.error("Failed to fetch slots", err))
      .finally(() => setLoading(false));
  }, [bioId, block.marketingId]);

  return (
    <div className="space-y-3 pt-3">
      <p className="text-xs text-gray-500">{t("dashboard.editor.blockItem.marketing.helper")}</p>
      {isLocked && (
        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-2">
          {t("dashboard.editor.blockItem.marketing.locked")}
        </div>
      )}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1.5 block">{t("dashboard.editor.blockItem.marketing.selectLabel")}</label>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
            {t("dashboard.editor.blockItem.marketing.loading")}
          </div>
        ) : slots.length === 0 ? (
          <p className="text-xs text-gray-400 mt-1.5">
            {t("dashboard.editor.blockItem.marketing.empty")} <a href="/dashboard/marketing" target="_blank" className="text-blue-600 hover:underline">{t("dashboard.editor.blockItem.marketing.createCta")}</a>
          </p>
        ) : (
          <select
            value={block.marketingId || ""}
            onChange={(e) => onChange("marketingId", e.target.value)}
            disabled={isLocked}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="">{t("dashboard.editor.blockItem.marketing.noneSelected")}</option>
            {slots.map(slot => (
              <option key={slot.id} value={slot.id}>{slot.slotName} ({slot.duration} {t("dashboard.editor.blockItem.marketing.days")})</option>
            ))}
          </select>
        )}
        {slots.length > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">
            <a href="/dashboard/marketing" target="_blank" className="text-blue-600 hover:underline">{t("dashboard.editor.blockItem.marketing.manageCta")}</a>
          </p>
        )}
      </div>
    </div>
  );
};

const PortfolioBlockConfig = ({ block, onChange, bioId }: { block: BioBlock; onChange: (key: keyof BioBlock, value: any) => void; bioId?: string }) => {
  const { t } = useTranslation();
  const [itemCount, setItemCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bioId) return;
    setLoading(true);
    api.get(`/portfolio/${bioId}`)
      .then(res => setItemCount(res.data.length))
      .catch(err => console.error("Failed to fetch portfolio items", err))
      .finally(() => setLoading(false));
  }, [bioId]);

  return (
    <div className="space-y-3 pt-3">
      <p className="text-xs text-gray-500">{t("dashboard.editor.blockItem.portfolio.helper")}</p>


      {!loading && (itemCount === 0 || itemCount === null) && (
        <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 flex flex-col gap-1.5">
          <span className="font-semibold">{t("dashboard.editor.blockItem.portfolio.emptyTitle")}</span>
          <span>{t("dashboard.editor.blockItem.portfolio.emptyBody")}</span>
          <a href="/dashboard/portfolio" target="_blank" className="font-bold underline cursor-pointer hover:text-amber-800 transition-colors">
            {t("dashboard.editor.blockItem.portfolio.createCta")}
          </a>
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-gray-700 mb-1.5 block">{t("dashboard.editor.blockItem.portfolio.sectionTitle")}</label>
        <input
          type="text"
          value={block.portfolioTitle || t("dashboard.editor.blockItem.portfolio.defaultTitle")}
          onChange={(e) => onChange("portfolioTitle", e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
          placeholder={t("dashboard.editor.blockItem.portfolio.placeholder")}
        />
      </div>
    </div>
  );
};

const BlockItem = memo((props: BlockItemProps) => {
  const {
    block,
    index,
    isExpanded,
    isDragging,
    isDragOver,
    dragItem,
    isLocked,
    onToggleExpand,
    onRemove,
    onChange,
    onDragStart,
    onDragEnd,
    onDrop,
    onDragEnter,
    availableQrCodes = [],
    onCreateQrCode
  } = props;
  const { t } = useTranslation();
  const { bio } = useContext(BioContext);
  const [stripeProducts, setStripeProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProductData, setNewProductData] = useState({
    title: "",
    price: "",
    currency: "usd",
    image: ""
  });

  const [isResumeUploading, setIsResumeUploading] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsResumeUploading(true);
    const formData = new FormData();
    formData.append("resume", file);

    const loader = toast.loading("Parsing resume...");

    try {
      const response = await api.post("/user/parse-resume-experiences", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success && response.data.experiences) {
        const newExperiences = response.data.experiences.map((exp: any) => ({
          id: exp.id || makeId(),
          role: exp.role || "",
          company: exp.company || "",
          period: exp.period || "",
          location: exp.location || "",
          description: exp.description || "",
        }));

        const currentExperiences = block.experiences || [];
        handleFieldChange("experiences", [...currentExperiences, ...newExperiences]);

        toast.success("Experiences imported successfully!", { id: loader });

        // Clear input value so same file can be selected again if needed
        e.target.value = "";
      }
    } catch (error) {
      console.error("Failed to parse resume", error);
      toast.error("Failed to parse resume", { id: loader });
    } finally {
      setIsResumeUploading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bio?.id) return;

    setIsCreatingProduct(true);
    try {
      const res = await api.post("/stripe/create-product", {
        bioId: bio.id,
        title: newProductData.title,
        price: parseFloat(newProductData.price),
        currency: newProductData.currency,
        image: newProductData.image
      });

      const newProduct = {
        id: res.data.id,
        title: res.data.name,
        price: (res.data.default_price?.unit_amount ? res.data.default_price.unit_amount / 100 : parseFloat(newProductData.price)),
        currency: res.data.default_price?.currency || newProductData.currency,
        image: res.data.images?.[0] || null,
        stripeProductId: res.data.id
      };

      // Add to local list
      setStripeProducts([...stripeProducts, {
        id: newProduct.id,
        title: newProduct.title,
        price: newProduct.price,
        currency: newProduct.currency,
        image: newProduct.image,
        status: 'active'
      }]);

      // Add to block
      const blockProduct = {
        id: makeId(),
        title: newProduct.title,
        price: new Intl.NumberFormat('en-US', { style: 'currency', currency: newProduct.currency }).format(newProduct.price),
        image: newProduct.image || "/base-img/card_base_image.png",
        url: "#",
        stripeProductId: newProduct.id
      };
      handleFieldChange("products", [...(block.products || []), blockProduct] as any);

      setIsCreateProductModalOpen(false);
      setIsProductSelectOpen(false);
      setNewProductData({ title: "", price: "", currency: "usd", image: "" });
    } catch (error) {
      console.error("Failed to create product", error);
      alert("Failed to create product. Please try again.");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  useEffect(() => {
    if (block.type === 'product' && isExpanded && bio?.id && stripeProducts.length === 0) {
      const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
          const res = await api.get(`/stripe/products?bioId=${bio.id}`);
          setStripeProducts(res.data);
        } catch (error) {
          console.error("Failed to fetch products", error);
        } finally {
          setIsLoadingProducts(false);
        }
      };
      fetchProducts();
    }
  }, [block.type, isExpanded, bio?.id]);

  const handleFieldChange = (key: keyof BioBlock, value: any) => {
    onChange(block.id, key, value);
  };

  const isMarketingLocked = block.type === 'marketing' && !!isLocked;
  const blockTypeLabel = getBlockTypeLabel(block.type, t);

  const whatsappNumber = (block.whatsappNumber || "").replace(/\D/g, "");
  const whatsappMessage = block.whatsappMessage || t("dashboard.editor.blockItem.whatsapp.defaultMessage");
  const whatsappLabel = block.title || t("dashboard.editor.blockItem.whatsapp.defaultLabel");
  const whatsappStyle = block.whatsappStyle || "solid";
  const whatsappShape = block.whatsappShape || "pill";
  const whatsappAccent = block.accent || "#25D366";
  const whatsappText = block.textColor || "#ffffff";
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}${whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ""}`
    : "#";

  const whatsappPreviewStyle = (() => {
    const base: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      width: "100%",
      minHeight: "48px",
      padding: "12px 18px",
      fontWeight: 700,
      fontSize: "14px",
      textDecoration: "none",
      transition: "all 240ms ease",
    };

    if (whatsappShape === "pill") base.borderRadius = "999px";
    else if (whatsappShape === "square") base.borderRadius = "10px";
    else base.borderRadius = "16px";

    if (whatsappStyle === "outline") {
      return {
        ...base,
        background: "transparent",
        border: `2px solid ${whatsappAccent}`,
        color: whatsappAccent,
      };
    }

    if (whatsappStyle === "glass") {
      return {
        ...base,
        background: "rgba(255,255,255,0.2)",
        color: whatsappText,
        border: "1px solid rgba(255,255,255,0.35)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      };
    }

    if (whatsappStyle === "gradient") {
      return {
        ...base,
        background: `linear-gradient(135deg, ${whatsappAccent} 0%, #128C7E 100%)`,
        color: whatsappText,
        boxShadow: "0 12px 25px rgba(18, 140, 126, 0.35)",
      };
    }

    if (whatsappStyle === "neon") {
      return {
        ...base,
        background: "rgba(0,0,0,0.05)",
        color: whatsappAccent,
        border: `1px solid ${whatsappAccent}`,
        boxShadow: `0 0 14px ${whatsappAccent}55, inset 0 0 12px ${whatsappAccent}33`,
      };
    }

    if (whatsappStyle === "minimal") {
      return {
        ...base,
        background: "transparent",
        color: whatsappAccent,
        borderBottom: `2px solid ${whatsappAccent}55`,
        borderRadius: "0",
        paddingLeft: "0",
        paddingRight: "0",
      };
    }

    if (whatsappStyle === "dark") {
      return {
        ...base,
        background: "#0f172a",
        color: "#ffffff",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.35)",
      };
    }

    if (whatsappStyle === "soft") {
      return {
        ...base,
        background: whatsappAccent,
        color: whatsappText,
        boxShadow: "0 12px 25px rgba(37, 211, 102, 0.35)",
      };
    }

    return {
      ...base,
      background: whatsappAccent,
      color: whatsappText,
      boxShadow: "0 8px 20px rgba(37, 211, 102, 0.25)",
    };
  })();


  return (
    <div className="group" data-tour="editor-block-item">
      <div
        className={`rounded-xl mb-2 overflow-hidden transition-all duration-300 ${isDragging
          ? "border-2 border-dashed border-primary/40 bg-primary/5 opacity-100"
          : "border-2 border-transparent hover:border-primary/40 bg-transparent"
          }`}
        draggable={!isMarketingLocked}
        onDragStart={(e) => {
          if (isMarketingLocked) {
            e.preventDefault();
            return;
          }
          onDragStart(e, block.id);
        }}
        onDragEnd={onDragEnd}
        onDrop={(e) => onDrop(e, index)}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => onDragEnter(e, block.id)}
      >
        {isDragging ? (
          <div className="h-16 flex items-center justify-center">
            <span className="text-sm font-medium text-primary/60">{t("dashboard.editor.blockItem.general.dropHere")}</span>
          </div>
        ) : (
          <div
            className="flex items-center justify-between gap-3 p-4 cursor-pointer bg-transparent hover:bg-white/40 transition-colors"
            onClick={() => onToggleExpand(block.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleExpand(block.id);
              }
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-1 shrink-0 ${isMarketingLocked ? 'text-gray-200 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500'}`}>
                <div
                  onTouchStart={(e) => {
                    if (isMarketingLocked) return;
                    e.stopPropagation();
                    props.onTouchDragStart?.(e);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ touchAction: "none" }}
                >
                  <DragHandleIcon />
                </div>
              </div>
              <div className={`p-2.5 rounded-xl ${getBlockTypeAccent(block.type).bg} ${getBlockTypeAccent(block.type).text} shrink-0`}>
                {/* Icon based on type */}
                {block.type === 'heading' && <HeadingIcon />}
                {block.type === 'text' && <TextIcon />}
                {block.type === 'button' && <ButtonIcon />}
                {block.type === 'image' && <ImageIcon />}
                {block.type === 'socials' && <SocialsIcon />}
                {block.type === 'video' && <VideoIcon />}
                {block.type === 'divider' && <DividerIcon />}
                {block.type === 'qrcode' && <QrCodeIcon />}
                {block.type === 'form' && <FormIcon />}
                {block.type === 'marketing' && <TrendingUpIcon />}
                {block.type === 'whatsapp' && <WhatsAppIcon />}
                {/* Add other icons as needed, defaulting to a generic one if missing */}
                {!['heading', 'text', 'button', 'image', 'socials', 'video', 'divider', 'qrcode', 'form', 'marketing', 'whatsapp'].includes(block.type) && (
                  <DefaultIcon />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{block.title || blockTypeLabel}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${getBlockTypeAccent(block.type).bg} ${getBlockTypeAccent(block.type).text}`}>
                    {blockTypeLabel}
                  </span>
                  {(() => {
                    try {
                      const preview = getBlockPreview(block, t);
                      return preview ? (
                        <span className="text-xs text-gray-400 truncate">{preview}</span>
                      ) : null;
                    } catch {
                      return null;
                    }
                  })()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMarketingLocked) return;
                  onRemove(block.id);
                }}
                type="button"
                title={isMarketingLocked ? t("dashboard.editor.blockItem.general.campaignInProgress") : t("dashboard.editor.blockItem.general.removeBlock")}
                disabled={isMarketingLocked}
              >
                <TrashIcon />
              </button>
              <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDownIcon />
              </div>
            </div>
          </div>
        )}

        {isExpanded && !isDragging && (
          <div className="p-4 pt-0 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {block.type === "heading" && (
              <div className="space-y-4 pt-4">
                <FormInput
                  label="Title"
                  value={block.title || ""}
                  onChange={(value) => handleFieldChange("title", value)}
                  placeholder="Title"
                />
                <FormTextarea
                  label="Subtitle"
                  value={block.body || ""}
                  onChange={(value) => handleFieldChange("body", value)}
                  placeholder="Subtitle"
                  rows={2}
                />
                <ColorPicker
                  label="Text Color"
                  value={block.textColor || "#000000"}
                  onChange={(value) => handleFieldChange("textColor", value)}
                />
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Animation</label>
                  <div className="flex gap-2">
                    <FormSelect
                      label=""
                      value={block.animation || "none"}
                      onChange={(value) => handleFieldChange("animation", value)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "bounce", label: "Bounce" },
                        { value: "pulse", label: "Pulse" },
                        { value: "shake", label: "Shake" },
                        { value: "wobble", label: "Wobble" }
                      ]}
                      className="flex-1"
                    />
                    {block.animation && block.animation !== "none" && (
                      <FormSelect
                        label=""
                        value={block.animationTrigger || "loop"}
                        onChange={(value) => handleFieldChange("animationTrigger", value)}
                        options={[
                          { value: "loop", label: "Loop" },
                          { value: "once", label: "Once" },
                          { value: "hover", label: "Hover" }
                        ]}
                        className="w-32"
                      />
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Typography
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Alignment</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() => handleFieldChange("align", align)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${(block.align || 'left') === align
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                          title={align.charAt(0).toUpperCase() + align.slice(1)}
                        >
                          {align === 'justify' ? (
                            <div className="flex flex-col gap-[2px] items-center justify-center w-full h-full">
                              <div className="w-3 h-[1px] bg-current"></div>
                              <div className="w-3 h-[1px] bg-current"></div>
                              <div className="w-3 h-[1px] bg-current"></div>
                              <div className="w-3 h-[1px] bg-current"></div>
                            </div>
                          ) : (
                            align.charAt(0).toUpperCase() + align.slice(1)
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormSelect
                      label="Font Size"
                      value={block.fontSize || "32px"}
                      onChange={(value) => handleFieldChange("fontSize", value)}
                      options={[
                        { value: "24px", label: "Small" },
                        { value: "32px", label: "Normal" },
                        { value: "40px", label: "Medium" },
                        { value: "48px", label: "Large" },
                        { value: "64px", label: "XL" }
                      ]}
                    />
                    <FormSelect
                      label="Font Weight"
                      value={block.fontWeight || "800"}
                      onChange={(value) => handleFieldChange("fontWeight", value)}
                      options={[
                        { value: "400", label: "Normal" },
                        { value: "500", label: "Medium" },
                        { value: "600", label: "Semibold" },
                        { value: "700", label: "Bold" },
                        { value: "800", label: "Extra Bold" },
                        { value: "900", label: "Black" }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {block.type === "text" && (
              <div className="pt-4 space-y-4">
                <FormTextarea
                  label={t("dashboard.editor.blockItem.text.content")}
                  value={block.body || ""}
                  onChange={(value) => handleFieldChange("body", value)}
                  placeholder={t("dashboard.editor.blockItem.text.placeholder")}
                  rows={3}
                />
                <ColorPicker
                  label={t("dashboard.editor.blockItem.common.textColor")}
                  value={block.textColor || "#4b5563"}
                  onChange={(value) => handleFieldChange("textColor", value)}
                />
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.common.animation")}</label>
                  <div className="flex gap-2">
                    <FormSelect
                      label=""
                      value={block.animation || "none"}
                      onChange={(value) => handleFieldChange("animation", value)}
                      options={[
                        { value: "none", label: t("dashboard.editor.blockItem.animation.none") },
                        { value: "bounce", label: t("dashboard.editor.blockItem.animation.bounce") },
                        { value: "pulse", label: t("dashboard.editor.blockItem.animation.pulse") },
                        { value: "shake", label: t("dashboard.editor.blockItem.animation.shake") },
                        { value: "wobble", label: t("dashboard.editor.blockItem.animation.wobble") }
                      ]}
                      className="flex-1"
                    />
                    {block.animation && block.animation !== "none" && (
                      <FormSelect
                        label=""
                        value={block.animationTrigger || "loop"}
                        onChange={(value) => handleFieldChange("animationTrigger", value)}
                        options={[
                          { value: "loop", label: t("dashboard.editor.blockItem.animation.loop") },
                          { value: "once", label: t("dashboard.editor.blockItem.animation.once") },
                          { value: "hover", label: t("dashboard.editor.blockItem.animation.hover") }
                        ]}
                        className="w-32"
                      />
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    {t("dashboard.editor.blockItem.typography.title")}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.common.alignment")}</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() => handleFieldChange("align", align)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${(block.align || 'left') === align
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                          title={t(`dashboard.editor.blockItem.align.${align}`)}
                        >
                          {align === 'justify' ? (
                            <div className="flex flex-col gap-[2px] items-center justify-center w-full h-full">
                              <div className="w-3 h-[1px] bg-current"></div>
                              <div className="w-3 h-[1px] bg-current"></div>
                              <div className="w-3 h-[1px] bg-current"></div>
                              <div className="w-3 h-[1px] bg-current"></div>
                            </div>
                          ) : (
                            t(`dashboard.editor.blockItem.align.${align}`)
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormSelect
                      label={t("dashboard.editor.blockItem.typography.fontSize")}
                      value={block.fontSize || "16px"}
                      onChange={(value) => handleFieldChange("fontSize", value)}
                      options={[
                        { value: "12px", label: t("dashboard.editor.blockItem.size.small") },
                        { value: "14px", label: t("dashboard.editor.blockItem.size.normal") },
                        { value: "16px", label: t("dashboard.editor.blockItem.size.medium") },
                        { value: "18px", label: t("dashboard.editor.blockItem.size.large") },
                        { value: "24px", label: t("dashboard.editor.blockItem.size.xl") }
                      ]}
                    />
                    <FormSelect
                      label={t("dashboard.editor.blockItem.typography.fontWeight")}
                      value={block.fontWeight || "500"}
                      onChange={(value) => handleFieldChange("fontWeight", value)}
                      options={[
                        { value: "300", label: t("dashboard.editor.blockItem.weight.light") },
                        { value: "400", label: t("dashboard.editor.blockItem.weight.normal") },
                        { value: "500", label: t("dashboard.editor.blockItem.weight.medium") },
                        { value: "600", label: t("dashboard.editor.blockItem.weight.semibold") },
                        { value: "700", label: t("dashboard.editor.blockItem.weight.bold") },
                        { value: "900", label: t("dashboard.editor.blockItem.weight.black") }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {block.type === "button_grid" && (
              <div className="space-y-4 pt-3">
                <div className="space-y-3">
                  {(block.gridItems || []).map((item, i) => (
                    <div key={item.id} className="bg-gray-50 p-3 rounded-xl border border-gray-200 relative group">
                      <button
                        onClick={() => {
                          const newItems = [...(block.gridItems || [])];
                          newItems.splice(i, 1);
                          handleFieldChange("gridItems", newItems);
                        }}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashIcon width={14} height={14} />
                      </button>

                      <div className="grid gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.label")}</label>
                          <input
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...(block.gridItems || [])];
                              newItems[i] = { ...item, title: e.target.value };
                              handleFieldChange("gridItems", newItems);
                            }}
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder={t("dashboard.editor.blockItem.buttonGrid.labelPlaceholder")}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.url")}</label>
                          <input
                            value={item.url}
                            onChange={(e) => {
                              const newItems = [...(block.gridItems || [])];
                              newItems[i] = { ...item, url: e.target.value };
                              handleFieldChange("gridItems", newItems);
                            }}
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="https://"
                          />
                        </div>
                        <div>
                          <ImageUpload
                            label={t("dashboard.editor.blockItem.common.backgroundImage")}
                            value={item.image || ""}
                            onChange={(url) => {
                              const newItems = [...(block.gridItems || [])];
                              newItems[i] = { ...item, image: url };
                              handleFieldChange("gridItems", newItems);
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.icon")}</label>
                          <select
                            value={item.icon}
                            onChange={(e) => {
                              const newItems = [...(block.gridItems || [])];
                              newItems[i] = { ...item, icon: e.target.value };
                              handleFieldChange("gridItems", newItems);
                            }}
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          >
                            <option value="">{t("dashboard.editor.blockItem.common.selectIcon")}</option>
                            <option value="https://cdn.simpleicons.org/instagram/E4405F">Instagram</option>
                            <option value="https://cdn.simpleicons.org/vsco/000000">VSCO</option>
                            <option value="https://cdn.simpleicons.org/snapchat/FFFC00">Snapchat</option>
                            <option value="https://cdn.simpleicons.org/tiktok/000000">TikTok</option>
                            <option value="https://cdn.simpleicons.org/x/000000">X (Twitter)</option>
                            <option value="https://cdn.simpleicons.org/linktree/43E660">Link</option>
                            <option value="https://cdn.simpleicons.org/amazon/FF9900">Amazon</option>
                            <option value="https://cdn.simpleicons.org/spotify/1DB954">Spotify</option>
                            <option value="https://cdn.simpleicons.org/youtube/FF0000">YouTube</option>
                            <option value="https://cdn.simpleicons.org/pinterest/BD081C">Pinterest</option>
                            <option value="https://cdn.simpleicons.org/netflix/E50914">Netflix</option>
                            <option value="https://cdn.simpleicons.org/twitch/9146FF">Twitch</option>
                            <option value="https://cdn.simpleicons.org/discord/5865F2">Discord</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const newItems = [...(block.gridItems || [])];
                    newItems.push({
                      id: makeId(),
                      title: t("dashboard.editor.blockItem.buttonGrid.newLink"),
                      url: "https://",
                      image: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop",
                      icon: ""
                    });
                    handleFieldChange("gridItems", newItems);
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  <PlusIcon width={16} height={16} />
                  {t("dashboard.editor.blockItem.buttonGrid.addButton")}
                </button>
              </div>
            )}

            {block.type === "button" && (
              <div className="space-y-4 pt-4">
                {/* Basic Info Section */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    {t("dashboard.editor.blockItem.sections.content")}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.common.label")}</label>
                      <input
                        value={block.title || ""}
                        onChange={(event) => handleFieldChange("title", event.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder={t("dashboard.editor.blockItem.button.labelPlaceholder")}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.common.url")}</label>
                      <input
                        value={block.href || ""}
                        onChange={(event) => handleFieldChange("href", event.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white font-mono"
                        placeholder="https://"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                        {block.buttonStyle as any === 'image-grid' ? t("dashboard.editor.blockItem.common.icon") : t("dashboard.editor.blockItem.button.imageOptional")}
                      </label>
                      {block.buttonStyle as any === 'image-grid' ? (
                        <select
                          value={block.buttonImage || ""}
                          onChange={(event) => handleFieldChange("buttonImage", event.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
                        >
                          <option value="">{t("dashboard.editor.blockItem.common.selectIcon")}</option>
                          <option value="https://cdn.simpleicons.org/instagram/E4405F">Instagram</option>
                          <option value="https://cdn.simpleicons.org/vsco/000000">VSCO</option>
                          <option value="https://cdn.simpleicons.org/snapchat/FFFC00">Snapchat</option>
                          <option value="https://cdn.simpleicons.org/tiktok/000000">TikTok</option>
                          <option value="https://cdn.simpleicons.org/x/000000">X (Twitter)</option>
                          <option value="https://cdn.simpleicons.org/linktree/43E660">Link</option>
                          <option value="https://cdn.simpleicons.org/amazon/FF9900">Amazon</option>
                          <option value="https://cdn.simpleicons.org/spotify/1DB954">Spotify</option>
                          <option value="https://cdn.simpleicons.org/youtube/FF0000">YouTube</option>
                          <option value="https://cdn.simpleicons.org/pinterest/BD081C">Pinterest</option>
                        </select>
                      ) : (
                        <ImageUpload
                          value={block.buttonImage || ""}
                          onChange={(url) => handleFieldChange("buttonImage", url)}
                        />
                      )}

                    </div>
                    {block.buttonStyle as any === 'image-grid' && (
                      <div>
                        <ImageUpload
                          label={t("dashboard.editor.blockItem.common.backgroundImage")}
                          value={block.mediaUrl || ""}
                          onChange={(url) => handleFieldChange("mediaUrl", url)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Style Section */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    {t("dashboard.editor.blockItem.sections.design")}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.common.textAlignment")}</label>
                      <div className="flex bg-gray-100 p-1 rounded-xl">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            key={align}
                            onClick={() => handleFieldChange("buttonTextAlign", align)}
                            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${(block.buttonTextAlign || 'center') === align
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                              }`}
                          >
                            {t(`dashboard.editor.blockItem.align.${align}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.common.style")}</label>
                        <select
                          value={block.buttonStyle || "solid"}
                          onChange={(event) => handleFieldChange("buttonStyle", event.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
                        >
                          <option value="solid">{t("dashboard.editor.blockItem.buttonStyles.solid")}</option>
                          <option value="outline">{t("dashboard.editor.blockItem.buttonStyles.outline")}</option>
                          <option value="ghost">{t("dashboard.editor.blockItem.buttonStyles.ghost")}</option>
                          <option value="hard-shadow">{t("dashboard.editor.blockItem.buttonStyles.retro")}</option>
                          <option value="soft-shadow">{t("dashboard.editor.blockItem.buttonStyles.softShadow")}</option>
                          <option value="3d">{t("dashboard.editor.blockItem.buttonStyles.threeD")}</option>
                          <option value="glass">{t("dashboard.editor.blockItem.buttonStyles.glass")}</option>
                          <option value="gradient">{t("dashboard.editor.blockItem.buttonStyles.gradient")}</option>
                          <option value="neon">{t("dashboard.editor.blockItem.buttonStyles.neon")}</option>
                          <option value="architect">{t("dashboard.editor.blockItem.buttonStyles.architect")}</option>
                          <option value="material">{t("dashboard.editor.blockItem.buttonStyles.material")}</option>
                          <option value="brutalist">{t("dashboard.editor.blockItem.buttonStyles.brutalist")}</option>
                          <option value="outline-thick">{t("dashboard.editor.blockItem.buttonStyles.outlineThick")}</option>
                          <option value="image-grid">{t("dashboard.editor.blockItem.buttonStyles.imageCard")}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.common.shape")}</label>
                        <select
                          value={block.buttonShape || "rounded"}
                          onChange={(event) => handleFieldChange("buttonShape", event.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
                        >
                          <option value="pill">{t("dashboard.editor.blockItem.shapes.pill")}</option>
                          <option value="rounded">{t("dashboard.editor.blockItem.shapes.rounded")}</option>
                          <option value="square">{t("dashboard.editor.blockItem.shapes.square")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 block">{t("dashboard.editor.blockItem.sections.colors")}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <ColorPicker
                      label={t("dashboard.editor.blockItem.common.background")}
                      value={block.accent || "#111827"}
                      onChange={(val) => handleFieldChange("accent", val)}
                    />
                    <ColorPicker
                      label={t("dashboard.editor.blockItem.common.text")}
                      value={block.textColor || "#ffffff"}
                      onChange={(val) => handleFieldChange("textColor", val)}
                    />
                  </div>
                  {["hard-shadow", "soft-shadow", "3d", "gradient", "cyberpunk", "gradient-border", "neon", "pixel", "sketch", "neumorphism", "clay", "architect", "material", "brutalist", "outline-thick"].includes(block.buttonStyle || "") && (
                    <div className="pt-2">
                      <ColorPicker
                        label={t("dashboard.editor.blockItem.button.secondaryShadow")}
                        value={block.buttonShadowColor || block.accent || "#111827"}
                        onChange={(val) => handleFieldChange("buttonShadowColor", val)}
                      />
                    </div>
                  )}
                </div>

                {/* Options Section */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    {t("dashboard.editor.blockItem.sections.options")}
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={block.isNsfw || false}
                        onChange={(event) => handleFieldChange("isNsfw", event.target.checked as any)}
                        className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">{t("dashboard.editor.blockItem.button.sensitiveContent")}</span>
                        <p className="text-xs text-gray-400">{t("dashboard.editor.blockItem.button.mark18")}</p>
                      </div>
                    </label>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.common.animation")}</label>
                      <div className="flex gap-2">
                        <select
                          value={block.animation || "none"}
                          onChange={(event) => handleFieldChange("animation", event.target.value)}
                          className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        >
                          <option value="none">{t("dashboard.editor.blockItem.animation.none")}</option>
                          <option value="bounce">{t("dashboard.editor.blockItem.animation.bounce")}</option>
                          <option value="pulse">{t("dashboard.editor.blockItem.animation.pulse")}</option>
                          <option value="shake">{t("dashboard.editor.blockItem.animation.shake")}</option>
                          <option value="wobble">{t("dashboard.editor.blockItem.animation.wobble")}</option>
                        </select>
                        {block.animation && block.animation !== "none" && (
                          <select
                            value={block.animationTrigger || "loop"}
                            onChange={(event) => handleFieldChange("animationTrigger", event.target.value)}
                            className="w-28 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                          >
                            <option value="loop">{t("dashboard.editor.blockItem.animation.loop")}</option>
                            <option value="once">{t("dashboard.editor.blockItem.animation.once")}</option>
                            <option value="hover">{t("dashboard.editor.blockItem.animation.hover")}</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {block.type === "whatsapp" && (
              <div className="space-y-4 pt-4">
                <p className="text-xs text-gray-500">{t("dashboard.editor.blockItem.whatsapp.helper")}</p>

                <div className="space-y-3">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    {t("dashboard.editor.blockItem.sections.content")}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.whatsapp.label")}</label>
                      <input
                        value={block.title || ""}
                        onChange={(event) => handleFieldChange("title", event.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder={t("dashboard.editor.blockItem.whatsapp.labelPlaceholder")}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.whatsapp.number")}</label>
                      <input
                        value={block.whatsappNumber || ""}
                        onChange={(event) => handleFieldChange("whatsappNumber", event.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white font-mono"
                        placeholder={t("dashboard.editor.blockItem.whatsapp.numberPlaceholder")}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.whatsapp.message")}</label>
                      <textarea
                        value={block.whatsappMessage || ""}
                        onChange={(event) => handleFieldChange("whatsappMessage", event.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder={t("dashboard.editor.blockItem.whatsapp.messagePlaceholder")}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    {t("dashboard.editor.blockItem.sections.design")}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.whatsapp.style")}</label>
                      <select
                        value={block.whatsappStyle || "solid"}
                        onChange={(event) => handleFieldChange("whatsappStyle", event.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white"
                      >
                        <option value="solid">{t("dashboard.editor.blockItem.whatsapp.styles.solid")}</option>
                        <option value="outline">{t("dashboard.editor.blockItem.whatsapp.styles.outline")}</option>
                        <option value="gradient">{t("dashboard.editor.blockItem.whatsapp.styles.gradient")}</option>
                        <option value="glass">{t("dashboard.editor.blockItem.whatsapp.styles.glass")}</option>
                        <option value="neon">{t("dashboard.editor.blockItem.whatsapp.styles.neon")}</option>
                        <option value="minimal">{t("dashboard.editor.blockItem.whatsapp.styles.minimal")}</option>
                        <option value="soft">{t("dashboard.editor.blockItem.whatsapp.styles.soft")}</option>
                        <option value="dark">{t("dashboard.editor.blockItem.whatsapp.styles.dark")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t("dashboard.editor.blockItem.common.shape")}</label>
                      <select
                        value={block.whatsappShape || "pill"}
                        onChange={(event) => handleFieldChange("whatsappShape", event.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white"
                      >
                        <option value="pill">{t("dashboard.editor.blockItem.shapes.pill")}</option>
                        <option value="rounded">{t("dashboard.editor.blockItem.shapes.rounded")}</option>
                        <option value="square">{t("dashboard.editor.blockItem.shapes.square")}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 block">{t("dashboard.editor.blockItem.sections.colors")}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <ColorPicker
                      label={t("dashboard.editor.blockItem.common.background")}
                      value={block.accent || "#25D366"}
                      onChange={(val) => handleFieldChange("accent", val)}
                    />
                    <ColorPicker
                      label={t("dashboard.editor.blockItem.common.text")}
                      value={block.textColor || "#ffffff"}
                      onChange={(val) => handleFieldChange("textColor", val)}
                    />
                  </div>
                </div>

              </div>
            )}

            {block.type === "socials" && (
              <div className="space-y-3 pt-3">
                <p className="text-xs text-gray-500">{t("dashboard.editor.blockItem.socials.helper")}</p>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.layout")}</label>
                    <select
                      value={block.socialsLayout || "row"}
                      onChange={(event) => handleFieldChange("socialsLayout", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="row">{t("dashboard.editor.blockItem.socials.inlineRow")}</option>
                      <option value="column">{t("dashboard.editor.blockItem.socials.listColumn")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.style")}</label>
                    <div className="flex items-center h-[38px]">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={block.socialsLabel || false}
                          onChange={(event) => handleFieldChange("socialsLabel", event.target.checked as any)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        {t("dashboard.editor.blockItem.socials.showText")}
                      </label>
                    </div>
                  </div>
                </div>

                {['instagram', 'twitter', 'linkedin', 'youtube', 'github'].map((platform) => (
                  <div key={platform}>
                    <label className="text-xs font-medium text-gray-700 mb-1 block capitalize">{platform}</label>
                    <input
                      value={block.socials?.[platform as keyof typeof block.socials] || ""}
                      onChange={(event) => {
                        const newSocials = { ...block.socials, [platform]: event.target.value };
                        handleFieldChange("socials", newSocials as any);
                      }}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder={`https://${platform}.com/...`}
                    />
                  </div>
                ))}
              </div>
            )}

            {block.type === 'form' && (
              <div className="space-y-4 pt-3">
                <FormBlockConfig block={block} onChange={handleFieldChange} bioId={bio?.id} />
              </div>
            )}

            {block.type === "calendar" && (
              <div className="pt-3 space-y-3">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                    <CalendarIcon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">{t("dashboard.editor.blockItem.calendar.bookingSettings")}</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      {t("dashboard.editor.blockItem.calendar.bookingHint")}
                      <a href="/dashboard/scheduler" target="_blank" className="underline font-bold ml-1 hover:text-blue-900">{t("dashboard.editor.blockItem.calendar.scheduler")}</a>
                      {t("dashboard.editor.blockItem.calendar.tabSuffix")}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.title")}</label>
                  <input
                    value={block.title || ""}
                    onChange={(event) => handleFieldChange("title", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.calendar.titlePlaceholder")}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.description")}</label>
                  <input
                    value={block.body || ""}
                    onChange={(event) => handleFieldChange("body", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.calendar.descriptionPlaceholder")}
                  />
                </div>
              </div>
            )}

            {block.type === "video" && (
              <div className="pt-3">
                <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.video.youtubeUrl")}</label>
                <input
                  value={block.mediaUrl || ""}
                  onChange={(event) => handleFieldChange("mediaUrl", event.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder={t("dashboard.editor.blockItem.video.youtubePlaceholder")}
                />
              </div>
            )}

            {block.type === "image" && (
              <div className="pt-3 space-y-4">
                {/* Image Upload */}
                <ImageUpload
                  label={t("dashboard.editor.blockItem.common.image")}
                  value={block.mediaUrl || ""}
                  onChange={(url) => handleFieldChange("mediaUrl", url)}
                />

                {/* Visual Effects Section */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Visual Effects
                  </div>

                  {/* Scale */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-600">Scale</label>
                      <span className="text-xs text-gray-500 font-mono">{block.imageScale || 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={block.imageScale || 100}
                      onChange={(e) => handleFieldChange("imageScale", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Rotation */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-600">Rotation</label>
                      <span className="text-xs text-gray-500 font-mono">{block.imageRotation || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={block.imageRotation || 0}
                      onChange={(e) => handleFieldChange("imageRotation", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Border Radius */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-600">Border Radius</label>
                      <span className="text-xs text-gray-500 font-mono">{block.imageBorderRadius || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={block.imageBorderRadius || 0}
                      onChange={(e) => handleFieldChange("imageBorderRadius", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Shadow */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Shadow</label>
                    <select
                      value={block.imageShadow || "none"}
                      onChange={(e) => handleFieldChange("imageShadow", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white"
                    >
                      <option value="none">None</option>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                      <option value="2xl">2X Large</option>
                    </select>
                  </div>

                  {/* Border */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-gray-600">Border Width</label>
                        <span className="text-xs text-gray-500 font-mono">{block.imageBorderWidth || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={block.imageBorderWidth || 0}
                        onChange={(e) => handleFieldChange("imageBorderWidth", parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                    <ColorPicker
                      label="Border Color"
                      value={block.imageBorderColor || "#000000"}
                      onChange={(val) => handleFieldChange("imageBorderColor", val)}
                    />
                  </div>
                </div>

                {/* Color Filters Section */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Color Filters
                  </div>

                  {/* Brightness */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-600">Brightness</label>
                      <span className="text-xs text-gray-500 font-mono">{block.imageBrightness || 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={block.imageBrightness || 100}
                      onChange={(e) => handleFieldChange("imageBrightness", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-600">Contrast</label>
                      <span className="text-xs text-gray-500 font-mono">{block.imageContrast || 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={block.imageContrast || 100}
                      onChange={(e) => handleFieldChange("imageContrast", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-600">Saturation</label>
                      <span className="text-xs text-gray-500 font-mono">{block.imageSaturation || 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={block.imageSaturation || 100}
                      onChange={(e) => handleFieldChange("imageSaturation", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>

                  {/* Blur */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-600">Blur</label>
                      <span className="text-xs text-gray-500 font-mono">{block.imageBlur || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={block.imageBlur || 0}
                      onChange={(e) => handleFieldChange("imageBlur", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Filter Toggles */}
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors flex-1">
                      <input
                        type="checkbox"
                        checked={block.imageGrayscale || false}
                        onChange={(e) => handleFieldChange("imageGrayscale", e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-gray-800 focus:ring-gray-500"
                      />
                      <span className="text-xs font-medium text-gray-700">Grayscale</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors flex-1">
                      <input
                        type="checkbox"
                        checked={block.imageSepia || false}
                        onChange={(e) => handleFieldChange("imageSepia", e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs font-medium text-gray-700">Sepia</span>
                    </label>
                  </div>
                </div>

                {/* Animation Section */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Animation
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Hover Effect</label>
                    <select
                      value={block.imageHoverEffect || "none"}
                      onChange={(e) => handleFieldChange("imageHoverEffect", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white"
                    >
                      <option value="none">None</option>
                      <option value="zoom">Zoom In</option>
                      <option value="lift">Lift Up</option>
                      <option value="glow">Glow</option>
                      <option value="tilt">3D Tilt</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Entrance Animation</label>
                    <select
                      value={block.entranceAnimation || "none"}
                      onChange={(e) => handleFieldChange("entranceAnimation", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white"
                    >
                      <option value="none">None</option>
                      <option value="fadeIn">Fade In</option>
                      <option value="slideUp">Slide Up</option>
                      <option value="slideDown">Slide Down</option>
                      <option value="slideLeft">Slide Left</option>
                      <option value="slideRight">Slide Right</option>
                      <option value="zoomIn">Zoom In</option>
                      <option value="bounceIn">Bounce In</option>
                      <option value="flipIn">Flip In</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {block.type === "blog" && (
              <div className="pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.background")}
                    value={block.blogBackgroundColor || "#ffffff"}
                    onChange={(val) => handleFieldChange("blogBackgroundColor", val)}
                  />
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.textColor")}
                    value={block.blogTextColor || "#1f2937"}
                    onChange={(val) => handleFieldChange("blogTextColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "product" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.layout")}</label>
                  <select
                    value={block.productLayout || "grid"}
                    onChange={(event) => handleFieldChange("productLayout", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="grid">{t("dashboard.editor.blockItem.product.layoutGrid")}</option>
                    <option value="list">{t("dashboard.editor.blockItem.product.layoutList")}</option>
                    <option value="carousel">{t("dashboard.editor.blockItem.product.layoutCarousel")}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.product.cardStyle")}</label>
                  <select
                    value={block.productCardStyle || "default"}
                    onChange={(event) => handleFieldChange("productCardStyle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="default">{t("dashboard.editor.blockItem.product.cardDefault")}</option>
                    <option value="minimal">{t("dashboard.editor.blockItem.product.cardMinimal")}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.background")}
                    value={block.productBackgroundColor || "#ffffff"}
                    onChange={(val) => handleFieldChange("productBackgroundColor", val)}
                  />
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.textColor")}
                    value={block.productTextColor || "#1f2937"}
                    onChange={(val) => handleFieldChange("productTextColor", val)}
                  />
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.product.accentColor")}
                    value={block.productAccentColor || "#000000"}
                    onChange={(val) => handleFieldChange("productAccentColor", val)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.buttonText")}</label>
                  <input
                    type="text"
                    value={block.productButtonText || "View Product"}
                    onChange={(e) => handleFieldChange("productButtonText", e.target.value)}
                    className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                    placeholder={t("dashboard.editor.blockItem.product.buttonPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 block">{t("dashboard.editor.blockItem.product.products")}</label>
                  {(block.products || []).map((product, index) => (
                    <div key={product.id} className="p-3 border border-gray-200 rounded-xl bg-white relative group flex items-center gap-3 hover:border-gray-300 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                        {product.image && product.image !== "https://placehold.co/300x300" ? (
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{product.title}</h4>
                        <p className="text-xs text-gray-500">{product.price}</p>
                      </div>

                      <button
                        onClick={() => {
                          const newProducts = [...(block.products || [])];
                          newProducts.splice(index, 1);
                          handleFieldChange("products", newProducts as any);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title={t("dashboard.editor.blockItem.product.removeProduct")}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-gray-100 mt-4">
                    <label className="text-xs font-medium text-gray-500 mb-2 block">{t("dashboard.editor.blockItem.product.addFromStripe")}</label>
                    {isLoadingProducts ? (
                      <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsProductSelectOpen(!isProductSelectOpen)}
                          className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white hover:border-gray-300 transition-colors text-left"
                        >
                          <span className="text-gray-500">{t("dashboard.editor.blockItem.product.selectToAdd")}</span>
                          <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isProductSelectOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProductSelectOpen && (
                          <div className="mt-2 w-full rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
                            <div className="overflow-y-auto flex-1 max-h-60">
                              {stripeProducts
                                .filter(p => !block.products?.some((bp: any) => bp.stripeProductId === p.id))
                                .length === 0 ? (
                                <div className="p-8 flex flex-col items-center justify-center text-center gap-3 bg-gray-50/80">
                                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm">
                                    <CreditCard className="w-6 h-6" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-900">{t("dashboard.editor.blockItem.product.emptyTitle")}</p>
                                    <p className="text-xs text-gray-500">{t("dashboard.editor.blockItem.product.emptyBody")}</p>
                                  </div>
                                </div>
                              ) : (
                                stripeProducts
                                  .filter(p => !block.products?.some((bp: any) => bp.stripeProductId === p.id))
                                  .map(p => (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => {
                                        const newProduct = {
                                          id: makeId(),
                                          title: p.title,
                                          price: new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency || 'USD' }).format(p.price || 0),
                                          image: p.image || "https://placehold.co/300x300",
                                          url: "#",
                                          stripeProductId: p.id
                                        };
                                        handleFieldChange("products", [...(block.products || []), newProduct] as any);
                                        setIsProductSelectOpen(false);
                                      }}
                                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 group"
                                    >
                                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100 group-hover:border-gray-200 transition-colors">
                                        {p.image ? (
                                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ImageIcon className="w-4 h-4" />
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-gray-900 group-hover:text-black transition-colors">{p.title}</div>
                                        <div className="text-xs text-gray-500">{new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency || 'USD' }).format(p.price || 0)}</div>
                                      </div>
                                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlusIcon className="w-4 h-4 text-gray-400" />
                                      </div>
                                    </button>
                                  ))
                              )
                              }
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsCreateProductModalOpen(true)}
                              className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-white bg-black hover:bg-gray-800 transition-all border-t border-gray-100"
                            >
                              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                <PlusIcon className="w-3 h-3 text-white" />
                              </div>
                              {t("dashboard.editor.blockItem.product.createNew")}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isCreateProductModalOpen && typeof document !== "undefined" && createPortal(
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{t("dashboard.editor.blockItem.product.createTitle")}</h3>
                    <button
                      onClick={() => setIsCreateProductModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("dashboard.editor.blockItem.product.productTitle")}</label>
                      <input
                        required
                        value={newProductData.title}
                        onChange={(e) => setNewProductData({ ...newProductData, title: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder={t("dashboard.editor.blockItem.product.productTitlePlaceholder")}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("dashboard.editor.blockItem.product.price")}</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                            {newProductData.currency === 'usd' ? '$' : newProductData.currency === 'eur' ? '€' : newProductData.currency === 'gbp' ? '£' : newProductData.currency.toUpperCase()}
                          </span>
                          <input
                            required
                            type="number"
                            min="0.50"
                            step="0.01"
                            value={newProductData.price}
                            onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
                            className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("dashboard.editor.blockItem.product.currency")}</label>
                        <select
                          value={newProductData.currency}
                          onChange={(e) => setNewProductData({ ...newProductData, currency: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                          <option value="usd">USD ($)</option>
                          <option value="eur">EUR (€)</option>
                          <option value="gbp">GBP (£)</option>
                          <option value="brl">BRL (R$)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <ImageUpload
                        label={t("dashboard.editor.blockItem.product.imageOptional")}
                        value={newProductData.image}
                        onChange={(url) => setNewProductData({ ...newProductData, image: url })}
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isCreatingProduct}
                        className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isCreatingProduct ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t("dashboard.editor.blockItem.product.creating")}
                          </>
                        ) : (
                          t("dashboard.editor.blockItem.product.createAction")
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}

            {block.type === "calendar" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.title")}</label>
                  <input
                    value={block.calendarTitle || ""}
                    onChange={(event) => handleFieldChange("calendarTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.calendar.titlePlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.background")}
                    value={block.calendarColor || "#ffffff"}
                    onChange={(val) => handleFieldChange("calendarColor", val)}
                  />
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.text")}
                    value={block.calendarTextColor || "#1f2937"}
                    onChange={(val) => handleFieldChange("calendarTextColor", val)}
                  />
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.accent")}
                    value={block.calendarAccentColor || "#2563eb"}
                    onChange={(val) => handleFieldChange("calendarAccentColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "map" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.map.locationName")}</label>
                  <input
                    value={block.mapTitle || ""}
                    onChange={(event) => handleFieldChange("mapTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.map.locationPlaceholder")}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.address")}</label>
                  <input
                    value={block.mapAddress || ""}
                    onChange={(event) => handleFieldChange("mapAddress", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.map.addressPlaceholder")}
                  />
                </div>
              </div>
            )}

            {block.type === "featured" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.featured.productTitle")}</label>
                  <input
                    value={block.featuredTitle || ""}
                    onChange={(event) => handleFieldChange("featuredTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.featured.productTitlePlaceholder")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.product.price")}</label>
                    <input
                      value={block.featuredPrice || ""}
                      onChange={(event) => handleFieldChange("featuredPrice", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="$19.99"
                    />
                  </div>
                  <div>
                    <ImageUpload
                      label={t("dashboard.editor.blockItem.featured.productImage")}
                      value={block.featuredImage || ""}
                      onChange={(url) => handleFieldChange("featuredImage", url)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.featured.productUrl")}</label>
                  <input
                    value={block.featuredUrl || ""}
                    onChange={(event) => handleFieldChange("featuredUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.background")}
                    value={block.featuredColor || "#1f4d36"}
                    onChange={(val) => handleFieldChange("featuredColor", val)}
                  />
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.textColor")}
                    value={block.featuredTextColor || "#ffffff"}
                    onChange={(val) => handleFieldChange("featuredTextColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "affiliate" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.title")}</label>
                  <input
                    value={block.affiliateTitle || ""}
                    onChange={(event) => handleFieldChange("affiliateTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.affiliate.titlePlaceholder")}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.affiliate.couponCode")}</label>
                  <input
                    value={block.affiliateCode || ""}
                    onChange={(event) => handleFieldChange("affiliateCode", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.affiliate.couponPlaceholder")}
                  />
                </div>
                <div>
                  <ImageUpload
                    label={t("dashboard.editor.blockItem.common.image")}
                    value={block.affiliateImage || ""}
                    onChange={(url) => handleFieldChange("affiliateImage", url)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.affiliate.affiliateUrl")}</label>
                  <input
                    value={block.affiliateUrl || ""}
                    onChange={(event) => handleFieldChange("affiliateUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.background")}
                    value={block.affiliateColor || "#ffffff"}
                    onChange={(val) => handleFieldChange("affiliateColor", val)}
                  />
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.textColor")}
                    value={block.affiliateTextColor || "#1f2937"}
                    onChange={(val) => handleFieldChange("affiliateTextColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "event" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.event.eventTitle")}</label>
                  <input
                    value={block.eventTitle || ""}
                    onChange={(event) => handleFieldChange("eventTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.event.eventTitlePlaceholder")}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.event.dateTime")}</label>
                  <input
                    type="datetime-local"
                    value={block.eventDate || ""}
                    onChange={(event) => handleFieldChange("eventDate", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.buttonText")}</label>
                    <input
                      value={block.eventButtonText || ""}
                      onChange={(event) => handleFieldChange("eventButtonText", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder={t("dashboard.editor.blockItem.event.buttonPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.event.buttonUrl")}</label>
                    <input
                      value={block.eventButtonUrl || ""}
                      onChange={(event) => handleFieldChange("eventButtonUrl", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.background")}
                    value={block.eventColor || "#111827"}
                    onChange={(val) => handleFieldChange("eventColor", val)}
                  />
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.textColor")}
                    value={block.eventTextColor || "#ffffff"}
                    onChange={(val) => handleFieldChange("eventTextColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "spotify" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.spotify.url")}</label>
                  <input
                    value={block.spotifyUrl || ""}
                    onChange={(event) => handleFieldChange("spotifyUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.spotify.placeholder")}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">{t("dashboard.editor.blockItem.spotify.helper")}</p>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">{t("dashboard.editor.blockItem.spotify.compactPlayer")}</label>
                  <button
                    onClick={() => handleFieldChange("spotifyCompact", !block.spotifyCompact)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${block.spotifyCompact ? 'bg-blue-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${block.spotifyCompact ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            )}

            {block.type === "instagram" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.instagram.username")}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm">@</span>
                    <input
                      value={block.instagramUsername || ""}
                      onChange={(event) => handleFieldChange("instagramUsername", event.target.value)}
                      className="w-full rounded-lg border border-border pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder={t("dashboard.editor.blockItem.instagram.usernamePlaceholder")}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.displayType")}</label>
                  <select
                    value={block.instagramDisplayType || "grid"}
                    onChange={(event) => handleFieldChange("instagramDisplayType", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="grid">{t("dashboard.editor.blockItem.instagram.displayGrid")}</option>
                    <option value="list">{t("dashboard.editor.blockItem.instagram.displayList")}</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">{t("dashboard.editor.blockItem.instagram.showUsername")}</label>
                  <button
                    onClick={() => handleFieldChange("instagramShowText", block.instagramShowText === false ? true : false)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${block.instagramShowText !== false ? 'bg-blue-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${block.instagramShowText !== false ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>

                {block.instagramShowText !== false && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.textPosition")}</label>
                      <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => handleFieldChange("instagramTextPosition", "top")}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${block.instagramTextPosition === "top" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                          {t("dashboard.editor.blockItem.position.top")}
                        </button>
                        <button
                          onClick={() => handleFieldChange("instagramTextPosition", "bottom")}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${(block.instagramTextPosition || "bottom") === "bottom" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                          {t("dashboard.editor.blockItem.position.bottom")}
                        </button>
                      </div>
                    </div>
                    <div>
                      <ColorPicker
                        label={t("dashboard.editor.blockItem.common.textColor")}
                        value={block.instagramTextColor || "#000000"}
                        onChange={(val) => handleFieldChange("instagramTextColor", val)}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {block.type === "youtube" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.youtube.channelUrl")}</label>
                  <input
                    value={block.youtubeUrl || ""}
                    onChange={(event) => handleFieldChange("youtubeUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.youtube.channelPlaceholder")}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.displayType")}</label>
                  <select
                    value={block.youtubeDisplayType || "grid"}
                    onChange={(event) => handleFieldChange("youtubeDisplayType", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="grid">{t("dashboard.editor.blockItem.youtube.displayGrid")}</option>
                    <option value="list">{t("dashboard.editor.blockItem.youtube.displayList")}</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">{t("dashboard.editor.blockItem.youtube.showChannelName")}</label>
                  <button
                    onClick={() => handleFieldChange("youtubeShowText", block.youtubeShowText === false ? true : false)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${block.youtubeShowText !== false ? 'bg-blue-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${block.youtubeShowText !== false ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>

                {block.youtubeShowText !== false && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.textPosition")}</label>
                      <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => handleFieldChange("youtubeTextPosition", "top")}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${block.youtubeTextPosition === "top" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                          {t("dashboard.editor.blockItem.position.top")}
                        </button>
                        <button
                          onClick={() => handleFieldChange("youtubeTextPosition", "bottom")}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${(block.youtubeTextPosition || "bottom") === "bottom" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                          {t("dashboard.editor.blockItem.position.bottom")}
                        </button>
                      </div>
                    </div>
                    <div>
                      <ColorPicker
                        label={t("dashboard.editor.blockItem.common.textColor")}
                        value={block.youtubeTextColor || "#ff0000"}
                        onChange={(val) => handleFieldChange("youtubeTextColor", val)}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {block.type === "tour" && (
              <div className="pt-3 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.tour.sectionTitle")}</label>
                  <input
                    value={block.tourTitle || ""}
                    onChange={(event) => handleFieldChange("tourTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.tour.sectionPlaceholder")}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-700 block">{t("dashboard.editor.blockItem.tour.tourDates")}</label>

                  {(block.tours || []).map((tour, index) => (
                    <div key={tour.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 relative group">
                      <button
                        onClick={() => {
                          const newTours = [...(block.tours || [])];
                          newTours.splice(index, 1);
                          handleFieldChange("tours", newTours);
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon />
                      </button>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold">{t("dashboard.editor.blockItem.tour.date")}</label>
                          <input
                            value={tour.date}
                            onChange={(e) => {
                              const newTours = [...(block.tours || [])];
                              newTours[index] = { ...tour, date: e.target.value };
                              handleFieldChange("tours", newTours);
                            }}
                            className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                            placeholder={t("dashboard.editor.blockItem.tour.datePlaceholder")}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold">{t("dashboard.editor.blockItem.tour.location")}</label>
                          <input
                            value={tour.location}
                            onChange={(e) => {
                              const newTours = [...(block.tours || [])];
                              newTours[index] = { ...tour, location: e.target.value };
                              handleFieldChange("tours", newTours);
                            }}
                            className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                            placeholder={t("dashboard.editor.blockItem.tour.locationPlaceholder")}
                          />
                        </div>
                      </div>

                      <div className="mb-2">
                        <ImageUpload
                          label={t("dashboard.editor.blockItem.tour.image")}
                          value={tour.image || ""}
                          onChange={(url) => {
                            const newTours = [...(block.tours || [])];
                            newTours[index] = { ...tour, image: url };
                            handleFieldChange("tours", newTours);
                          }}
                        />
                      </div>

                      <div className="mb-2">
                        <label className="text-[10px] text-gray-500 uppercase font-bold">{t("dashboard.editor.blockItem.tour.ticketLink")}</label>
                        <input
                          value={tour.ticketUrl || ""}
                          onChange={(e) => {
                            const newTours = [...(block.tours || [])];
                            newTours[index] = { ...tour, ticketUrl: e.target.value };
                            handleFieldChange("tours", newTours);
                          }}
                          className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                          placeholder="https://..."
                        />
                      </div>

                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tour.sellingFast || false}
                            onChange={(e) => {
                              const newTours = [...(block.tours || [])];
                              newTours[index] = { ...tour, sellingFast: e.target.checked, soldOut: e.target.checked ? false : tour.soldOut };
                              handleFieldChange("tours", newTours);
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-xs text-gray-600">{t("dashboard.editor.blockItem.tour.sellingFast")}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tour.soldOut || false}
                            onChange={(e) => {
                              const newTours = [...(block.tours || [])];
                              newTours[index] = { ...tour, soldOut: e.target.checked, sellingFast: e.target.checked ? false : tour.sellingFast };
                              handleFieldChange("tours", newTours);
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-xs text-gray-600">{t("dashboard.editor.blockItem.tour.soldOut")}</span>
                        </label>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newTours = [...(block.tours || [])];
                      newTours.push({
                        id: makeId(),
                        date: t("dashboard.editor.blockItem.tour.defaultDate"),
                        location: t("dashboard.editor.blockItem.tour.defaultLocation"),
                        image: "",
                        ticketUrl: ""
                      });
                      handleFieldChange("tours", newTours);
                    }}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-xs font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusIcon />
                    {t("dashboard.editor.blockItem.tour.addTourDate")}
                  </button>
                </div>
              </div>
            )}

            {block.type === "experience" && (
              <div className="pt-3 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.experience.sectionTitle")}</label>
                  <input
                    value={block.experienceTitle || ""}
                    onChange={(event) => handleFieldChange("experienceTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={t("dashboard.editor.blockItem.experience.sectionPlaceholder")}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-700 block">{t("dashboard.editor.blockItem.experience.items")}</label>

                  {(block.experiences || []).map((experience, index) => (
                    <div key={experience.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 relative group">
                      <button
                        onClick={() => {
                          const newItems = [...(block.experiences || [])];
                          newItems.splice(index, 1);
                          handleFieldChange("experiences", newItems);
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon />
                      </button>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold">{t("dashboard.editor.blockItem.experience.role")}</label>
                          <input
                            value={experience.role}
                            onChange={(e) => {
                              const newItems = [...(block.experiences || [])];
                              newItems[index] = { ...experience, role: e.target.value };
                              handleFieldChange("experiences", newItems);
                            }}
                            className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                            placeholder={t("dashboard.editor.blockItem.experience.rolePlaceholder")}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold">{t("dashboard.editor.blockItem.experience.company")}</label>
                          <input
                            value={experience.company}
                            onChange={(e) => {
                              const newItems = [...(block.experiences || [])];
                              newItems[index] = { ...experience, company: e.target.value };
                              handleFieldChange("experiences", newItems);
                            }}
                            className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                            placeholder={t("dashboard.editor.blockItem.experience.companyPlaceholder")}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold">{t("dashboard.editor.blockItem.experience.period")}</label>
                          <input
                            value={experience.period || ""}
                            onChange={(e) => {
                              const newItems = [...(block.experiences || [])];
                              newItems[index] = { ...experience, period: e.target.value };
                              handleFieldChange("experiences", newItems);
                            }}
                            className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                            placeholder={t("dashboard.editor.blockItem.experience.periodPlaceholder")}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold">{t("dashboard.editor.blockItem.experience.location")}</label>
                          <input
                            value={experience.location || ""}
                            onChange={(e) => {
                              const newItems = [...(block.experiences || [])];
                              newItems[index] = { ...experience, location: e.target.value };
                              handleFieldChange("experiences", newItems);
                            }}
                            className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                            placeholder={t("dashboard.editor.blockItem.experience.locationPlaceholder")}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold">{t("dashboard.editor.blockItem.experience.description")}</label>
                        <textarea
                          value={experience.description || ""}
                          onChange={(e) => {
                            const newItems = [...(block.experiences || [])];
                            newItems[index] = { ...experience, description: e.target.value };
                            handleFieldChange("experiences", newItems);
                          }}
                          className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs min-h-[70px]"
                          placeholder={t("dashboard.editor.blockItem.experience.descriptionPlaceholder")}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newItems = [...(block.experiences || [])];
                        newItems.push({
                          id: makeId(),
                          role: t("dashboard.editor.blockItem.experience.defaultRole"),
                          company: t("dashboard.editor.blockItem.experience.defaultCompany"),
                          period: t("dashboard.editor.blockItem.experience.defaultPeriod"),
                          location: t("dashboard.editor.blockItem.experience.defaultLocation"),
                          description: t("dashboard.editor.blockItem.experience.defaultDescription")
                        });
                        handleFieldChange("experiences", newItems);
                      }}
                      className="flex-1 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-xs font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusIcon />
                      {t("dashboard.editor.blockItem.experience.addExperience")}
                    </button>

                    <label className={`flex-1 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-xs font-medium hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 cursor-pointer ${isResumeUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleResumeUpload}
                        disabled={isResumeUploading}
                      />
                      {isResumeUploading ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-current rounded-full animate-spin"></div>
                      ) : (
                        <UploadIcon size={14} />
                      )}
                      Import Resume
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.experience.roleColor") || "Role/Dot Color"}
                    value={block.experienceRoleColor || "#111827"}
                    onChange={(val) => handleFieldChange("experienceRoleColor", val)}
                  />
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.experience.textColor") || "Text Color"}
                    value={block.experienceTextColor || "#374151"}
                    onChange={(val) => handleFieldChange("experienceTextColor", val)}
                  />
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.experience.lineColor") || "Line Color"}
                    value={block.experienceLineColor || "#e5e7eb"}
                    onChange={(val) => handleFieldChange("experienceLineColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "qrcode" && (
              <div className="space-y-4 pt-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.common.layout")}</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['single', 'multiple', 'grid'] as const).map((layout) => (
                      <button
                        key={layout}
                        onClick={() => handleFieldChange("qrCodeLayout", layout)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${(block.qrCodeLayout || 'single') === layout
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        {t(`dashboard.editor.blockItem.qr.layout.${layout}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {(block.qrCodeLayout === 'single' || !block.qrCodeLayout) ? (
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">{t("dashboard.editor.blockItem.qr.selectQr")}</label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <select
                          value={block.qrCodeValue || ""}
                          onChange={(event) => handleFieldChange("qrCodeValue", event.target.value)}
                          className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                          <option value="">{t("dashboard.editor.blockItem.qr.selectQrOption")}</option>
                          {availableQrCodes.map((qr) => (
                            <option key={qr.id} value={qr.value}>
                              {qr.value}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width={14} height={14} />
                      </div>
                      <button
                        onClick={onCreateQrCode}
                        className="flex items-center justify-center w-9 h-9 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                        title={t("dashboard.editor.blockItem.qr.createNew")}
                      >
                        <PlusIcon width={16} height={16} />
                      </button>
                    </div>
                    {!block.qrCodeValue && (
                      <p className="text-[10px] text-text-muted mt-1">{t("dashboard.editor.blockItem.qr.helper")}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-700 block">{t("dashboard.editor.blockItem.qr.qrCodes")}</label>
                    {(block.qrCodeItems || []).map((item, idx) => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 relative group">
                        <button
                          onClick={() => {
                            const newItems = [...(block.qrCodeItems || [])];
                            newItems.splice(idx, 1);
                            handleFieldChange("qrCodeItems", newItems);
                          }}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XIcon width={12} height={12} />
                        </button>
                        <input
                          value={item.label}
                          onChange={(e) => {
                            const newItems = [...(block.qrCodeItems || [])];
                            newItems[idx] = { ...newItems[idx], label: e.target.value };
                            handleFieldChange("qrCodeItems", newItems);
                          }}
                          className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:border-primary outline-none"
                          placeholder={t("dashboard.editor.blockItem.common.label")}
                        />
                        <div className="flex gap-2 items-center">
                          <div className="relative flex-1">
                            <select
                              value={item.value}
                              onChange={(e) => {
                                const newItems = [...(block.qrCodeItems || [])];
                                newItems[idx] = { ...newItems[idx], value: e.target.value };
                                handleFieldChange("qrCodeItems", newItems);
                              }}
                              className="w-full appearance-none rounded border border-gray-200 bg-white px-2 py-1.5 pr-6 text-xs focus:border-primary outline-none"
                            >
                              <option value="">{t("dashboard.editor.blockItem.qr.selectQrOption")}</option>
                              {availableQrCodes.map((qr) => (
                                <option key={qr.id} value={qr.value}>
                                  {qr.value}
                                </option>
                              ))}
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width={12} height={12} />
                          </div>
                          <button
                            onClick={onCreateQrCode}
                            className="flex items-center justify-center w-7 h-7 bg-white border border-gray-200 rounded text-gray-500 hover:text-primary hover:border-primary transition-colors"
                            title={t("dashboard.editor.blockItem.qr.createNew")}
                          >
                            <PlusIcon width={14} height={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newItems = [...(block.qrCodeItems || [])];
                        newItems.push({ id: makeId(), label: t("dashboard.editor.blockItem.qr.newLabel"), value: "" });
                        handleFieldChange("qrCodeItems", newItems);
                      }}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-xs font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusIcon />
                      {t("dashboard.editor.blockItem.qr.addItem")}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.qr.foreground")}
                    value={block.qrCodeColor || "#000000"}
                    onChange={(val) => handleFieldChange("qrCodeColor", val)}
                  />
                  <ColorPicker
                    label={t("dashboard.editor.blockItem.common.background")}
                    value={block.qrCodeBgColor || "#FFFFFF"}
                    onChange={(val) => handleFieldChange("qrCodeBgColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "divider" && (
              <p className="text-xs text-text-muted pt-3">{t("dashboard.editor.blockItem.divider.helper")}</p>
            )}

            {block.type === "marketing" && (
              <MarketingBlockConfig block={block} onChange={handleFieldChange} bioId={bio?.id} isLocked={isMarketingLocked} />
            )}

            {block.type === "portfolio" && (
              <PortfolioBlockConfig block={block} onChange={handleFieldChange} bioId={bio?.id} />
            )}

            {!['heading', 'text', 'button', 'socials', 'divider', 'qrcode', 'image', 'button_grid', 'video', 'map', 'event', 'form', 'portfolio', 'instagram', 'youtube', 'blog', 'product', 'featured', 'affiliate', 'spotify', 'marketing', 'calendar', 'whatsapp', 'experience'].includes(block.type) && (
              <div className="pt-2 border-t border-gray-50 mt-3">
                <label className="text-xs font-medium text-gray-700 mb-2 block">{t("dashboard.editor.blockItem.common.alignment")}</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => handleFieldChange("align", align)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${(block.align || 'center') === align
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {t(`dashboard.editor.blockItem.align.${align}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Container Effects - Available for ALL block types */}
            {block.type !== "experience" && (
              <div className="space-y-3 pt-4 mt-4 border-t border-gray-200">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                  Container Effects
                </div>

                {/* Block Background */}
                <ColorPicker
                  label="Container Background"
                  value={block.blockBackground || "transparent"}
                  onChange={(val) => handleFieldChange("blockBackground", val)}
                />

                {/* Opacity */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-600">Container Opacity</label>
                    <span className="text-xs text-gray-500 font-mono">{block.blockOpacity ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={block.blockOpacity ?? 100}
                    onChange={(e) => handleFieldChange("blockOpacity", parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                {/* Border Radius */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-600">Border Radius</label>
                    <span className="text-xs text-gray-500 font-mono">{block.blockBorderRadius || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={block.blockBorderRadius || 0}
                    onChange={(e) => handleFieldChange("blockBorderRadius", parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                {/* Shadow */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Container Shadow</label>
                  <select
                    value={block.blockShadow || "none"}
                    onChange={(e) => handleFieldChange("blockShadow", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-gray-50 focus:bg-white"
                  >
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">Extra Large</option>
                    <option value="2xl">2X Large</option>
                    <option value="glow">Glow Effect</option>
                  </select>
                </div>

                {block.blockShadow === "glow" && (
                  <ColorPicker
                    label="Glow Color"
                    value={block.blockShadowColor || "#6366f1"}
                    onChange={(val) => handleFieldChange("blockShadowColor", val)}
                  />
                )}

                {/* Border */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-600">Border Width</label>
                      <span className="text-xs text-gray-500 font-mono">{block.blockBorderWidth || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      value={block.blockBorderWidth || 0}
                      onChange={(e) => handleFieldChange("blockBorderWidth", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                  <ColorPicker
                    label="Border Color"
                    value={block.blockBorderColor || "#e5e7eb"}
                    onChange={(val) => handleFieldChange("blockBorderColor", val)}
                  />
                </div>

                {/* Padding */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-600">Container Padding</label>
                    <span className="text-xs text-gray-500 font-mono">{block.blockPadding || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={block.blockPadding || 0}
                    onChange={(e) => handleFieldChange("blockPadding", parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                {/* Entrance Animation */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Entrance Animation</label>
                    <select
                      value={block.entranceAnimation || "none"}
                      onChange={(e) => handleFieldChange("entranceAnimation", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-gray-50 focus:bg-white"
                    >
                      <option value="none">None</option>
                      <option value="fadeIn">Fade In</option>
                      <option value="slideUp">Slide Up</option>
                      <option value="slideDown">Slide Down</option>
                      <option value="slideLeft">Slide Left</option>
                      <option value="slideRight">Slide Right</option>
                      <option value="zoomIn">Zoom In</option>
                      <option value="bounceIn">Bounce In</option>
                      <option value="flipIn">Flip In</option>
                    </select>
                  </div>
                  {block.entranceAnimation && block.entranceAnimation !== "none" && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-gray-600">Delay</label>
                        <span className="text-xs text-gray-500 font-mono">{block.entranceDelay || 0}ms</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="50"
                        value={block.entranceDelay || 0}
                        onChange={(e) => handleFieldChange("entranceDelay", parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

BlockItem.displayName = "BlockItem";

export default BlockItem;
