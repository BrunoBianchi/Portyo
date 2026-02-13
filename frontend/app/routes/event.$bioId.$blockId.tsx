import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft, CalendarDays, ExternalLink } from "lucide-react";

export default function EventPublicPage() {
  const { bioId, blockId } = useParams();
  const [searchParams] = useSearchParams();

  const title = searchParams.get("title") || "Evento";
  const eventDate = searchParams.get("date") || "";
  const buttonText = searchParams.get("buttonText") || "Ver detalhes";
  const buttonUrl = searchParams.get("buttonUrl") || "";

  if (!bioId || !blockId) {
    return (
      <main className="min-h-screen bg-[#F3F3F1] flex items-center justify-center px-4">
        <div className="bg-white border-2 border-black rounded-2xl p-6 text-center">Evento inválido.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3F3F1] py-10 px-4">
      <div className="w-full max-w-xl mx-auto space-y-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="bg-white border-2 border-black rounded-2xl p-6 md:p-8 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/20 bg-black/5 text-xs font-semibold text-black/70">
            <CalendarDays className="w-3.5 h-3.5" /> Página do Evento
          </div>

          <h1 className="text-3xl font-black text-[#1A1A1A] leading-tight">{title}</h1>

          {eventDate ? (
            <p className="text-sm text-gray-700">
              {new Date(eventDate).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Data não informada.</p>
          )}

          {buttonUrl ? (
            <a
              href={buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-black bg-[#C6F035] text-black font-black"
            >
              {buttonText} <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <p className="text-sm text-gray-500">Este evento não possui link externo configurado.</p>
          )}
        </div>
      </div>
    </main>
  );
}
