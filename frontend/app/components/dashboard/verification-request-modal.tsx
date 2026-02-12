import { memo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, Clock, Shield, Loader2, BadgeCheck, Sparkles } from "lucide-react";
import { api } from "~/services/api";

interface VerificationRequestModalProps {
  bioId: string;
  verified: boolean;
  verificationStatus: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const VerificationRequestModal = memo(function VerificationRequestModal({
  bioId,
  verified,
  verificationStatus,
  onClose,
  onSuccess,
}: VerificationRequestModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (loading) return;

      setError(null);
      setLoading(true);

      try {
        await api.post(`/bio/verification-request/${bioId}`, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          description: description.trim() || undefined,
        });
        setSuccess(true);
        onSuccess();
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          "Falha ao enviar solicitação. Tente novamente.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [bioId, name, email, phone, description, loading, onSuccess]
  );

  // Already verified
  if (verified) {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center py-6 sm:py-8">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <BadgeCheck className="w-9 h-9 text-white" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Página verificada!</h3>
          <p className="text-sm text-gray-500 font-medium max-w-[260px] mx-auto leading-relaxed">
            Sua página já possui o selo de verificação e autenticidade.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-8 py-3 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-black transition-colors border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5"
          >
            Fechar
          </button>
        </div>
      </Overlay>
    );
  }

  // Pending review
  if (verificationStatus === "pending" && !success) {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center py-6 sm:py-8">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse opacity-40" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Clock className="w-9 h-9 text-white" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Em análise</h3>
          <p className="text-sm text-gray-500 font-medium max-w-[280px] mx-auto leading-relaxed">
            Sua solicitação está sendo analisada pela nossa equipe.
            Você será notificado quando houver uma atualização.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-8 py-3 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-black transition-colors border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5"
          >
            Entendi
          </button>
        </div>
      </Overlay>
    );
  }

  // Success state
  if (success) {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center py-6 sm:py-8">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <CheckCircle className="w-9 h-9 text-white" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Solicitação enviada!</h3>
          <p className="text-sm text-gray-500 font-medium max-w-[280px] mx-auto leading-relaxed">
            Recebemos sua solicitação. Nossa equipe irá analisar
            seus dados e você será notificado em breve.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-8 py-3 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-black transition-colors border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5"
          >
            Fechar
          </button>
        </div>
      </Overlay>
    );
  }

  // Request form
  return (
    <Overlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">Solicitar verificação</h3>
          <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
            Comprove sua identidade para obter o selo
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-3.5 sm:p-4 mb-5">
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
              <BadgeCheck className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-blue-900 mb-0.5">O que é a verificação?</p>
            <p className="text-[11px] sm:text-xs text-blue-600/80 leading-relaxed">
              O selo confirma que sua página é autêntica e pertence a quem diz ser.
              Aumenta a confiança dos visitantes e dá credibilidade ao seu perfil.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
        <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 mb-1 block">
              Nome completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              placeholder="Seu nome completo"
              className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 focus:border-black focus:bg-white rounded-xl font-bold text-sm outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
            />
          </div>

          <div>
            <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 mb-1 block">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 focus:border-black focus:bg-white rounded-xl font-bold text-sm outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 mb-1 block">
            Telefone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+55 (11) 99999-9999"
            className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 focus:border-black focus:bg-white rounded-xl font-bold text-sm outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
          />
        </div>

        <div>
          <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 mb-1 block">
            Por que você merece o selo?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Descreva quem você é, sua profissão, links de redes sociais que comprovem sua identidade..."
            className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 focus:border-black focus:bg-white rounded-xl font-bold text-sm outline-none transition-all placeholder:text-gray-300 placeholder:font-medium resize-none"
          />
          <p className="text-[10px] text-gray-400 font-medium mt-1 leading-relaxed">
            Inclua links de redes sociais, site profissional ou qualquer outra informação que ajude na verificação
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
            <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm text-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim()}
            className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 disabled:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Enviar solicitação
              </>
            )}
          </button>
        </div>
      </form>
    </Overlay>
  );
});

// Overlay wrapper — uses Portal to render at document.body, escaping any stacking context
function Overlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{
        zIndex: 99999,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[95vw] sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl border-2 border-black sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[0_-4px_24px_rgba(0,0,0,0.1)] p-4 sm:p-6 animate-in sm:fade-in sm:zoom-in-95 slide-in-from-bottom-4 duration-200 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors z-10"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
