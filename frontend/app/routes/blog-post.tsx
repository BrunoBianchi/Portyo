import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { api } from "../services/api";
import { format } from "date-fns";
import { ArrowLeft, Clock, Eye, ThumbsUp, Share2, Calendar, User } from "lucide-react";

interface BlogPost {
    id: string;
    title: string;
    content: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    bio?: {
        id: string;
        sufix: string;
        profileImage?: string;
        seoTitle?: string;
    };
    user?: {
        id: string;
        name?: string;
    };
}

export default function BlogPostPage() {
    const { postId } = useParams();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!postId) {
            setError("Post not found");
            setLoading(false);
            return;
        }
        fetchPost();
    }, [postId]);

    const fetchPost = async () => {
        try {
            const res = await api.get(`/public/blog/post/${postId}`);
            setPost(res.data);

            // Update page title and meta for SEO
            if (res.data?.title) {
                document.title = `${res.data.title} | ${res.data.bio?.seoTitle || res.data.bio?.sufix || 'Blog'}`;
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post?.title,
                    url: url
                });
            } catch (err) {
                // User cancelled
            }
        } else {
            navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    // Calculate read time
    const getReadTime = (content: string) => {
        const wordCount = content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
        return Math.max(1, Math.ceil(wordCount / 200));
    };

    // Extract first image from content
    const getHeaderImage = (content: string) => {
        const match = content?.match(/<img[^>]+src="([^">]+)"/);
        return match ? match[1] : null;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h1 className="text-6xl font-black text-gray-200 mb-4">404</h1>
                    <p className="text-xl font-bold text-gray-900 mb-2">Post not found</p>
                    <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const authorName = post.bio?.seoTitle || post.bio?.sufix || "Author";
    const authorImage = post.bio?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=1e3a5f&color=fff`;
    const readTime = getReadTime(post.content);
    const headerImage = getHeaderImage(post.content);
    const formattedDate = format(new Date(post.createdAt), 'MMMM d, yyyy');

    return (
        <article className="min-h-screen bg-white">
            {/* Header / Hero Section */}
            <header className="max-w-3xl mx-auto px-6 pt-12 pb-8">
                {/* Back Button */}
                <Link
                    to={`/blog`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blog
                </Link>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-6">
                    {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                    {/* Author */}
                    <div className="flex items-center gap-3">
                        <img
                            src={authorImage}
                            alt={authorName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                        />
                        <div>
                            <p className="font-semibold text-gray-900">{authorName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formattedDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {readTime} min read
                        </span>
                    </div>
                </div>
            </header>

            {/* Featured Image */}
            {headerImage && (
                <div className="max-w-4xl mx-auto px-6 mb-10">
                    <img
                        src={headerImage}
                        alt={post.title}
                        className="w-full rounded-2xl object-cover max-h-[500px]"
                    />
                </div>
            )}

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 pb-16">
                <div
                    className="prose prose-lg prose-gray max-w-none
                        prose-headings:font-bold prose-headings:tracking-tight
                        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                        prose-p:text-gray-600 prose-p:leading-relaxed
                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-xl prose-img:shadow-lg
                        prose-blockquote:border-l-4 prose-blockquote:border-gray-900 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                        prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl
                    "
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-500 text-sm">Enjoyed this post? Share it with others.</p>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                </div>

                {/* Author Card */}
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <img
                            src={authorImage}
                            alt={authorName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                        />
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Written by</p>
                            <p className="font-bold text-gray-900 text-lg">{authorName}</p>
                            {post.bio?.sufix && (
                                <Link
                                    to={`/`}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    View Profile →
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
