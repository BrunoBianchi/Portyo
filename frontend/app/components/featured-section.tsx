
import React from 'react';
import { Linkedin } from "lucide-react";
import { TwitterXIcon, TikTokIcon, ProductHuntIcon } from "./icons";

export default function FeaturedSection() {
  return (
    <section className="w-full py-12 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-12 font-sans">
          As featured in...
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {/* Twitter (X) */}
          <div className="bg-white rounded-full px-10 py-6 shadow-sm flex items-center justify-center min-w-[200px] transition-transform hover:-translate-y-1 duration-300 group cursor-default">
            <TwitterXIcon className="w-8 h-8 text-text-main group-hover:scale-110 transition-transform duration-300" />
          </div>

          {/* TikTok */}
          <div className="bg-white rounded-full px-10 py-6 shadow-sm flex items-center justify-center min-w-[200px] transition-transform hover:-translate-y-1 duration-300 group cursor-default">
            <TikTokIcon className="w-8 h-8 text-text-main group-hover:scale-110 transition-transform duration-300" />
          </div>

          {/* Product Hunt */}
          <div className="bg-white rounded-full px-10 py-6 shadow-sm flex items-center justify-center min-w-[200px] transition-transform hover:-translate-y-1 duration-300 group cursor-default">
            <ProductHuntIcon className="w-8 h-8 text-text-main group-hover:scale-110 transition-transform duration-300" />
          </div>

          {/* LinkedIn */}
          <div className="bg-white rounded-full px-10 py-6 shadow-sm flex items-center justify-center min-w-[200px] transition-transform hover:-translate-y-1 duration-300 group cursor-default">
            <Linkedin className="w-8 h-8 text-text-main group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
