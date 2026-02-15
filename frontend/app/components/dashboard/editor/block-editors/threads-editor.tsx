import { useTranslation } from "react-i18next";
import { useContext, useEffect, useMemo, useState } from "react";
import type { BioBlock } from "~/contexts/bio.context";
import BioContext from "~/contexts/bio.context";
import { api } from "~/services/api";
import { ThreadsPreview } from "../integration-selectors/threads-preview";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function ThreadsBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");
  const { bio } = useContext(BioContext);
  const [connectedUsername, setConnectedUsername] = useState("");
  const [checkingIntegration, setCheckingIntegration] = useState(false);

  const effectiveBioId = block.bioId || bio?.id || null;

  useEffect(() => {
    const loadThreadsIntegration = async () => {
      if (!effectiveBioId) {
        setConnectedUsername("");
        return;
      }

      setCheckingIntegration(true);
      try {
        const response = await api.get(`/integration`, { params: { bioId: effectiveBioId } });
        const integrations = Array.isArray(response.data) ? response.data : [];
        const threadsIntegration = integrations.find((item: any) => {
          const provider = String(item?.provider || "").toLowerCase();
          const name = String(item?.name || "").toLowerCase();
          return provider === "threads" || name.includes("threads");
        });

        const resolvedUsername = String(threadsIntegration?.name || "")
          .replace(/^@+/, "")
          .trim();

        setConnectedUsername(resolvedUsername);

        if (resolvedUsername && block.threadsUsername !== resolvedUsername) {
          onChange({ threadsUsername: resolvedUsername });
        }
      } catch (error) {
        console.error("Failed to load threads integration", error);
        setConnectedUsername("");
      } finally {
        setCheckingIntegration(false);
      }
    };

    loadThreadsIntegration();
  }, [effectiveBioId]);

  const isConnected = useMemo(() => connectedUsername.length > 0, [connectedUsername]);

  const openThreadsConnectPopup = () => {
    if (!effectiveBioId) return;
    const returnTo = window.location.origin;
    const authUrl = `/api/threads/auth?bioId=${encodeURIComponent(effectiveBioId)}&returnTo=${encodeURIComponent(returnTo)}`;
    window.open(authUrl, "threads-connect", "width=620,height=780,noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block text-xs font-black uppercase tracking-wider ml-1">
          {t("editor.editDrawer.fields.instagramUsernameLabel", { defaultValue: "Username" })}
        </label>

        <div className="w-full p-4 bg-white border-2 border-black rounded-xl">
          {checkingIntegration ? (
            <p className="text-sm font-medium text-gray-500">Verificando conexão do Threads...</p>
          ) : isConnected ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-black">Conta conectada: @{connectedUsername}</p>
              <button
                type="button"
                onClick={openThreadsConnectPopup}
                className="px-3 py-2 border-2 border-black rounded-lg text-xs font-black bg-white hover:bg-gray-50"
              >
                Reconectar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-500">
                Conecte seu Threads para carregar o feed oficial da API.
              </p>
              <button
                type="button"
                onClick={openThreadsConnectPopup}
                className="px-3 py-2 border-2 border-black rounded-lg text-xs font-black bg-black text-white hover:bg-gray-900"
              >
                Conectar Threads
              </button>
            </div>
          )}
        </div>
      </div>

      <ThreadsPreview bioId={effectiveBioId} username={connectedUsername || block.threadsUsername} />
    </div>
  );
}
