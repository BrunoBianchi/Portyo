import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  image?: string;
  imageUrl?: string;
}

const formatPrice = (price: number, currency = "BRL") => {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(price / 100);
  } catch {
    return `R$ ${(price / 100).toFixed(2)}`;
  }
};

export default function ProductPublicPage() {
  const { bioId, productId } = useParams();
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!bioId || !productId) return;

    let cancelled = false;
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    fetch(`${origin}/api/public/products/${bioId}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data) ? data : data?.products || [];
        const found = items.find((item: Product) => item.id === productId) || null;
        setProduct(found);
      })
      .catch(() => {
        if (!cancelled) setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bioId, productId]);

  const imageSrc = useMemo(() => product?.image || product?.imageUrl || "", [product]);

  const handleBuy = async () => {
    if (!bioId || !productId || buying) return;
    setBuying(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const response = await fetch(`${origin}/api/public/stripe/generate-product-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, bioId }),
      });
      const data = await response.json();
      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer,width=700,height=900");
      }
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F3F3F1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#F3F3F1] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white border-2 border-black rounded-2xl p-6 text-center">
          <p className="text-lg font-bold text-[#1A1A1A] mb-3">Produto não encontrado</p>
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black rounded-xl font-semibold">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3F3F1] py-10 px-4">
      <div className="w-full max-w-3xl mx-auto bg-white border-2 border-black rounded-2xl p-6 md:p-8 space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="grid md:grid-cols-[1.15fr_1fr] gap-6 items-start">
          <div className="rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 aspect-square">
            {imageSrc ? (
              <img src={imageSrc} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ShoppingBag className="w-10 h-10" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-black text-[#1A1A1A] leading-tight">{product.title}</h1>
            {product.description ? (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{product.description}</p>
            ) : null}
            <p className="text-2xl font-black text-[#1A1A1A]">{formatPrice(product.price, product.currency)}</p>

            <button
              type="button"
              onClick={handleBuy}
              disabled={buying}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-black bg-[#C6F035] text-black font-black disabled:opacity-60"
            >
              {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />} Comprar agora
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
