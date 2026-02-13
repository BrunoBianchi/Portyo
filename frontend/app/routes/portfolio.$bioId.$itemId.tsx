import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "~/services/api";

interface Category {
  id: string;
  name: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  category: Category | null;
}

export default function PortfolioItemPublicPage() {
  const { bioId, itemId } = useParams();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    if (!bioId || !itemId) return;

    let cancelled = false;

    api
      .get(`/portfolio/${bioId}`)
      .then((response) => {
        if (cancelled) return;
        const payload = response.data;
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        setItem(items.find((entry: PortfolioItem) => entry.id === itemId) || null);
      })
      .catch(() => {
        if (!cancelled) setItem(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bioId, itemId]);

  const coverImage = useMemo(() => item?.images?.[0] || "", [item]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F3F3F1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-[#F3F3F1] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white border-2 border-black rounded-2xl p-6 text-center">
          <p className="text-lg font-bold text-[#1A1A1A] mb-3">Projeto não encontrado</p>
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

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-[#1A1A1A] leading-tight">{item.title}</h1>
          {item.category?.name ? (
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold border border-black/20 bg-black/5 text-black/70">
              {item.category.name}
            </span>
          ) : null}
        </div>

        {coverImage ? (
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
            <img src={coverImage} alt={item.title} className="w-full h-auto object-cover" />
          </div>
        ) : null}

        {item.description ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item.description}</p>
        ) : (
          <p className="text-sm text-gray-500">Sem descrição disponível.</p>
        )}

        {item.images?.length > 1 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {item.images.slice(1).map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt={`${item.title} ${index + 2}`}
                className="w-full h-32 object-cover rounded-xl border border-gray-200"
              />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
