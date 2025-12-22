import React from 'react';

export default function FeaturesSection() {
  return (
    <div className="w-full flex flex-col">
      
      {/* Feature 1: Newsletter */}
      <section className="w-full py-24 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <div className="flex-1 flex flex-col gap-8 text-left order-2 md:order-1">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-extrabold text-text-main font-sans tracking-tight leading-[1.1]">Newsletter</h2>
                <p className="text-xl text-text-muted leading-relaxed max-w-lg">
                  Build a loyal audience by collecting emails directly from your bio. Send beautiful, automated newsletters to your subscribers without ever leaving the platform.
                </p>
              </div>
              <button className="w-fit mt-2 font-bold text-text-main hover:text-primary transition-colors flex items-center gap-3 group text-xl">
                Learn more <i className="fa-solid fa-arrow-right text-base group-hover:translate-x-1 transition-transform"></i>
              </button>
          </div>
          
          <div className="flex-1 w-full relative min-h-[400px] flex items-center justify-center order-1 md:order-2">
             {/* Visual: White Card with Input */}
             <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 relative z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-gray-100"></div>
                    <div className="space-y-2">
                        <div className="h-3 w-24 bg-gray-100 rounded-full"></div>
                        <div className="h-3 w-16 bg-gray-100 rounded-full"></div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="h-4 w-full bg-gray-50 rounded-full"></div>
                    <div className="h-4 w-3/4 bg-gray-50 rounded-full"></div>
                </div>
                <div className="mt-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-text-main mb-2 uppercase tracking-wider">Join the list</p>
                    <div className="flex gap-2">
                        <div className="flex-1 h-12 bg-white border border-gray-200 rounded-xl px-4 flex items-center text-gray-400 text-sm">your@email.com</div>
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-text-main shadow-sm cursor-pointer hover:bg-primary-hover transition-colors">
                            <i className="fa-solid fa-arrow-right"></i>
                        </div>
                    </div>
                </div>
             </div>
             
             {/* Floating Badge */}
             <div className="absolute -right-4 top-20 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl z-20 rotate-[5deg] animate-bounce-slow">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black text-xs">
                        <i className="fa-solid fa-bell"></i>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Notification</p>
                        <p className="font-bold text-sm">New Subscriber!</p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Partnerships */}
      <section className="w-full py-24 px-4 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <div className="flex-1 flex flex-col gap-8 text-left order-2">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-extrabold text-white font-sans tracking-tight leading-[1.1]">Partnerships</h2>
                <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                  Stop missing out on opportunities. Let brands reach out to you directly with a dedicated partnership inquiry flow.
                </p>
              </div>
              <button className="w-fit mt-2 font-bold text-white hover:text-primary transition-colors flex items-center gap-3 group text-xl">
                Get Sponsored <i className="fa-solid fa-arrow-right text-base group-hover:translate-x-1 transition-transform"></i>
              </button>
          </div>
          
          <div className="flex-1 w-full relative min-h-[400px] flex items-center justify-center order-1">
             {/* Visual: Primary Card */}
             <div className="w-full max-w-md bg-primary rounded-[2.5rem] shadow-xl p-8 relative z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                    <i className="fa-brands fa-nike text-3xl text-black"></i>
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">Collaboration Request</h3>
                <p className="text-black/70 mb-8">Nike wants to collaborate with you on their new campaign.</p>
                
                <div className="flex gap-4">
                    <button className="flex-1 bg-black text-white py-3 rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-colors">Accept</button>
                    <button className="flex-1 bg-white/30 text-black py-3 rounded-xl font-bold hover:bg-white/40 transition-colors">Decline</button>
                </div>
             </div>
             
             {/* Floating Badge */}
             <div className="absolute -right-8 top-1/2 bg-white text-text-main px-6 py-3 rounded-2xl shadow-xl z-20 rotate-[10deg]">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Budget</p>
                <p className="text-2xl font-bold text-green-600">$1,200</p>
             </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Blog */}
      <section className="w-full py-24 px-4 bg-orange-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <div className="flex-1 w-full relative min-h-[400px] flex items-center justify-center order-1 md:order-2">
             {/* Visual: Beige Card */}
             <div className="w-full max-w-md bg-[#fcdba8] rounded-[2.5rem] shadow-xl p-8 relative z-10 rotate-[2deg] hover:rotate-0 transition-transform duration-500">
                <div className="w-full aspect-video bg-black/5 rounded-2xl mb-6 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center text-black/20">
                        <i className="fa-solid fa-image text-4xl"></i>
                    </div>
                </div>
                <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-white/40 rounded-full text-xs font-bold text-black/70">Lifestyle</span>
                    <span className="px-3 py-1 bg-white/40 rounded-full text-xs font-bold text-black/70">5 min read</span>
                </div>
                <h3 className="text-2xl font-bold text-text-main mb-4 leading-tight">10 Tips for Growing Your Audience in 2025</h3>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black/10"></div>
                    <span className="text-sm font-medium text-black/60">By You</span>
                </div>
             </div>

             {/* Floating Badge */}
             <div className="absolute -left-4 top-20 bg-white text-text-main px-5 py-3 rounded-xl shadow-xl z-20 rotate-[-5deg]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-bold text-sm">Published</span>
                </div>
             </div>
          </div>

          <div className="flex-1 flex flex-col gap-8 text-left order-2 md:order-1">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-extrabold text-text-main font-sans tracking-tight leading-[1.1]">Integrated Blog</h2>
                <p className="text-xl text-text-muted leading-relaxed max-w-lg">
                  Your voice matters. Share your thoughts, stories, and expertise with a fully integrated blogging platform. SEO-optimized.
                </p>
              </div>
              <button className="w-fit mt-2 font-bold text-text-main hover:text-primary transition-colors flex items-center gap-3 group text-xl">
                Start Writing <i className="fa-solid fa-arrow-right text-base group-hover:translate-x-1 transition-transform"></i>
              </button>
          </div>
        </div>
      </section>

    </div>
  );
}
