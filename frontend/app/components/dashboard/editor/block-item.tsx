import React, { memo, useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import BioContext, { type BioBlock } from "~/contexts/bio.context";
import { api } from "~/services/api";
import { Loader2, CreditCard, Calendar as CalendarIcon } from "lucide-react";
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
  FormIcon
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
  onToggleExpand: (id: string) => void;
  onRemove: (id: string) => void;
  onChange: (id: string, key: keyof BioBlock, value: any) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnter: (e: React.DragEvent, id: string) => void;
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
  };
  return accents[type] || { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" };
};

// Get a preview snippet for block content
const getBlockPreview = (block: BioBlock): string => {
  switch (block.type) {
    case 'button':
      return block.href ? new URL(block.href).hostname.replace('www.', '') : 'No URL set';
    case 'heading':
    case 'text':
      return block.body?.substring(0, 40) || '';
    case 'image':
    case 'video':
      return block.mediaUrl ? 'Media attached' : 'No media';
    case 'socials':
      const count = Object.values(block.socials || {}).filter(Boolean).length;
      return count ? `${count} link${count > 1 ? 's' : ''}` : 'No links';
    case 'qrcode':
      return block.qrCodeValue ? 'QR configured' : 'No QR value';
    case 'form':
      return block.formId ? 'Form selected' : 'No form selected';
    case 'portfolio':
      return block.portfolioTitle || 'Portfolio';
    default:
      return '';
  }
};

const FormBlockConfig = ({ block, onChange, bioId }: { block: BioBlock; onChange: (key: keyof BioBlock, value: any) => void; bioId?: string }) => {
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
      <p className="text-xs text-gray-500">Select a form to display on your bio page.</p>

      <div>
        <label className="text-xs font-medium text-gray-700 mb-1.5 block">Select Form</label>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            Loading forms...
          </div>
        ) : forms.length === 0 ? (
          <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
            No forms found. Please create a form in the "Forms" tab first.
          </div>
        ) : (
          <select
            value={block.formId || ""}
            onChange={(e) => onChange("formId", e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
          >
            <option value="">Select a form...</option>
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
          label="Background"
          value={block.formBackgroundColor || "#ffffff"}
          onChange={(val) => onChange("formBackgroundColor", val)}
        />
        <ColorPicker
          label="Text Color"
          value={block.formTextColor || "#1f2937"}
          onChange={(val) => onChange("formTextColor", val)}
        />
      </div>

    </div>
  );
};

const BlockItem = memo(({
  block,
  index,
  isExpanded,
  isDragging,
  isDragOver,
  dragItem,
  onToggleExpand,
  onRemove,
  onChange,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragEnter,
  availableQrCodes = [],
  onCreateQrCode
}: BlockItemProps) => {
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
        image: newProduct.image || "https://placehold.co/300x300",
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

  return (
    <div className="group">
      <div
        className={`rounded-xl mb-2 overflow-hidden transition-all duration-300 ${isDragging
          ? "border-2 border-dashed border-primary/40 bg-primary/5 opacity-100"
          : "border-2 border-transparent hover:border-primary/40 bg-transparent"
          }`}
        draggable
        onDragStart={(e) => onDragStart(e, block.id)}
        onDragEnd={onDragEnd}
        onDrop={(e) => onDrop(e, index)}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => onDragEnter(e, block.id)}
      >
        {isDragging ? (
          <div className="h-16 flex items-center justify-center">
            <span className="text-sm font-medium text-primary/60">Drop here</span>
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
              <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 p-1 shrink-0">
                <DragHandleIcon />
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
                {/* Add other icons as needed, defaulting to a generic one if missing */}
                {!['heading', 'text', 'button', 'image', 'socials', 'video', 'divider', 'qrcode', 'form'].includes(block.type) && (
                  <DefaultIcon />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{block.title || block.type.charAt(0).toUpperCase() + block.type.slice(1).replace('_', ' ')}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${getBlockTypeAccent(block.type).bg} ${getBlockTypeAccent(block.type).text}`}>
                    {block.type.replace('_', ' ')}
                  </span>
                  {(() => {
                    try {
                      const preview = getBlockPreview(block);
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
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(block.id);
                }}
                type="button"
                title="Remove block"
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
                  label="Content"
                  value={block.body || ""}
                  onChange={(value) => handleFieldChange("body", value)}
                  placeholder="Write your text"
                  rows={3}
                />
                <ColorPicker
                  label="Text Color"
                  value={block.textColor || "#4b5563"}
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
                      value={block.fontSize || "16px"}
                      onChange={(value) => handleFieldChange("fontSize", value)}
                      options={[
                        { value: "12px", label: "Small" },
                        { value: "14px", label: "Normal" },
                        { value: "16px", label: "Medium" },
                        { value: "18px", label: "Large" },
                        { value: "24px", label: "XL" }
                      ]}
                    />
                    <FormSelect
                      label="Font Weight"
                      value={block.fontWeight || "500"}
                      onChange={(value) => handleFieldChange("fontWeight", value)}
                      options={[
                        { value: "300", label: "Light" },
                        { value: "400", label: "Normal" },
                        { value: "500", label: "Medium" },
                        { value: "600", label: "Semibold" },
                        { value: "700", label: "Bold" },
                        { value: "900", label: "Black" }
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
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Label</label>
                          <input
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...(block.gridItems || [])];
                              newItems[i] = { ...item, title: e.target.value };
                              handleFieldChange("gridItems", newItems);
                            }}
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Button Label"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">URL</label>
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
                            label="Background Image"
                            value={item.image || ""}
                            onChange={(url) => {
                              const newItems = [...(block.gridItems || [])];
                              newItems[i] = { ...item, image: url };
                              handleFieldChange("gridItems", newItems);
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Icon</label>
                          <select
                            value={item.icon}
                            onChange={(e) => {
                              const newItems = [...(block.gridItems || [])];
                              newItems[i] = { ...item, icon: e.target.value };
                              handleFieldChange("gridItems", newItems);
                            }}
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          >
                            <option value="">Select an icon</option>
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
                      title: "New Link",
                      url: "https://",
                      image: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop",
                      icon: ""
                    });
                    handleFieldChange("gridItems", newItems);
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  <PlusIcon width={16} height={16} />
                  Add Button
                </button>
              </div>
            )}

            {block.type === "button" && (
              <div className="space-y-4 pt-4">
                {/* Basic Info Section */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Content
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Label</label>
                      <input
                        value={block.title || ""}
                        onChange={(event) => handleFieldChange("title", event.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="Button text"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">URL</label>
                      <input
                        value={block.href || ""}
                        onChange={(event) => handleFieldChange("href", event.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white font-mono"
                        placeholder="https://"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                        {block.buttonStyle as any === 'image-grid' ? 'Icon' : 'Image (optional)'}
                      </label>
                      {block.buttonStyle as any === 'image-grid' ? (
                        <select
                          value={block.buttonImage || ""}
                          onChange={(event) => handleFieldChange("buttonImage", event.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
                        >
                          <option value="">Select an icon</option>
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
                  </div>
                </div>

                {/* Style Section */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Design
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Text Alignment</label>
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
                            {align.charAt(0).toUpperCase() + align.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Style</label>
                        <select
                          value={block.buttonStyle || "solid"}
                          onChange={(event) => handleFieldChange("buttonStyle", event.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
                        >
                          <option value="solid">Solid</option>
                          <option value="outline">Outline</option>
                          <option value="ghost">Ghost</option>
                          <option value="hard-shadow">Retro</option>
                          <option value="soft-shadow">Soft Shadow</option>
                          <option value="3d">3D</option>
                          <option value="glass">Glass</option>
                          <option value="gradient">Gradient</option>
                          <option value="neon">Neon</option>
                          <option value="architect">Architect</option>
                          <option value="material">Material</option>
                          <option value="brutalist">Brutalist</option>
                          <option value="outline-thick">Outline Thick</option>
                          <option value="image-grid">Image Card</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Shape</label>
                        <select
                          value={block.buttonShape || "rounded"}
                          onChange={(event) => handleFieldChange("buttonShape", event.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
                        >
                          <option value="pill">Pill</option>
                          <option value="rounded">Rounded</option>
                          <option value="square">Square</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 block">Colors</label>
                  <div className="grid grid-cols-2 gap-3">
                    <ColorPicker
                      label="Background"
                      value={block.accent || "#111827"}
                      onChange={(val) => handleFieldChange("accent", val)}
                    />
                    <ColorPicker
                      label="Text"
                      value={block.textColor || "#ffffff"}
                      onChange={(val) => handleFieldChange("textColor", val)}
                    />
                  </div>
                  {["hard-shadow", "soft-shadow", "3d", "gradient", "cyberpunk", "gradient-border", "neon", "pixel", "sketch", "neumorphism", "clay", "architect", "material", "brutalist", "outline-thick"].includes(block.buttonStyle || "") && (
                    <div className="pt-2">
                      <ColorPicker
                        label="Secondary / Shadow"
                        value={block.buttonShadowColor || block.accent || "#111827"}
                        onChange={(val) => handleFieldChange("buttonShadowColor", val)}
                      />
                    </div>
                  )}
                </div>

                {/* Options Section */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Options
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
                        <span className="text-sm font-medium text-gray-700">Sensitive Content</span>
                        <p className="text-xs text-gray-400">Mark as 18+ content</p>
                      </div>
                    </label>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Animation</label>
                      <div className="flex gap-2">
                        <select
                          value={block.animation || "none"}
                          onChange={(event) => handleFieldChange("animation", event.target.value)}
                          className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        >
                          <option value="none">None</option>
                          <option value="bounce">Bounce</option>
                          <option value="pulse">Pulse</option>
                          <option value="shake">Shake</option>
                          <option value="wobble">Wobble</option>
                        </select>
                        {block.animation && block.animation !== "none" && (
                          <select
                            value={block.animationTrigger || "loop"}
                            onChange={(event) => handleFieldChange("animationTrigger", event.target.value)}
                            className="w-28 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                          >
                            <option value="loop">Loop</option>
                            <option value="once">Once</option>
                            <option value="hover">Hover</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {block.type === "socials" && (
              <div className="space-y-3 pt-3">
                <p className="text-xs text-gray-500">Add your social media links below.</p>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Layout</label>
                    <select
                      value={block.socialsLayout || "row"}
                      onChange={(event) => handleFieldChange("socialsLayout", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="row">Inline (Row)</option>
                      <option value="column">List (Column)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Style</label>
                    <div className="flex items-center h-[38px]">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={block.socialsLabel || false}
                          onChange={(event) => handleFieldChange("socialsLabel", event.target.checked as any)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        Show Text
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
                    <h4 className="text-sm font-bold text-blue-900">Booking Settings</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Availability and booking settings are managed in the
                      <a href="/dashboard/scheduler" target="_blank" className="underline font-bold ml-1 hover:text-blue-900">Scheduler</a> tab.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
                  <input
                    value={block.title || ""}
                    onChange={(event) => handleFieldChange("title", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Book a time"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
                  <input
                    value={block.body || ""}
                    onChange={(event) => handleFieldChange("body", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Brief description"
                  />
                </div>
              </div>
            )}

            {block.type === "video" && (
              <div className="pt-3">
                <label className="text-xs font-medium text-gray-700 mb-1 block">YouTube URL</label>
                <input
                  value={block.mediaUrl || ""}
                  onChange={(event) => handleFieldChange("mediaUrl", event.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}

            {block.type === "image" && (
              <div className="pt-3">
                <ImageUpload
                  label="Image"
                  value={block.mediaUrl || ""}
                  onChange={(url) => handleFieldChange("mediaUrl", url)}
                />
              </div>
            )}

            {block.type === "blog" && (
              <div className="pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label="Background"
                    value={block.blogBackgroundColor || "#ffffff"}
                    onChange={(val) => handleFieldChange("blogBackgroundColor", val)}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={block.blogTextColor || "#1f2937"}
                    onChange={(val) => handleFieldChange("blogTextColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "product" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Layout</label>
                  <select
                    value={block.productLayout || "grid"}
                    onChange={(event) => handleFieldChange("productLayout", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                    <option value="carousel">Carousel</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Card Style</label>
                  <select
                    value={block.productCardStyle || "default"}
                    onChange={(event) => handleFieldChange("productCardStyle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="default">Default</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label="Background"
                    value={block.productBackgroundColor || "#ffffff"}
                    onChange={(val) => handleFieldChange("productBackgroundColor", val)}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={block.productTextColor || "#1f2937"}
                    onChange={(val) => handleFieldChange("productTextColor", val)}
                  />
                  <ColorPicker
                    label="Accent Color"
                    value={block.productAccentColor || "#000000"}
                    onChange={(val) => handleFieldChange("productAccentColor", val)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Button Text</label>
                  <input
                    type="text"
                    value={block.productButtonText || "View Product"}
                    onChange={(e) => handleFieldChange("productButtonText", e.target.value)}
                    className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                    placeholder="e.g. Buy Now"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 block">Products</label>
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
                        title="Remove product"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-gray-100 mt-4">
                    <label className="text-xs font-medium text-gray-500 mb-2 block">Add Product from Stripe</label>
                    {isLoadingProducts ? (
                      <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsProductSelectOpen(!isProductSelectOpen)}
                          className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white hover:border-gray-300 transition-colors text-left"
                        >
                          <span className="text-gray-500">Select a product to add...</span>
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
                                    <p className="text-sm font-semibold text-gray-900">No products found</p>
                                    <p className="text-xs text-gray-500">Create a new product to add it here.</p>
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
                              Create New Product
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
                    <h3 className="text-lg font-bold text-gray-900">Create Product</h3>
                    <button
                      onClick={() => setIsCreateProductModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                      <input
                        required
                        value={newProductData.title}
                        onChange={(e) => setNewProductData({ ...newProductData, title: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="e.g. Digital Guide"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
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
                        label="Product Image (Optional)"
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
                            Creating...
                          </>
                        ) : (
                          "Create Product"
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
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
                  <input
                    value={block.calendarTitle || ""}
                    onChange={(event) => handleFieldChange("calendarTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Book a Call"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Booking URL</label>
                  <input
                    value={block.calendarUrl || ""}
                    onChange={(event) => handleFieldChange("calendarUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://calendly.com/..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <ColorPicker
                    label="Background"
                    value={block.calendarColor || "#ffffff"}
                    onChange={(val) => handleFieldChange("calendarColor", val)}
                  />
                  <ColorPicker
                    label="Text"
                    value={block.calendarTextColor || "#1f2937"}
                    onChange={(val) => handleFieldChange("calendarTextColor", val)}
                  />
                  <ColorPicker
                    label="Accent"
                    value={block.calendarAccentColor || "#2563eb"}
                    onChange={(val) => handleFieldChange("calendarAccentColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "map" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Location Name</label>
                  <input
                    value={block.mapTitle || ""}
                    onChange={(event) => handleFieldChange("mapTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g. Our Office"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Address</label>
                  <input
                    value={block.mapAddress || ""}
                    onChange={(event) => handleFieldChange("mapAddress", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g. 123 Main St, City"
                  />
                </div>
              </div>
            )}

            {block.type === "featured" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Product Title</label>
                  <input
                    value={block.featuredTitle || ""}
                    onChange={(event) => handleFieldChange("featuredTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Product Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Price</label>
                    <input
                      value={block.featuredPrice || ""}
                      onChange={(event) => handleFieldChange("featuredPrice", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="$19.99"
                    />
                  </div>
                  <div>
                    <ImageUpload
                      label="Product Image"
                      value={block.featuredImage || ""}
                      onChange={(url) => handleFieldChange("featuredImage", url)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Product URL</label>
                  <input
                    value={block.featuredUrl || ""}
                    onChange={(event) => handleFieldChange("featuredUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label="Background"
                    value={block.featuredColor || "#1f4d36"}
                    onChange={(val) => handleFieldChange("featuredColor", val)}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={block.featuredTextColor || "#ffffff"}
                    onChange={(val) => handleFieldChange("featuredTextColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "affiliate" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
                  <input
                    value={block.affiliateTitle || ""}
                    onChange={(event) => handleFieldChange("affiliateTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Copy my coupon code"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Coupon Code</label>
                  <input
                    value={block.affiliateCode || ""}
                    onChange={(event) => handleFieldChange("affiliateCode", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="CODE123"
                  />
                </div>
                <div>
                  <ImageUpload
                    label="Image"
                    value={block.affiliateImage || ""}
                    onChange={(url) => handleFieldChange("affiliateImage", url)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Affiliate URL</label>
                  <input
                    value={block.affiliateUrl || ""}
                    onChange={(event) => handleFieldChange("affiliateUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label="Background"
                    value={block.affiliateColor || "#ffffff"}
                    onChange={(val) => handleFieldChange("affiliateColor", val)}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={block.affiliateTextColor || "#1f2937"}
                    onChange={(val) => handleFieldChange("affiliateTextColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "event" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Event Title</label>
                  <input
                    value={block.eventTitle || ""}
                    onChange={(event) => handleFieldChange("eventTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Live Webinar"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={block.eventDate || ""}
                    onChange={(event) => handleFieldChange("eventDate", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Button Text</label>
                    <input
                      value={block.eventButtonText || ""}
                      onChange={(event) => handleFieldChange("eventButtonText", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="Register"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Button URL</label>
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
                    label="Background"
                    value={block.eventColor || "#111827"}
                    onChange={(val) => handleFieldChange("eventColor", val)}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={block.eventTextColor || "#ffffff"}
                    onChange={(val) => handleFieldChange("eventTextColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "spotify" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Spotify URL</label>
                  <input
                    value={block.spotifyUrl || ""}
                    onChange={(event) => handleFieldChange("spotifyUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://open.spotify.com/track/..."
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Supports tracks, albums, and playlists</p>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">Compact Player</label>
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
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Instagram Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm">@</span>
                    <input
                      value={block.instagramUsername || ""}
                      onChange={(event) => handleFieldChange("instagramUsername", event.target.value)}
                      className="w-full rounded-lg border border-border pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Display Type</label>
                  <select
                    value={block.instagramDisplayType || "grid"}
                    onChange={(event) => handleFieldChange("instagramDisplayType", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="grid">Grid (3 Columns)</option>
                    <option value="list">List (Vertical)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">Show Username</label>
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
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Text Position</label>
                      <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => handleFieldChange("instagramTextPosition", "top")}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${block.instagramTextPosition === "top" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                          Top
                        </button>
                        <button
                          onClick={() => handleFieldChange("instagramTextPosition", "bottom")}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${(block.instagramTextPosition || "bottom") === "bottom" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                          Bottom
                        </button>
                      </div>
                    </div>
                    <div>
                      <ColorPicker
                        label="Text Color"
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
                  <label className="text-xs font-medium text-gray-700 mb-1 block">YouTube Channel URL</label>
                  <input
                    value={block.youtubeUrl || ""}
                    onChange={(event) => handleFieldChange("youtubeUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://youtube.com/@..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Display Type</label>
                  <select
                    value={block.youtubeDisplayType || "grid"}
                    onChange={(event) => handleFieldChange("youtubeDisplayType", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="grid">Grid (2 Columns)</option>
                    <option value="list">List (Vertical)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">Show Channel Name</label>
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
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Text Position</label>
                      <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => handleFieldChange("youtubeTextPosition", "top")}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${block.youtubeTextPosition === "top" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                          Top
                        </button>
                        <button
                          onClick={() => handleFieldChange("youtubeTextPosition", "bottom")}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${(block.youtubeTextPosition || "bottom") === "bottom" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                          Bottom
                        </button>
                      </div>
                    </div>
                    <div>
                      <ColorPicker
                        label="Text Color"
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
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Section Title</label>
                  <input
                    value={block.tourTitle || ""}
                    onChange={(event) => handleFieldChange("tourTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="TOURS"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-700 block">Tour Dates</label>

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
                          <label className="text-[10px] text-gray-500 uppercase font-bold">Date</label>
                          <input
                            value={tour.date}
                            onChange={(e) => {
                              const newTours = [...(block.tours || [])];
                              newTours[index] = { ...tour, date: e.target.value };
                              handleFieldChange("tours", newTours);
                            }}
                            className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                            placeholder="AUG 1"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold">Location</label>
                          <input
                            value={tour.location}
                            onChange={(e) => {
                              const newTours = [...(block.tours || [])];
                              newTours[index] = { ...tour, location: e.target.value };
                              handleFieldChange("tours", newTours);
                            }}
                            className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                            placeholder="City, Country"
                          />
                        </div>
                      </div>

                      <div className="mb-2">
                        <ImageUpload
                          label="Tour Image"
                          value={tour.image || ""}
                          onChange={(url) => {
                            const newTours = [...(block.tours || [])];
                            newTours[index] = { ...tour, image: url };
                            handleFieldChange("tours", newTours);
                          }}
                        />
                      </div>

                      <div className="mb-2">
                        <label className="text-[10px] text-gray-500 uppercase font-bold">Ticket Link</label>
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
                          <span className="text-xs text-gray-600">Selling Fast</span>
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
                          <span className="text-xs text-gray-600">Sold Out</span>
                        </label>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newTours = [...(block.tours || [])];
                      newTours.push({
                        id: makeId(),
                        date: "TBA",
                        location: "City",
                        image: "",
                        ticketUrl: ""
                      });
                      handleFieldChange("tours", newTours);
                    }}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-xs font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusIcon />
                    Add Tour Date
                  </button>
                </div>
              </div>
            )}

            {block.type === "qrcode" && (
              <div className="space-y-4 pt-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Layout</label>
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
                        {layout.charAt(0).toUpperCase() + layout.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {(block.qrCodeLayout === 'single' || !block.qrCodeLayout) ? (
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Select QR Code</label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <select
                          value={block.qrCodeValue || ""}
                          onChange={(event) => handleFieldChange("qrCodeValue", event.target.value)}
                          className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                          <option value="">Select a QR Code</option>
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
                        title="Create new QR Code"
                      >
                        <PlusIcon width={16} height={16} />
                      </button>
                    </div>
                    {!block.qrCodeValue && (
                      <p className="text-[10px] text-text-muted mt-1">Select an existing QR code or create a new one.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-700 block">QR Codes</label>
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
                          placeholder="Label"
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
                              <option value="">Select QR Code</option>
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
                            title="Create new QR Code"
                          >
                            <PlusIcon width={14} height={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newItems = [...(block.qrCodeItems || [])];
                        newItems.push({ id: makeId(), label: "New QR Code", value: "" });
                        handleFieldChange("qrCodeItems", newItems);
                      }}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-xs font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusIcon />
                      Add QR Code Item
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label="Foreground"
                    value={block.qrCodeColor || "#000000"}
                    onChange={(val) => handleFieldChange("qrCodeColor", val)}
                  />
                  <ColorPicker
                    label="Background"
                    value={block.qrCodeBgColor || "#FFFFFF"}
                    onChange={(val) => handleFieldChange("qrCodeBgColor", val)}
                  />
                </div>
              </div>
            )}

            {block.type === "divider" && (
              <p className="text-xs text-text-muted pt-3">Simple dividing line.</p>
            )}

            {block.type === "portfolio" && (
              <div className="space-y-3 pt-3">
                <p className="text-xs text-gray-500">Display your portfolio items on your bio page. Add and manage items in the Portfolio tab.</p>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">Section Title</label>
                  <input
                    type="text"
                    value={block.portfolioTitle || "Portfólio"}
                    onChange={(e) => handleFieldChange("portfolioTitle", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
                    placeholder="Portfolio"
                  />
                </div>
              </div>
            )}

            {!['heading', 'text', 'button', 'socials', 'divider', 'qrcode', 'image', 'button_grid', 'video', 'map', 'event', 'form', 'portfolio', 'instagram', 'youtube', 'blog', 'product', 'featured', 'affiliate', 'spotify'].includes(block.type) && (
              <div className="pt-2 border-t border-gray-50 mt-3">
                <label className="text-xs font-medium text-gray-700 mb-2 block">Alignment</label>
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
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
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
