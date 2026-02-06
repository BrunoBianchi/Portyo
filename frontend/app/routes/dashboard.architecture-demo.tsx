import { useState } from "react";
import type { MetaFunction } from "react-router";
import { ButtonBlock } from "~/blocks/button/button.component";
import { buttonSchema } from "~/blocks/button/button.schema";
import { buttonTokens } from "~/blocks/tokens/button-tokens";

export const meta: MetaFunction = () => {
  return [{ title: "Architecture Demo | Portyo" }];
};

// --- AutoForm Component (PoC) ---
const AutoForm = ({ schema, data, onChange }: { schema: any, data: any, onChange: (newData: any) => void }) => {
  const handleChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="font-bold text-lg mb-4">Auto-Generated Form</h3>
      {Object.entries(schema).map(([key, field]: [string, any]) => {
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{field.label || key}</label>
            
            {field.type === 'text' && (
              <input 
                type="text" 
                value={data[key] !== undefined ? data[key] : (field.default || '')}
                onChange={(e) => handleChange(key, e.target.value)}
                className="border p-2 rounded w-full"
              />
            )}

            {field.type === 'select' && (
              <select 
                value={data[key] !== undefined ? data[key] : (field.default || '')}
                onChange={(e) => handleChange(key, e.target.value)}
                className="border p-2 rounded w-full"
              >
                {field.options.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            
            {field.type === 'boolean' && (
              <div className="flex items-center gap-2">
                 <input 
                    type="checkbox"
                    checked={data[key] !== undefined ? data[key] : (field.default || false)}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className="h-4 w-4"
                 />
                 <span className="text-sm text-gray-500">Enable</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function ArchitectureDemo() {
  const [blockData, setBlockData] = useState<any>({
    text: "Click Me",
    url: "https://example.com",
    variant: "primary",
    size: "md",
    isFullWidth: false
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Phase 1: Architecture Prototype</h1>
      <p className="mb-8 text-gray-600">Demonstrating Schema-Driven Forms & Token-Based Components</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Editor Panel */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Editor (AutoForm)</h2>
          <div className="bg-gray-50 p-4 rounded-xl">
             <AutoForm 
                schema={buttonSchema}
                data={blockData}
                onChange={setBlockData}
             />
             
             <div className="mt-4 p-4 bg-gray-800 text-gray-200 text-xs rounded overflow-auto">
                <pre>{JSON.stringify(blockData, null, 2)}</pre>
             </div>
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Live Preview (Unified Component)</h2>
          
          {/* Simulation of the Wrapper/Theme/CSS Variable Scope */}
          <div 
            className="preview-canvas border-2 border-dashed border-gray-300 rounded-xl p-12 flex items-center justify-center bg-white min-h-[300px]"
            style={buttonTokens as any} // Direct injection of tokens as CSS vars for this scope
          >
             <ButtonBlock data={blockData} />
          </div>

          <div className="mt-6">
            <h3 className="font-bold mb-2">How it works:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li><strong>AutoForm:</strong> Reads <code>button.schema.ts</code> to generate the inputs on the left.</li>
                <li><strong>State:</strong> React state manages the JSON data object.</li>
                <li><strong>Unified Component:</strong> <code>ButtonBlock</code> receives the JSON data prop.</li>
                <li><strong>Tokens:</strong> CSS Custom Properties (Variables) ensure styling consistency.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
