import React, { useState, useEffect } from "react";
import { api } from "~/services/api";
import { format } from "date-fns";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { sanitizeHtml } from "~/utils/security";
import ReactMarkdown from "react-markdown";

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
}

interface BlogPostViewProps {
    postId: string;
    bio: any;
    subdomain: string;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({ postId, bio, subdomain }) => {
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

            // Update page title for SEO
            if (res.data?.title) {
                document.title = `${res.data.title} | ${bio?.seoTitle || subdomain || 'Blog'}`;
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
                await navigator.share({ title: post?.title, url });
            } catch (err) { }
        } else {
            navigator.clipboard.writeText(url);
            alert("Link copied!");
        }
    };

    const getReadTime = (content: string) => {
        const wordCount = content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
        return Math.max(1, Math.ceil(wordCount / 200));
    };

    const getHeaderImage = (content: string) => {
        const match = content?.match(/<img[^>]+src="([^">]+)"/);
        return match ? match[1] : null;
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <div style={{ width: 40, height: 40, border: '2px solid #e5e7eb', borderTop: '2px solid #111', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 24 }}>
                <div style={{ textAlign: 'center', maxWidth: 400 }}>
                    <div style={{ fontSize: 72, fontWeight: 900, color: '#e5e7eb', marginBottom: 16 }}>404</div>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>Post not found</p>
                    <p style={{ color: '#6b7280', marginBottom: 24 }}>The post you're looking for doesn't exist.</p>
                    <a
                        href="/blog"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#111', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}
                    >
                        ← Back to Blog
                    </a>
                </div>
            </div>
        );
    }

    const authorName = bio?.seoTitle || subdomain || "Author";
    const authorImage = bio?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=1e3a5f&color=fff`;
    const readTime = getReadTime(post.content);
    const headerImage = getHeaderImage(post.content);
    const formattedDate = format(new Date(post.createdAt), 'MMMM d, yyyy');
    const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(post.content || "");

    return (
        <article style={{ minHeight: '100vh', background: '#fff' }}>
            {/* Header */}
            <header style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 32px' }}>
                {/* Back Button */}
                <a
                    href="/blog"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b7280', textDecoration: 'none', marginBottom: 32 }}
                >
                    <ArrowLeft style={{ width: 16, height: 16 }} />
                    Back to Blog
                </a>

                {/* Title */}
                <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#111', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
                    {post.title}
                </h1>

                {/* Meta Info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, fontSize: 14, color: '#6b7280' }}>
                    {/* Author */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                            src={authorImage}
                            alt={authorName}
                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f3f4f6' }}
                        />
                        <span style={{ fontWeight: 600, color: '#111' }}>{authorName}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#9ca3af' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar style={{ width: 16, height: 16 }} />
                            {formattedDate}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock style={{ width: 16, height: 16 }} />
                            {readTime} min read
                        </span>
                    </div>
                </div>
            </header>

            {/* Featured Image */}
            {headerImage && (
                <div style={{ maxWidth: 900, margin: '0 auto 40px', padding: '0 24px' }}>
                    <img
                        src={headerImage}
                        alt={post.title}
                        style={{ width: '100%', borderRadius: 20, objectFit: 'cover', maxHeight: 500 }}
                    />
                </div>
            )}

            {/* Content */}
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 64px' }}>
                <div
                    className="blog-post-content"
                    style={{
                        fontSize: 18,
                        lineHeight: 1.8,
                        color: '#374151',
                    }}
                >
                    {isHtmlContent ? (
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
                    ) : (
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    )}
                </div>

                <style>{`
                    .blog-post-content h1, .blog-post-content h2, .blog-post-content h3, .blog-post-content h4 {
                        color: #111; font-weight: 700; margin: 2em 0 0.5em; line-height: 1.3;
                    }
                    .blog-post-content h1 { font-size: 2em; }
                    .blog-post-content h2 { font-size: 1.5em; }
                    .blog-post-content h3 { font-size: 1.25em; }
                    .blog-post-content p { margin: 0 0 1.5em; }
                    .blog-post-content a { color: #2563eb; text-decoration: none; }
                    .blog-post-content a:hover { text-decoration: underline; }
                    .blog-post-content img { max-width: 100%; border-radius: 12px; margin: 1.5em 0; }
                    .blog-post-content blockquote { 
                        border-left: 4px solid #111; background: #f9fafb; margin: 1.5em 0; 
                        padding: 1em 1.5em; border-radius: 0 12px 12px 0; font-style: italic;
                    }
                    .blog-post-content code { 
                        background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: monospace;
                    }
                    .blog-post-content pre { 
                        background: #1f2937; color: #f3f4f6; padding: 1.5em; border-radius: 12px; 
                        overflow-x: auto; margin: 1.5em 0;
                    }
                    .blog-post-content pre code { background: none; padding: 0; }
                    .blog-post-content ul, .blog-post-content ol { margin: 0 0 1.5em; padding-left: 1.5em; }
                    .blog-post-content li { margin: 0.5em 0; }
                `}</style>

                {/* Share Section */}
                <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Enjoyed this? Share it.</p>
                    <button
                        onClick={handleShare}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, color: '#374151', fontSize: 14 }}
                    >
                        <Share2 style={{ width: 16, height: 16 }} />
                        Share
                    </button>
                </div>

                {/* Author Card */}
                <div style={{ marginTop: 32, padding: 24, background: '#f9fafb', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <img
                        src={authorImage}
                        alt={authorName}
                        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <div>
                        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px' }}>Written by</p>
                        <p style={{ fontWeight: 700, color: '#111', fontSize: 18, margin: 0 }}>{authorName}</p>
                        <a
                            href="/"
                            style={{ fontSize: 14, color: '#2563eb', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}
                        >
                            View Profile →
                        </a>
                    </div>
                </div>
            </div>
        </article>
    );
};
