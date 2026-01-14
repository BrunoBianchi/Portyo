
$path = "c:\Users\bruno\Desktop\portyo\frontend\app\routes\dashboard-editor.tsx"
$content = Get-Content $path -Raw
$content = $content.Replace("const [blocks, setBlocks] = useState<Block[]>([]);", "const [blocks, setBlocks] = useState<Block[]>([]);`n  const [showMobilePreview, setShowMobilePreview] = useState(false);")
$content = $content.Replace("className=`"col-span-12 lg:col-span-4 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden items-center relative`"", "className=`"hidden lg:flex lg:col-span-4 flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden items-center relative`"")
$fab = @"
      {/* Mobile Preview FAB */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowMobilePreview(true)}
          className="bg-gray-900 text-white p-4 rounded-full shadow-xl hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center border border-white/20"
          aria-label="Preview Bio"
        >
          <Eye className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Preview Modal */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-sm animate-in slide-in-from-bottom duration-300 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white shadow-sm">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Preview
            </h3>
            <button
              onClick={() => setShowMobilePreview(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden p-4 bg-gray-100 flex items-center justify-center">
             <div className="w-full h-full max-w-[375px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-gray-900 relative">
                <iframe
                  srcDoc={debouncedHtml || ""}
                  className="w-full h-full scrollbar-hide border-none bg-white"
                  title="Mobile Preview"
                  sandbox="allow-same-origin allow-scripts"
                />
             </div>
          </div>
        </div>
      )}

      {/* Modals & Popups */}
"@
$content = $content.Replace("{/* Modals & Popups */}", $fab)
$content | Set-Content $path -Encoding UTF8
