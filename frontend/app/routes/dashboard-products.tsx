import type { MetaFunction } from "react-router";
import { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, ShoppingBag, MoreVertical, Image as ImageIcon, DollarSign, Link as LinkIcon, Loader2, X } from "lucide-react";
import { api } from "~/services/api";
import BioContext from "~/contexts/bio.context";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newProductData, setNewProductData] = useState({
    title: "",
    price: "",
    currency: "usd",
    image: ""
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bio?.id) return;
    
    setCreateError(null);
    setIsCreatingProduct(true);
    try {
      const res = await api.post("/stripe/create-product", {
        bioId: bio.id,
        title: newProductData.title,
        price: parseFloat(newProductData.price),
        currency: newProductData.currency,
        image: newProductData.image
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
    } catch (error: any) {
      console.error("Failed to create product", error);
      setCreateError(error.response?.data?.message || "Failed to create product. Please try again.");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
        if (!bio?.id) return;
        setIsLoading(true);
        try {
            const res = await api.get(`/stripe/products?bioId=${bio.id}`);
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchProducts();
  }, [bio?.id]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-500 mt-1">Manage your digital products and services.</p>
        </div>
        <button className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200">
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* Search and Filter */}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden relative">
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
                  <span className={`pl-2 pr-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-xl border shadow-sm flex items-center gap-1.5 ${
                    product.status === 'active' 
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
                
                <div className="flex gap-1.5">
                  <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all" aria-label="More options">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <button className="h-9 px-4 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5">
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
                            onChange={(e) => setNewProductData({...newProductData, title: e.target.value})}
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
                                    onChange={(e) => setNewProductData({...newProductData, price: e.target.value})}
                                    className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                            <select
                                value={newProductData.currency}
                                onChange={(e) => setNewProductData({...newProductData, currency: e.target.value})}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                        <input
                            value={newProductData.image}
                            onChange={(e) => setNewProductData({...newProductData, image: e.target.value})}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="https://..."
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
    </div>
  );
}
