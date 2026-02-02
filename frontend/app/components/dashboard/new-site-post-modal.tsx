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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="p-6 pb-4 border-b border-border">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                {post ? "Edit Site Post" : "New Site Post"}
                            </h2>
                            <p className="text-muted-foreground text-sm mt-0.5">{post ? "Update your site blog content" : "Create content for your main site blog"}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-red-200 text-destructive rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Language Selector */}
                    <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="language"
                                value="en"
                                checked={activeLanguage === "en"}
                                onChange={() => setActiveLanguage("en")}
                                className="w-4 h-4 text-black focus:ring-black"
                            />
                            <span className="text-sm font-medium text-muted-foreground">English</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="language"
                                value="pt"
                                checked={activeLanguage === "pt"}
                                onChange={() => setActiveLanguage("pt")}
                                className="w-4 h-4 text-black focus:ring-black"
                            />
                            <span className="text-sm font-medium text-muted-foreground">Portuguese</span>
                        </label>
                    </div>

                    {/* Mode Toggle */}
                    <div className="bg-muted p-1 rounded-lg inline-flex w-full">
                        <button
                            onClick={() => setActiveMode("upload")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeMode === "upload"
                                ? "bg-surface-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload File</span>
                        </button>
                        <button
                            onClick={() => setActiveMode("write")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeMode === "write"
                                ? "bg-surface-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
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
                            className="border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-border hover:bg-muted transition-all group bg-surface-card min-h-[200px]"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Upload className="w-5 h-5 text-muted-foreground" />
                            </div>
                            {file ? (
                                <div>
                                    <p className="text-base font-bold text-foreground">{file.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-base font-bold text-foreground mb-1">Upload your blog file</p>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        HTML, Markdown, or PDF (10 mb max)
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground ml-1">Post Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={titles[activeLanguage] || ""}
                                onChange={(e) => setTitles((prev) => ({
                                    ...prev,
                                    [activeLanguage]: e.target.value,
                                }))}
                                placeholder="e.g. The Future of Design"
                                className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-card focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm placeholder:text-muted-foreground/50"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-semibold text-muted-foreground">Publish Time</label>
                            </div>
                            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 h-[42px]">
                                <button
                                    onClick={() => setScheduleMode("now")}
                                    className={`flex-1 h-full rounded-md text-xs font-medium transition-all ${scheduleMode === "now"
                                        ? "bg-surface-card text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    Now
                                </button>
                                <div
                                    ref={datePickerRef}
                                    className={`flex-[2] h-full relative rounded-md transition-all flex items-center px-3 gap-2 cursor-pointer ${scheduleMode === "later"
                                        ? "bg-surface-card text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
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

                    {/* Thumbnail Input (Both Modes) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground ml-1">Thumbnail / Cover Image</label>
                        <div
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-card hover:bg-muted hover:border-border transition-all cursor-pointer flex items-center gap-3 group"
                        >
                            <input
                                type="file"
                                ref={thumbnailInputRef}
                                onChange={handleThumbnailChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                                {thumbnail ? (
                                    <img
                                        src={thumbnail instanceof File ? URL.createObjectURL(thumbnail) : thumbnail}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                )}
                            </div>
                            {thumbnail ? (
                                <span className="text-sm font-medium text-foreground">
                                    {thumbnail instanceof File ? thumbnail.name : "Current Thumbnail"}
                                </span>
                            ) : (
                                <span className="text-sm text-muted-foreground/50">Click to upload thumbnail...</span>
                            )}
                        </div>
                    </div>

                    {/* Markdown Editor (Only in Write Mode) */}
                    {activeMode === "write" && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground ml-1">
                                Content <span className="text-red-500">*</span>
                            </label>

                            <div className="relative group border border-border rounded-lg bg-surface-card focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all overflow-hidden">
                                {/* Fixed Toolbar inside container */}
                                <div className="flex items-center gap-1 p-1.5 border-b border-border bg-muted">
                                    <button onClick={() => insertMarkdown("**", "**")} className="p-1.5 hover:bg-surface-card hover:shadow-sm rounded-md transition-all text-muted-foreground hover:text-foreground" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => insertMarkdown("*", "*")} className="p-1.5 hover:bg-surface-card hover:shadow-sm rounded-md transition-all text-muted-foreground hover:text-foreground" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => insertMarkdown("<u>", "</u>")} className="p-1.5 hover:bg-surface-card hover:shadow-sm rounded-md transition-all text-muted-foreground hover:text-foreground" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
                                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                    <button onClick={() => insertMarkdown("`", "`")} className="p-1.5 hover:bg-surface-card hover:shadow-sm rounded-md transition-all text-muted-foreground hover:text-foreground" title="Code"><Code className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => insertMarkdown("[", "](url)")} className="p-1.5 hover:bg-surface-card hover:shadow-sm rounded-md transition-all text-muted-foreground hover:text-foreground" title="Link"><LinkIcon className="w-3.5 h-3.5" /></button>
                                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                    <button onClick={() => insertMarkdown("\n- ")} className="p-1.5 hover:bg-surface-card hover:shadow-sm rounded-md transition-all text-muted-foreground hover:text-foreground" title="List"><List className="w-3.5 h-3.5" /></button>
                                </div>

                                <textarea
                                    ref={textareaRef}
                                    value={contents[activeLanguage] || ""}
                                    onChange={(e) => setContents((prev) => ({
                                        ...prev,
                                        [activeLanguage]: e.target.value,
                                    }))}
                                    placeholder="Write your article here..."
                                    className="w-full h-[200px] px-4 py-3 bg-transparent focus:outline-none font-mono text-sm resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-semibold text-muted-foreground">Tags</label>
                            <span className="text-xs text-muted-foreground/50">12 tags remaining</span>
                        </div>
                        <div className="flex flex-wrap gap-2 p-2 bg-surface-card border border-border rounded-lg min-h-[46px] items-center focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all">
                            {tagsByLang[activeLanguage].map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs font-medium text-foreground border border-transparent">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                            <input
                                type="text"
                                placeholder="Add tags..."
                                className="bg-transparent border-none focus:outline-none text-xs px-2 py-1 min-w-[80px] flex-1 font-medium placeholder:text-muted-foreground/50"
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
                        <div className="flex gap-2 mt-1">
                            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors bg-surface-card">
                                <Plus className="w-3 h-3" /> Photography
                            </button>
                            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors bg-surface-card">
                                <Plus className="w-3 h-3" /> AI Art
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-border bg-muted/50 rounded-b-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500/100 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]"></div>
                        <span className="text-xs font-medium text-muted-foreground">Saved as a draft</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSchedule}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-black hover:bg-gray-800 transition-all shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
