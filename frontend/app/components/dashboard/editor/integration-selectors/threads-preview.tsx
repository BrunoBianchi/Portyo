import { useThreadsPreview } from "~/hooks/use-block-integration";

interface ThreadsPreviewProps {
  bioId: string | null;
  username?: string;
  className?: string;
}

export function ThreadsPreview({
  bioId,
  username,
  className = "",
}: ThreadsPreviewProps) {
  const { posts, isLoading, error } = useThreadsPreview(bioId);

  if (!bioId) {
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
            <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || posts.length === 0) {
    return (
      <div className={`${className}`}>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 ml-0.5 font-bold">
          Preview
        </p>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400">
            {error ? "Não foi possível carregar os posts" : "Nenhum post encontrado"}
          </p>
          <p className="text-[10px] text-gray-300 mt-1">Verifique a conexão do Threads</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 ml-0.5 font-bold">
        Preview — últimos threads
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {posts.map((post, i) => (
          <a
            key={post.id || i}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square rounded-lg overflow-hidden group relative"
          >
            <img
              src={post.imageUrl}
              alt={`Thread ${i + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </a>
        ))}
      </div>
      <p className="text-[10px] text-gray-300 mt-1.5 text-center">
        {username ? `@${username} · ` : ""}{posts.length} post(s) recentes
      </p>
    </div>
  );
}
