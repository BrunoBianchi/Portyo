import { useContext, useEffect, useMemo, useState, useRef, useCallback } from "react";
import type { MetaFunction } from "react-router";
import BioContext, { type BioBlock } from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import BlockItem from "~/components/dashboard-editor/block-item";
import { BlogPostPopup } from "~/components/blog-post-popup";
import { palette } from "~/data/editor-palette";
import { blocksToHtml } from "~/services/html-generator";
import { api } from "~/services/api";
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
          <div className={`${
            layout === 'carousel' ? 'flex gap-3 w-max' : 
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
            )})}
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
  const [bgType, setBgType] = useState<"color" | "image" | "video" | "grid" | "dots" | "waves" | "polka" | "stripes" | "zigzag" | "mesh" | "particles" | "noise" | "abstract">("color");
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [bgSecondaryColor, setBgSecondaryColor] = useState("#e2e8f0");
  const [bgImage, setBgImage] = useState("");
  const [bgVideo, setBgVideo] = useState("");
  const [usernameColor, setUsernameColor] = useState("#111827");
  const [imageStyle, setImageStyle] = useState("circle");
  
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
      
      // Load Card/Layout settings
      setCardStyle(bio.cardStyle || "none");
      setCardBackgroundColor(bio.cardBackgroundColor || "#ffffff");
      setCardBorderColor(bio.cardBorderColor || "#e2e8f0");
      setCardBorderWidth(Number(bio.cardBorderWidth ?? 0));
      setCardBorderRadius(Number(bio.cardBorderRadius ?? 16));
      setCardShadow(bio.cardShadow || "none");
      setCardPadding(Number(bio.cardPadding ?? 24));
      setMaxWidth(Number(bio.maxWidth ?? 640));
    }
  }, [bio?.id, bio?.blocks]);

  useEffect(() => {
    // Initialize Subscribe Modal logic for Preview
    (window as any).openSubscribe = function() {
        const modal = document.getElementById('subscribe-modal');
        if (modal) modal.style.display = 'flex';
    };
    (window as any).closeSubscribe = function() {
        const modal = document.getElementById('subscribe-modal');
        if (modal) modal.style.display = 'none';
        const successMsg = document.getElementById('subscribe-success');
        if (successMsg) successMsg.style.display = 'none';
    };
    (window as any).submitSubscribe = function(e: any) {
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
      const html = blocksToHtml(blocks, user, { ...bio, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, usernameColor, imageStyle, ...layoutSettings });
      await updateBio(bio.id, { html, blocks, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, usernameColor, imageStyle, ...layoutSettings });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (error) {
      setStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [bio, blocks, user, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, usernameColor, imageStyle, updateBio, cardStyle, cardBackgroundColor, cardBorderColor, cardBorderWidth, cardBorderRadius, cardShadow, cardPadding, maxWidth]);

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

  const previewBlocks = useMemo(() => blocks, [blocks]);

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
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "blocks" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Blocks
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "settings" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
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
                          {items.map((item) => (
                            <div
                              key={item.type}
                              draggable
                              onDragStart={() => setDragItem({ source: "palette", type: item.type })}
                              onDragEnd={() => setDragItem(null)}
                              className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-2xl border border-border hover:border-primary hover:bg-primary/5 cursor-grab active:cursor-grabbing bg-white transition-all group shadow-sm hover:shadow-md"
                            >
                              <div className="text-gray-500 group-hover:text-primary transition-colors [&>svg]:w-5 [&>svg]:h-5">
                                {item.icon}
                              </div>
                              <p className="font-medium text-[10px] text-text-main text-center leading-tight">{item.label}</p>
                            </div>
                          ))}
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
                          {(['color', 'image', 'video', 'grid', 'dots', 'waves', 'polka', 'stripes', 'zigzag', 'mesh', 'particles', 'noise', 'abstract'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => setBgType(type)}
                              className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                                bgType === type ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
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

                      {['grid', 'dots', 'waves', 'polka', 'stripes', 'zigzag', 'mesh', 'particles', 'noise', 'abstract'].includes(bgType) && (
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
                              className={`aspect-square flex items-center justify-center bg-gray-100 rounded-lg border-2 transition-all ${
                                imageStyle === style.id ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent hover:bg-gray-200 text-gray-500'
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
                              className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                                cardStyle === style ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
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
                  className={`transition-all duration-200 ease-out rounded-xl border-2 border-dashed flex items-center justify-center mb-2 ${
                    dragItem && dragItem.source === "palette"
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
                <div 
                  className="w-full h-full rounded-[2.5rem] overflow-hidden relative flex flex-col"
                  style={{
                    backgroundColor: bgColor,
                    backgroundImage: 
                      bgType === 'image' ? `url(${bgImage})` : 
                      bgType === 'grid' ? `linear-gradient(${bgSecondaryColor} 1px, transparent 1px), linear-gradient(90deg, ${bgSecondaryColor} 1px, transparent 1px)` :
                      bgType === 'dots' ? `radial-gradient(${bgSecondaryColor} 1px, transparent 1px)` :
                      bgType === 'polka' ? `radial-gradient(${bgSecondaryColor} 20%, transparent 20%), radial-gradient(${bgSecondaryColor} 20%, transparent 20%)` :
                      bgType === 'stripes' ? `repeating-linear-gradient(45deg, ${bgColor}, ${bgColor} 10px, ${bgSecondaryColor} 10px, ${bgSecondaryColor} 20px)` :
                      bgType === 'zigzag' ? `linear-gradient(135deg, ${bgSecondaryColor} 25%, transparent 25%), linear-gradient(225deg, ${bgSecondaryColor} 25%, transparent 25%), linear-gradient(45deg, ${bgSecondaryColor} 25%, transparent 25%), linear-gradient(315deg, ${bgSecondaryColor} 25%, ${bgColor} 25%)` :
                      bgType === 'waves' ? `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='${encodeURIComponent(bgSecondaryColor)}' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` :
                      bgType === 'mesh' ? `radial-gradient(at 40% 20%, ${bgSecondaryColor} 0px, transparent 50%), radial-gradient(at 80% 0%, ${bgSecondaryColor} 0px, transparent 50%), radial-gradient(at 0% 50%, ${bgSecondaryColor} 0px, transparent 50%)` :
                      bgType === 'particles' ? `radial-gradient(${bgSecondaryColor} 2px, transparent 2px), radial-gradient(${bgSecondaryColor} 2px, transparent 2px)` :
                      bgType === 'noise' ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` :
                      bgType === 'abstract' ? `linear-gradient(30deg, ${bgSecondaryColor} 12%, transparent 12.5%, transparent 87%, ${bgSecondaryColor} 87.5%, ${bgSecondaryColor}), linear-gradient(150deg, ${bgSecondaryColor} 12%, transparent 12.5%, transparent 87%, ${bgSecondaryColor} 87.5%, ${bgSecondaryColor}), linear-gradient(30deg, ${bgSecondaryColor} 12%, transparent 12.5%, transparent 87%, ${bgSecondaryColor} 87.5%, ${bgSecondaryColor}), linear-gradient(150deg, ${bgSecondaryColor} 12%, transparent 12.5%, transparent 87%, ${bgSecondaryColor} 87.5%, ${bgSecondaryColor}), linear-gradient(60deg, ${bgSecondaryColor}77 25%, transparent 25.5%, transparent 75%, ${bgSecondaryColor}77 75%, ${bgSecondaryColor}77), linear-gradient(60deg, ${bgSecondaryColor}77 25%, transparent 25.5%, transparent 75%, ${bgSecondaryColor}77 75%, ${bgSecondaryColor}77)` :
                      undefined,
                    backgroundSize: 
                      bgType === 'image' ? 'cover' : 
                      bgType === 'grid' || bgType === 'dots' || bgType === 'stripes' || bgType === 'zigzag' ? '20px 20px' :
                      bgType === 'polka' ? '20px 20px' :
                      bgType === 'waves' ? 'auto' :
                      bgType === 'particles' ? '32px 32px' :
                      bgType === 'abstract' ? '20px 35px' :
                      'cover',
                    backgroundPosition: 
                      bgType === 'image' ? 'center' : 
                      bgType === 'polka' ? '0 0, 10px 10px' :
                      bgType === 'zigzag' ? '10px 0, 10px 0, 0 0, 0 0' :
                      bgType === 'particles' ? '0 0, 16px 16px' :
                      bgType === 'abstract' ? '0 0, 0 0, 10px 18px, 10px 18px, 0 0, 10px 18px' :
                      'center',
                    backgroundRepeat: 
                      bgType === 'image' ? 'no-repeat' : 'repeat',
                  }}
                >
                  {bgType === 'video' && bgVideo && (
                    <>
                      <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      >
                        <source src={bgVideo} type="video/mp4" />
                      </video>
                      <div className="absolute inset-0 bg-black/30 z-0" />
                    </>
                  )}

                  {/* Status Bar Area */}
                  <div className="absolute top-0 w-full h-12 z-10 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                  
                  {/* Background Pattern */}
                  {bgType === 'color' && (
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                         style={{ 
                           backgroundImage: 'linear-gradient(90deg, #000 1px, transparent 1px)', 
                           backgroundSize: '40px 100%' 
                         }} 
                    />
                  )}

                  {/* Top Navigation Bar */}
                  <div className="relative z-20 px-6 pt-14 pb-2 flex items-center justify-between">
                    <button 
                      className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700"
                      aria-label="Home"
                    >
                      <HomeIcon />
                    </button>
                    <button className="h-10 px-4 rounded-full bg-white shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <BellIcon />
                      Subscribe
                    </button>
                  </div>

                  {/* Content Scrollable Area */}
                  <div className="flex-1 overflow-y-auto pb-8 px-4 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                    <div style={{
                      width: '100%',
                      margin: '0 auto',
                      padding: `${cardPadding}px`,
                      position: 'relative',
                      zIndex: 1,
                      ...(cardStyle === 'card' ? {
                        background: cardBackgroundColor,
                        border: `${cardBorderWidth}px solid ${cardBorderColor}`,
                        borderRadius: `${cardBorderRadius}px`,
                        boxShadow: cardShadow,
                        marginTop: '24px',
                        marginBottom: '24px'
                      } : cardStyle === 'glass' ? {
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: `${cardBorderWidth}px solid rgba(255,255,255,0.2)`,
                        borderRadius: `${cardBorderRadius}px`,
                        boxShadow: cardShadow,
                        marginTop: '24px',
                        marginBottom: '24px'
                      } : cardStyle === 'neumorphism' ? {
                        background: cardBackgroundColor,
                        borderRadius: `${cardBorderRadius}px`,
                        boxShadow: '5px 5px 15px #d1d1d1, -5px -5px 15px #ffffff',
                        marginTop: '24px',
                        marginBottom: '24px'
                      } : cardStyle === 'outline' ? {
                        background: 'transparent',
                        border: `${cardBorderWidth}px solid ${cardBorderColor}`,
                        borderRadius: `${cardBorderRadius}px`,
                        marginTop: '24px',
                        marginBottom: '24px'
                      } : {})
                    }}>
                    {/* User Profile Section */}
                    <div className="flex flex-col items-center gap-2 pt-8 pb-6">
                      <div 
                        className={`w-24 h-24 bg-gray-100 shadow-sm overflow-hidden ${
                          imageStyle === 'circle' ? 'rounded-full border-4 border-white' : 
                          imageStyle === 'rounded' ? 'rounded-2xl border-4 border-white' : 
                          imageStyle === 'square' ? 'rounded-none border-4 border-white' : 
                          ''
                        }`}
                        style={{
                          clipPath: 
                            imageStyle === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                            imageStyle === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
                            undefined
                        }}
                      >
                        <img 
                          src={`/users-photos/${user?.id}-96.webp`} 
                          srcSet={`/users-photos/${user?.id}-96.webp 1x, /users-photos/${user?.id}-192.webp 2x`}
                          onError={(e) => { 
                            const target = e.currentTarget;
                            target.onerror = () => {
                              target.src = `/users-photos/julia-soares.jpeg`;
                            };
                            target.srcset = '';
                            target.src = `/users-photos/${user?.id}.png`;
                          }}
                          alt={user?.fullname || "User avatar"} 
                          className="w-full h-full object-cover"
                          width="96"
                          height="96"
                          fetchPriority="high"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold" style={{ color: usernameColor }}>@{bio.sufix}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {previewBlocks.map((block) => {
                        if (block.type === "heading") {
                          const trigger = block.animationTrigger || 'loop';
                          const isHover = trigger === 'hover';
                          const animationStyle = block.animation && block.animation !== 'none' && !isHover
                            ? { animation: `${block.animation} 1s ${trigger === 'once' ? '1' : 'infinite'}` } 
                            : {};
                          const hoverClass = isHover && block.animation && block.animation !== 'none' ? `hover-anim-${block.id}` : '';

                          return (
                            <div key={block.id} className={`${textAlignClass(block.align)} py-2 ${hoverClass}`} style={animationStyle}>
                              {isHover && <style>{`.${hoverClass}:hover { animation: ${block.animation} 1s infinite; }`}</style>}
                              <h3 className="text-2xl font-bold leading-tight break-words" style={{ color: block.textColor || "#000000" }}>{block.title || "Heading"}</h3>
                              {block.body && <p className="mt-2 text-sm leading-relaxed break-words" style={{ color: block.textColor ? `${block.textColor}b3` : "#6b7280" }}>{block.body}</p>}
                            </div>
                          );
                        }

                        if (block.type === "text") {
                          const trigger = block.animationTrigger || 'loop';
                          const isHover = trigger === 'hover';
                          const animationStyle = block.animation && block.animation !== 'none' && !isHover
                            ? { animation: `${block.animation} 1s ${trigger === 'once' ? '1' : 'infinite'}` } 
                            : {};
                          const hoverClass = isHover && block.animation && block.animation !== 'none' ? `hover-anim-${block.id}` : '';

                          return (
                            <div key={block.id} className={`${textAlignClass(block.align)} ${hoverClass}`} style={animationStyle}>
                              {isHover && <style>{`.${hoverClass}:hover { animation: ${block.animation} 1s infinite; }`}</style>}
                              <p className="text-sm leading-relaxed break-words" style={{ color: block.textColor || "#4b5563" }}>{block.body}</p>
                            </div>
                          );
                        }

                        if (block.type === "button") {
                          const isDark = block.accent === "#111827" || block.accent === "#000000" || !block.accent;
                          const textColor = block.textColor || (isDark ? "#ffffff" : "#111827");
                          const style = block.buttonStyle || "solid";
                          const shape = block.buttonShape || "rounded";
                          const textAlign = block.buttonTextAlign || "center";
                          
                          let buttonClass = `relative flex items-center min-h-[60px] px-6 py-3 text-sm font-semibold w-full transition-transform active:scale-95 border`;
                          
                          // Shape
                          if (shape === "pill") buttonClass += " rounded-full";
                          else if (shape === "square") buttonClass += " rounded-lg";
                          else buttonClass += " rounded-2xl";

                          // Style
                          const bg = block.accent || "#111827";
                          const shadowColor = block.buttonShadowColor || bg;
                          let inlineStyle: React.CSSProperties = {};

                          if (style === "outline") {
                            buttonClass += " bg-transparent";
                            inlineStyle = { borderColor: bg, color: bg };
                          } else if (style === "ghost") {
                            buttonClass += " bg-transparent border-transparent shadow-none";
                            inlineStyle = { color: bg };
                          } else if (style === "hard-shadow") {
                            buttonClass += " border-solid";
                            inlineStyle = { 
                                backgroundColor: bg, 
                                color: textColor, 
                                borderColor: shadowColor,
                                borderWidth: '2px',
                                boxShadow: `4px 4px 0px 0px ${shadowColor}`,
                            };
                          } else if (style === "soft-shadow") {
                            buttonClass += " border-transparent";
                            inlineStyle = { 
                                backgroundColor: bg, 
                                color: textColor,
                                boxShadow: `0 10px 15px -3px ${shadowColor}40, 0 4px 6px -2px ${shadowColor}20`
                            };
                          } else if (style === "3d") {
                            buttonClass += " border-transparent active:translate-y-[2px] active:border-b-[2px]";
                            inlineStyle = { 
                                backgroundColor: bg, 
                                color: textColor,
                                borderBottom: `4px solid ${shadowColor}`,
                                transition: 'all 0.1s'
                            };
                          } else if (style === "glass") {
                            buttonClass += " border border-white/30 backdrop-blur-md bg-white/20";
                            inlineStyle = { color: textColor };
                          } else if (style === "gradient") {
                            buttonClass += " border-none";
                            inlineStyle = { 
                                background: `linear-gradient(45deg, ${bg}, ${shadowColor})`,
                                color: textColor 
                            };
                          } else if (style === "neumorphism") {
                            buttonClass += " border-none";
                            inlineStyle = { 
                                backgroundColor: bg,
                                color: textColor,
                                boxShadow: `-5px -5px 10px rgba(255,255,255,0.5), 5px 5px 10px ${shadowColor}40`
                            };
                          } else if (style === "clay") {
                            buttonClass += " border-none rounded-3xl";
                            inlineStyle = { 
                                backgroundColor: bg,
                                color: textColor,
                                boxShadow: `inset 6px 6px 12px rgba(255,255,255,0.4), inset -6px -6px 12px ${shadowColor}20, 8px 16px 24px ${shadowColor}40`
                            };
                          } else if (style === "cyberpunk") {
                            buttonClass += " border-l-4 font-mono uppercase rounded-none";
                            inlineStyle = { 
                                backgroundColor: bg,
                                color: textColor,
                                borderColor: shadowColor,
                                clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)'
                            };
                          } else if (style === "pixel") {
                            buttonClass += " border-none rounded-none m-1";
                            inlineStyle = { 
                                backgroundColor: bg,
                                color: textColor,
                                boxShadow: `-3px 0 0 0 ${shadowColor}, 3px 0 0 0 ${shadowColor}, 0 -3px 0 0 ${shadowColor}, 0 3px 0 0 ${shadowColor}`
                            };
                          } else if (style === "neon") {
                            buttonClass += " bg-transparent border-2";
                            inlineStyle = { 
                                borderColor: bg,
                                color: bg,
                                boxShadow: `0 0 10px ${shadowColor}, inset 0 0 10px ${shadowColor}`,
                                textShadow: `0 0 5px ${shadowColor}`
                            };
                          } else if (style === "sketch") {
                            buttonClass += " bg-transparent border-2";
                            inlineStyle = { 
                                borderColor: shadowColor,
                                color: bg,
                                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'
                            };
                          } else if (style === "gradient-border") {
                            buttonClass += " border-2 border-transparent bg-clip-padding";
                            inlineStyle = { 
                                background: `linear-gradient(#fff, #fff) padding-box, linear-gradient(to right, ${bg}, ${shadowColor}) border-box`,
                                color: bg
                            };
                          } else if (style === "minimal-underline") {
                            buttonClass += " bg-transparent border-b-4 border-t-0 border-x-0 rounded-none px-0";
                            inlineStyle = { 
                                borderColor: bg,
                                color: bg,
                                justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'
                            };
                          } else {
                            // Solid
                            buttonClass += " shadow-sm border-transparent";
                            inlineStyle = { backgroundColor: bg, color: textColor };
                          }

                          const trigger = block.animationTrigger || 'loop';
                          const isHover = trigger === 'hover';
                          const animationStyle = block.animation && block.animation !== 'none' && !isHover
                            ? { animation: `${block.animation} 1s ${trigger === 'once' ? '1' : 'infinite'}` } 
                            : {};
                          const hoverClass = isHover && block.animation && block.animation !== 'none' ? `hover-anim-${block.id}` : '';

                          return (
                            <div key={block.id} className={`flex ${alignmentClass(block.align)}`}>
                              {isHover && <style>{`.${hoverClass}:hover { animation: ${block.animation} 1s infinite; }`}</style>}
                              <a
                                className={`${buttonClass} ${hoverClass}`}
                                style={{ ...inlineStyle, ...animationStyle }}
                              >
                                {block.buttonImage && (
                                  <img 
                                    src={block.buttonImage} 
                                    alt="" 
                                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-lg object-cover" 
                                    width="52"
                                    height="52"
                                    loading="lazy"
                                  />
                                )}
                                <span className={`flex-1 ${block.buttonImage ? 'pl-[66px]' : ''} text-${textAlign}`}>
                                  {block.title || "Button"}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShareData({ url: block.href || "", title: block.title || "" });
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/10 transition-colors z-10"
                                  style={{ color: inlineStyle.color }}
                                >
                                  <DotsIcon />
                                </button>
                              </a>
                            </div>
                          );
                        }

                        if (block.type === "socials") {
                          const links = block.socials || {};
                          const hasLinks = Object.values(links).some(url => url);
                          const layout = block.socialsLayout || "row";
                          const showLabel = block.socialsLabel || false;
                          
                          return (
                            <div key={block.id} className={`flex ${layout === 'column' ? 'flex-col' : 'flex-wrap'} gap-3 ${alignmentClass(block.align)}`}>
                              {!hasLinks && <div className="w-full text-center text-xs text-gray-400 italic">Add social links to see them here</div>}
                              {Object.entries(links).map(([platform, url]) => {
                                if (!url) return null;
                                return (
                                  <a key={platform} href={url} target="_blank" rel="noreferrer" 
                                     className={`
                                        flex items-center justify-center
                                        ${showLabel ? 'px-3 py-2 rounded-xl text-sm' : 'p-3 rounded-full'} 
                                        bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors
                                        ${layout === 'column' ? 'w-full' : ''}
                                     `}>
                                    {/* Simple icons for preview */}
                                    {platform === 'instagram' && <InstagramIcon width={20} height={20} />}
                                    {platform === 'twitter' && <TwitterIcon width={20} height={20} />}
                                    {platform === 'linkedin' && <LinkedInIcon width={20} height={20} />}
                                    {platform === 'youtube' && <YouTubeIcon width={20} height={20} />}
                                    {platform === 'github' && <GitHubIcon width={20} height={20} />}
                                    {showLabel && <span className="ml-2 font-medium capitalize">{platform}</span>}
                                  </a>
                                );
                              })}
                            </div>
                          );
                        }

                        if (block.type === "video") {
                          const videoId = block.mediaUrl?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                          return (
                            <div key={block.id} className={`flex ${alignmentClass(block.align)}`}>
                              <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative">
                                {videoId ? (
                                  <iframe 
                                    src={`https://www.youtube.com/embed/${videoId}`} 
                                    className="absolute inset-0 w-full h-full" 
                                    allowFullScreen 
                                    title="YouTube video"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                    Enter YouTube URL
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }

                        if (block.type === "image") {
                          return (
                            <div key={block.id} className={`flex ${alignmentClass(block.align)}`}>
                              {block.mediaUrl ? (
                                <div className="p-1 bg-white rounded-xl border border-gray-100 shadow-sm w-full">
                                  <img 
                                    src={block.mediaUrl} 
                                    alt="User media content" 
                                    className="rounded-2xl w-full max-h-64 object-cover" 
                                    loading="lazy"
                                  />
                                </div>
                              ) : (
                                <div className="rounded-2xl bg-gray-100 border border-gray-200 h-32 w-full" />
                              )}
                            </div>
                          );
                        }

                        if (block.type === "blog") {
                          return <BlogBlockPreview key={block.id} block={block} bioId={bio.id} />;
                        }

                        if (block.type === "product") {
                          const products = block.products || [];
                          const layout = block.productLayout || "grid";
                          const cardStyle = block.productCardStyle || "default";
                          const bgColor = block.productBackgroundColor || "#ffffff";
                          const textColor = block.productTextColor || "#1f2937";
                          const accentColor = block.productAccentColor || "#2563eb";
                          const btnText = block.productButtonText || "View Product";
                          
                          // Adjust scroll amount based on card width
                          const scrollAmount = cardStyle === "minimal" ? 276 : 150;

                          return (
                            <div key={block.id} className="relative group/carousel">
                              {layout === 'carousel' && (
                                <>
                                  <button 
                                    onClick={() => document.getElementById(`preview-product-${block.id}`)?.scrollBy({ left: -scrollAmount, behavior: 'smooth' })}
                                    className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                                  >
                                    <ChevronLeftIcon />
                                  </button>
                                  <button 
                                    onClick={() => document.getElementById(`preview-product-${block.id}`)?.scrollBy({ left: scrollAmount, behavior: 'smooth' })}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                                  >
                                    <ChevronRightIcon />
                                  </button>
                                </>
                              )}
                              <div 
                                id={`preview-product-${block.id}`}
                                className={`w-full ${layout === 'carousel' ? 'overflow-x-auto px-10 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden' : 'flex flex-col gap-3'}`}
                                style={layout === 'carousel' ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
                              >
                                <div className={`${
                                  layout === 'carousel' ? 'flex gap-3 w-max' : 
                                  layout === 'grid' ? (cardStyle === 'minimal' ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-3') : 
                                  'flex flex-col gap-3'
                                }`}>
                                  {products.map((product) => (
                                    <a 
                                      key={product.id} 
                                      href={product.url} 
                                      className={`block group ${
                                        layout === 'carousel' 
                                          ? (cardStyle === 'minimal' ? 'w-[260px] shrink-0 snap-start' : 'w-[140px] shrink-0 snap-start') 
                                          : ''
                                      }`}
                                    >
                                      {cardStyle === 'minimal' ? (
                                        <div 
                                          className="h-full flex items-center gap-3 p-2 rounded-2xl border shadow-sm transition-all hover:shadow-md"
                                          style={{ 
                                            backgroundColor: bgColor,
                                            borderColor: bgColor === '#ffffff' ? '#e5e7eb' : 'rgba(255,255,255,0.1)'
                                          }}
                                        >
                                          <div 
                                            className="w-16 h-16 shrink-0 rounded-xl overflow-hidden"
                                            style={{ backgroundColor: bgColor === '#ffffff' ? '#f9fafb' : 'rgba(0,0,0,0.05)' }}
                                          >
                                            <img 
                                              src={product.image} 
                                              alt={product.title} 
                                              className="w-full h-full object-cover" 
                                              loading="lazy"
                                            />
                                          </div>
                                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h3 
                                              className="font-semibold text-[13px] leading-tight truncate mb-1"
                                              style={{ color: textColor }}
                                            >
                                              {product.title}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                              <span className="text-[12px] font-bold opacity-80" style={{ color: textColor }}>
                                                {product.price}
                                              </span>
                                              <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: accentColor }}>
                                                <span>{btnText}</span>
                                                <ArrowRightLongIcon />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div 
                                          className="rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md h-full flex flex-col border"
                                          style={{ 
                                            backgroundColor: bgColor,
                                            borderColor: bgColor === '#ffffff' ? '#e5e7eb' : 'rgba(255,255,255,0.1)'
                                          }}
                                        >
                                          <div 
                                            className="aspect-square w-full relative overflow-hidden"
                                            style={{ backgroundColor: bgColor === '#ffffff' ? '#f3f4f6' : 'rgba(0,0,0,0.05)' }}
                                          >
                                            <img 
                                              src={product.image} 
                                              alt={product.title} 
                                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                              loading="lazy"
                                            />
                                            <div className="absolute bottom-1.5 right-1.5 bg-white/95 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-800 shadow-sm">
                                              {product.price}
                                            </div>
                                          </div>
                                          <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                                            <h3 
                                              className="font-semibold text-[13px] leading-snug line-clamp-2"
                                              style={{ color: textColor }}
                                            >
                                              {product.title}
                                            </h3>
                                            <div className="flex items-center gap-1 text-[11px] font-semibold mt-auto" style={{ color: accentColor }}>
                                              <span>{btnText}</span>
                                              <ArrowRightLongIcon />
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (block.type === "calendar") {
                          const title = block.calendarTitle || "Book a Call";
                          const url = block.calendarUrl || "#";
                          const bgColor = block.calendarColor || "#ffffff";
                          const textColor = block.calendarTextColor || "#1f2937";
                          const accentColor = block.calendarAccentColor || "#2563eb";
                          const today = new Date().getDate();
                          
                          return (
                            <div key={block.id}>
                              <a href={url} className="block rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all" style={{ backgroundColor: bgColor }}>
                                <div className="flex justify-between items-center mb-3">
                                  <h3 className="font-bold text-base" style={{ color: textColor }}>{title}</h3>
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>Book Now</span>
                                </div>
                                <div className="rounded-lg p-3" style={{ backgroundColor: bgColor === '#ffffff' ? '#f8fafc' : 'rgba(0,0,0,0.05)' }}>
                                  <div className="flex justify-between mb-2 text-[10px] font-semibold" style={{ color: textColor }}>
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                  </div>
                                  <div className="grid grid-cols-7 gap-1.5 text-center text-[10px]" style={{ color: `${textColor}99` }}>
                                    {Array.from({ length: 31 }, (_, i) => {
                                      const day = i + 1;
                                      const isToday = day === today;
                                      return (
                                        <span 
                                          key={day}
                                          className={isToday ? "rounded-full w-5 h-5 flex items-center justify-center mx-auto" : ""}
                                          style={isToday ? { backgroundColor: accentColor, color: 'white' } : {}}
                                        >
                                          {day}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              </a>
                            </div>
                          );
                        }

                        if (block.type === "map") {
                          const title = block.mapTitle || "Our Office";
                          const address = block.mapAddress || "123 Main St, City";
                          const encodedAddress = encodeURIComponent(address);
                          
                          return (
                            <div key={block.id} className="relative h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                              <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight={0} 
                                marginWidth={0} 
                                src={`https://maps.google.com/maps?q=${encodedAddress}&t=m&z=15&output=embed&iwloc=near`}
                                className="w-full h-full border-0 grayscale-[0.2]"
                              ></iframe>

                              {/* Address Card */}
                              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm max-w-[70%] pointer-events-none">
                                <h3 className="font-bold text-sm text-gray-900 leading-tight">{title}</h3>
                                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{address}</p>
                              </div>
                            </div>
                          );
                        }

                        if (block.type === "featured") {
                          const title = block.featuredTitle || "Glow lipstick";
                          const price = block.featuredPrice || "$19.99";
                          const image = block.featuredImage || "https://placehold.co/300x300";
                          const url = block.featuredUrl || "#";
                          const bgColor = block.featuredColor || "#1f4d36";
                          const textColor = block.featuredTextColor || "#ffffff";
                          
                          return (
                            <div key={block.id}>
                              <a href={url} className="block rounded-xl overflow-hidden relative transition-all hover:scale-[1.01]" style={{ backgroundColor: bgColor, color: textColor }}>
                                {/* Top Badge */}
                                <div className="absolute top-3 -right-8 bg-white text-black py-1 px-8 rotate-45 text-[10px] font-extrabold shadow-sm z-10">
                                  TOTAL CLICK
                                </div>
                                      src={image} 
                                      alt={title} 
                                      className="w-full h-full object-cover" 
                                      loading="lazy"
                                   
                                
                                <div className="p-4 flex gap-4 items-center">
                                  {/* Image */}
                                  <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-white/10">
                                    <img src={image} alt={title} className="w-full h-full object-cover" />
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1">
                                    <h3 className="m-0 mb-2 font-mono text-lg font-bold tracking-tighter">{title}</h3>
                                    
                                    {/* Lines representing description */}
                                    <div className="h-1.5 bg-white/30 rounded-full mb-1.5 w-full"></div>
                                    <div className="h-1.5 bg-white/30 rounded-full w-4/5"></div>
                                  </div>
                                </div>
                                
                                {/* Divider */}
                                <div className="h-px bg-white/20 mx-4"></div>
                                
                                {/* Bottom Action */}
                                <div className="p-3 text-center">
                                  <span className="text-sm font-medium">Buy now for {price}</span>
                                </div>
                              </a>
                            </div>
                          );
                        }

                        if (block.type === "event") {
                          return <EventBlockPreview key={block.id} block={block} />;
                        }

                        if (block.type === "tour") {
                          return <TourBlockPreview key={block.id} block={block} />;
                        }

                        if (block.type === "spotify") {
                          return <SpotifyBlockPreview key={block.id} block={block} />;
                        }

                        if (block.type === "instagram") {
                          return <InstagramBlockPreview key={block.id} block={block} />;
                        }

                        if (block.type === "youtube") {
                          return <YoutubeBlockPreview key={block.id} block={block} />;
                        }

                        if (block.type === "affiliate") {
                          const title = block.affiliateTitle || "Copy my coupon code";
                          const code = block.affiliateCode || "CODE123";
                          const image = block.affiliateImage || "https://placehold.co/300x300";
                          const url = block.affiliateUrl || "#";
                          const bgColor = block.affiliateColor || "#ffffff";
                          const textColor = block.affiliateTextColor || "#1f2937";
                          
                          return (
                            <div key={block.id}>
                              <div 
                                className="rounded-xl p-4 text-center shadow-sm border border-gray-200"
                                style={{ backgroundColor: bgColor }}
                              >
                                <a href={url} className="block mb-3">
                                  <img 
                                    src={image} 
                                    alt={title} 
                                    className="w-24 h-24 object-cover rounded-xl mx-auto shadow-sm" 
                                    width="96"
                                    height="96"
                                    loading="lazy"
                                  />
                                </a>
                                <p 
                                  className="mb-2 text-sm font-semibold"
                                  style={{ color: textColor }}
                                >
                                  {title}
                                </p>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(code);
                                    // In a real app we might show a toast here
                                  }}
                                  className="w-full border-2 border-dashed border-slate-300 rounded-xl p-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-black/5 transition-colors font-mono text-sm font-bold group"
                                  style={{ color: textColor, backgroundColor: 'rgba(255,255,255,0.5)' }}
                                >
                                  {code}
                                  <CopyIcon className="opacity-60 group-hover:opacity-100" />
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return <hr key={block.id} className="border-gray-200 my-2" />;
                      })}
                      
                      <div className="text-center py-6 mt-6">
                        <a href="https://portyo.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors no-underline bg-white px-3 py-1.5 rounded-lg shadow-sm">
                          Powered by <span className="text-gray-900 font-extrabold">Portyo</span>
                        </a>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {shareData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             {/* Header */}
             <div className="flex items-center justify-between p-4 border-b border-gray-100">
               <h3 className="font-bold text-lg text-gray-900">Share link</h3>
               <button 
                 onClick={() => setShareData(null)}
                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
               >
                 <XIcon width="20" height="20" />
               </button>
             </div>
             
             {/* Content */}
             <div className="p-6">
               {/* Preview Card */}
               <div className="bg-gray-900 rounded-2xl p-8 text-center text-white mb-8 shadow-xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black z-0"></div>
                 <div className="relative z-10">
                    <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-4 p-2 shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareData.url)}`} 
                          alt="QR Code" 
                          className="w-full h-full" 
                          loading="lazy"
                        />
                    </div>
                    <p className="font-medium truncate text-lg opacity-90">{shareData.title}</p>
                 </div>
               </div>

               {/* Social Icons */}
               <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-between px-2">
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(shareData.url);
                        // Could add a toast here
                    }}
                    className="flex flex-col items-center gap-2 min-w-[64px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-gray-200 transition-colors">
                        <LinkIcon />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Copy link</span>
                  </button>

                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 min-w-[64px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white group-hover:bg-gray-800 transition-colors">
                        <TwitterIcon />
                    </div>
                    <span className="text-xs font-medium text-gray-600">X</span>
                  </a>

                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 min-w-[64px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white group-hover:opacity-90 transition-opacity">
                        <FacebookIcon />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Facebook</span>
                  </a>

                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(shareData.url)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 min-w-[64px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white group-hover:opacity-90 transition-opacity">
                        <WhatsAppIcon />
                    </div>
                    <span className="text-xs font-medium text-gray-600">WhatsApp</span>
                  </a>

                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 min-w-[64px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white group-hover:opacity-90 transition-opacity">
                        <LinkedInIcon />
                    </div>
                    <span className="text-xs font-medium text-gray-600">LinkedIn</span>
                  </a>
               </div>
             </div>
             
             {/* Footer Promo */}
             <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
                <p className="font-bold text-sm text-gray-900 mb-1">Join Portyo</p>
                <p className="text-xs text-gray-500 mb-4">Create your own free bio link today.</p>
                <div className="flex gap-2 justify-center">
                    <a href="https://portyo.com/signup" target="_blank" rel="noreferrer" className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                        Sign up free
                    </a>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200/50">
                    <button className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto">
                        <FlagIcon />
                        Report link
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}
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
