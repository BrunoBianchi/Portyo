import { Link } from "react-router";
import ClaimUsernameInput from "./claim-username-input";
import { Palette, Instagram, Image, Rocket, Youtube } from "lucide-react";
import { DecorativeUnderlineIcon, TikTokIcon } from "./icons";

export default function HeroSection() {
  return (
    <section className="relative w-full max-w-7xl top-[-102px] mx-auto px-4 py-20 md:py-32 flex flex-col items-center justify-center min-h-[600px] overflow-hidden">
      <div className="absolute left-12 lg:left-24 top-1/4 hidden md:block animate-float" style={{ animationDelay: "0s" }}>
        <div className="relative group">
          <div className="transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
            <img 
              src="/Street%20Life%20-%20Head.svg" 
              alt="User avatar" 
              width="80"
              height="80"
              className="w-20 h-20 "
            />
          </div>
          
          <div className="absolute top-2 -right-45 bg-white px-4 py-2.5 rounded-2xl shadow-xl transform rotate-3 group-hover:rotate-0 transition-transform duration-300 flex items-center gap-3 z-20">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Palette className="w-4 h-4" />
            </div>
            <div className="flex flex-col ">
              <span className="text-xs text-text-muted font-medium">Role</span>
              <span className="text-sm font-bold text-text-main leading-none">Digital Artist</span>
            </div>
          </div>

          {/* Icon: Instagram */}
          <div className="absolute -top-10 -left-10 bg-white p-3 rounded-full shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-300 z-10">
            <Instagram className="w-6 h-6 text-[#E1306C]" />
          </div>

           {/* Card: New Post */}
           <div className="absolute -bottom-12 -left-14 bg-white px-3 py-2 rounded-xl shadow-lg transform rotate-6 group-hover:rotate-0 transition-transform duration-300 flex items-center gap-2 z-30">
             <Image className="w-4 h-4 text-blue-500" />
             <span className="text-xs font-semibold text-text-main">New 3D Art</span>
           </div>
        </div>
      </div>

      {/* Floating Elements - Bottom Left (New) */}
      <div className="absolute left-10 lg:left-24 bottom-40 hidden lg:block animate-float" style={{ animationDelay: "2.5s" }}>
        <div className="relative group">
           {/* Avatar */}
           <div className="transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
            <img 
              src="/Street%20Life%20-%20Head%20(1).svg" 
              alt="User avatar" 
              width="64"
              height="64"
              className="w-16 h-16"
            />
          </div>

          {/* Card: TikTok */}
          <div className="absolute -top-8 -right-24 bg-white px-3 py-1.5 rounded-xl shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300 flex items-center gap-2 z-20">
             <TikTokIcon className="w-4 h-4 text-black" />
             <span className="text-xs font-bold text-text-main">Viral!</span>
          </div>
        </div>
      </div>

      {/* Floating Elements - Right Side */}
      <div className="absolute right-10 lg:right-10 top-1/2 hidden md:block animate-float" style={{ animationDelay: "1s" }}>
        <div className="relative group">
          {/* Avatar */}
          <div className="transform rotate-6 group-hover:rotate-0 transition-transform duration-300 z-10 relative">
            <img 
              src="/Street%20Life%20-%20Head%20(2).svg" 
              alt="User avatar" 
              width="96"
              height="96"
              className="w-24 h-24 "
            />
          </div>

          {/* Card: Startup Founder */}
          <div className="absolute top-0 -left-48 bg-white px-5 py-3 rounded-2xl shadow-xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-300 flex items-center gap-3 z-20">
             <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Rocket className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-muted font-medium">Founder</span>
              <span className="text-sm font-bold text-text-main leading-none">Startup Life</span>
            </div>
          </div>



          {/* Card: Revenue */}
          <div className="absolute -bottom-12 -right-10 bg-white px-4 py-2 rounded-xl shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300 flex items-center gap-2 z-30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-text-main">Revenue +120%</span>
          </div>
        </div>
      </div>

      {/* Floating Elements - Top Right (New) */}
      <div className="absolute right-10 lg:right-32 top-20 hidden lg:block animate-float" style={{ animationDelay: "1.5s" }}>
        <div className="relative group">
           {/* Avatar */}
           <div className="transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
            <img 
              src="/Street%20Life%20-%20Head%20(3).svg" 
              alt="User avatar" 
              width="56"
              height="56"
              className="w-14 h-14"
            />
          </div>

          {/* Card: YouTube */}
          <div className="absolute -bottom-8 -left-20 bg-white px-3 py-1.5 rounded-xl shadow-lg transform rotate-6 group-hover:rotate-0 transition-transform duration-300 flex items-center gap-2 z-20">
             <Youtube className="w-4 h-4 text-[#FF0000]" />
             <span className="text-xs font-bold text-text-main">New Video</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-main leading-[1.1]">
          Convert your followers into <span className="text-primary-hover relative inline-block">
            customers
            <DecorativeUnderlineIcon className="absolute w-full h-3 -bottom-1 left-0 text-secondary opacity-60 -z-10" />
          </span> with one link
        </h1>
        
        <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
          Generate powerful revenue-generating Bio's with our an all-in-one platform. 
          Grow your following and earn while you sleep!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full">
          <ClaimUsernameInput />
        </div>
      </div>
    </section>
  );
}
