import { Eye, X, BadgeCheck } from 'lucide-react';
import { useContext, useEffect, useMemo, useState, useRef, useCallback } from "react";
import type { MetaFunction } from "react-router";
import BioContext, { type BioBlock } from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import BlockItem from "~/components/dashboard/editor/block-item";
import { ColorPicker } from "~/components/dashboard/editor/ColorPicker";
import { BlogPostPopup } from "~/components/bio/blog-post-popup";
import { palette } from "~/data/editor-palette";
import { blocksToHtml } from "~/services/html-generator";
import { api } from "~/services/api";
import QRCode from "react-qr-code";
import { getQrCodes, createQrCode, type QrCode } from "~/services/qrcode.service";
import BioLayout from "~/components/bio/bio-layout";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  InstagramIcon,
  YouTubeIcon,
  EyeIcon,
  ShareIcon,
  ExternalLinkIcon,
  SearchIcon,
  ChevronDownIcon,
  DotsIcon,
  TwitterIcon,
  LinkedInIcon,
  GitHubIcon,
  XIcon,
  ImageIcon,
  HomeIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  LinkIcon,
  FacebookIcon,
  WhatsAppIcon,
  FlagIcon,
  ArrowRightLongIcon
} from "~/components/shared/icons";
import { UpgradePopup } from "~/components/shared/upgrade-popup";
import { PortyoAI } from "~/components/dashboard/portyo-ai";

export const meta: MetaFunction = () => {
  return [
    { title: "Editor | Portyo" },
    { name: "description", content: "Customize your bio page, add links, and manage your content." },
  ];
};

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

const defaultBlocks = (): BioBlock[] => [
  {
    id: makeId(),
    type: "heading",
    title: "Introduce yourself",
    body: "In one line, tell people why they should connect with you.",
    align: "center",
  },
  {
    id: makeId(),
    type: "button",
    title: "Main link",
    href: "https://",
    align: "center",
    accent: "#111827",
  },
];





const EventBlockPreview = ({ block }: { block: BioBlock }) => {
  const title = block.eventTitle || "Live Webinar";
  const date = block.eventDate || new Date(Date.now() + 86400000 * 7).toISOString();
  const bgColor = block.eventColor || "#111827";
  const textColor = block.eventTextColor || "#ffffff";
  const btnText = block.eventButtonText || "Register Now";
  const btnUrl = block.eventButtonUrl || "#";

  // Simple countdown logic for preview
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = new Date(date).getTime();
    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff < 0) {
        setIsExpired(true);
        return;
      }
      setIsExpired(false);
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <div key={block.id}>
      <div
        className="rounded-xl p-4 text-center shadow-lg"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <h3 className="mb-4 text-xl font-bold tracking-tight">{title}</h3>

        {isExpired ? (
          <div className="text-lg font-bold py-4 mb-4">Event Started</div>
        ) : (
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {['Days', 'Hours', 'Mins', 'Secs'].map((label, i) => {
              const val = i === 0 ? timeLeft.d : i === 1 ? timeLeft.h : i === 2 ? timeLeft.m : timeLeft.s;
              return (
                <div key={label} className="bg-white/10 p-2 rounded-xl min-w-[55px] backdrop-blur-sm flex-1 max-w-[80px]">
                  <div className="text-xl font-black leading-none mb-1">{val.toString().padStart(2, '0')}</div>
                  <div className="text-[9px] font-bold opacity-60 uppercase tracking-wider">{label}</div>
                </div>
              );
            })}
          </div>
        )}

        {btnText && (
          <a
            href={btnUrl}
            className="inline-block bg-white px-6 py-3 rounded-full font-bold text-sm transition-transform hover:scale-105 shadow-md"
            style={{ color: bgColor }}
          >
            {btnText}
          </a>
        )}
      </div>
    </div>
  );
};

const BlogBlockPreview = ({ block, bioId }: { block: BioBlock; bioId: string }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get(`/blog/${bioId}?publicView=true`);
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setLoading(false);
      }
    };

    if (bioId) {
      fetchPosts();
    }
  }, [bioId]);

  const layout = block.blogLayout || "carousel";
  const cardStyle = block.blogCardStyle || "featured";

  // Colors
  const bgColor = block.blogBackgroundColor || (cardStyle === 'featured' ? '#fef3c7' : '#ffffff');
  const titleColor = block.blogTitleColor || '#1f2937';
  const textColor = block.blogTextColor || '#4b5563';
  const dateColor = block.blogDateColor || "#f59e0b";
  const tagBg = block.blogTagBackgroundColor || '#f3f4f6';
  const tagText = block.blogTagTextColor || '#4b5563';

  const displayPosts = posts.length > 0 ? posts : Array.from({ length: block.blogPostCount || 3 }).map((_, i) => ({
    title: i === 0 ? "Senior Developer" : `Blog Post Title ${i + 1}`,
    subtitle: i === 0 ? "Tech4Humans ÔÇó S+úo Paulo, SP - Remote" : "Category ÔÇó Location",
    createdAt: new Date().toISOString(),
    content: "FullStack Developer at Tech4Humans, working on projects for large insurance companies. I had the chance to participate in the development of new features...",
    tags: ["FullStack Dev", "Soft Skills", "Hard Skills"],
    category: "Lifestyle",
    readTime: "5 min read",
    image: "/base-img/card_base_image.png",
    author: "By You"
  }));

  return (
    <>
      {selectedPost && (
        <BlogPostPopup
          post={{
            ...selectedPost,
            date: new Date(selectedPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            image: "/base-img/card_base_image.png",
            author: "By You"
          }}
          onClose={() => setSelectedPost(null)}
          config={{
            backgroundColor: block.blogPopupBackgroundColor,
            textColor: block.blogPopupTextColor,
            overlayColor: block.blogPopupOverlayColor
          }}
        />
      )}
      <div key={block.id} className="relative group/carousel">
        {layout === 'carousel' && (
          <>
            <button
              onClick={() => document.getElementById(`preview-blog-${block.id}`)?.scrollBy({ left: -230, behavior: 'smooth' })}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={() => document.getElementById(`preview-blog-${block.id}`)?.scrollBy({ left: 230, behavior: 'smooth' })}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            >
              <ChevronRightIcon />
            </button>
          </>
        )}
        <div
          id={`preview-blog-${block.id}`}
          className={`w-full ${layout === 'carousel' ? 'overflow-x-auto px-10 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden' : 'flex flex-col gap-3'}`}
          style={layout === 'carousel' ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
        >
          <div className={`${layout === 'carousel' ? 'flex gap-3 w-max' :
            layout === 'grid' ? 'grid grid-cols-2 gap-3' :
              'flex flex-col gap-3'
            }`}>
            {displayPosts.map((post, i) => {
              const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const description = post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '';
              const image = "/base-img/card_base_image.png";
              const category = "Blog";
              const readTime = "5 min read";
              const author = "By You";

              return (
                <article
                  key={i}
                  onClick={() => setSelectedPost(post)}
                  className={`
                  cursor-pointer transition-transform hover:scale-[1.02] active:scale-95
                  ${cardStyle === 'featured'
                      ? 'p-3 rounded-2xl flex flex-col gap-2.5 w-[200px]'
                      : cardStyle === 'modern'
                        ? 'py-4 flex flex-col gap-2 w-full border-b border-gray-100 last:border-0'
                        : 'border border-gray-200 p-3.5 rounded-2xl w-[160px]'}
                  ${(layout === 'list' || layout === 'grid') && cardStyle !== 'modern' ? 'w-full' : ''}
                  ${cardStyle === 'modern' && layout === 'carousel' ? 'w-[280px] border-r border-b-0 pr-6 mr-2' : ''}
                  shrink-0 snap-start
                `}
                  style={cardStyle !== 'modern' ? { backgroundColor: bgColor } : {}}
                >
                  {cardStyle === 'modern' ? (
                    <>
                      <div className="text-xs font-bold mb-1" style={{ color: dateColor }}>{date}</div>
                      <h3 className="text-lg font-bold leading-tight mb-0.5" style={{ color: titleColor }}>{post.title}</h3>
                      <div className="text-xs font-medium opacity-80 mb-2" style={{ color: textColor }}>{category} ÔÇó {readTime}</div>
                      <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: textColor, opacity: 0.8 }}>{description}</p>
                    </>
                  ) : cardStyle === 'featured' ? (
                    <>
                      <div className="aspect-[16/10] w-full bg-slate-200 rounded-xl overflow-hidden">
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: tagBg, color: tagText }}>{category}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: tagBg, color: tagText }}>{readTime}</span>
                      </div>
                      <h3 className="text-base font-extrabold leading-tight" style={{ color: titleColor }}>{post.title}</h3>
                      <div className="flex items-center gap-1.5 mt-auto pt-1">
                        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                        <span className="text-xs" style={{ color: textColor }}>{author}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-sm mb-1.5" style={{ color: titleColor }}>{post.title}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px]" style={{ color: textColor }}>{readTime}</span>
                        <span className="text-[11px] font-medium" style={{ color: dateColor }}>Read more &rarr;</span>
                      </div>
                    </>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </>
  );
};

const TourBlockPreview = ({ block }: { block: BioBlock }) => {
  const tours = block.tours || [];
  const title = block.tourTitle || "TOURS";
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const cardWidth = 160;
      const gap = 12; // gap-3
      const scrollAmount = (cardWidth + gap) * 3;
      const currentScroll = scrollContainerRef.current.scrollLeft;

      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full py-4 relative group/container">
      <h3 className="text-center text-white font-bold mb-4 tracking-wider text-sm">{title.toUpperCase()}</h3>

      {tours.length === 0 ? (
        <div className="text-center text-gray-500 text-xs py-8 bg-gray-100 rounded-lg border border-dashed border-gray-300">
          No tour dates added yet
        </div>
      ) : (
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/container:opacity-100 transition-opacity hover:bg-white/20 -ml-2"
          >
            <ArrowLeftIcon className="text-white" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50 opacity-0 group-hover/container:opacity-100 transition-opacity hover:bg-blue-500 -mr-2"
          >
            <ArrowRightIcon className="text-white" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-3 pb-4 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="relative flex-shrink-0 w-[160px] aspect-[3/4] rounded-lg overflow-hidden snap-center group"
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-gray-800">
                  {tour.image ? (
                    <img
                      src={tour.image}
                      alt={tour.location}
                      className="w-full h-full object-cover opacity-80"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                  {/* Top Badge */}
                  <div className="flex justify-start">
                    {tour.soldOut ? (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                        Sold Out
                      </span>
                    ) : tour.sellingFast ? (
                      <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-white/20">
                        Selling fast
                      </span>
                    ) : null}
                  </div>

                  {/* Bottom Info */}
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1">{tour.date}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-300 truncate w-full">
                      {tour.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SpotifyBlockPreview = ({ block }: { block: BioBlock }) => {
  const url = block.spotifyUrl;
  const isCompact = block.spotifyCompact;

  if (!url) {
    return (
      <div className="w-full py-4">
        <div className="text-center text-gray-500 text-xs py-8 bg-gray-100 rounded-lg border border-dashed border-gray-300">
          Add a Spotify link to display the player
        </div>
      </div>
    );
  }

  // Extract ID from URL
  // Supports:
  // https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
  // https://open.spotify.com/album/0fLheFnjlIV3pCNyY14Kta
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
  // spotify:track:4cOdK2wGLETKBW3PvgPWqT

  let embedUrl = "";

  try {
    if (url.startsWith("spotify:")) {
      const parts = url.split(":");
      embedUrl = `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
    } else {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const type = pathParts[pathParts.length - 2];
        const id = pathParts[pathParts.length - 1];
        embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
      }
    }
  } catch (e) {
    // Invalid URL
  }

  if (!embedUrl) {
    return (
      <div className="w-full py-4">
        <div className="text-center text-red-500 text-xs py-8 bg-red-50 rounded-lg border border-dashed border-red-300">
          Invalid Spotify URL
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 overflow-hidden">
      <iframe
        style={{ borderRadius: "12px", border: 0 }}
        src={embedUrl}
        width="100%"
        height={isCompact ? "80" : "152"}
        frameBorder="0"
        scrolling="no"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="overflow-hidden w-full"
      ></iframe>
    </div>
  );
};

const InstagramBlockPreview = ({ block }: { block: BioBlock }) => {
  const username = block.instagramUsername || "instagram";
  const displayType = block.instagramDisplayType || "grid";
  const showText = block.instagramShowText !== false;
  const textPosition = block.instagramTextPosition || "bottom";
  const textColor = block.instagramTextColor || "#0095f6";

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (!username || username === "instagram") {

      return;
    }
    setLoading(true);


    const controller = new AbortController();
    const timeoutId = setTimeout(() => {

      controller.abort();
    }, 10000);

    // Use the configured api instance instead of raw fetch to ensure correct base URL
    // Note: api is axios instance, so we use api.get
    api.get(`/public/instagram/${username}`, { signal: controller.signal })
      .then(res => {

        return res.data;
      })
      .then(data => {

        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setPosts([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch instagram posts", err);
        setPosts([]);
      })
      .finally(() => {

        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => {

      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [username]);

  const images = posts.length > 0 ? posts.map(p => p.imageUrl) : [null, null, null];
  // Fill up to 3 if less
  while (images.length < 3) images.push(null);
  const displayImages = images.slice(0, 3);

  const textElement = showText ? (
    <div className={`text-center ${textPosition === 'top' ? 'mb-2' : 'mt-2'}`}>
      <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: textColor }}>
        <InstagramIcon width={14} height={14} />
        @{username}
      </a>
    </div>
  ) : null;

  return (
    <div key={block.id} className="py-2">
      {textPosition === 'top' && textElement}
      <div className={`overflow-hidden rounded-xl ${displayType === 'grid' ? 'grid grid-cols-3 gap-1' : 'flex flex-col gap-3'}`}>
        {displayImages.map((img, i) => (
          <div key={i} className={`relative bg-gray-100 ${displayType === 'grid' ? 'aspect-square w-full' : 'aspect-square w-full max-h-[400px]'}`}>
            {img ? (
              <img
                src={img}
                alt="Instagram post"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                ) : (
                  <ImageIcon width={24} height={24} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {textPosition === 'bottom' && textElement}
    </div>
  );
};

const YoutubeBlockPreview = ({ block }: { block: BioBlock }) => {
  const url = block.youtubeUrl || "https://youtube.com/@youtube";
  const displayType = block.youtubeDisplayType || "grid";
  const showText = block.youtubeShowText !== false;
  const textPosition = block.youtubeTextPosition || "bottom";
  const textColor = block.youtubeTextColor || "#ff0000";

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // We send the URL as a query parameter to the backend
    // The backend will handle parsing the URL to find the channel ID
    api.get(`/public/youtube/fetch?url=${encodeURIComponent(url)}`, { signal: controller.signal })
      .then(res => res.data)
      .then(data => {
        if (Array.isArray(data)) {
          setVideos(data);
        } else {
          setVideos([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch youtube videos", err);
        setVideos([]);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [url]);

  const images = videos.length > 0 ? videos.map(v => v.imageUrl) : [null, null, null];
  // Fill up to 3 if less
  while (images.length < 3) images.push(null);
  const displayImages = images.slice(0, 3);

  const textElement = showText ? (
    <div className={`text-center ${textPosition === 'top' ? 'mb-2' : 'mt-2'}`}>
      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: textColor }}>
        <YouTubeIcon width={14} height={14} />
        YouTube Channel
      </a>
    </div>
  ) : null;

  return (
    <div key={block.id} className="py-2">
      {textPosition === 'top' && textElement}
      <div className={`overflow-hidden rounded-xl ${displayType === 'grid' ? 'grid grid-cols-3 gap-1' : 'flex flex-col gap-3'}`}>
        {displayImages.map((img, i) => (
          <div key={i} className={`relative bg-gray-100 ${displayType === 'grid' ? 'aspect-video w-full' : 'aspect-video w-full'}`}>
            {img ? (
              <img
                src={img}
                alt="YouTube video"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                ) : (
                  <YouTubeIcon width={24} height={24} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {textPosition === 'bottom' && textElement}
    </div>
  );
};

const QrCodeBlockPreview = ({ block }: { block: BioBlock }) => {
  const layout = block.qrCodeLayout || "single";
  const fgColor = block.qrCodeColor || "#000000";
  const bgColor = block.qrCodeBgColor || "#FFFFFF";

  if (layout === "single") {
    const value = block.qrCodeValue || "https://example.com";
    return (
      <div key={block.id} className="flex justify-center py-4">
        <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: bgColor }}>
          <QRCode
            value={value}
            size={150}
            fgColor={fgColor}
            bgColor={bgColor}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        </div>
      </div>
    );
  }

  const items = block.qrCodeItems || [];

  if (items.length === 0) {
    return (
      <div className="w-full py-4">
        <div className="text-center text-gray-500 text-xs py-8 bg-gray-100 rounded-lg border border-dashed border-gray-300">
          Add QR Codes to display
        </div>
      </div>
    );
  }

  return (
    <div key={block.id} className={`py-4 ${layout === 'grid' ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'}`}>
      {items.map((item) => (
        <div key={item.id} className="flex flex-col items-center gap-2 p-4 rounded-xl shadow-sm" style={{ backgroundColor: bgColor }}>
          <QRCode
            value={item.value || "https://example.com"}
            size={layout === 'grid' ? 100 : 120}
            fgColor={fgColor}
            bgColor={bgColor}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
          {item.label && (
            <span className="text-sm font-medium text-center" style={{ color: fgColor }}>{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
};

const MarketingBlockPreview = ({ block }: { block: BioBlock }) => {
  // TODO: Fetch slot data if marketingSlotId exists
  // For now, show placeholder
  const hasActiveSlot = false; // Will be true when connected to backend

  return (
    <div key={block.id} className="py-4">
      <div className="border-[3px] border-dashed border-gray-900/60 rounded-2xl p-6 bg-white/40 text-center backdrop-blur-sm">
        {hasActiveSlot ? (
          // When there's an active proposal/ad
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-3">
              <span className="text-white text-xl">📢</span>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Active Advertisement</h3>
            <p className="text-sm text-gray-600 mb-4">Company ad will appear here</p>
            <button className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition">
              View Details
            </button>
          </div>
        ) : (
          // Empty state - no active proposal
          <div>
            <div className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-gray-700 mb-1">Marketing Slot</h3>
            <p className="text-xs text-gray-500 mb-4">
              Configure this slot in the Marketing dashboard<br />
              Companies can submit advertising proposals
            </p>
            <a
              href="/dashboard/marketing"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Create Slot
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default function DashboardEditor() {
  const { bio, bios, selectBio, updateBio, getBios } = useContext(BioContext);
  const { user } = useContext(AuthContext);
  const [blocks, setBlocks] = useState<BioBlock[]>([]);
  const [marketingSlotStatusById, setMarketingSlotStatusById] = useState<Record<string, string>>({});
  const [dragItem, setDragItem] = useState<{ source: "palette" | "canvas"; type?: BioBlock["type"]; id?: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Content", "Social", "Shop", "Music", "Blog", "Marketing"]);
  const [expandedSettings, setExpandedSettings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"blocks" | "settings">("blocks");
  const [bgType, setBgType] = useState<"color" | "image" | "video" | "grid" | "dots" | "waves" | "polka" | "stripes" | "zigzag" | "mesh" | "particles" | "noise" | "abstract" | "palm-leaves" | "blueprint" | "marble" | "concrete" | "terracotta" | "wood-grain" | "brick" | "frosted-glass" | "steel" | "wheat">("color");
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [bgSecondaryColor, setBgSecondaryColor] = useState("#e2e8f0");
  const [bgImage, setBgImage] = useState("");
  const [bgVideo, setBgVideo] = useState("");

  // Card Styles
  const [cardStyle, setCardStyle] = useState<"none" | "solid" | "frosted">("none");
  const [cardBackgroundColor, setCardBackgroundColor] = useState("#ffffff");
  const [cardOpacity, setCardOpacity] = useState(100);
  const [cardBlur, setCardBlur] = useState(10); // Standard blur amount

  const [usernameColor, setUsernameColor] = useState("#111827");
  const [imageStyle, setImageStyle] = useState("circle");
  const [enableSubscribeButton, setEnableSubscribeButton] = useState(false);
  const [removeBranding, setRemoveBranding] = useState(false);
  const [font, setFont] = useState(bio?.font || 'Inter');
  const [customFontUrl, setCustomFontUrl] = useState(bio?.customFontUrl || null);
  const [customFontName, setCustomFontName] = useState(bio?.customFontName || null);
  const [showUpgrade, setShowUpgrade] = useState<string | null>(null);

  const [shareData, setShareData] = useState<{ url: string; title: string } | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // QR Code State
  const [availableQrCodes, setAvailableQrCodes] = useState<QrCode[]>([]);
  const [showCreateQrModal, setShowCreateQrModal] = useState(false);
  const [creatingQrForBlockId, setCreatingQrForBlockId] = useState<string | null>(null);
  const [newQrValue, setNewQrValue] = useState("");
  const [isCreatingQr, setIsCreatingQr] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!bio?.id) return;
    api.get("/marketing/slots/")
      .then(res => {
        const bioSlots = (res.data || []).filter((s: any) => s.bioId === bio.id);
        const map: Record<string, string> = {};
        bioSlots.forEach((slot: any) => {
          map[slot.id] = slot.status;
        });
        setMarketingSlotStatusById(map);
      })
      .catch(err => console.error("Failed to fetch marketing slots", err));
  }, [bio?.id]);

  const isMarketingLockedBlock = useCallback((block: BioBlock) => {
    if (block.type !== 'marketing' || !block.marketingId) return false;
    const status = marketingSlotStatusById[block.marketingId];
    return !!status && status !== 'available';
  }, [marketingSlotStatusById]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!bio?.id) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('bioId', bio.id);

    setIsUploading(true);
    try {
      // Use the new dedicated bio logo upload route
      const res = await api.post('/user/upload-bio-logo', formData);
      // Append timestamp to prevent caching
      const newImageUrl = `${res.data.url}?v=${Date.now()}`;

      // Regenerate HTML to ensure public page updates immediately
      const tempBio = {
        ...bio,
        blocks,
        bgType,
        bgColor,
        bgSecondaryColor,
        bgImage,
        bgVideo,
        cardStyle,
        cardBackgroundColor,
        cardOpacity,
        cardBlur,
        usernameColor,
        imageStyle,
        enableSubscribeButton,
        profileImage: newImageUrl // Use the new image
      };

      const newHtml = blocksToHtml(blocks, user, tempBio, window.location.origin);

      await updateBio(bio.id, {
        profileImage: newImageUrl,
        html: newHtml
      });

    } catch (error) {
      console.error("Failed to upload image", error);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }, []);

  const toggleSetting = useCallback((setting: string) => {
    setExpandedSettings((prev) =>
      prev.includes(setting) ? prev.filter((s) => s !== setting) : [...prev, setting]
    );
  }, []);

  const filteredPalette = useMemo(() => {
    if (!searchQuery) return palette;
    return palette.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const groupedPalette = useMemo(() => {
    const groups: Record<string, typeof palette> = {};
    filteredPalette.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredPalette]);

  useEffect(() => {
    if (!bio) getBios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bio?.id]);

  // --- Recent Colors Logic ---
  const [recentColors, setRecentColors] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('portyo_recent_colors');
    if (saved) {
      try {
        setRecentColors(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent colors", e);
      }
    }
  }, []);

  const addToRecentColors = useCallback((color: string) => {
    if (!color || !color.startsWith('#')) return;
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      const next = [color, ...filtered].slice(0, 7); // Keep top 7
      localStorage.setItem('portyo_recent_colors', JSON.stringify(next));
      return next;
    });
  }, []);

  // --- Undo Logic ---
  // We use a simple history stack. 
  // We snapshot "significant" state changes.

  const [undoStack, setUndoStack] = useState<any[]>([]);

  // Helper to capture current full state
  const getCurrentState = useCallback(() => {
    return {
      blocks,
      bgType,
      bgColor,
      bgSecondaryColor,
      bgImage,
      bgVideo,
      cardStyle,
      cardBackgroundColor,
      cardOpacity,
      cardBlur,
      usernameColor,
      imageStyle,
      enableSubscribeButton,
      removeBranding,
      font,
      customFontUrl,
      customFontName,
      bioId: bio?.id // Verify we are undoing for same bio
    };
  }, [blocks, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, cardStyle, cardBackgroundColor, cardOpacity, cardBlur, usernameColor, imageStyle, enableSubscribeButton, removeBranding, font, bio?.id]);

  // Load backend state (last saved) as "safety net" or initial checkpoint
  useEffect(() => {
    if (bio && undoStack.length === 0) {
      // Push initial state
      // We only do this once on load? 
      // Actually, we should probably do this when bio loads fully?
      // Let's rely on explicit snapshots for now to avoid complexity or infinite loops.
    }
  }, [bio]);

  const takeSnapshot = useCallback(() => {
    const state = getCurrentState();
    setUndoStack(prev => {
      const next = [...prev, state].slice(-20); // Keep last 20 states
      // Persist for page refresh safety
      localStorage.setItem(`portyo_undo_history_${state.bioId}`, JSON.stringify(next));
      return next;
    });
  }, [getCurrentState]);

  // Load undo history from local storage on mount
  useEffect(() => {
    if (bio?.id) {
      const savedHistory = localStorage.getItem(`portyo_undo_history_${bio.id}`);
      if (savedHistory) {
        try {
          setUndoStack(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to parse undo history", e);
        }
      }
    }
  }, [bio?.id]);

  const handleUndo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const previousState = newStack.pop(); // Get last state

      // Restore state
      if (previousState) {
        setBlocks(previousState.blocks);
        setBgType(previousState.bgType);
        setBgColor(previousState.bgColor);
        setBgSecondaryColor(previousState.bgSecondaryColor);
        setBgImage(previousState.bgImage);
        setBgVideo(previousState.bgVideo);
        setCardStyle(previousState.cardStyle);
        setCardBackgroundColor(previousState.cardBackgroundColor);
        setCardOpacity(previousState.cardOpacity);
        setCardBlur(previousState.cardBlur);
        setUsernameColor(previousState.usernameColor);
        setImageStyle(previousState.imageStyle);
        setEnableSubscribeButton(previousState.enableSubscribeButton);
        setRemoveBranding(previousState.removeBranding);
        setFont(previousState.font);
        setCustomFontUrl(previousState.customFontUrl);
        setCustomFontName(previousState.customFontName);
        setFont(previousState.font);

        // Should we save this restoration? Maybe not automatically, let the user decide or auto-save debounce handle it.
      }

      if (bio?.id) {
        localStorage.setItem(`portyo_undo_history_${bio.id}`, JSON.stringify(newStack));
      }
      return newStack;
    });
  }, [bio?.id]);

  // Auto-snapshot before major changes? 
  // For simplicity, let's snapshot when user STARTS editing certain things or periodically?
  // Let's attach snapshot to specific checkpoints manually if possible, or use a debounced approach where we snapshot *before* the change if it's been a while.
  // BUT the request says "save the last bio in localhost BEFORE a change is made". 
  // This implies we need to snapshot *right before* we commit a change.
  // Hooks are tricky for "before change". 
  // Easier Strategy: Whenever `debouncedHtml` changes (meaning user stopped typing/changing), we push the *previous* meaningful state? No, that's too late.

  // Revised Strategy: 
  // We use a simplified approach: The "Undo" button restores the state to what it was *before the session started* OR allows stepping back?
  // User asked: "system to leave the last selected color saved... also add a undo button... should save the last bio in localhost before a change is made"
  // Let's Snapshot whenever a setting setter is called? Too verbose.
  // Efficient Strategy: We assume the *current* state in `undoStack` (top) is the "previous" state. 
  // So before we change something, we should ensure the *current* state is in the stack.
  // But React state updates are async.

  // Let's use an interval? No. 
  // Let's snapshot on "Focus" of inputs? 
  // Let's provided a manual snapshot wrapper or just snapshot every X seconds if changed?

  // Let's implementing "Snapshot on Tab Change" or "Snapshot every 1 minute"?
  // Or better: Just snapshot when `handleSave` happens? That's too infrequent.

  // Let's implement a `saveCheckpoint` function and call it `onFocus` of inputs?

  // For `RecentColors`: We invoke `addToRecentColors` in `onChange` (debounced) or `onBlur` of color inputs.


  useEffect(() => {
    if (bio) {
      // Filter out PRO-only blocks if user is not PRO
      const PRO_BLOCK_TYPES = ['calendar', 'tour'];
      const originalBlocks = (bio.blocks as BioBlock[] | null) ?? defaultBlocks();
      let loadedBlocks = originalBlocks;
      let needsSave = false;
      const updates: Record<string, any> = {};

      // Check PRO-only blocks
      if (user?.plan !== 'pro') {
        loadedBlocks = originalBlocks.filter(block => !PRO_BLOCK_TYPES.includes(block.type));

        if (loadedBlocks.length < originalBlocks.length) {
          needsSave = true;
          updates.blocks = loadedBlocks;
        }
      }

      // Check Standard/Pro features for Free users
      if (user?.plan === 'free') {
        // Remove Email Signup if enabled
        if (bio.enableSubscribeButton) {
          needsSave = true;
          updates.enableSubscribeButton = false;
        }

        // Remove Branding removal if enabled
        if (bio.removeBranding) {
          needsSave = true;
          updates.removeBranding = false;
        }
      }

      // Auto-save if any changes were made
      if (needsSave) {
        const finalBlocks = updates.blocks || loadedBlocks;
        const html = blocksToHtml(finalBlocks, user, {
          ...bio,
          enableSubscribeButton: updates.enableSubscribeButton ?? bio.enableSubscribeButton,
          removeBranding: updates.removeBranding ?? bio.removeBranding
        }, window.location.origin);
        updateBio(bio.id, { html, ...updates }).catch(console.error);
      }

      setBlocks(loadedBlocks);
      setBgType((bio.bgType as any) || "color");
      setBgColor(bio.bgColor || "#f8fafc");
      setBgSecondaryColor(bio.bgSecondaryColor || "#e2e8f0");
      setBgImage(bio.bgImage || "");
      setBgVideo(bio.bgVideo || "");

      setCardStyle((bio.cardStyle as any) || "none");
      setCardBackgroundColor(bio.cardBackgroundColor || "#ffffff");
      setCardOpacity(bio.cardOpacity !== undefined ? bio.cardOpacity : 100);
      setCardBlur(bio.cardBlur !== undefined ? bio.cardBlur : 10);

      setUsernameColor(bio.usernameColor || "#111827");
      setImageStyle(bio.imageStyle || "circle");
      setFont(bio.font || 'Inter');

      // For Free users, force these to false
      setEnableSubscribeButton(user?.plan === 'free' ? false : (bio.enableSubscribeButton || false));
      setRemoveBranding(user?.plan === 'free' ? false : (bio.removeBranding || false));


      // Fetch QR Codes
      getQrCodes(bio.id).then(setAvailableQrCodes).catch(console.error);
    }
  }, [bio?.id, user?.plan]);

  const handleCreateQrCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bio?.id || !newQrValue) return;

    setIsCreatingQr(true);
    try {
      const newQr = await createQrCode(bio.id, newQrValue);
      setAvailableQrCodes(prev => [...prev, newQr]);

      if (creatingQrForBlockId) {
        setBlocks(prev => prev.map(block => {
          if (block.id === creatingQrForBlockId) {
            // If it's a single QR block
            if (block.qrCodeLayout === 'single' || !block.qrCodeLayout) {
              return { ...block, qrCodeValue: newQr.value };
            }
            // If it's a multiple QR block (we might need more logic here if we want to add to the list, 
            // but for now let's assume single or just don't auto-select for multiple to avoid confusion on WHICH item to update)
          }
          return block;
        }));
      }

      setNewQrValue("");
      setShowCreateQrModal(false);
      setCreatingQrForBlockId(null);
    } catch (error) {
      console.error("Failed to create QR code", error);
    } finally {
      setIsCreatingQr(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TRIGGER_IMAGE_UPLOAD') {
        document.getElementById('avatar-upload')?.click();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    // Initialize Subscribe Modal logic for Preview
    (window as any).openSubscribe = function () {
      const modal = document.getElementById('subscribe-modal');
      if (modal) modal.style.display = 'flex';
    };
    (window as any).closeSubscribe = function () {
      const modal = document.getElementById('subscribe-modal');
      if (modal) modal.style.display = 'none';
      const successMsg = document.getElementById('subscribe-success');
      if (successMsg) successMsg.style.display = 'none';
    };
    (window as any).submitSubscribe = function (e: any) {
      e.preventDefault();
      const emailInput = e.target.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value : '';

      if (email) {

        const successMsg = document.getElementById('subscribe-success');
        if (successMsg) {
          successMsg.style.display = 'block';
          successMsg.textContent = 'Thanks for subscribing!';
        }
        if (emailInput) emailInput.value = '';
        setTimeout(() => {
          (window as any).closeSubscribe();
        }, 2000);
      }
    };
  }, []);

  const handleDrop = useCallback((index?: number, event?: React.DragEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!dragItem) return;
    setBlocks((prev) => {
      const next = [...prev];

      if (dragItem.source === "palette" && dragItem.type) {
        const paletteItem = palette.find(p => p.type === dragItem.type);
        if (paletteItem?.isPro && user?.plan !== 'pro') {
          return prev;
        }

        takeSnapshot(); // Snapshot before adding new block

        const newBlock: BioBlock = {
          id: makeId(),
          type: dragItem.type,
          title: dragItem.type === "button" ? "New button" : dragItem.type === "heading" ? "New heading" : dragItem.type === "video" ? "New video" : "New block",
          body: dragItem.type === "text" ? "Describe something here." : undefined,
          href: dragItem.type === "button" ? "https://" : undefined,
          accent: dragItem.type === "button" ? "#111827" : undefined,
          mediaUrl: dragItem.type === "image" ? "https://placehold.co/1200x600" : dragItem.type === "video" ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : undefined,
          buttonStyle: "solid",
          buttonShape: "rounded",
          socials: dragItem.type === "socials" ? { instagram: "", twitter: "", linkedin: "" } : undefined,
          socialsLayout: "row",
          socialsLabel: false,
          blogLayout: dragItem.type === "blog" ? "carousel" : undefined,
          blogCardStyle: dragItem.type === "blog" ? "featured" : undefined,
          blogPostCount: dragItem.type === "blog" ? 3 : undefined,
          products: dragItem.type === "product" ? [
            { id: makeId(), title: "Product 1", price: "$19.99", image: "https://placehold.co/300x300", url: "#" },
            { id: makeId(), title: "Product 2", price: "$29.99", image: "https://placehold.co/300x300", url: "#" },
            { id: makeId(), title: "Product 3", price: "$39.99", image: "https://placehold.co/300x300", url: "#" }
          ] : undefined,
          productLayout: dragItem.type === "product" ? "carousel" : undefined,
          productBackgroundColor: dragItem.type === "product" ? "#ffffff" : undefined,
          productTextColor: dragItem.type === "product" ? "#1f2937" : undefined,
          productAccentColor: dragItem.type === "product" ? "#2563eb" : undefined,
          productButtonText: dragItem.type === "product" ? "View Product" : undefined,
          calendarTitle: dragItem.type === "calendar" ? "Book a Call" : undefined,
          calendarUrl: dragItem.type === "calendar" ? "https://calendly.com" : undefined,
          calendarColor: dragItem.type === "calendar" ? "#ffffff" : undefined,
          calendarTextColor: dragItem.type === "calendar" ? "#1f2937" : undefined,
          calendarAccentColor: dragItem.type === "calendar" ? "#2563eb" : undefined,
          mapTitle: dragItem.type === "map" ? "Our Office" : undefined,
          mapAddress: dragItem.type === "map" ? "123 Main St, City" : undefined,
          featuredTitle: dragItem.type === "featured" ? "Glow lipstick" : undefined,
          featuredPrice: dragItem.type === "featured" ? "$19.99" : undefined,
          featuredImage: dragItem.type === "featured" ? "https://placehold.co/300x300" : undefined,
          eventTitle: dragItem.type === "event" ? "Live Webinar" : undefined,
          eventDate: dragItem.type === "event" ? new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] + "T18:00" : undefined,
          eventColor: dragItem.type === "event" ? "#111827" : undefined,
          eventTextColor: dragItem.type === "event" ? "#ffffff" : undefined,
          eventButtonText: dragItem.type === "event" ? "Register Now" : undefined,
          eventButtonUrl: dragItem.type === "event" ? "#" : undefined,
          featuredUrl: dragItem.type === "featured" ? "#" : undefined,
          youtubeUrl: dragItem.type === "youtube" ? "https://youtube.com/@youtube" : undefined,
          youtubeDisplayType: dragItem.type === "youtube" ? "grid" : undefined,
          youtubeShowText: dragItem.type === "youtube" ? true : undefined,
          youtubeTextPosition: dragItem.type === "youtube" ? "bottom" : undefined,
          youtubeTextColor: dragItem.type === "youtube" ? "#ff0000" : undefined,
          featuredColor: dragItem.type === "featured" ? "#1f4d36" : undefined,
          featuredTextColor: dragItem.type === "featured" ? "#ffffff" : undefined,
          affiliateTitle: dragItem.type === "affiliate" ? "Copy my coupon code" : undefined,
          affiliateCode: dragItem.type === "affiliate" ? "ILoveMatcha" : undefined,
          affiliateImage: dragItem.type === "affiliate" ? "https://placehold.co/300x300" : undefined,
          affiliateUrl: dragItem.type === "affiliate" ? "#" : undefined,
          portfolioTitle: dragItem.type === "portfolio" ? "Portfólio" : undefined,
        };
        let targetIndex = typeof index === "number" ? index : next.length;
        const lockedIndices = next
          .map((block, idx) => (isMarketingLockedBlock(block) ? idx : -1))
          .filter((idx) => idx >= 0);
        if (lockedIndices.length > 0) {
          const lastLockedIndex = Math.max(...lockedIndices);
          if (targetIndex <= lastLockedIndex) {
            targetIndex = lastLockedIndex + 1;
          }
        }
        next.splice(targetIndex, 0, newBlock);
        setExpandedId(newBlock.id);
        return next;
      }

      if (dragItem.source === "canvas" && dragItem.id) {
        // For canvas reordering, the live swap in onDragEnter handles the order.
        // We just need to clear the drag state, which happens at the end of this function.
        return next;
      }

      return next;
    });
    setDragItem(null);
  }, [dragItem, isMarketingLockedBlock]);

  const handleSave = useCallback(async () => {
    if (!bio) return;
    setIsSaving(true);
    setStatus("idle");
    try {
      const html = blocksToHtml(blocks, user, { ...bio, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, cardStyle, cardBackgroundColor, cardOpacity, cardBlur, usernameColor, imageStyle, enableSubscribeButton, removeBranding, font, customFontUrl: customFontUrl || undefined, customFontName: customFontName || undefined }, window.location.origin);
      await updateBio(bio.id, { html, blocks, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, cardStyle, cardBackgroundColor, cardOpacity, cardBlur, usernameColor, imageStyle, enableSubscribeButton, removeBranding, font, customFontUrl: customFontUrl || undefined, customFontName: customFontName || undefined });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (error) {
      setStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [bio, blocks, user, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, cardStyle, cardBackgroundColor, cardOpacity, cardBlur, usernameColor, imageStyle, enableSubscribeButton, updateBio, removeBranding, font]);

  const handleFieldChange = useCallback((id: string, key: keyof BioBlock, value: any) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, [key]: value } : block)));
  }, []);

  const handleRemove = useCallback((id: string) => {
    takeSnapshot();
    setBlocks((prev) => {
      const block = prev.find((b) => b.id === id);
      if (block && isMarketingLockedBlock(block)) return prev;
      return prev.filter((b) => b.id !== id);
    });
  }, [takeSnapshot, isMarketingLockedBlock]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (block && isMarketingLockedBlock(block)) {
      e.preventDefault();
      return;
    }
    takeSnapshot(); // Snapshot before potentially reordering
    setDragItem({ source: "canvas", id });
  }, [blocks, isMarketingLockedBlock, takeSnapshot]);

  const handleDragEnd = useCallback(() => {
    setDragItem(null);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragItem?.source === "canvas" && dragItem.id !== id) {
      const draggedBlock = blocks.find((b) => b.id === dragItem.id);
      const hoverBlock = blocks.find((b) => b.id === id);
      if ((draggedBlock && isMarketingLockedBlock(draggedBlock)) || (hoverBlock && isMarketingLockedBlock(hoverBlock))) {
        return;
      }
      setBlocks((prev) => {
        const dragIndex = prev.findIndex((b) => b.id === dragItem.id);
        const hoverIndex = prev.findIndex((b) => b.id === id);
        if (dragIndex === -1 || hoverIndex === -1 || dragIndex === hoverIndex) return prev;

        const next = [...prev];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(hoverIndex, 0, moved);
        return next;
      });
    }
  }, [blocks, dragItem, isMarketingLockedBlock]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const previewBio = useMemo(() => {
    if (!bio) return null;
    const tempBio = {
      ...bio,
      blocks,
      bgType,
      bgColor,
      bgSecondaryColor,
      bgImage,
      bgVideo,
      cardStyle,
      cardBackgroundColor,
      cardOpacity,
      cardBlur,
      usernameColor,
      imageStyle,
      enableSubscribeButton,
      font,
      customFontUrl,
      customFontName,
      isPreview: true,
    };
    const html = blocksToHtml(blocks, user, tempBio, window.location.origin);
    return {
      ...tempBio,
      html,
      htmlBase64: null
    };
  }, [bio, blocks, user, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, cardStyle, cardBackgroundColor, cardOpacity, cardBlur, usernameColor, imageStyle, enableSubscribeButton, font]);

  const [debouncedHtml, setDebouncedHtml] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedHtml(previewBio?.html || "");
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [previewBio?.html]);

  // Real-time preview update for smoother experience
  useEffect(() => {
    if (!iframeRef.current?.contentDocument) return;

    const container = iframeRef.current.contentDocument.getElementById('profile-container');
    if (!container) return;

    if (cardStyle === 'none') {
      const style = container.style as any;
      style.backgroundColor = 'transparent';
      style.backdropFilter = 'none';
      style.webkitBackdropFilter = 'none';
      style.boxShadow = 'none';
      style.border = 'none';
      style.padding = '0'; // Or whatever default padding logic was
    } else {
      const hex = cardBackgroundColor || '#ffffff';
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const alpha = (cardOpacity !== undefined ? cardOpacity : 100) / 100;

      const style = container.style as any;
      style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      style.borderRadius = '24px';
      style.padding = '32px 24px';
      style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';

      if (cardStyle === 'frosted') {
        const blur = cardBlur !== undefined ? cardBlur : 10;
        style.backdropFilter = `blur(${blur}px)`;
        style.webkitBackdropFilter = `blur(${blur}px)`;
        style.border = '1px solid rgba(255,255,255,0.1)';
      } else {
        style.backdropFilter = 'none';
        style.webkitBackdropFilter = 'none';
        style.border = 'none';
      }
    }

  }, [cardStyle, cardBackgroundColor, cardOpacity, cardBlur]);

  if (!bio) {
    return (
      <div className="p-8 min-h-screen bg-[#f9f7f2] flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="text-gray-400 w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Bio Selected</h3>
          <p className="text-sm text-gray-500 mb-6">Create or select a bio to start editing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f2] font-sans text-gray-900 flex flex-col h-screen overflow-hidden">
      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Custom Scrollbar for inner content */
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 20px;
        }
      `}</style>

      {/* Top Bar */}
      <header className="shrink-0 px-3 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#f9f7f2] z-40">
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Editor</p>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-none">{bio.sufix}</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* AI Assistant */}
          <div className="flex-shrink min-w-0">
            <PortyoAI
              bioId={bio.id}
              onBlocksGenerated={(newBlocks: BioBlock[], replace: boolean) => {
                // AI is not allowed to remove existing blocks
                setBlocks(prev => {
                  if (!newBlocks || newBlocks.length === 0) return prev;
                  return [...prev, ...newBlocks];
                });
              }}
              onSettingsChange={(settings) => {
                if (settings?.bgType) setBgType(settings.bgType as any);
                if (settings?.bgColor) setBgColor(settings.bgColor);
                if (settings?.bgSecondaryColor) setBgSecondaryColor(settings.bgSecondaryColor);
                if (settings?.cardStyle) setCardStyle(settings.cardStyle as any);
                if (settings?.cardBackgroundColor) setCardBackgroundColor(settings.cardBackgroundColor);
                if (settings?.usernameColor) setUsernameColor(settings.usernameColor);
                if (settings?.font) setFont(settings.font);
                if (settings?.imageStyle) setImageStyle(settings.imageStyle);
              }}
              onGlobalStylesChange={(styles) => {
                if (!styles) return;
                setBlocks(prev => prev.map(block => ({
                  ...block,
                  ...styles
                })));
              }}
            />
          </div>

          <div className="hidden md:flex items-center bg-white rounded-xl border border-gray-200 shadow-sm p-1">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Undo last change"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
              </svg>
              Undo
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <button
              onClick={() => setShareData({ url: `https://${bio.sufix}.portyo.me`, title: `@${bio.sufix}` })}

              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              Share
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <a
              href={`https://${bio.sufix}.portyo.me`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              Open page
              <ExternalLinkIcon width={12} height={12} />
            </a>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-black text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex-shrink-0"
          >
            {isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">Save bio</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 px-6 pb-6 min-h-0">
        <div className="grid grid-cols-12 gap-6 h-full">

          {/* Left Column: Tools & Settings (Col Span 3) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 p-3 bg-white">
              <button
                onClick={() => setActiveTab("blocks")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${activeTab === "blocks" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
              >
                Blocks
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${activeTab === "settings" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
              >
                Settings
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              {activeTab === "blocks" ? (
                <div className="space-y-6">
                  {/* Search */}
                  <div className="relative group">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search blocks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Palette Groups */}
                  <div className="space-y-6 pb-8">
                    {Object.keys(groupedPalette).length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-xs font-medium">No blocks found</div>
                    ) : (
                      Object.entries(groupedPalette).map(([category, items]) => (
                        <div key={category}>
                          <button
                            className="w-full flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-600 transition-colors"
                            onClick={() => toggleCategory(category)}
                          >
                            {category}
                            <ChevronDownIcon width={14} height={14} className={`transition-transform duration-200 ${expandedCategories.includes(category) ? 'rotate-0' : '-rotate-90'}`} />
                          </button>

                          {expandedCategories.includes(category) && (
                            <div className="grid grid-cols-2 gap-3">
                              {items.map((item) => {
                                const isLocked = item.isPro && user?.plan !== 'pro';
                                return (
                                  <div
                                    key={item.type}
                                    draggable={!isLocked}
                                    onDragStart={() => !isLocked && setDragItem({ source: "palette", type: item.type as BioBlock["type"] })}
                                    onDragEnd={() => setDragItem(null)}
                                    className={`
                                                    group relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 bg-white transition-all duration-200
                                                    ${isLocked
                                        ? 'opacity-60 grayscale cursor-not-allowed bg-gray-50'
                                        : 'cursor-grab active:cursor-grabbing hover:border-blue-200 hover:shadow-md hover:-translate-y-1'
                                      }
                                                `}
                                  >
                                    {isLocked && <div className="absolute top-2 right-2 flex space-x-1"><div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div></div>}

                                    <div className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-500 mb-1 transition-colors
                                                    ${!isLocked && 'group-hover:bg-blue-50 group-hover:text-blue-600'}
                                                 `}>
                                      <div className="scale-90">
                                        {item.icon}
                                      </div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{item.label}</span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Settings Tab content */
                <div className="space-y-8 pb-8">
                  {/** Font Settings */}
                  <div>
                    <button
                      className="w-full flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-600 transition-colors"
                      onClick={() => toggleSetting("font")}
                    >
                      Typography
                      <ChevronDownIcon width={14} height={14} className={`transition-transform duration-200 ${expandedSettings.includes("font") ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                    {expandedSettings.includes("font") && (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div>
                          <label className="text-xs font-medium text-gray-900 mb-2 block">Font Family</label>
                          <div className="relative">
                            <select
                              value={font}
                              onChange={(e) => setFont(e.target.value)}
                              className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-8 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="Inter">Inter (Default)</option>
                              <option value="Roboto">Roboto</option>
                              <option value="Open Sans">Open Sans</option>
                              <option value="Merriweather">Merriweather</option>
                              <option value="Oswald">Oswald</option>
                              <option value="Raleway">Raleway</option>
                              <option value="Poppins">Poppins</option>
                              {bio?.customFontName && <option value="Custom">{bio.customFontName} (Custom)</option>}
                            </select>
                            <div className="absolute right-3 top-2.5 pointer-events-none text-gray-400">
                              <ChevronDownIcon width={14} height={14} />
                            </div>
                          </div>

                          <div className="mt-3">
                            <input
                              type="file"
                              id="font-upload"
                              accept=".ttf,.otf,.woff,.woff2"
                              className="hidden"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  const formData = new FormData();
                                  formData.append('font', file);

                                  try {
                                    setIsSaving(true);
                                    const res = await api.post('/user/upload-font', formData);
                                    const { url, name } = res.data;

                                    if (!url) throw new Error("No URL returned from upload");

                                    // Set state immediately
                                    setCustomFontUrl(url);
                                    setCustomFontName(name);
                                    setFont('Custom');

                                    // Update bio immediately to select the new font
                                    if (bio) {
                                      // Regenerate HTML with new font settings explicity
                                      // Use 'Custom' directly as font
                                      const tempBio = {
                                        ...bio,
                                        blocks,
                                        bgType: bgType || bio.bgType,
                                        bgColor: bgColor || bio.bgColor,
                                        bgSecondaryColor: bgSecondaryColor || bio.bgSecondaryColor,
                                        bgImage: bgImage || bio.bgImage,
                                        bgVideo: bgVideo || bio.bgVideo,
                                        cardStyle: cardStyle || bio.cardStyle,
                                        cardBackgroundColor: cardBackgroundColor || bio.cardBackgroundColor,
                                        cardOpacity: cardOpacity ?? bio.cardOpacity,
                                        cardBlur: cardBlur ?? bio.cardBlur,
                                        usernameColor: usernameColor || bio.usernameColor,
                                        imageStyle: imageStyle || bio.imageStyle,
                                        enableSubscribeButton: enableSubscribeButton ?? bio.enableSubscribeButton,
                                        removeBranding: removeBranding ?? bio.removeBranding,
                                        customFontUrl: url,
                                        customFontName: name,
                                        font: 'Custom'
                                      };

                                      // Pass strict tempBio to generator
                                      const newHtml = blocksToHtml(blocks, user, tempBio, window.location.origin);

                                      // Then save to backend
                                      await updateBio(bio.id, {
                                        customFontUrl: url,
                                        customFontName: name,
                                        font: 'Custom',
                                        html: newHtml
                                      });
                                    }
                                  } catch (err) {
                                    console.error("Font upload failed", err);
                                    alert("Failed to upload font. Please try a valid font file (ttf, otf, woff, woff2).");
                                  } finally {
                                    setIsSaving(false);
                                  }
                                }
                              }}
                            />
                            <label
                              htmlFor="font-upload"
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm group"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-gray-600 transition-colors">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                              </svg>
                              Upload Custom Font
                            </label>
                            <p className="text-[10px] text-gray-400 mt-1.5 text-center px-1">
                              Supports .ttf, .otf, .woff, .woff2 (max 10MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Background Settings */}
                  <div>
                    <button
                      className="w-full flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-600 transition-colors"
                      onClick={() => toggleSetting("background")}
                    >
                      Background
                      <ChevronDownIcon width={14} height={14} className={`transition-transform duration-200 ${expandedSettings.includes("background") ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                    {expandedSettings.includes("background") && (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-3 gap-2">
                          {(['color', 'image', 'video', 'grid', 'dots', 'waves', 'abstract', 'palm-leaves', 'wheat', 'gradient', 'blueprint', 'marble', 'wood-grain', 'brick', 'frosted-glass', 'steel', 'concrete', 'terracotta']).map((type) => (
                            <button
                              key={type}
                              onClick={() => setBgType(type as any)}
                              className={`px-2 py-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${bgType === type ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                            >
                              {type.replace('-', ' ')}
                            </button>
                          ))}
                        </div>

                        {bgType === 'color' && (
                          <div>
                            <ColorPicker
                              label="Overlay Color"
                              value={bgColor}
                              onChange={(val) => {
                                setBgColor(val);
                                takeSnapshot();
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Settings */}
                  <div>
                    <button
                      className="w-full flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-600 transition-colors"
                      onClick={() => toggleSetting("card")}
                    >
                      Card Style
                      <ChevronDownIcon width={14} height={14} className={`transition-transform duration-200 ${expandedSettings.includes("card") ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                    {expandedSettings.includes("card") && (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">

                        {/* Style Selector */}
                        <div>
                          <label className="text-xs font-medium text-gray-900 mb-2 block">Card Type</label>
                          <div className="flex bg-gray-100 p-1 rounded-lg">
                            {[
                              { value: 'none', label: 'None' },
                              { value: 'solid', label: 'Solid' },
                              { value: 'frosted', label: 'Frosted' }
                            ].map((type) => (
                              <button
                                key={type.value}
                                onClick={() => setCardStyle(type.value as any)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${cardStyle === type.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                              >
                                {type.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Additional Options when style is active */}
                        {cardStyle !== 'none' && (
                          <>
                            {/* Background Color */}
                            <div>
                              <ColorPicker
                                label="Card Color"
                                value={cardBackgroundColor}
                                onChange={(val) => setCardBackgroundColor(val)}
                              />
                            </div>

                            {/* Opacity */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-gray-900">Opacity</label>
                                <span className="text-xs text-gray-500 font-mono">{cardOpacity}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={cardOpacity}
                                onChange={(e) => setCardOpacity(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                              />
                            </div>

                            {/* Blur (Only for Frosted) */}
                            {cardStyle === 'frosted' && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-xs font-medium text-gray-900">Blur</label>
                                  <span className="text-xs text-gray-500 font-mono">{cardBlur}px</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="40"
                                  value={cardBlur}
                                  onChange={(e) => setCardBlur(parseInt(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                />
                              </div>
                            )}
                          </>
                        )}

                      </div>
                    )}
                  </div>

                  {/* Profile Settings */}
                  <div>
                    <button
                      className="w-full flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-600 transition-colors"
                      onClick={() => toggleSetting("profile")}
                    >
                      Profile
                      <ChevronDownIcon width={14} height={14} className={`transition-transform duration-200 ${expandedSettings.includes("profile") ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                    {expandedSettings.includes("profile") && (
                      <div className="space-y-4">



                        {/* Image Style Selector */}
                        <div>
                          <label className="text-xs font-medium text-gray-900 mb-2 block">Image Shape</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['circle', 'rounded', 'square', 'amoeba', 'star', 'hexagon'].map((style) => (
                              <button
                                key={style}
                                onClick={() => setImageStyle(style)}
                                className={`px-2 py-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${imageStyle === style ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4">
                          <ColorPicker
                            label="Username Color"
                            value={usernameColor}
                            onChange={(val) => setUsernameColor(val)}
                          />
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <label className="text-xs font-medium text-gray-900 mb-2 block">Verification Status</label>
                          <button
                            onClick={() => {
                              if (bio?.id) updateBio(bio.id, { verified: !bio.verified });
                            }}
                            className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${bio?.verified
                              ? 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                              : 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/5 hover:-translate-y-0.5'
                              }`}
                          >
                            {bio?.verified ? (
                              <>
                                <BadgeCheck size={16} fill="#3b82f6" className="text-white" />
                                <span>Verified</span>
                              </>
                            ) : (
                              <>
                                <span>Get Verified</span>
                                <BadgeCheck size={16} className="text-blue-400" />
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Other Settings */}
                  <div>
                    <button
                      className="w-full flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-600 transition-colors"
                      onClick={() => toggleSetting("features")}
                    >
                      Features
                      <ChevronDownIcon width={14} height={14} className={`transition-transform duration-200 ${expandedSettings.includes("features") ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                    {expandedSettings.includes("features") && (
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">Email Signup</span>
                            {user?.plan === 'free' && <span className="text-[10px] text-black font-bold">STANDARD / PRO</span>}
                          </div>
                          <div className={`w-10 h-5 rounded-full relative transition-colors ${user?.plan === 'free' ? 'opacity-50' : ''} ${enableSubscribeButton ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <input
                              type="checkbox"
                              checked={enableSubscribeButton}
                              onChange={(e) => {
                                if (user?.plan === 'free') {
                                  setShowUpgrade('email_signup');
                                  return;
                                }
                                const checked = e.target.checked;
                                setEnableSubscribeButton(checked);
                                if (bio?.id) updateBio(bio.id, { enableSubscribeButton: checked });
                              }}
                              className="hidden"
                            />
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${enableSubscribeButton ? 'left-5.5' : 'left-0.5'}`} />
                          </div>
                        </label>

                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">Remove Branding</span>
                            {user?.plan === 'free' && <span className="text-[10px] text-black font-bold">STANDARD / PRO</span>}
                          </div>
                          <div className={`w-10 h-5 rounded-full relative transition-colors ${user?.plan === 'free' ? 'opacity-50' : ''} ${removeBranding ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <input
                              type="checkbox"
                              checked={removeBranding}
                              onChange={(e) => {
                                if (user?.plan === 'free') {
                                  setShowUpgrade('branding');
                                } else {
                                  const checked = e.target.checked;
                                  setRemoveBranding(checked);
                                  if (bio?.id) updateBio(bio.id, { removeBranding: checked });
                                }
                              }}
                              className="hidden"
                            />
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${removeBranding ? 'left-5.5' : 'left-0.5'}`} />
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Middle Column: Drag & Drop (Col Span 6 - BIGGEST) */}
          {/* Middle Column: Drag & Drop (Col Span 5 - ADJUSTED) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <h2 className="font-bold text-gray-900 text-lg">Layout</h2>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">Drag to reorder</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/50">
              <div
                className="space-y-4 min-h-[500px] pb-20"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(undefined, event)}
              >
                {/* Empty State */}
                {blocks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                      <div className="scale-150"><img src="/favicon.ico" className="w-6 h-6 opacity-50 grayscale" alt="" /></div>
                      {/* Using a placeholder icon since I can't easily import a specific one without checking imports */}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Your bio is empty</h3>
                    <p className="text-sm text-gray-500 max-w-xs">Drag blocks from the left sidebar to start building your page.</p>
                  </div>
                )}

                {/* Drop Zone Top */}
                {blocks.length > 0 && (
                  <div
                    className={`h-2 rounded-lg transition-all ${dragItem ? 'bg-blue-100 my-2' : 'bg-transparent my-0'}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(0, e)}
                  />
                )}

                {/* Blocks */}
                {blocks.map((block, index) => (
                  <BlockItem
                    key={block.id}
                    block={block}
                    index={index}
                    isExpanded={expandedId === block.id}
                    isDragging={dragItem?.id === block.id}
                    isDragOver={false} /* Simplified, usually managed by BlockItem internal ref or complex state */
                    dragItem={dragItem}
                    isLocked={block.type === 'marketing' && !!block.marketingId && !!marketingSlotStatusById[block.marketingId] && marketingSlotStatusById[block.marketingId] !== 'available'}
                    onToggleExpand={handleToggleExpand}
                    onRemove={handleRemove}
                    onChange={handleFieldChange}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDrop={(e: React.DragEvent, i: number) => handleDrop(i, e)}
                    onDragEnter={handleDragEnter}
                    availableQrCodes={availableQrCodes}
                    onCreateQrCode={() => {
                      setCreatingQrForBlockId(block.id);
                      setShowCreateQrModal(true);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Preview (Col Span 3 - SIMPLIFIED) */}
          {/* Right Column: Preview (Col Span 4 - ADJUSTED) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden items-center relative">
            <div className="w-full h-full">
              <iframe
                ref={iframeRef}
                srcDoc={debouncedHtml || ""}
                className="w-full h-full scrollbar-hide border-none"
                title="Bio Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur border border-gray-200 px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold text-gray-500 uppercase tracking-widest z-10 pointer-events-none">
              <span>Live Preview</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            </div>
          </div>

        </div>
      </div >

      {/* Mobile Preview FAB */}
      < div className="lg:hidden fixed bottom-6 right-6 z-50" >
        <button
          onClick={() => setShowMobilePreview(true)}
          className="bg-gray-900 text-white p-4 rounded-full shadow-xl hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center border border-white/20"
          aria-label="Preview Bio"
        >
          <Eye className="w-6 h-6" />
        </button>
      </div >

      {/* Mobile Preview Modal */}
      {
        showMobilePreview && (
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
        )
      }

      {/* Modals & Popups */}
      {
        showUpgrade && (
          <UpgradePopup
            isOpen={!!showUpgrade}
            onClose={() => setShowUpgrade(null)}
          />
        )
      }

      {
        showCreateQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Create New QR Code</h3>
              <form onSubmit={handleCreateQrCode}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination URL</label>
                  <input
                    type="url"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="https://example.com"
                    value={newQrValue}
                    onChange={e => setNewQrValue(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCreateQrModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isCreatingQr} className="px-6 py-2 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                    {isCreatingQr ? 'Creating...' : 'Create QR'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Hidden Global Inputs */}
      <input
        type="file"
        id="avatar-upload"
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

    </div >
  );
}

function alignmentClass(align?: string) {
  if (align === "center") return "justify-center";
  if (align === "right") return "justify-end";
  return "justify-start";
}

function textAlignClass(align?: string) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}


