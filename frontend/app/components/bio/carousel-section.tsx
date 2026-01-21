import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "~/services/api";

type CarouselBio = {
  name: string;
  role: string;
  image: string;
  username: string;
  description: string;
};

const buildOptimizedImageUrl = (path: string, width: number, height: number) => {
  const params = new URLSearchParams({
    path,
    w: String(width),
    h: String(height)
  });
  return `/api/images/optimize?${params.toString()}`;
};

const needsOptimization = (path: string) => path.startsWith("/users-photos/") || path.startsWith("/icons/");

export default function CarouselSection() {
  const { t } = useTranslation();

  const fallbackUsers: CarouselBio[] = [
    {
      name: "Julia Soares",
      role: t("home.carousel.fallback.0.role"),
      image: "/Street Life - Head (1).svg",
      username: "arquiteta-julia-soares",
      description: t("home.carousel.fallback.0.description")
    },
    {
      name: "Bruno Bianchi",
      role: t("home.carousel.fallback.1.role"),
      image: "/users-photos/bruno-bianchi.png",
      username: "bruno-bianchi",
      description: t("home.carousel.fallback.1.description")
    },
    {
      name: "Dra Mariana",
      role: t("home.carousel.fallback.2.role"),
      image: "/users-photos/dra-mariana-bianchi.jpg",
      username: "dra-mariana-bianchi",
      description: t("home.carousel.fallback.2.description")
    },
    {
      name: "EstagioAi",
      role: t("home.carousel.fallback.3.role"),
      image: "/users-photos/estagioai.png",
      username: "estagioai",
      description: t("home.carousel.fallback.3.description")
    }
  ];

  const normalizeRole = (description?: string | null) => {
    if (!description) return t("home.carousel.defaultRole");
    const trimmed = description.split(/[\n\.]/)[0]?.trim();
    if (!trimmed) return t("home.carousel.defaultRole");
    return trimmed.length > 32 ? `${trimmed.slice(0, 32)}…` : trimmed;
  };

  const parseJsonArray = (payload: unknown) => {
    if (Array.isArray(payload)) return payload;
    if (typeof payload !== "string") return null;
    const trimmed = payload.trim();
    if (!trimmed || trimmed.startsWith("<")) return null;
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const [users, setUsers] = useState<CarouselBio[]>(fallbackUsers);

  useEffect(() => {
    const fallbackUsernames = new Set(fallbackUsers.map((user) => user.username));
    setUsers((current) => {
      const isFallbackOnly = current.every((user) => fallbackUsernames.has(user.username));
      return isFallbackOnly ? fallbackUsers : current;
    });
  }, [t]);

  useEffect(() => {
    let isActive = true;

    const fetchBios = async () => {
      try {
        const response = await api.get("/public/bios/random", {
          params: { limit: 8 },
          responseType: "text",
          transformResponse: [(data) => data]
        });
        const data = parseJsonArray(response.data);
        if (!data || !isActive) return;

        const mapped = data
          .filter((bio: any) => bio?.sufix)
          .map((bio: any): CarouselBio => ({
            name: bio.fullName || bio.sufix,
            role: normalizeRole(bio.description),
            image: bio.profileImage || "/Street Life - Head (1).svg",
            username: bio.sufix,
            description: bio.description || t("home.carousel.defaultDescription")
          }));

        if (mapped.length > 0) setUsers(mapped);
      } catch (err) {
        console.error("Failed to load random bios", err);
      }
    };

    fetchBios();

    return () => {
      isActive = false;
    };
  }, [t]);

  const items = [...users, ...users];

  return (
    <section className="w-full overflow-hidden pt-10 pb-0 bg-surface-alt top-[-102px] relative">
      <div className="flex w-max animate-scroll hover:[animation-play-state:paused]">
        {items.map((user, index) => (
          <a
            key={`${user.username}-${index}`}
            href={`/p/${user.username}`}
            aria-label={`Abrir portyo.me/${user.username}`}
            className="relative w-[240px] h-[320px] mx-3 rounded-2xl overflow-hidden group cursor-pointer shrink-0"
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <img
                src={needsOptimization(user.image) ? buildOptimizedImageUrl(user.image, 240, 320) : user.image}
                alt={user.name}
                width={240}
                height={320}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-3 flex items-center shadow-lg">
                <span className="font-bold text-text-main text-sm truncate mr-2">{user.name}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
