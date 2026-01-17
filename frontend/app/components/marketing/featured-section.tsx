import React from 'react';
import { ProductHuntIcon } from "~/components/shared/icons";
import { useTranslation } from "react-i18next";

export default function FeaturedSection() {
  const { t } = useTranslation();

  const buildOptimizedImageUrl = (path: string, size: number) => {
    const params = new URLSearchParams({
      path,
      w: String(size),
      h: String(size)
    });
    return `/api/images/optimize?${params.toString()}`;
  };

  return (
    <section className="w-full py-20 px-4 bg-transparent">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-sm uppercase tracking-widest font-bold text-gray-700 mb-12 font-sans opacity-80">
          {t("home.featured.title")}
        </h2>

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">

          {/* Product Hunt */}
          <div className="group transition-transform hover:-translate-y-1 duration-300">
            <div className="h-14 w-auto flex items-center justify-center opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
              <ProductHuntIcon className="h-14 w-14 text-[#DA552F]" />
            </div>
          </div>

          {/* Twitter (X) */}
          <div className="group transition-transform hover:-translate-y-1 duration-300">
            <img
              src={buildOptimizedImageUrl("/icons/twitter-x-seeklogo.png", 48)}
              alt="Twitter X"
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              className="h-12 w-auto object-contain opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
            />
          </div>

          {/* TikTok */}
          <div className="group transition-transform hover:-translate-y-1 duration-300">
            <img
              src={buildOptimizedImageUrl("/icons/tiktok-seeklogo.png", 56)}
              alt="TikTok"
              width={56}
              height={56}
              loading="lazy"
              decoding="async"
              className="h-14 w-auto object-contain opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
            />
          </div>

          {/* LinkedIn */}
          <div className="group transition-transform hover:-translate-y-1 duration-300">
            <img
              src={buildOptimizedImageUrl("/icons/linkedin-new-2020-seeklogo.png", 56)}
              alt="LinkedIn"
              width={56}
              height={56}
              loading="lazy"
              decoding="async"
              className="h-14 w-auto object-contain opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
