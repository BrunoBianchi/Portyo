import { useContext, useEffect, useMemo, useState, useRef, useCallback } from "react";
import type { MetaFunction } from "react-router";
import BioContext, { type BioBlock } from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import BlockItem from "~/components/dashboard-editor/block-item";
import { BlogPostPopup } from "~/components/blog-post-popup";
import { palette } from "~/data/editor-palette";
import { blocksToHtml } from "~/services/html-generator";
import { api } from "~/services/api";
import QRCode from "react-qr-code";
import { getQrCodes, createQrCode, type QrCode } from "~/services/qrcode.service";
import BioLayout from "~/components/bio-layout";
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
} from "~/components/icons";

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
    subtitle: i === 0 ? "Tech4Humans • São Paulo, SP - Remote" : "Category • Location",
    createdAt: new Date().toISOString(),
    content: "FullStack Developer at Tech4Humans, working on projects for large insurance companies. I had the chance to participate in the development of new features...",
    tags: ["FullStack Dev", "Soft Skills", "Hard Skills"],
    category: "Lifestyle",
    readTime: "5 min read",
    image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Post",
    author: "By You"
  }));

  return (
    <>
      {selectedPost && (
        <BlogPostPopup
          post={{
            ...selectedPost,
            date: new Date(selectedPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Post",
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
              const image = "https://placehold.co/600x400/e2e8f0/94a3b8?text=Post";
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
                      <div className="text-xs font-medium opacity-80 mb-2" style={{ color: textColor }}>{category} • {readTime}</div>
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
    console.log("InstagramBlockPreview useEffect triggered", { username });
    if (!username || username === "instagram") {
      console.log("InstagramBlockPreview: username is invalid or default, skipping fetch");
      return;
    }
    setLoading(true);
    console.log("InstagramBlockPreview: starting fetch for", username);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("InstagramBlockPreview: fetch timed out");
      controller.abort();
    }, 10000);

    // Use the configured api instance instead of raw fetch to ensure correct base URL
    // Note: api is axios instance, so we use api.get
    api.get(`/public/instagram/${username}`, { signal: controller.signal })
      .then(res => {
        console.log("InstagramBlockPreview: fetch response received", res.status);
        return res.data;
      })
      .then(data => {
        console.log("InstagramBlockPreview: data received", data);
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
        console.log("InstagramBlockPreview: fetch completed (finally)");
        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => {
      console.log("InstagramBlockPreview: cleanup");
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

export default function DashboardEditor() {
  const { bio, bios, selectBio, updateBio, getBios } = useContext(BioContext);
  const { user } = useContext(AuthContext);
  const [blocks, setBlocks] = useState<BioBlock[]>([]);
  const [dragItem, setDragItem] = useState<{ source: "palette" | "canvas"; type?: BioBlock["type"]; id?: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Content", "Social", "Shop", "Music", "Blog", "Layout"]);
  const [expandedSettings, setExpandedSettings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"blocks" | "settings">("blocks");
  const [bgType, setBgType] = useState<"color" | "image" | "video" | "grid" | "dots" | "waves" | "polka" | "stripes" | "zigzag" | "mesh" | "particles" | "noise" | "abstract" | "palm-leaves" | "blueprint" | "marble" | "concrete" | "terracotta">("color");
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [bgSecondaryColor, setBgSecondaryColor] = useState("#e2e8f0");
  const [bgImage, setBgImage] = useState("");
  const [bgVideo, setBgVideo] = useState("");
  const [usernameColor, setUsernameColor] = useState("#111827");
  const [imageStyle, setImageStyle] = useState("circle");
  const [enableSubscribeButton, setEnableSubscribeButton] = useState(false);

  // Card/Layout State
  const [cardStyle, setCardStyle] = useState("none");
  const [cardBackgroundColor, setCardBackgroundColor] = useState("#ffffff");
  const [cardBorderColor, setCardBorderColor] = useState("#e2e8f0");
  const [cardBorderWidth, setCardBorderWidth] = useState(0);
  const [cardBorderRadius, setCardBorderRadius] = useState(16);
  const [cardShadow, setCardShadow] = useState("none");
  const [cardPadding, setCardPadding] = useState(24);
  const [maxWidth, setMaxWidth] = useState(640);

  const [shareData, setShareData] = useState<{ url: string; title: string } | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // QR Code State
  const [availableQrCodes, setAvailableQrCodes] = useState<QrCode[]>([]);
  const [showCreateQrModal, setShowCreateQrModal] = useState(false);
  const [creatingQrForBlockId, setCreatingQrForBlockId] = useState<string | null>(null);
  const [newQrValue, setNewQrValue] = useState("");
  const [isCreatingQr, setIsCreatingQr] = useState(false);

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

  useEffect(() => {
    if (bio) {
      setBlocks((bio.blocks as BioBlock[] | null) ?? defaultBlocks());
      setBgType((bio.bgType as any) || "color");
      setBgColor(bio.bgColor || "#f8fafc");
      setBgSecondaryColor(bio.bgSecondaryColor || "#e2e8f0");
      setBgImage(bio.bgImage || "");
      setBgVideo(bio.bgVideo || "");
      setUsernameColor(bio.usernameColor || "#111827");
      setImageStyle(bio.imageStyle || "circle");
      setEnableSubscribeButton(bio.enableSubscribeButton || false);

      // Load Card/Layout settings
      setCardStyle(bio.cardStyle || "none");
      setCardBackgroundColor(bio.cardBackgroundColor || "#ffffff");
      setCardBorderColor(bio.cardBorderColor || "#e2e8f0");
      setCardBorderWidth(Number(bio.cardBorderWidth ?? 0));
      setCardBorderRadius(Number(bio.cardBorderRadius ?? 16));
      setCardShadow(bio.cardShadow || "none");
      setCardPadding(Number(bio.cardPadding ?? 24));
      setMaxWidth(Number(bio.maxWidth ?? 640));

      // Fetch QR Codes
      getQrCodes(bio.id).then(setAvailableQrCodes).catch(console.error);
    }
  }, [bio?.id, bio?.blocks]);

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
        console.log('Subscribing email:', email);
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

        const newBlock: BioBlock = {
          id: makeId(),
          type: dragItem.type,
          title: dragItem.type === "button" ? "New button" : dragItem.type === "heading" ? "New heading" : dragItem.type === "video" ? "New video" : "New block",
          body: dragItem.type === "text" ? "Describe something here." : undefined,
          href: dragItem.type === "button" ? "https://" : undefined,
          align: "center",
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
        };
        const targetIndex = typeof index === "number" ? index : next.length;
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
  }, [dragItem]);

  const handleSave = useCallback(async () => {
    if (!bio) return;
    setIsSaving(true);
    setStatus("idle");
    try {
      const layoutSettings = {
        cardStyle,
        cardBackgroundColor,
        cardBorderColor,
        cardBorderWidth: Number(cardBorderWidth),
        cardBorderRadius: Number(cardBorderRadius),
        cardShadow,
        cardPadding: Number(cardPadding),
        maxWidth: Number(maxWidth)
      };
      const html = blocksToHtml(blocks, user, { ...bio, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, usernameColor, imageStyle, enableSubscribeButton, ...layoutSettings });
      await updateBio(bio.id, { html, blocks, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, usernameColor, imageStyle, enableSubscribeButton, ...layoutSettings });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (error) {
      setStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [bio, blocks, user, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, usernameColor, imageStyle, enableSubscribeButton, updateBio, cardStyle, cardBackgroundColor, cardBorderColor, cardBorderWidth, cardBorderRadius, cardShadow, cardPadding, maxWidth]);

  const handleFieldChange = useCallback((id: string, key: keyof BioBlock, value: any) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, [key]: value } : block)));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDragItem({ source: "canvas", id });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragItem(null);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragItem?.source === "canvas" && dragItem.id !== id) {
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
  }, [dragItem]);

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
      usernameColor,
      imageStyle,
      enableSubscribeButton,
      cardStyle,
      cardBackgroundColor,
      cardBorderColor,
      cardBorderWidth,
      cardBorderRadius,
      cardShadow,
      cardPadding,
      maxWidth
    };
    const html = blocksToHtml(blocks, user, tempBio);
    return {
      ...tempBio,
      html,
      htmlBase64: null
    };
  }, [bio, blocks, user, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, usernameColor, imageStyle, enableSubscribeButton, cardStyle, cardBackgroundColor, cardBorderColor, cardBorderWidth, cardBorderRadius, cardShadow, cardPadding, maxWidth]);

  if (!bio) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto bg-surface border border-border rounded-2xl p-8 text-center">
          <p className="text-lg text-text-muted">Create or select a bio to start editing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-alt/60">
      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes wobble { 0% { transform: translateX(0%); } 15% { transform: translateX(-25%) rotate(-5deg); } 30% { transform: translateX(20%) rotate(3deg); } 45% { transform: translateX(-15%) rotate(-3deg); } 60% { transform: translateX(10%) rotate(2deg); } 75% { transform: translateX(-5%) rotate(-1deg); } 100% { transform: translateX(0%); } }
      `}</style>
      <div className="px-4 py-4 max-w-full mx-auto space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs text-text-muted">Drag & drop editor</p>
            <h1 className="text-2xl font-bold text-text-main">Build your bio</h1>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setShowMobilePreview(true)}
              className="xl:hidden inline-flex items-center gap-2 rounded-xl bg-white border border-border px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <EyeIcon />
              Preview
            </button>
            <div className="flex items-center bg-white rounded-xl border border-border shadow-sm p-1">
              <button
                onClick={() => setShareData({ url: `https://${bio.sufix}.portyo.me`, title: `@${bio.sufix}` })}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
              >
                Share
                <ShareIcon />
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1"></div>
              <a
                href={`https://${bio.sufix}.portyo.me`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
              >
                Open page
                <ExternalLinkIcon />
              </a>
            </div>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-white shadow-md hover:bg-gray-900 transition"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save bio"}
            </button>
            {status === "saved" && <span className="text-sm text-green-600">Saved</span>}
            {status === "error" && <span className="text-sm text-red-600">Error saving</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1 items-start">
          <section className="bg-white border border-border rounded-xl p-3 shadow-sm h-[calc(100vh-120px)] overflow-y-auto relative lg:sticky top-0 lg:top-4 scrollbar-hide">
            <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
              <button
                onClick={() => setActiveTab("blocks")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "blocks" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Blocks
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "settings" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Settings
              </button>
            </div>

            {activeTab === "blocks" ? (
              <>
                <div className="mb-6">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.entries(groupedPalette).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="mb-3">
                        <button
                          className="text-sm font-medium text-text-main flex items-center gap-2 select-none cursor-pointer hover:text-primary transition-colors w-full text-left"
                          onClick={() => toggleCategory(category)}
                          aria-expanded={expandedCategories.includes(category)}
                        >
                          <span className={`transform transition-transform duration-200 ${expandedCategories.includes(category) ? '' : '-rotate-90'}`}>
                            <ChevronDownIcon width={14} height={14} />
                          </span>
                          {category}
                        </button>
                      </h3>
                      {expandedCategories.includes(category) && (
                        <div className="grid grid-cols-3 gap-2">
                          {items.map((item) => {
                            const isLocked = item.isPro && user?.plan !== 'pro';
                            return (
                              <div
                                key={item.type}
                                draggable={!isLocked}
                                onDragStart={() => !isLocked && setDragItem({ source: "palette", type: item.type as BioBlock["type"] })}
                                onDragEnd={() => setDragItem(null)}
                                className={`flex flex-col items-center justify-center gap-1 p-1.5 rounded-2xl border border-border bg-white transition-all group shadow-sm relative ${isLocked
                                  ? 'opacity-60 cursor-not-allowed'
                                  : 'hover:border-primary hover:bg-primary/5 cursor-grab active:cursor-grabbing hover:shadow-md'
                                  }`}
                              >
                                {isLocked && (
                                  <div className="absolute top-1 right-1 bg-black text-white text-[8px] px-1 rounded font-bold z-10">
                                    PRO
                                  </div>
                                )}
                                <div className={`text-gray-500 transition-colors [&>svg]:w-5 [&>svg]:h-5 ${!isLocked && 'group-hover:text-primary'}`}>
                                  {item.icon}
                                </div>
                                <p className="font-medium text-[10px] text-text-main text-center leading-tight">{item.label}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                  {Object.keys(groupedPalette).length === 0 && (
                    <div className="text-center py-8 text-text-muted text-sm">
                      No blocks found
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                {/* Background Section */}
                <div>
                  <h3 className="mb-3">
                    <button
                      className="text-sm font-medium text-text-main flex items-center gap-2 select-none cursor-pointer hover:text-primary transition-colors w-full text-left"
                      onClick={() => toggleSetting("background")}
                      aria-expanded={expandedSettings.includes("background")}
                    >
                      <span className={`transform transition-transform duration-200 ${expandedSettings.includes("background") ? '' : '-rotate-90'}`}>
                        <ChevronDownIcon width={14} height={14} />
                      </span>
                      Background
                    </button>
                  </h3>

                  {expandedSettings.includes("background") && (
                    <div className="pl-2 space-y-6">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-2 block">Type</label>
                        <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg">
                          {(['color', 'image', 'video', 'grid', 'dots', 'waves', 'polka', 'stripes', 'zigzag', 'mesh', 'particles', 'noise', 'abstract', 'palm-leaves', 'blueprint', 'marble', 'concrete', 'terracotta'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => setBgType(type)}
                              className={`py-1.5 text-xs font-medium rounded-md transition-all ${bgType === type ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {bgType === "color" && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Background Color</label>
                          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                            <div className="relative flex-shrink-0 w-10 h-10">
                              <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div
                                className="w-full h-full rounded-lg border border-gray-200 shadow-sm transition-transform active:scale-95"
                                style={{ backgroundColor: bgColor }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-full bg-transparent border-none text-sm font-medium text-gray-900 focus:ring-0 p-0 placeholder-gray-400"
                                placeholder="#000000"
                              />
                              <p className="text-[10px] text-gray-400 mt-0.5">Hex color code</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {['grid', 'dots', 'waves', 'polka', 'stripes', 'zigzag', 'mesh', 'particles', 'noise', 'abstract', 'palm-leaves', 'blueprint', 'marble', 'concrete', 'terracotta'].includes(bgType) && (
                        <div className="flex flex-col gap-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Background Color</label>
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                              <div className="relative flex-shrink-0 w-10 h-10">
                                <input
                                  type="color"
                                  value={bgColor}
                                  onChange={(e) => setBgColor(e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                  className="w-full h-full rounded-lg border border-gray-200 shadow-sm transition-transform active:scale-95"
                                  style={{ backgroundColor: bgColor }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={bgColor}
                                  onChange={(e) => setBgColor(e.target.value)}
                                  className="w-full bg-transparent border-none text-sm font-medium text-gray-900 focus:ring-0 p-0 placeholder-gray-400"
                                  placeholder="#000000"
                                />
                                <p className="text-[10px] text-gray-400 mt-0.5">Base color</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Pattern Color</label>
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                              <div className="relative flex-shrink-0 w-10 h-10">
                                <input
                                  type="color"
                                  value={bgSecondaryColor}
                                  onChange={(e) => setBgSecondaryColor(e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                  className="w-full h-full rounded-lg border border-gray-200 shadow-sm transition-transform active:scale-95"
                                  style={{ backgroundColor: bgSecondaryColor }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={bgSecondaryColor}
                                  onChange={(e) => setBgSecondaryColor(e.target.value)}
                                  className="w-full bg-transparent border-none text-sm font-medium text-gray-900 focus:ring-0 p-0 placeholder-gray-400"
                                  placeholder="#000000"
                                />
                                <p className="text-[10px] text-gray-400 mt-0.5">Pattern accent</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {bgType === "image" && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Image URL</label>
                          <input
                            type="text"
                            value={bgImage}
                            onChange={(e) => setBgImage(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-3 py-2 bg-gray-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          <p className="text-xs text-gray-500 mt-2">Enter a direct link to an image.</p>
                        </div>
                      )}

                      {bgType === "video" && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Video URL</label>
                          <input
                            type="text"
                            value={bgVideo}
                            onChange={(e) => setBgVideo(e.target.value)}
                            placeholder="https://example.com/video.mp4"
                            className="w-full px-3 py-2 bg-gray-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          <p className="text-xs text-gray-500 mt-2">Enter a direct link to an MP4 video.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Header Section */}
                <div>
                  <h3
                    className="text-sm font-medium text-text-main mb-3 flex items-center gap-2 select-none cursor-pointer hover:text-primary transition-colors"
                    onClick={() => toggleSetting("profile")}
                  >
                    <span className={`transform transition-transform duration-200 ${expandedSettings.includes("profile") ? '' : '-rotate-90'}`}>
                      <ChevronDownIcon width={14} height={14} />
                    </span>
                    Profile Header
                  </h3>

                  {expandedSettings.includes("profile") && (
                    <div className="pl-2 space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Username Color</label>
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                          <div className="relative flex-shrink-0 w-10 h-10">
                            <input
                              type="color"
                              value={usernameColor}
                              onChange={(e) => setUsernameColor(e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                              className="w-full h-full rounded-lg border border-gray-200 shadow-sm transition-transform active:scale-95"
                              style={{ backgroundColor: usernameColor }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={usernameColor}
                              onChange={(e) => setUsernameColor(e.target.value)}
                              className="w-full bg-transparent border-none text-sm font-medium text-gray-900 focus:ring-0 p-0 placeholder-gray-400"
                              placeholder="#000000"
                            />
                            <p className="text-[10px] text-gray-400 mt-0.5">Text color</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Profile Image Style</label>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { id: 'circle', label: 'Circle', style: { borderRadius: '50%' } },
                            { id: 'rounded', label: 'Rounded', style: { borderRadius: '8px' } },
                            { id: 'square', label: 'Square', style: { borderRadius: '0' } },
                            { id: 'star', label: 'Star', style: { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' } },
                            { id: 'hexagon', label: 'Hex', style: { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' } },
                          ].map((style) => (
                            <button
                              key={style.id}
                              onClick={() => setImageStyle(style.id)}
                              className={`aspect-square flex items-center justify-center bg-gray-100 rounded-lg border-2 transition-all ${imageStyle === style.id ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent hover:bg-gray-200 text-gray-500'
                                }`}
                              title={style.label}
                            >
                              <div className="w-6 h-6 bg-current" style={style.style}></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Layout Section */}
                <div>
                  <h3 className="mb-3">
                    <button
                      className="text-sm font-medium text-text-main flex items-center gap-2 select-none cursor-pointer hover:text-primary transition-colors w-full text-left"
                      onClick={() => toggleSetting("layout")}
                      aria-expanded={expandedSettings.includes("layout")}
                    >
                      <span className={`transform transition-transform duration-200 ${expandedSettings.includes("layout") ? '' : '-rotate-90'}`}>
                        <ChevronDownIcon width={14} height={14} />
                      </span>
                      Layout
                    </button>
                  </h3>

                  {expandedSettings.includes("layout") && (
                    <div className="pl-2 space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Card Style</label>
                        <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg">
                          {(['flat', 'card', 'glass', 'neumorphism', 'outline'] as const).map((style) => (
                            <button
                              key={style}
                              onClick={() => setCardStyle(style)}
                              className={`py-1.5 text-xs font-medium rounded-md transition-all ${cardStyle === style ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                              {style.charAt(0).toUpperCase() + style.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {cardStyle !== 'flat' && (
                        <>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Card Background</label>
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                              <div className="relative flex-shrink-0 w-10 h-10">
                                <input
                                  type="color"
                                  value={cardBackgroundColor}
                                  onChange={(e) => setCardBackgroundColor(e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                  className="w-full h-full rounded-lg border border-gray-200 shadow-sm transition-transform active:scale-95"
                                  style={{ backgroundColor: cardBackgroundColor }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={cardBackgroundColor}
                                  onChange={(e) => setCardBackgroundColor(e.target.value)}
                                  className="w-full bg-transparent border-none text-sm font-medium text-gray-900 focus:ring-0 p-0 placeholder-gray-400"
                                  placeholder="#ffffff"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Border Color</label>
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                              <div className="relative flex-shrink-0 w-10 h-10">
                                <input
                                  type="color"
                                  value={cardBorderColor}
                                  onChange={(e) => setCardBorderColor(e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                  className="w-full h-full rounded-lg border border-gray-200 shadow-sm transition-transform active:scale-95"
                                  style={{ backgroundColor: cardBorderColor }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={cardBorderColor}
                                  onChange={(e) => setCardBorderColor(e.target.value)}
                                  className="w-full bg-transparent border-none text-sm font-medium text-gray-900 focus:ring-0 p-0 placeholder-gray-400"
                                  placeholder="#e5e7eb"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Border Width: {cardBorderWidth}px</label>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={cardBorderWidth}
                              onChange={(e) => setCardBorderWidth(Number(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Border Radius: {cardBorderRadius}px</label>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              value={cardBorderRadius}
                              onChange={(e) => setCardBorderRadius(Number(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Shadow</label>
                            <select
                              value={cardShadow}
                              onChange={(e) => setCardShadow(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                              <option value="none">None</option>
                              <option value="0 1px 2px 0 rgb(0 0 0 / 0.05)">Small</option>
                              <option value="0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)">Medium</option>
                              <option value="0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)">Large</option>
                              <option value="0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)">Extra Large</option>
                            </select>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Max Width: {maxWidth}px</label>
                        <input
                          type="range"
                          min="320"
                          max="1200"
                          step="10"
                          value={maxWidth}
                          onChange={(e) => setMaxWidth(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Padding: {cardPadding}px</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={cardPadding}
                          onChange={(e) => setCardPadding(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Features Section */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h3 className="mb-3">
                    <button
                      className="text-sm font-medium text-text-main flex items-center gap-2 select-none cursor-pointer hover:text-primary transition-colors w-full text-left"
                      onClick={() => toggleSetting("features")}
                      aria-expanded={expandedSettings.includes("features")}
                    >
                      <span className={`transform transition-transform duration-200 ${expandedSettings.includes("features") ? '' : '-rotate-90'}`}>
                        <ChevronDownIcon width={14} height={14} />
                      </span>
                      Features
                    </button>
                  </h3>

                  {expandedSettings.includes("features") && (
                    <div className="pl-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-900 block">Subscribe Button</label>
                            {user?.plan === 'free' && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-gray-900 text-white">
                                Pro
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">Allow visitors to subscribe to your newsletter.</p>
                        </div>
                        <button
                          onClick={() => {
                            if (user?.plan !== 'free') {
                              setEnableSubscribeButton(!enableSubscribeButton);
                            } else {
                              alert("Upgrade to Standard or Pro to enable this feature.");
                            }
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${enableSubscribeButton ? 'bg-primary' : 'bg-gray-200'
                            } ${user?.plan === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableSubscribeButton ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="bg-white border border-border rounded-xl p-3 shadow-sm h-[calc(100vh-120px)] overflow-y-auto relative lg:sticky top-0 lg:top-4 scrollbar-hide">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-text-main">Layout</h2>
              <span className="text-xs text-text-muted">Drag to reorder</span>
            </div>
            <div
              className="min-h-[420px] border border-dashed border-border rounded-lg p-3 bg-surface-alt/50"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(undefined, event)}
              onDragEnter={(event) => event.preventDefault()}
            >
              {blocks.length === 0 && (
                <div className="h-full flex items-center justify-center text-text-muted text-sm">
                  Drop a block here to start.
                </div>
              )}

              {blocks.length > 0 && (
                <div
                  className={`transition-all duration-200 ease-out rounded-xl border-2 border-dashed flex items-center justify-center mb-2 ${dragItem && dragItem.source === "palette"
                    ? "h-14 border-primary/30 bg-primary/5 opacity-100 hover:border-primary hover:bg-primary/10"
                    : "h-0 border-transparent opacity-0 overflow-hidden"
                    }`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(0, event)}
                >
                  <span className="text-xs font-medium text-primary pointer-events-none">
                    Insert at top
                  </span>
                </div>
              )}

              {blocks.map((block, index) => (
                <BlockItem
                  key={block.id}
                  block={block}
                  index={index}
                  isExpanded={expandedId === block.id}
                  isDragging={dragItem?.id === block.id}
                  isDragOver={false}
                  dragItem={dragItem}
                  onToggleExpand={handleToggleExpand}
                  onRemove={handleRemove}
                  onChange={handleFieldChange}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDrop={(e, i) => handleDrop(i, e)}
                  onDragEnter={handleDragEnter}
                  availableQrCodes={availableQrCodes}
                  onCreateQrCode={() => {
                    setCreatingQrForBlockId(block.id);
                    setShowCreateQrModal(true);
                  }}
                />
              ))}
            </div>
          </section>

          <section className={showMobilePreview ? 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4' : 'hidden xl:flex justify-center items-start bg-white/30 border border-border/40 rounded-xl p-3 shadow-sm h-[calc(100vh-120px)] overflow-hidden sticky top-4'}>
            {showMobilePreview && (
              <button
                onClick={() => setShowMobilePreview(false)}
                className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg z-50 text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <XIcon width={24} height={24} />
              </button>
            )}
            <div className={`relative transition-all duration-300 ${showMobilePreview ? 'scale-90 sm:scale-100' : 'scale-90 2xl:scale-100'}`}>
              <div className="relative w-[320px] h-[660px] bg-black rounded-[3rem] shadow-2xl border-[8px] border-gray-900 ring-1 ring-white/10">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-40 bg-black rounded-b-2xl z-20 border-b border-x border-white/10"></div>

                {/* Side buttons */}
                <div className="absolute -left-[10px] top-28 h-12 w-[3px] bg-gray-800 rounded-l-md"></div>
                <div className="absolute -left-[10px] top-44 h-12 w-[3px] bg-gray-800 rounded-l-md"></div>
                <div className="absolute -right-[10px] top-40 h-16 w-[3px] bg-gray-800 rounded-r-md"></div>

                {/* Screen */}
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-white relative">
                  {previewBio && (
                    <BioLayout bio={previewBio} subdomain={previewBio.sufix} isPreview />
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
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
