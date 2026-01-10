import React from 'react';
import { ProductHuntIcon } from "./icons";

export default function FeaturedSection() {
  return (
    <section className="w-full py-20 px-4 bg-transparent">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-sm uppercase tracking-widest font-bold text-text-muted mb-12 font-sans opacity-70">
          As featured in
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
              src="/icons/twitter-x-seeklogo.png"
              alt="Twitter X"
              className="h-12 w-auto object-contain opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
            />
          </div>

          {/* TikTok */}
          <div className="group transition-transform hover:-translate-y-1 duration-300">
            <img
              src="/icons/tiktok-seeklogo.png"
              alt="TikTok"
              className="h-14 w-auto object-contain opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
            />
          </div>

          {/* LinkedIn */}
          <div className="group transition-transform hover:-translate-y-1 duration-300">
            <img
              src="/icons/linkedin-new-2020-seeklogo.png"
              alt="LinkedIn"
              className="h-14 w-auto object-contain opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
