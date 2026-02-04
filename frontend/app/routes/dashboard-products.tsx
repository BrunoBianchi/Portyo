import type { MetaFunction } from "react-router";
import { useState, useEffect, useContext, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, ShoppingBag, MoreVertical, Image as ImageIcon, DollarSign, Link as LinkIcon, Loader2, X, Edit2, Trash2, ExternalLink, CreditCard } from "lucide-react";
import { api } from "~/services/api";
import BioContext from "~/contexts/bio.context";
import { AuthorizationGuard } from "~/contexts/guard.context";
import AuthContext from "~/contexts/auth.context";
import { PLAN_LIMITS } from "~/constants/plan-limits";
import type { PlanType } from "~/constants/plan-limits";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";

export const meta: MetaFunction = () => {
  return [
    { title: "Produtos | Portyo" },
    { name: "description", content: "Gerencie seu catálogo de produtos." },
  ];
};

interface Product {
  id: string;
  title: string;
  price: number;
  image: string | null;
  status: "active" | "archived";
  sales: number;
  currency: string;
}

export default function DashboardProducts() {
  const { t } = useTranslation("dashboard");
  const { bio } = useContext(BioContext);
  const { user } = useContext(AuthContext);
  const userPlan = (user?.plan || 'free') as PlanType;
  const storeFee = PLAN_LIMITS[userPlan]?.storeFee ?? 0.025;
  const storeFeePercent = storeFee * 100;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
  const isMobile = useIsMobile();
  const { startTour } = useDriverTour({ primaryColor: tourPrimaryColor, storageKey: "portyo:products-tour-done" });

  // Create State
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newProductData, setNewProductData] = useState({
    title: "",
    price: "",
    currency: "usd",
    image: ""
  });

  // Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    price: "",
    currency: "usd",
    image: ""
  });

  // Delete State
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showStripePopup, setShowStripePopup] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Image State for Create
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);

  // Image State for Edit
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bio?.id) return;

    setCreateError(null);
    setIsCreatingProduct(true);
    try {
      let imageUrl = newProductData.image;

      if (createImageFile) {
        const formData = new FormData();
        formData.append("image", createImageFile);
        const uploadRes = await api.post("/user/upload-product-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.url;
      }

      const res = await api.post("/stripe/create-product", {
        bioId: bio.id,
        title: newProductData.title,
        price: parseFloat(newProductData.price),
        currency: newProductData.currency,
        image: imageUrl
      });

      const newProduct: Product = {
        id: res.data.id,
        title: res.data.name,
        price: (res.data.default_price?.unit_amount ? res.data.default_price.unit_amount / 100 : parseFloat(newProductData.price)),
        currency: res.data.default_price?.currency || newProductData.currency,
        image: res.data.images?.[0] || null,
        status: 'active',
        sales: 0
      };

      setProducts([...products, newProduct]);

      setIsCreateProductModalOpen(false);
      setNewProductData({ title: "", price: "", currency: "usd", image: "" });
      setCreateImageFile(null);
      setCreateImagePreview(null);
    } catch (error: any) {
      console.error("Failed to create product", error);
      if (error.response?.data?.error === "Stripe account not connected") {
        setIsCreateProductModalOpen(false);
        setShowStripePopup(true);
      } else {
        setCreateError(error.response?.data?.message || t("dashboard.products.errors.create"));
      }
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      title: product.title,
      price: product.price.toString(),
      currency: product.currency,
      image: product.image || ""
    });
    setEditImagePreview(product.image || null);
    setEditImageFile(null);
    setOpenMenuId(null);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bio?.id || !editingProduct) return;

    setEditError(null);
    setIsUpdating(true);
    try {
      let imageUrl = editFormData.image;

      if (editImageFile) {
        const formData = new FormData();
        formData.append("image", editImageFile);
        const uploadRes = await api.post("/user/upload-product-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.url;
      }

      const res = await api.put(`/stripe/products/${editingProduct.id}`, {
        bioId: bio.id,
        title: editFormData.title,
        price: parseFloat(editFormData.price),
        currency: editFormData.currency,
        image: imageUrl
      });

      const updatedProduct = {
        ...editingProduct,
        title: res.data.name,
        price: res.data.default_price?.unit_amount ? res.data.default_price.unit_amount / 100 : parseFloat(editFormData.price),
        currency: res.data.default_price?.currency || editFormData.currency,
        image: res.data.images?.[0] || null,
      };

      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      setEditingProduct(null);
      setEditImageFile(null);
      setEditImagePreview(null);
    } catch (error: any) {
      console.error("Failed to update product", error);
      setEditError(error.response?.data?.message || t("dashboard.products.errors.update"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!bio?.id || !deletingProduct) return;

    setIsDeleting(true);
    try {
      await api.delete(`/stripe/products/${deletingProduct.id}`, {
        data: { bioId: bio.id }
      });

      setProducts(products.filter(p => p.id !== deletingProduct.id));
      setDeletingProduct(null);
    } catch (error: any) {
      console.error("Failed to delete product", error);
      alert(error.response?.data?.message || t("dashboard.products.errors.delete"));
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!bio?.id) return;
      setIsLoading(true);
      try {
        const res = await api.get(`/stripe/products?bioId=${bio.id}`);
        setProducts(res.data.filter((p: any) => p.status === 'active'));
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [bio?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isMobile) return;

    const hasSeenTour = window.localStorage.getItem("portyo:products-tour-done");
    if (!hasSeenTour) {
      setTourRun(true);
    }

    const rootStyles = getComputedStyle(document.documentElement);
    const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
    if (primaryFromTheme) {
      setTourPrimaryColor(primaryFromTheme);
    }
  }, [isMobile]);

  const productsTourSteps: Step[] = [
    {
      target: "[data-tour=\"products-header\"]",
      content: t("dashboard.tours.products.steps.header"),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: "[data-tour=\"products-add\"]",
      content: t("dashboard.tours.products.steps.add"),
      placement: "bottom",
    },
    {
      target: "[data-tour=\"products-fee\"]",
      content: t("dashboard.tours.products.steps.fee"),
      placement: "bottom",
    },
    {
      target: "[data-tour=\"products-search\"]",
      content: t("dashboard.tours.products.steps.search"),
      placement: "bottom",
    },
    {
      target: "[data-tour=\"products-grid\"]",
      content: t("dashboard.tours.products.steps.grid"),
      placement: "top",
    },
    {
      target: "[data-tour=\"products-card\"]",
      content: t("dashboard.tours.products.steps.card"),
      placement: "top",
    },
    {
      target: "[data-tour=\"products-add-placeholder\"]",
      content: t("dashboard.tours.products.steps.addPlaceholder"),
      placement: "top",
    },
  ];

  const handleProductsTourCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type as any)) {
      const delta = action === ACTIONS.PREV ? -1 : 1;
      setTourStepIndex(index + delta);
      return;
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setTourRun(false);
      setTourStepIndex(0);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("portyo:products-tour-done", "true");
      }
    }
  };

  const handleCreateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCreateImageFile(file);
      setCreateImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <AuthorizationGuard>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">


        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black/5 pb-8" data-tour="products-header">
          <div>
            <h1 className="text-5xl font-black text-[#1A1A1A] tracking-tighter mb-2" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.products.title")}</h1>
            <p className="text-xl text-gray-500 font-medium">{t("dashboard.products.subtitle")}</p>
          </div>
          <button
            data-tour="products-add"
            onClick={() => setIsCreateProductModalOpen(true)}
            className="px-8 py-4 bg-[#1A1A1A] text-white rounded-full font-black text-lg hover:bg-black hover:scale-105 transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <Plus className="w-6 h-6" strokeWidth={3} /> {t("dashboard.products.addProduct")}
          </button>
        </div>

        {/* Store Fee Banner */}
        {storeFee > 0 && (
          <div className="bg-[#E0F2FE] border-2 border-[#0284C7] rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(2,132,199,1)]" data-tour="products-fee">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white border-2 border-[#0284C7] rounded-xl flex items-center justify-center text-[#0284C7]">
                <DollarSign className="w-6 h-6" strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0C4A6E]" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.products.fee.title", { fee: storeFeePercent })}</h3>
                <p className="text-sm font-bold text-[#0284C7]">{t("dashboard.products.fee.subtitle")}</p>
              </div>
            </div>
            <button
              className="px-6 py-3 bg-white text-[#0C4A6E] text-sm font-black rounded-xl border-2 border-[#0284C7] hover:bg-[#F0F9FF] transition-all shadow-sm"
              onClick={() => window.open('/dashboard/settings', '_self')}
            >
              {t("dashboard.products.fee.upgrade")}
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12" data-tour="products-search">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("dashboard.products.searchPlaceholder")}
              className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black transition-all text-lg font-bold placeholder:text-gray-300"
            />
          </div>
          <select className="px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl text-base font-bold text-[#1A1A1A] focus:outline-none focus:border-black cursor-pointer appearance-none min-w-[200px]">
            <option value="all">{t("dashboard.products.status.all")}</option>
            <option value="active">{t("dashboard.products.status.active")}</option>
            <option value="draft">{t("dashboard.products.status.draft")}</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20" data-tour="products-grid">
            {products.map((product, index) => (
              <div
                key={product.id}
                data-tour={index === 0 ? "products-card" : undefined}
                className="bg-white rounded-[32px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200 group flex flex-col overflow-hidden relative"
              >
                <div className="p-3">
                  <div className="aspect-square relative bg-[#F3F3F1] rounded-[24px] overflow-hidden border-2 border-transparent group-hover:border-black transition-all">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <ImageIcon className="w-16 h-16 opacity-30" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border-2 shadow-sm flex items-center gap-1.5 ${product.status === 'active'
                        ? 'bg-[#E5F6E3] text-[#356233] border-[#356233]'
                        : 'bg-white text-gray-500 border-gray-200'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${product.status === 'active' ? 'bg-[#356233]' : 'bg-gray-400'}`}></span>
                        {product.status === 'active' ? t("dashboard.products.status.active") : t("dashboard.products.status.draft")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="font-black text-[#1A1A1A] text-xl mb-1 truncate tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }} title={product.title}>{product.title}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("dashboard.products.digitalProduct")}</p>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-px">{t("dashboard.products.price")}</span>
                      <span className="text-2xl font-black text-[#1A1A1A] tracking-tighter">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price)}
                      </span>
                    </div>

                    <div className="flex gap-2 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === product.id ? null : product.id); }}
                        className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:text-black hover:border-black hover:bg-gray-50 transition-all focus:outline-none"
                        aria-label="More options"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === product.id && (
                        <div ref={menuRef} className="absolute bottom-12 right-0 w-40 bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                          <button
                            onClick={() => { setDeletingProduct(product); setOpenMenuId(null); }}
                            className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 uppercase tracking-wide"
                          >
                            <Trash2 className="w-4 h-4" /> {t("dashboard.products.remove")}
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => openEditModal(product)}
                        className="h-10 px-5 bg-[#1A1A1A] text-white rounded-full text-xs font-bold hover:bg-black transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> {t("dashboard.products.edit")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Placeholder */}
            <button
              data-tour="products-add-placeholder"
              onClick={() => setIsCreateProductModalOpen(true)}
              className="border-4 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center gap-4 p-6 hover:border-black hover:bg-gray-50 transition-all group h-full min-h-[360px]"
            >
              <div className="w-20 h-20 rounded-full bg-[#F3F3F1] flex items-center justify-center text-gray-400 group-hover:bg-[#1A1A1A] group-hover:text-white group-hover:shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] group-hover:scale-110 transition-all duration-300 border-2 border-gray-200 group-hover:border-black">
                <Plus className="w-8 h-8" strokeWidth={3} />
              </div>
              <div className="text-center">
                <p className="font-black text-[#1A1A1A] text-xl mb-1">{t("dashboard.products.addNew")}</p>
                <p className="text-sm text-gray-400 font-bold">{t("dashboard.products.addNewSubtitle")}</p>
              </div>
            </button>
          </div>
        )}

        {/* Create Product Modal */}
        {isCreateProductModalOpen && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-black">
              <div className="p-8 border-b-2 border-black/5 flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.products.create.title")}</h3>
                <button
                  onClick={() => setIsCreateProductModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-black border-2 border-transparent hover:border-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateProduct} className="p-8 space-y-6">
                {createError && (
                  <div className="p-4 bg-red-100 border-2 border-red-500 text-red-600 rounded-xl text-sm font-bold">
                    {createError}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("dashboard.products.form.productTitle")}</label>
                  <input
                    required
                    value={newProductData.title}
                    onChange={(e) => setNewProductData({ ...newProductData, title: e.target.value })}
                    className="w-full rounded-xl border-2 border-transparent bg-[#F3F3F1] px-4 py-3 text-sm font-bold text-[#1A1A1A] focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-400"
                    placeholder={t("dashboard.products.form.productTitlePlaceholder")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("dashboard.products.form.price")}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                        {newProductData.currency === 'usd' ? '$' : newProductData.currency === 'eur' ? '€' : newProductData.currency === 'gbp' ? '£' : newProductData.currency.toUpperCase()}
                      </span>
                      <input
                        required
                        type="number"
                        min="0.50"
                        step="0.01"
                        value={newProductData.price}
                        onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
                        className="w-full rounded-xl border-2 border-transparent bg-[#F3F3F1] pl-8 pr-4 py-3 text-sm font-bold text-[#1A1A1A] focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-400"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("dashboard.products.form.currency")}</label>
                    <select
                      value={newProductData.currency}
                      onChange={(e) => setNewProductData({ ...newProductData, currency: e.target.value })}
                      className="w-full rounded-xl border-2 border-transparent bg-[#F3F3F1] px-4 py-3 text-sm font-bold text-[#1A1A1A] focus:bg-white focus:border-black outline-none transition-all cursor-pointer"
                    >
                      <option value="usd">USD ($)</option>
                      <option value="eur">EUR (€)</option>
                      <option value="gbp">GBP (£)</option>
                      <option value="brl">BRL (R$)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("dashboard.products.form.productImage")}</label>
                  <div className="border-2 border-transparent bg-[#F3F3F1] rounded-xl p-3 flex items-center gap-4 hover:bg-white hover:border-black transition-all cursor-pointer group relative">
                    <div className="w-14 h-14 bg-white border-2 border-gray-200 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
                      {createImagePreview ? (
                        <img src={createImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1A1A1A] truncate">{createImageFile ? createImageFile.name : "Select Image"}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">JPG, PNG, WEBP</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleCreateFileChange}
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isCreatingProduct}
                    className="w-full bg-[#1A1A1A] text-white rounded-full py-4 text-base font-black hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    {isCreatingProduct ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("dashboard.products.create.creating")}
                      </>
                    ) : (
                      t("dashboard.products.create.action")
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Edit Product Modal */}
        {editingProduct && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-black">
              <div className="p-8 border-b-2 border-black/5 flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.products.editModal.title")}</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-black border-2 border-transparent hover:border-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateProduct} className="p-8 space-y-6">
                {editError && (
                  <div className="p-4 bg-red-100 border-2 border-red-500 text-red-600 rounded-xl text-sm font-bold">
                    {editError}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("dashboard.products.form.productTitle")}</label>
                  <input
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full rounded-xl border-2 border-transparent bg-[#F3F3F1] px-4 py-3 text-sm font-bold text-[#1A1A1A] focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("dashboard.products.form.price")}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                        {editFormData.currency === 'usd' ? '$' : editFormData.currency === 'eur' ? '€' : editFormData.currency === 'gbp' ? '£' : editFormData.currency.toUpperCase()}
                      </span>
                      <input
                        required
                        type="number"
                        min="0.50"
                        step="0.01"
                        value={editFormData.price}
                        onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                        className="w-full rounded-xl border-2 border-transparent bg-[#F3F3F1] pl-8 pr-4 py-3 text-sm font-bold text-[#1A1A1A] focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("dashboard.products.form.currency")}</label>
                    <select
                      value={editFormData.currency}
                      onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
                      className="w-full rounded-xl border-2 border-transparent bg-[#F3F3F1] px-4 py-3 text-sm font-bold text-[#1A1A1A] focus:bg-white focus:border-black outline-none transition-all cursor-pointer"
                    >
                      <option value="usd">USD ($)</option>
                      <option value="eur">EUR (€)</option>
                      <option value="gbp">GBP (£)</option>
                      <option value="brl">BRL (R$)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("dashboard.products.form.productImage")}</label>
                  <div className="border-2 border-transparent bg-[#F3F3F1] rounded-xl p-3 flex items-center gap-4 hover:bg-white hover:border-black transition-all cursor-pointer group relative">
                    <div className="w-14 h-14 bg-white border-2 border-gray-200 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
                      {editImagePreview ? (
                        <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1A1A1A] truncate">{editImageFile ? editImageFile.name : "Change Image"}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">JPG, PNG, WEBP</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleEditFileChange}
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full bg-[#1A1A1A] text-white rounded-full py-4 text-base font-black hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("dashboard.products.editModal.saving")}
                      </>
                    ) : (
                      t("dashboard.products.editModal.action")
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Delete Confirmation Modal */}
        {deletingProduct && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-8 text-center border-4 border-black">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 border-2 border-red-200">
                <Trash2 className="w-8 h-8" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.products.delete.title")}</h3>
              <p className="text-gray-500 text-base font-medium mb-8">
                {t("dashboard.products.delete.body", { title: deletingProduct.title })}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeletingProduct(null)}
                  className="flex-1 py-3.5 bg-white border-2 border-gray-200 text-gray-500 font-bold rounded-full hover:border-black hover:text-black transition-colors"
                >
                  {t("dashboard.products.delete.cancel")}
                </button>
                <button
                  onClick={handleDeleteProduct}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 bg-red-600 text-white font-black rounded-full hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("dashboard.products.delete.action")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Stripe Not Connected Popup */}
        {showStripePopup && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full p-8 relative animate-in zoom-in-95 duration-200 border-4 border-black">
              <button
                onClick={() => setShowStripePopup(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-black border-2 border-transparent hover:border-black"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 bg-[#635BFF]/10 rounded-2xl flex items-center justify-center border-2 border-[#635BFF]/20">
                  <CreditCard className="w-8 h-8 text-[#635BFF]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.products.stripe.title")}</h3>
                  <p className="text-base text-gray-500 font-bold">{t("dashboard.products.stripe.subtitle")}</p>
                </div>
              </div>

              <p className="text-gray-600 font-medium text-lg leading-relaxed mb-8">
                {t("dashboard.products.stripe.body")}
              </p>

              <div className="flex gap-4">
                <a
                  href="/dashboard/integrations"
                  className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-[#635BFF] text-white rounded-full font-black text-lg hover:bg-[#635BFF]/90 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  {t("dashboard.products.stripe.cta")}
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setShowStripePopup(false)}
                  className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 text-gray-500 rounded-full font-bold hover:text-black hover:border-black transition-colors"
                >
                  {t("dashboard.products.stripe.close")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </AuthorizationGuard>
  );
}
