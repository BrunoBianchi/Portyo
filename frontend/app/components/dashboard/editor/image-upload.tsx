import React, { useState, useRef } from "react";
import { api } from "~/services/api";
import { UploadIcon, XIcon, ImageIcon, CheckIcon, LinkIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
    placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    label,
    className = "",
    placeholder = "Upload or paste URL"
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
            const res = await api.post("/user/upload-block-image", formData, {
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
            {label && <label className="text-xs font-medium text-gray-700 block">{label}</label>}

            {value ? (
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video flex items-center justify-center">
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
                            className="p-2 bg-white/10 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                            title="Remove image"
                        >
                            <XIcon size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-0.5 rounded-lg w-fit">
                        <button
                            onClick={() => setInputType("upload")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${inputType === "upload"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <UploadIcon size={12} />
                            Upload
                        </button>
                        <button
                            onClick={() => setInputType("url")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${inputType === "url"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
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
                ${isDragging ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"}
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
                                    <span className="text-xs text-gray-500 font-medium">Uploading...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-1">
                                        <ImageIcon size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-700">
                                            Drag & drop or {" "}
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-primary hover:underline cursor-pointer bg-transparent border-0 p-0 inline font-medium"
                                            >
                                                browse
                                            </button>
                                        </p>
                                        <p className="text-[10px] text-gray-400">Max 10MB</p>
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
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                            autoFocus
                        />
                    )}
                </div>
            )}
        </div>
    );
};
