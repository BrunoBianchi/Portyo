import React, { useEffect, useState } from 'react';
import { ArrowRight, Flame, Play } from 'lucide-react';
import { getPublicSitePosts, type SitePost } from '~/services/site-blog.service';
import { format } from 'date-fns';
import { Link } from 'react-router';

interface BlogPost {
    id: number | string;
    title: string;
    excerpt?: string;
    category: string;
    date?: string;
    image?: string;
    isHot?: boolean;
    isVideo?: boolean;
    bgColor?: string;
    bgImage?: string;
}

const defaultPosts: BlogPost[] = [
    {
        id: 'default-1',
        title: 'HOW TO CREATE THE PERFECT LINK IN BIO',
        category: 'Tips',
        date: '08 Jan',
        bgColor: 'linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%)',
        bgImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80',
        isHot: true,
    },
    {
        id: 'default-2',
        title: 'BOOST YOUR SOCIAL MEDIA PRESENCE WITH ONE LINK',
        excerpt: 'Transform your followers into customers with a powerful bio link. Learn how to optimize your profile and increase conversions with simple strategies...',
        category: 'Growth',
        bgColor: '#e8f5d3',
        bgImage: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=300&q=80',
    },
    {
        id: 'default-3',
        title: 'TOP CREATOR MONETIZATION STRATEGIES',
        category: 'Revenue',
        date: '05 Jan',
        bgColor: 'linear-gradient(135deg, #fff4e6 0%, #ffe4c4 100%)',
        bgImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=200&q=80',
        isHot: true,
    },
    {
        id: 'default-4',
        title: 'ANALYTICS MASTERCLASS | UNDERSTAND YOUR AUDIENCE',
        category: 'Insights',
        date: '03 Jan',
        bgImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
        isVideo: true,
    },
];

const categories = [
    { name: 'Social Media', color: 'bg-purple-700 text-white' },
    { name: 'Monetization', color: 'bg-yellow-300 text-text-main' },
    { name: 'Analytics', color: 'bg-white text-text-main border border-border' },
    { name: 'Design Tips', color: 'bg-white text-text-main border border-border' },
    { name: 'Growth Hacks', color: 'bg-yellow-300 text-text-main' },
    { name: 'Branding', color: 'bg-white text-text-main border border-border' },
    { name: 'E-commerce', color: 'bg-white text-text-main border border-border' },
    { name: 'Creators', color: 'bg-white text-text-main border border-border' },
];

const additionalLinks = [
    'HOW TO DESIGN A STUNNING BIO PAGE',
    'CONVERT FOLLOWERS INTO PAYING CUSTOMERS',
];

export default function BlogSection() {
    const [posts, setPosts] = useState<BlogPost[]>(defaultPosts);

    useEffect(() => {
        const fetchPosts = async () => {
            const sitePosts = await getPublicSitePosts();
            if (sitePosts && sitePosts.length > 0) {
                const mappedPosts: BlogPost[] = sitePosts.slice(0, 4).map((post, index) => {
                    const defaultPost = defaultPosts[index] || defaultPosts[0]; // Fallback style
                    return {
                        id: post.id,
                        title: post.title,
                        excerpt: post.content ? post.content.substring(0, 100) + '...' : '',
                        category: post.keywords?.[0] || defaultPost.category,
                        date: format(new Date(post.createdAt), 'dd MMM'),
                        bgColor: defaultPost.bgColor, // Preserve layout styling
                        bgImage: post.thumbnail || defaultPost.bgImage,
                        isHot: index === 0 || index === 2, // Mimic layout hot posts
                        isVideo: false
                    };
                });

                // If we fetched fewer than 4 posts, fill the rest with defaults
                if (mappedPosts.length < 4) {
                    const remaining = 4 - mappedPosts.length;
                    for (let i = 0; i < remaining; i++) {
                        mappedPosts.push(defaultPosts[mappedPosts.length]);
                    }
                }

                setPosts(mappedPosts);
            }
        };
        fetchPosts();
    }, []);

    return (
        <section className="w-full py-16 px-4 bg-surface-alt">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-4xl md:text-5xl font-black text-text-main tracking-tight">
                        BLOG
                    </h2>
                    <button className="btn bg-white text-text-main border border-border rounded-full px-6 py-3 hover:shadow-md transition-all duration-300 group">
                        Read Our Blog
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left - Main Featured Post with dramatic organic shape */}
                    <div className="lg:col-span-4">
                        <Link
                            to={posts[0].id.toString().startsWith('default') ? '/blog' : `/site-blog/${posts[0].id}`}
                            className="block relative h-[520px] overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                            style={{
                                background: posts[0].bgColor,
                                borderRadius: '32px 180px 32px 32px',
                            }}
                        >
                            {/* Content overlay with image */}
                            <div className="absolute inset-0 flex items-end p-8">
                                {/* Large letter or icon in background - hidden if image exists */}
                                {!posts[0].bgImage && (
                                    <div className="absolute top-10 left-8 right-8 flex items-center justify-center opacity-20">
                                        <svg viewBox="0 0 200 200" className="w-48 h-48 text-red-600 opacity-80">
                                            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-current text-[120px] font-black">
                                                P
                                            </text>
                                        </svg>
                                    </div>
                                )}

                                {/* Background Image */}
                                {posts[0].bgImage && (
                                    <>
                                        <img
                                            src={posts[0].bgImage}
                                            alt={posts[0].title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    </>
                                )}

                                {/* Hot Badge */}
                                {posts[0].isHot && (
                                    <div className="absolute top-6 left-6 bg-orange-500 rounded-full p-3 shadow-lg">
                                        <Flame className="w-5 h-5 text-white" fill="currentColor" />
                                    </div>
                                )}

                                {/* Text content */}
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
                                        <span>Category</span>
                                        <span className="text-primary font-bold">{posts[0].category}</span>
                                        <span className="mx-1">|</span>
                                        <span>{posts[0].date}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                                        {posts[0].title}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Center Column */}
                    <div className="lg:col-span-5 flex flex-col gap-5">
                        {/* Featured Article Card - Green */}
                        <Link
                            to={posts[1].id.toString().startsWith('default') ? '/blog' : `/site-blog/${posts[1].id}`}
                            className="block p-7 flex-1 relative overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                            style={{
                                background: posts[1].bgColor,
                                borderRadius: '32px 32px 120px 32px',
                                minHeight: '280px',
                            }}
                        >
                            {/* Arrow icon */}
                            <div className="absolute top-5 right-5 bg-white rounded-full p-3 shadow-sm group-hover:shadow-md transition-all group-hover:rotate-12">
                                <ArrowRight className="w-5 h-5 text-text-main -rotate-45" />
                            </div>

                            <div className="flex gap-6 h-full">
                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-text-muted text-sm mb-4">
                                        <span>Category</span>
                                        <span>.</span>
                                        <span className="text-text-main font-bold">{posts[1].category}</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-text-main leading-tight tracking-tight mb-4">
                                        {posts[1].title}
                                    </h3>
                                    <p className="text-text-muted text-sm leading-relaxed flex-1 line-clamp-3">
                                        {posts[1].excerpt}
                                    </p>
                                    <span className="text-text-main font-bold mt-2 cursor-pointer hover:underline block">
                                        More
                                    </span>
                                </div>

                                {/* Image with organic shape */}
                                <div
                                    className="w-40 h-48 overflow-hidden flex-shrink-0 self-end"
                                    style={{
                                        borderRadius: '80px 24px 24px 24px',
                                    }}
                                >
                                    <img
                                        src={posts[1].bgImage}
                                        alt={posts[1].title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            </div>
                        </Link>

                        {/* Additional Links */}
                        <div className="space-y-1 px-1">
                            {additionalLinks.map((link, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-4 px-2 border-b border-border/40 cursor-pointer group transition-colors hover:bg-white/50 rounded-lg"
                                >
                                    <span className="text-text-main font-bold text-sm tracking-wide uppercase group-hover:text-primary transition-colors">
                                        {link}
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>

                        {/* Video Card (Using 4th post) */}
                        <Link
                            to={posts[3].id.toString().startsWith('default') ? '/blog' : `/site-blog/${posts[3].id}`}
                            className="block relative h-48 overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                            style={{
                                borderRadius: '120px 32px 32px 32px',
                            }}
                        >
                            <img
                                src={posts[3].bgImage}
                                alt={posts[3].title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            {/* Category Badge */}
                            <div className="absolute top-5 left-6 flex items-center gap-2 text-white/80 text-xs">
                                <span>Category</span>
                                <span>.</span>
                                <span className="text-primary font-bold">{posts[3].category}</span>
                            </div>

                            {/* Play Button - Only if video */}
                            {posts[3].isVideo && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform">
                                    <Play className="w-6 h-6 text-text-main" fill="currentColor" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="absolute bottom-5 left-6 right-6">
                                <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                                    <span>5 Min</span>
                                    <span>.</span>
                                    <span>{posts[3].date}</span>
                                </div>
                                <h4 className="text-sm font-bold text-white tracking-wide uppercase">
                                    {posts[3].title}
                                </h4>
                            </div>
                        </Link>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-3 flex flex-col gap-5">
                        {/* Small Featured Card - Orange */}
                        <Link
                            to={posts[2].id.toString().startsWith('default') ? '/blog' : `/site-blog/${posts[2].id}`}
                            className="block relative h-56 overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                            style={{
                                background: posts[2].bgColor,
                                borderRadius: '32px 32px 32px 100px',
                            }}
                        >
                            {/* Decorative icon */}
                            <div className="absolute top-4 right-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                <Flame className="w-5 h-5 text-text-main" />
                            </div>

                            <div className="absolute top-6 left-6 right-20">
                                <div className="flex items-center gap-2 text-text-main/70 text-xs mb-2">
                                    <span>Category</span>
                                    <span>.</span>
                                    <span className="text-text-main font-bold">{posts[2].category}</span>
                                </div>
                                <div className="flex items-center gap-2 text-red-500 text-xs mb-4 font-semibold">
                                    <span>Hot</span>
                                    <span>.</span>
                                    <span className="text-text-main/60">{posts[2].date}</span>
                                </div>
                                <h4 className="text-lg md:text-xl font-black text-text-main leading-tight tracking-tight">
                                    {posts[2].title}
                                </h4>
                            </div>

                            {/* Image */}
                            <img
                                src={posts[2].bgImage}
                                alt={posts[2].title}
                                className="absolute bottom-0 right-0 w-32 h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                                style={{
                                    borderRadius: '60px 0 0 0',
                                }}
                            />
                        </Link>

                        {/* Categories Card - Purple */}
                        <div
                            className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 flex-1 flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                            style={{
                                borderRadius: '32px 100px 32px 32px',
                                minHeight: '320px',
                            }}
                        >
                            <div className="flex flex-wrap gap-2 mb-6">
                                {categories.map((category, index) => (
                                    <span
                                        key={index}
                                        className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm ${category.color}`}
                                    >
                                        {category.name}
                                    </span>
                                ))}
                            </div>

                            {/* View All Categories */}
                            <div className="flex items-center justify-between mt-auto cursor-pointer group pt-4">
                                <span className="text-text-main font-black text-sm">View All Categories</span>
                                <div className="bg-white rounded-full p-3 shadow-sm group-hover:shadow-md transition-all group-hover:translate-x-1">
                                    <ArrowRight className="w-5 h-5 text-text-main" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
