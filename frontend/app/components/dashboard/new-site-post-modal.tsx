import {
    X, Upload, FileText, Video, Mic, BookOpen,
    Bold, Italic, Underline, Code, Link as LinkIcon, List,
    AlignLeft, AlignCenter, AlignRight, Image as ImageIcon,
    Settings, Plus, Sparkles, Info, Calendar
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CustomDatePicker } from "./custom-date-picker";
import { useSiteBlog } from "~/contexts/site-blog.context";
import { api } from "~/services/api";

interface NewSitePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post?: any; // Add post prop
}

type PostMode = "upload" | "write";

export function NewSitePostModal({ isOpen, onClose, post }: NewSitePostModalProps) {
    const { createPost, updatePost } = useSiteBlog();
    const [activeMode, setActiveMode] = useState<PostMode>("upload");
    const [activeLanguage, setActiveLanguage] = useState<"en" | "pt">("en");
    const [titles, setTitles] = useState({ en: "", pt: "" });
    const [contents, setContents] = useState({ en: "", pt: "" });
    const [file, setFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | string | null>(null);
    const [tagsByLang, setTagsByLang] = useState<{ en: string[]; pt: string[] }>({
        en: ["Design", "Blog"],
        pt: ["Design", "Blog"],
    });
    const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
    const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (post) {
            const fallbackTitle = post.title || "";
            const fallbackContent = post.content || "";
            const fallbackKeywords = post.keywords ? post.keywords.split(',') : [];

            setTitles({
                en: post.titleEn || fallbackTitle,
                pt: post.titlePt || "",
            });
            setContents({
                en: post.contentEn || fallbackContent,
                pt: post.contentPt || "",
            });
            setTagsByLang({
                en: post.keywordsEn ? post.keywordsEn.split(',') : fallbackKeywords,
                pt: post.keywordsPt ? post.keywordsPt.split(',') : [],
            });
            setThumbnail(post.thumbnail || null);
            setActiveMode("write"); // Default to write mode for editing for now
            if (post.scheduledAt) {
                setScheduledDate(new Date(post.scheduledAt));
                setScheduleMode("later");
            } else {
                setScheduleMode("now");
            }
            if (post.contentPt && !post.contentEn) {
                setActiveLanguage("pt");
            } else {
                setActiveLanguage("en");
            }
        } else {
            // Reset fields if no post (create mode)
            setTitles({ en: "", pt: "" });
            setContents({ en: "", pt: "" });
            setTagsByLang({ en: ["Design", "Blog"], pt: ["Design", "Blog"] });
            setActiveLanguage("en");
            setFile(null);
            setThumbnail(null);
            setScheduleMode("now");
            setScheduledDate(null);
        }
    }, [post, isOpen]);

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

    const handleSchedule = async () => {
        setError(null);
        const activeTitle = titles[activeLanguage];
        const activeContent = contents[activeLanguage];

        if (!activeTitle) {
            setError("Title is required");
            return;
        }
        if (activeMode === "write" && !activeContent) {
            setError("Content is required");
            return;
        }

        setIsSubmitting(true);
        try {
            let thumbnailUrl = post?.thumbnail;

            if (thumbnail && thumbnail instanceof File) {
                const formData = new FormData();
                formData.append("thumbnail", thumbnail);
                const response = await api.post("/user/upload-blog-thumbnail", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                thumbnailUrl = response.data.url;
            } else if (thumbnail === null) {
                thumbnailUrl = null;
            }

            const fallbackTitle = titles.en || titles.pt || "";
            const fallbackContent = contents.en || contents.pt || (activeMode === "write" ? "" : "File upload content placeholder");
            const fallbackKeywords = (tagsByLang.en.length ? tagsByLang.en : tagsByLang.pt).join(",");

            const postData = {
                title: fallbackTitle,
                content: activeMode === "write" ? fallbackContent : "File upload content placeholder",
                keywords: fallbackKeywords,
                titleEn: titles.en || null,
                titlePt: titles.pt || null,
                contentEn: contents.en || null,
                contentPt: contents.pt || null,
                keywordsEn: tagsByLang.en.join(",") || null,
                keywordsPt: tagsByLang.pt.join(",") || null,
                status: scheduleMode === "now" ? "published" : "scheduled",
                scheduledAt: scheduleMode === "later" && scheduledDate ? scheduledDate.toISOString() : null,
                thumbnail: thumbnailUrl,
            };

            if (post) {
                await updatePost(post.id, postData);
            } else {
                await createPost(postData);
            }

            onClose();
            // Reset form
            setTitles({ en: "", pt: "" });
            setContents({ en: "", pt: "" });
            setTagsByLang({ en: ["Design", "Blog"], pt: ["Design", "Blog"] });
            setFile(null);
            setThumbnail(null);
        } catch (error: any) {
            console.error("Failed to save post", error);
            setError(error.message || "Failed to save post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
        const text = contents[activeLanguage] || "";
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + prefix + selection + suffix + after;
        setContents((prev) => ({
            ...prev,
            [activeLanguage]: newText,
        }));

        // Restore focus and selection
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
            }
        }, 0);
    };

    const removeTag = (tagToRemove: string) => {
        setTagsByLang((prev) => ({
            ...prev,
            [activeLanguage]: prev[activeLanguage].filter((tag) => tag !== tagToRemove),
        }));
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border-4 border-black"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="p-6 pb-4 border-b-2 border-black/5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                                {post ? "Edit Site Post" : "New Site Post"}
                            </h2>
                            <p className="text-gray-500 font-medium text-base mt-1">{post ? "Update your site blog content" : "Create content for your main site blog"}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-black border-2 border-transparent hover:border-black">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-600 rounded-xl text-sm font-bold">
                            {error}
                        </div>
                    )}

                    {/* Language Selector */}
                    <div className="flex gap-6 mb-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-black transition-colors ${activeLanguage === "en" ? "border-black" : ""}`}>
                                {activeLanguage === "en" && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                            </div>
                            <input
                                type="radio"
                                name="language"
                                value="en"
                                checked={activeLanguage === "en"}
                                onChange={() => setActiveLanguage("en")}
                                className="hidden"
                            />
                            <span className={`text-sm font-bold transition-colors ${activeLanguage === "en" ? "text-black" : "text-gray-400 group-hover:text-black"}`}>English</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-black transition-colors ${activeLanguage === "pt" ? "border-black" : ""}`}>
                                {activeLanguage === "pt" && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                            </div>
                            <input
                                type="radio"
                                name="language"
                                value="pt"
                                checked={activeLanguage === "pt"}
                                onChange={() => setActiveLanguage("pt")}
                                className="hidden"
                            />
                            <span className={`text-sm font-bold transition-colors ${activeLanguage === "pt" ? "text-black" : "text-gray-400 group-hover:text-black"}`}>Portuguese</span>
                        </label>
                    </div>

                    {/* Mode Toggle */}
                    <div className="bg-[#F3F3F1] p-1.5 rounded-xl inline-flex w-full border-2 border-transparent">
                        <button
                            onClick={() => setActiveMode("upload")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-black transition-all duration-200 ${activeMode === "upload"
                                ? "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                                : "text-gray-400 hover:text-black hover:bg-black/5"
                                }`}
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload File</span>
                        </button>
                        <button
                            onClick={() => setActiveMode("write")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-black transition-all duration-200 ${activeMode === "write"
                                ? "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                                : "text-gray-400 hover:text-black hover:bg-black/5"
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
                            className="border-2 border-dashed border-gray-300 rounded-[24px] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all group bg-white min-h-[220px] mt-6"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="w-16 h-16 rounded-2xl bg-[#F3F3F1] border-2 border-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300 text-gray-400 shadow-sm">
                                <Upload className="w-6 h-6" />
                            </div>
                            {file ? (
                                <div>
                                    <p className="text-lg font-black text-[#1A1A1A]">{file.name}</p>
                                    <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-wider">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-lg font-black text-[#1A1A1A] mb-1">Upload your blog file</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                        HTML, Markdown, or PDF (10 mb max)
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-6 mt-2">
                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Post Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={titles[activeLanguage] || ""}
                                onChange={(e) => setTitles((prev) => ({
                                    ...prev,
                                    [activeLanguage]: e.target.value,
                                }))}
                                placeholder="e.g. The Future of Design"
                                className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-[#F3F3F1] focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-bold text-[#1A1A1A] placeholder:text-gray-400"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider">Publish Time</label>
                            </div>
                            <div className="flex items-center gap-1 bg-[#F3F3F1] rounded-xl p-1.5 h-[50px] border-2 border-transparent">
                                <button
                                    onClick={() => setScheduleMode("now")}
                                    className={`flex-1 h-full rounded-lg text-xs font-bold transition-all uppercase tracking-wide ${scheduleMode === "now"
                                        ? "bg-white text-black shadow-sm border-2 border-black"
                                        : "text-gray-400 hover:text-black"
                                        }`}
                                >
                                    Now
                                </button>
                                <div
                                    ref={datePickerRef}
                                    className={`flex-[2] h-full relative rounded-lg transition-all flex items-center px-3 gap-2 cursor-pointer ${scheduleMode === "later"
                                        ? "bg-white text-black shadow-sm border-2 border-black"
                                        : "text-gray-400 hover:text-black"
                                        }`}
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                >
                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-xs font-bold truncate uppercase tracking-wide">
                                        {scheduledDate
                                            ? scheduledDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            : "Select date..."}
                                    </span>

                                    {showDatePicker && (
                                        <div className="absolute top-full right-0 mt-2 z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden border-2 border-black" onClick={(e) => e.stopPropagation()}>
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

                    {/* Thumbnail Input (Both Modes) */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Thumbnail / Cover Image</label>
                        <div
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-[#F3F3F1] hover:bg-white hover:border-black transition-all cursor-pointer flex items-center gap-4 group"
                        >
                            <input
                                type="file"
                                ref={thumbnailInputRef}
                                onChange={handleThumbnailChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <div className="w-10 h-10 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden group-hover:border-black">
                                {thumbnail ? (
                                    <img
                                        src={thumbnail instanceof File ? URL.createObjectURL(thumbnail) : thumbnail}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-gray-300 group-hover:text-black" />
                                )}
                            </div>
                            {thumbnail ? (
                                <span className="text-sm font-bold text-[#1A1A1A]">
                                    {thumbnail instanceof File ? thumbnail.name : "Current Thumbnail"}
                                </span>
                            ) : (
                                <span className="text-sm text-gray-400 font-bold group-hover:text-black transition-colors">Click to upload thumbnail...</span>
                            )}
                        </div>
                    </div>

                    {/* Markdown Editor (Only in Write Mode) */}
                    {activeMode === "write" && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">
                                Content <span className="text-red-500">*</span>
                            </label>

                            <div className="relative group border-2 border-transparent rounded-xl bg-[#F3F3F1] focus-within:bg-white focus-within:border-black transition-all overflow-hidden">
                                {/* Fixed Toolbar inside container */}
                                <div className="flex items-center gap-1 p-2 border-b-2 border-gray-200 bg-gray-50">
                                    <button onClick={() => insertMarkdown("**", "**")} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500 hover:text-black font-bold" title="Bold"><Bold className="w-4 h-4" /></button>
                                    <button onClick={() => insertMarkdown("*", "*")} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500 hover:text-black font-bold" title="Italic"><Italic className="w-4 h-4" /></button>
                                    <button onClick={() => insertMarkdown("<u>", "</u>")} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500 hover:text-black font-bold" title="Underline"><Underline className="w-4 h-4" /></button>
                                    <div className="w-0.5 h-4 bg-gray-300 mx-1"></div>
                                    <button onClick={() => insertMarkdown("`", "`")} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500 hover:text-black font-bold" title="Code"><Code className="w-4 h-4" /></button>
                                    <button onClick={() => insertMarkdown("[", "](url)")} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500 hover:text-black font-bold" title="Link"><LinkIcon className="w-4 h-4" /></button>
                                    <div className="w-0.5 h-4 bg-gray-300 mx-1"></div>
                                    <button onClick={() => insertMarkdown("\n- ")} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500 hover:text-black font-bold" title="List"><List className="w-4 h-4" /></button>
                                </div>

                                <textarea
                                    ref={textareaRef}
                                    value={contents[activeLanguage] || ""}
                                    onChange={(e) => setContents((prev) => ({
                                        ...prev,
                                        [activeLanguage]: e.target.value,
                                    }))}
                                    placeholder="Write your article here..."
                                    className="w-full h-[240px] px-4 py-3 bg-transparent focus:outline-none font-mono text-sm resize-none leading-relaxed text-[#1A1A1A] font-medium"
                                />
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider">Tags</label>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">12 tags remaining</span>
                        </div>
                        <div className="flex flex-wrap gap-2 p-3 bg-[#F3F3F1] border-2 border-transparent rounded-xl min-h-[56px] items-center focus-within:bg-white focus-within:border-black transition-all">
                            {tagsByLang[activeLanguage].map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-xs font-bold text-black border-2 border-gray-200 shadow-sm">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-red-600 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                </span>
                            ))}
                            <input
                                type="text"
                                placeholder="Add tags..."
                                className="bg-transparent border-none focus:outline-none text-xs px-2 py-1 min-w-[80px] flex-1 font-bold text-[#1A1A1A] placeholder:text-gray-400 placeholder:font-medium"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = (e.target as HTMLInputElement).value.trim();
                                        if (val && !tagsByLang[activeLanguage].includes(val)) {
                                            setTagsByLang((prev) => ({
                                                ...prev,
                                                [activeLanguage]: [...prev[activeLanguage], val],
                                            }));
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-transparent text-xs font-bold text-gray-500 hover:bg-[#F3F3F1] hover:text-black hover:border-gray-300 transition-all bg-white">
                                <Plus className="w-3 h-3" /> Photography
                            </button>
                            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-transparent text-xs font-bold text-gray-500 hover:bg-[#F3F3F1] hover:text-black hover:border-gray-300 transition-all bg-white">
                                <Plus className="w-3 h-3" /> AI Art
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t-2 border-black/5 bg-[#FAFAFA] rounded-b-[30px]">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]"></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saved as a draft</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-full text-sm font-bold text-gray-500 hover:text-black hover:bg-gray-200 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSchedule}
                            disabled={isSubmitting}
                            className="px-8 py-3 rounded-full text-sm font-black text-white bg-[#1A1A1A] hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                        >
                            {isSubmitting ? "Saving..." : (post ? "Save Changes" : "Schedule Post")}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        typeof document !== 'undefined' ? document.body : (globalThis as any)?.document?.body ?? null
    );
}
