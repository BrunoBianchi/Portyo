import type { MetaFunction } from "react-router";
import { useState, useEffect, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, ShoppingBag, MoreVertical, Image as ImageIcon, DollarSign, Link as LinkIcon, Loader2, X, Edit2, Trash2, ExternalLink, CreditCard } from "lucide-react";
import { api } from "~/services/api";
import BioContext from "~/contexts/bio.context";
import { AuthorizationGuard } from "~/contexts/guard.context";
import AuthContext from "~/contexts/auth.context";
import { PLAN_LIMITS } from "~/constants/plan-limits";
import type { PlanType } from "~/constants/plan-limits";

export const meta: MetaFunction = () => {
  return [
    { title: "Products | Portyo" },
    { name: "description", content: "Manage your product catalog." },
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
  const { bio } = useContext(BioContext);
  const { user } = useContext(AuthContext);
  const userPlan = (user?.plan || 'free') as PlanType;
  const storeFee = PLAN_LIMITS[userPlan]?.storeFee ?? 0.025;
  const storeFeePercent = storeFee * 100;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        setCreateError(error.response?.data?.message || "Failed to create product. Please try again.");
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
      setEditError(error.response?.data?.message || "Failed to update product");
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
      alert(error.response?.data?.message || "Failed to delete product");
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
      <div className="p-6 max-w-7xl mx-auto">
        {/* ... (Header and Banner code unchanged) ... */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
            <p className="text-gray-500 mt-1">Manage your digital products and services.</p>
          </div>
          <button
            onClick={() => setIsCreateProductModalOpen(true)}
            className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200"
          >
            <Plus className="w-5 h-5" /> Add Product
          </button>
        </div>

        {/* ... (Store Fee Banner and Search) ... */}
        {storeFee > 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">transaction Fee: {storeFeePercent}%</h3>
                <p className="text-sm text-blue-700">Upgrade to Pro to remove transaction fees.</p>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition"
              onClick={() => window.open('/dashboard/settings', '_self')}
            >
              Upgrade
            </button>
          </div>
        )}

        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-8 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
            />
          </div>
          <select className="px-6 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black cursor-pointer">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden relative">
                {/* ... (Product Card content unchanged) ... */}
                <div className="p-2">
                  <div className="aspect-square relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50/50">
                        <ImageIcon className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`pl-2 pr-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-xl border shadow-sm flex items-center gap-1.5 ${product.status === 'active'
                        ? 'bg-white/80 text-green-700 border-green-100'
                        : 'bg-white/80 text-gray-600 border-gray-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {product.status === 'active' ? 'Active' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1 flex flex-col flex-1">
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900 text-base mb-0.5 truncate tracking-tight" title={product.title}>{product.title}</h3>
                    <p className="text-xs text-gray-500 font-medium">Digital Product</p>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-px">Price</span>
                      <span className="text-lg font-bold text-gray-900 tracking-tight">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price)}
                      </span>
                    </div>

                    <div className="flex gap-1.5 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === product.id ? null : product.id); }}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all focus:outline-none"
                        aria-label="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === product.id && (
                        <div ref={menuRef} className="absolute bottom-11 right-0 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                          <button
                            onClick={() => { setDeletingProduct(product); setOpenMenuId(null); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => openEditModal(product)}
                        className="h-9 px-4 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Placeholder */}
            <button
              onClick={() => setIsCreateProductModalOpen(true)}
              className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 p-6 hover:border-black/20 hover:bg-gray-50/50 transition-all group h-full min-h-[320px]"
            >
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-black group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 border border-gray-100">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 text-base mb-0.5">Add New Product</p>
                <p className="text-xs text-gray-500">Create a new digital product</p>
              </div>
            </button>
          </div>
        )}

        {/* Create Product Modal */}
        {isCreateProductModalOpen && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Create Product</h3>
                <button
                  onClick={() => setIsCreateProductModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
                {createError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {createError}
                  </div>
                )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <div className="border border-gray-200 rounded-lg p-2 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {createImagePreview ? (
                        <img src={createImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      onChange={handleCreateFileChange}
                      accept="image/*"
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
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

        {/* Edit Product Modal */}
        {editingProduct && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Edit Product</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
                {editError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {editError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                  <input
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        {editFormData.currency === 'usd' ? '$' : editFormData.currency === 'eur' ? '€' : editFormData.currency === 'gbp' ? '£' : editFormData.currency.toUpperCase()}
                      </span>
                      <input
                        required
                        type="number"
                        min="0.50"
                        step="0.01"
                        value={editFormData.price}
                        onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value={editFormData.currency}
                      onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <div className="border border-gray-200 rounded-lg p-2 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {editImagePreview ? (
                        <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      onChange={handleEditFileChange}
                      accept="image/*"
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-700">"{deletingProduct.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingProduct(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Stripe Not Connected Popup */}
        {showStripePopup && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowStripePopup(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Stripe Not Connected</h3>
                  <p className="text-sm text-gray-500">Connect to sell products</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                To create and sell products, you need to connect your Stripe account first. Go to Integrations and set up your Stripe connection.
              </p>

              <div className="flex gap-3">
                <a
                  href="/dashboard/integrations"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                >
                  Go to Integrations
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setShowStripePopup(false)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
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
