import { useState, useEffect, useRef } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  srcSet?: string;
}

/**
 * Componente de imagem otimizado com:
 * - Lazy loading nativo
 * - WebP com fallback automático
 * - Placeholder blur opcional
 * - Aspect ratio fixo (evita CLS)
 * - Decoding async para não bloquear main thread
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  placeholder = "empty",
  blurDataURL,
  sizes = "100vw",
  srcSet,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Gerar WebP src automaticamente
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, ".webp");
  const hasWebP = !src.endsWith(".webp") && !src.endsWith(".svg");

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px",
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Placeholder blur simples (base64 1x1 pixel cinza)
  const defaultBlurDataURL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23222'/%3E%3C/svg%3E";

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: `${width} / ${height}`,
        backgroundColor: placeholder === "blur" ? "#222" : undefined,
      }}
    >
      {/* Placeholder blur */}
      {placeholder === "blur" && !isLoaded && (
        <img
          src={blurDataURL || defaultBlurDataURL}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 transition-opacity duration-500"
          style={{ opacity: isLoaded ? 0 : 1 }}
        />
      )}

      {/* Imagem real */}
      {isInView && (
        <picture>
          {hasWebP && <source srcSet={webpSrc} type="image/webp" sizes={sizes} />}
          {srcSet && <source srcSet={srcSet} sizes={sizes} />}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </picture>
      )}
    </div>
  );
}

/**
 * Hook para carregar imagens de forma otimizada
 */
export function useImagePreload(srcs: string[]) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const totalImages = srcs.length;

    if (totalImages === 0) {
      setLoaded(true);
      return;
    }

    srcs.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setLoaded(true);
        }
      };
    });
  }, [srcs]);

  return loaded;
}

/**
 * Componente para imagens responsivas com srcset
 */
interface ResponsiveImageProps extends Omit<OptimizedImageProps, "srcSet"> {
  mobileSrc: string;
  tabletSrc?: string;
  desktopSrc: string;
}

export function ResponsiveImage({
  mobileSrc,
  tabletSrc,
  desktopSrc,
  ...props
}: ResponsiveImageProps) {
  const srcSet = tabletSrc
    ? `${mobileSrc} 640w, ${tabletSrc} 1024w, ${desktopSrc} 1920w`
    : `${mobileSrc} 640w, ${desktopSrc} 1920w`;

  return (
    <OptimizedImage
      {...props}
      src={desktopSrc}
      srcSet={srcSet}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  );
}
