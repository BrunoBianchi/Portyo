import { useYouTubePreview } from "~/hooks/use-block-integration";

interface YouTubePreviewProps {
  url: string;
  className?: string;
}

const PlayIcon: React.FC = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 48 48"
    fill="none"
    className="drop-shadow-md"
  >
    <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.6)" />
    <polygon points="19,14 36,24 19,34" fill="white" />
  </svg>
);

export function YouTubePreview({
  url,
  className = "",
}: YouTubePreviewProps) {
  const { videos, isLoading, error } = useYouTubePreview(url);

  const isValidUrl =
    url && (url.includes("youtube.com") || url.includes("youtu.be"));

  if (!url || !isValidUrl) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 ml-0.5 font-bold">
          Preview
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="aspect-video bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || videos.length === 0) {
    return (
      <div className={`${className}`}>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 ml-0.5 font-bold">
          Preview
        </p>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400">
            {error
              ? "Não foi possível carregar os vídeos"
              : "Nenhum vídeo encontrado"}
          </p>
          <p className="text-[10px] text-gray-300 mt-1">
            Verifique a URL do canal ou playlist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 ml-0.5 font-bold">
        Preview — últimos vídeos
      </p>
      <div className="grid grid-cols-3 gap-2">
        {videos.map((video, i) => (
          <a
            key={video.id || i}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="aspect-video rounded-lg overflow-hidden relative">
              <img
                src={video.imageUrl}
                alt={video.title || `Vídeo ${i + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                  <PlayIcon />
                </div>
              </div>
            </div>
            {video.title && (
              <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight font-medium">
                {video.title}
              </p>
            )}
          </a>
        ))}
      </div>
      <p className="text-[10px] text-gray-300 mt-1.5 text-center">
        {videos.length} vídeo(s) recentes
      </p>
    </div>
  );
}
