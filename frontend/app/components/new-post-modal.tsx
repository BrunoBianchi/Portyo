import { 
  X, Upload, FileText, Video, Mic, BookOpen, 
  Bold, Italic, Underline, Code, Link as LinkIcon, List, 
  AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, 
  Settings, Plus, Sparkles, Info, Calendar
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CustomDatePicker } from "./custom-date-picker";

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PostMode = "upload" | "write";

export function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
  const [activeMode, setActiveMode] = useState<PostMode>("upload");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // For markdown
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>(["Design", "Blog"]);
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = content;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + selection + suffix + after;
    setContent(newText);
    
    // Restore focus and selection
    setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
        }
    }, 0);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        New Post
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">Create or upload content for your blog</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="bg-gray-100 p-1 rounded-lg inline-flex w-full">
                <button
                    onClick={() => setActiveMode("upload")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeMode === "upload" 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    <Upload className="w-4 h-4" />
                    <span>Upload File</span>
                </button>
                <button
                    onClick={() => setActiveMode("write")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeMode === "write" 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    <span>Write Article</span>
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-6 space-y-6 custom-scrollbar">
            
            {/* Upload Area (Only in Upload Mode) */}
            {activeMode === "upload" && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all group bg-white min-h-[200px]"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-5 h-5 text-gray-600" />
                    </div>
                    {file ? (
                        <div>
                            <p className="text-base font-bold text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-base font-bold text-gray-900 mb-1">Upload your blog file</p>
                            <p className="text-xs text-gray-500 font-medium">
                                HTML, Markdown, or PDF (10 mb max)
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 ml-1">Post Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. The Future of Design"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm placeholder:text-gray-400"
                    />
                </div>
                <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                        <label className="text-xs font-semibold text-gray-700">Publish Time</label>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 h-[42px]">
                        <button 
                            onClick={() => setScheduleMode("now")}
                            className={`flex-1 h-full rounded-md text-xs font-medium transition-all ${
                                scheduleMode === "now" 
                                ? "bg-white text-gray-900 shadow-sm" 
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            Now
                        </button>
                        <div 
                            ref={datePickerRef}
                            className={`flex-[2] h-full relative rounded-md transition-all flex items-center px-3 gap-2 cursor-pointer ${
                                scheduleMode === "later" 
                                ? "bg-white text-gray-900 shadow-sm" 
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                            onClick={() => setShowDatePicker(!showDatePicker)}
                        >
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="text-xs font-medium truncate">
                                {scheduledDate 
                                    ? scheduledDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                                    : "Select date..."}
                            </span>
                            
                            {showDatePicker && (
                                <div className="absolute top-full right-0 mt-2 z-50" onClick={(e) => e.stopPropagation()}>
                                    <CustomDatePicker 
                                        value={scheduledDate}
                                        onChange={(date) => {
                                            setScheduledDate(date);
                                            setScheduleMode("later");
                                            // Don't close automatically to allow time selection
                                        }}
                                        minDate={new Date()}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Thumbnail Input (Only in Upload Mode) */}
            {activeMode === "upload" && (
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 ml-1">Thumbnail / Cover Image</label>
                    <div 
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer flex items-center gap-3 group"
                    >
                        <input
                            type="file"
                            ref={thumbnailInputRef}
                            onChange={handleThumbnailChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <ImageIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        {thumbnail ? (
                            <span className="text-sm font-medium text-gray-900">{thumbnail.name}</span>
                        ) : (
                            <span className="text-sm text-gray-400">Click to upload thumbnail...</span>
                        )}
                    </div>
                </div>
            )}

            {/* Markdown Editor (Only in Write Mode) */}
            {activeMode === "write" && (
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 ml-1">
                        Content <span className="text-red-500">*</span>
                    </label>
                    
                    <div className="relative group border border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all overflow-hidden">
                        {/* Fixed Toolbar inside container */}
                        <div className="flex items-center gap-1 p-1.5 border-b border-gray-100 bg-gray-50">
                            <button onClick={() => insertMarkdown("**", "**")} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-700 hover:text-black" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                            <button onClick={() => insertMarkdown("*", "*")} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-700 hover:text-black" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                            <button onClick={() => insertMarkdown("<u>", "</u>")} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-700 hover:text-black" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                            <button onClick={() => insertMarkdown("`", "`")} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-700 hover:text-black" title="Code"><Code className="w-3.5 h-3.5" /></button>
                            <button onClick={() => insertMarkdown("[", "](url)")} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-700 hover:text-black" title="Link"><LinkIcon className="w-3.5 h-3.5" /></button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                            <button onClick={() => insertMarkdown("\n- ")} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-700 hover:text-black" title="List"><List className="w-3.5 h-3.5" /></button>
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your article here..."
                            className="w-full h-[200px] px-4 py-3 bg-transparent focus:outline-none font-mono text-sm resize-none leading-relaxed"
                        />
                    </div>
                </div>
            )}

            {/* Tags */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-semibold text-gray-700">Tags</label>
                    <span className="text-xs text-gray-400">12 tags remaining</span>
                </div>
                <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-200 rounded-lg min-h-[46px] items-center focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all">
                    {tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-900 border border-transparent">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                        </span>
                    ))}
                    <input 
                        type="text" 
                        placeholder="Add tags..." 
                        className="bg-transparent border-none focus:outline-none text-xs px-2 py-1 min-w-[80px] flex-1 font-medium placeholder:text-gray-400"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val && !tags.includes(val)) {
                                    setTags([...tags, val]);
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }
                        }}
                    />
                </div>
                <div className="flex gap-2 mt-1">
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white">
                        <Plus className="w-3 h-3" /> Photography
                    </button>
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white">
                        <Plus className="w-3 h-3" /> AI Art
                    </button>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]"></div>
                <span className="text-xs font-medium text-gray-600">Saved as a draft</span>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                    Cancel
                </button>
                <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-black hover:bg-gray-800 transition-all shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5">
                    Schedule Post
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
