/**
 * Block System Demo Route
 * Dentro do dashboard para teste imediato
 */

import { useState } from "react";
import { 
  useBlockRegistry, 
  useBlockRenderer,
  registry,
  type NewBlock 
} from "../blocks";

// Sample blocks for testing
const sampleBlocks: NewBlock[] = [
  {
    id: "block-1",
    type: "heading",
    version: 2,
    data: {
      title: "🎉 Block System V2 Funcionando!",
      level: 1,
      align: "center"
    }
  },
  {
    id: "block-2",
    type: "text",
    version: 2,
    data: {
      text: "Esta é uma demonstração do novo sistema de blocos baseado na arquitetura de 4 pilares: Registry, Tokens, Islands e Schemas.",
      align: "center"
    }
  },
  {
    id: "block-3",
    type: "button",
    version: 2,
    data: {
      title: "Botão de Teste",
      href: "https://example.com",
      style: "solid",
      shape: "rounded",
      openInNewTab: true
    }
  },
  {
    id: "block-4",
    type: "divider",
    version: 2,
    data: { style: "line" }
  },
  {
    id: "block-5",
    type: "image",
    version: 2,
    data: {
      src: "https://via.placeholder.com/600x300/3b82f6/ffffff?text=Block+System",
      alt: "Demo",
      caption: "Imagem de exemplo"
    }
  }
];

// Mock bio data
const mockBio = {
  id: "demo-bio",
  sufix: "demo",
  username: "Demo User",
  bgColor: "#f8fafc",
  usernameColor: "#111827",
  buttonColor: "#3b82f6",
  buttonTextColor: "#ffffff",
  cardBackgroundColor: "#ffffff",
  cardOpacity: 100,
  cardBorderRadius: 12
};

export default function DashboardBlocksPage() {
  const { blockTypes } = useBlockRegistry();
  const [blocks, setBlocks] = useState<NewBlock[]>(sampleBlocks);
  
  const { tokens, renderedBlocks, errors, isLoading } = useBlockRenderer(
    mockBio,
    blocks,
    { isEditor: false }
  );

  const addBlock = (type: string) => {
    const definition = registry.get(type);
    if (!definition) return;
    
    const newBlock: NewBlock = {
      id: `block-${Date.now()}`,
      type,
      version: definition.version,
      data: { ...definition.defaultData }
    };
    
    setBlocks(prev => [...prev, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🧱 Block System V2</h1>
          <p className="text-gray-600 mt-2">
            Sistema de blocos com arquitetura de 4 pilares funcionando!
          </p>
        </header>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Status do Sistema</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{blockTypes.length}</div>
              <div className="text-sm text-blue-600/70">Tipos de Blocos</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{Object.keys(tokens).length}</div>
              <div className="text-sm text-green-600/70">Tokens de Tema</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{blocks.length}</div>
              <div className="text-sm text-purple-600/70">Blocos na Página</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{errors.length}</div>
              <div className="text-sm text-red-600/70">Erros</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h2 className="text-lg font-semibold mb-4">Editor de Blocos</h2>
              
              {/* Add Block */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['button', 'heading', 'text', 'divider', 'image'].map(type => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm capitalize transition-colors"
                  >
                    + {type}
                  </button>
                ))}
              </div>

              {/* Block List */}
              <div className="space-y-2">
                {blocks.map((block, index) => (
                  <div 
                    key={block.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-gray-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                        <span className="font-medium capitalize">{block.type}</span>
                      </div>
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  Renderizando...
                </div>
              ) : errors.length > 0 ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                  <h3 className="font-semibold">Erros:</h3>
                  {errors.map((e, i) => (
                    <div key={i} className="text-sm mt-1">
                      Block {e.id}: {e.message}
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  className="preview-container p-6 rounded-lg"
                  style={{
                    backgroundColor: tokens['--bg-primary'],
                    color: tokens['--text-primary'],
                  }}
                >
                  {renderedBlocks.map(({ id, output }) => (
                    <div 
                      key={id}
                      dangerouslySetInnerHTML={{ __html: output.html }}
                      className="mb-4"
                    />
                  ))}
                </div>
              )}

              {/* Tokens */}
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-600">
                  Ver Tokens ({Object.keys(tokens).length})
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-48">
                  {JSON.stringify(tokens, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Sistema de Blocos V2 • Portyo Architecture</p>
          <p className="mt-1">4 Pilares: Registry • Tokens • Islands • Schemas</p>
        </footer>
      </div>
    </div>
  );
}
