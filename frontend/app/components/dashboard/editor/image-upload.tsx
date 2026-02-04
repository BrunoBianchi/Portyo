import React, { useState, useRef } from "react";
import { api } from "~/services/api";
import { UploadIcon, XIcon, ImageIcon, CheckIcon, LinkIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
    placeholder?: string;
    endpoint?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    label,
    className = "",
    placeholder = "Upload or paste URL",
    endpoint = "/user/upload-block-image"
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [inputType, setInputType] = useState<"upload" | "url">("upload");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file");
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("File size must be less than 10MB");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await api.post(endpoint, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            onChange(res.data.url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <label className="text-xs font-medium text-muted-foreground block">{label}</label>}

            {value ? (
                <div className="relative group rounded-xl overflow-hidden border border-border bg-muted aspect-video flex items-center justify-center">
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback if image fails to load
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image";
                        }}
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            onClick={() => onChange("")}
                            className="p-2 bg-surface-card/10 hover:bg-destructive/100/80 text-white rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                            title="Remove image"
                        >
                            <XIcon size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {/* Tabs */}
                    <div className="flex bg-muted p-0.5 rounded-lg w-fit">
                        <button
                            onClick={() => setInputType("upload")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${inputType === "upload"
                                ? "bg-surface-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-muted-foreground"
                                }`}
                        >
                            <UploadIcon size={12} />
                            Upload
                        </button>
                        <button
                            onClick={() => setInputType("url")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${inputType === "url"
                                ? "bg-surface-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-muted-foreground"
                                }`}
                        >
                            <LinkIcon size={12} />
                            URL
                        </button>
                    </div>

                    {inputType === "upload" ? (
                        <div
                            className={`
                relative border-2 border-dashed rounded-xl p-6 transition-all text-center
                ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted"}
                ${isUploading ? "pointer-events-none opacity-70" : ""}
              `}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2 py-2">
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                    <span className="text-xs text-muted-foreground font-medium">Uploading...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-1">
                                        <ImageIcon size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Drag & drop or {" "}
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-primary hover:underline cursor-pointer bg-transparent border-0 p-0 inline font-medium"
                                            >
                                                browse
                                            </button>
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">Max 10MB</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="https://example.com/image.png"
                            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:ring-2 focus:ring-white/30 focus:border-white/50 outline-none transition-all placeholder:text-muted-foreground/50"
                            autoFocus
                        />
                    )}
                </div>
            )}
        </div>
    );
};
