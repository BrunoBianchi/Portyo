import type { MetaFunction } from "react-router";
import { useState } from "react";
import { Plus, Search, ShoppingBag, MoreVertical, Image as ImageIcon, DollarSign, Link as LinkIcon } from "lucide-react";

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
  image: string;
  status: "active" | "draft";
  sales: number;
}

export default function DashboardProducts() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      title: "Digital Marketing Guide 2025",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      status: "active",
      sales: 124
    },
    {
      id: "2",
      title: "1-on-1 Coaching Session",
      price: 150.00,
      image: "https://images.unsplash.com/photo-1515168816144-1064ba8b308b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      status: "active",
      sales: 45
    },
    {
      id: "3",
      title: "Preset Pack Vol. 1",
      price: 19.00,
      image: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      status: "draft",
      sales: 0
    }
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-500 mt-1">Manage your digital products and services.</p>
        </div>
        <button className="px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
          />
        </div>
        <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="aspect-square relative bg-gray-100">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-1 truncate">{product.title}</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                <span className="text-xs text-gray-500">{product.sales} sales</span>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200">
                  Edit
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" aria-label="More options">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Placeholder */}
        <button className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 hover:border-gray-400 hover:bg-gray-50 transition-all group h-full min-h-[300px]">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all">
            <Plus className="w-6 h-6" />
          </div>
          <p className="font-medium text-gray-500 group-hover:text-gray-900">Add New Product</p>
        </button>
      </div>
    </div>
  );
}
