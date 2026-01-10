import React from 'react';
import { ArrowRight, Bell, Image, Clock, Check, UserPlus, Mail, Zap } from "lucide-react";
import { NikeIcon } from "./icons";

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
              Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -right-4 top-20 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl z-20 rotate-[5deg] animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black text-xs">
                  <Bell className="w-4 h-4" />
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

      {/* Feature 2: Automation */}
      <section className="w-full py-24 px-4 bg-neutral-900 overflow-visible">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-32">

          {/* Visual (Left) - Vertical Compact Flow */}
          <div className="flex-1 w-full relative min-h-[550px] flex items-center justify-center order-1">
            {/* Main White Card Container - Smaller & Vertical */}
            <div className="w-full max-w-[360px] h-[480px] bg-white rounded-[2.5rem] shadow-2xl relative z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-700 ease-out border border-gray-100">

              {/* Badge: Running (Top Right) */}
              <div className="absolute -right-4 -top-3 z-50">
                <div className="bg-[#ccf32f] text-black px-5 py-2 rounded-full shadow-lg rotate-[5deg] flex items-center gap-2 border-[4px] border-neutral-900">
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span className="font-bold text-xs tracking-wide uppercase">Running</span>
                </div>
              </div>

              {/* Internal Flow Layout */}
              <div className="relative w-full h-full flex flex-col items-center pt-12">

                {/* SVG Connections - Absolute behind nodes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 0 }}>

                  {/* Connection 1: Node 1 (Center) -> Node 2 (Center) */}
                  {/* Vertical S-curve: Start Bottom of Node 1 -> Top of Node 2 */}
                  {/* Node 1 center approx: x=180, y=86 (12pt padding + height/2) -> wait, explicit positioning is safer if we want exact curves.
                      Let's stick to absolute positioning for precision.
                      Card W: 360. Center: 180.
                      Node 1: Top 60. H ~80. CenterY ~100.
                      Node 2: Top 200. H ~80. CenterY ~240.
                      Node 3: Top 360.
                  */}
                  <path
                    d="M 180 125 C 180 160, 180 160, 180 200"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                  />

                  {/* Particle 1 */}
                  <circle r="3" fill="#fb923c">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path="M 180 125 C 180 160, 180 160, 180 200"
                      calcMode="linear"
                    />
                  </circle>

                  {/* Connection 2: Node 2 (Center) -> Node 3 (Center) */}
                  {/* Vertical S-curve: Node 2 Bottom (280) -> Node 3 Top (380) */}
                  <path
                    d="M 180 280 C 180 320, 180 320, 180 380"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                  />
                  {/* Particle 2 */}
                  <circle r="3" fill="#8b5cf6">
                    <animateMotion
                      dur="2s"
                      begin="1s"
                      repeatCount="indefinite"
                      path="M 180 280 C 180 320, 180 320, 180 380"
                      calcMode="linear"
                    />
                  </circle>

                </svg>

                {/* Node 1: New Subscriber */}
                <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-white rounded-[1.5rem] p-3 pr-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-4 w-[240px] group hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-10 h-10 rounded-full bg-[#fff0e6] flex items-center justify-center shrink-0">
                      <UserPlus className="w-5 h-5 text-[#ff8e3c]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">New Subscriber</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Trigger</span>
                        <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-1.5 rounded">join</span>
                      </div>
                    </div>
                    {/* Handle Bottom */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-200 rounded-full border-2 border-white"></div>
                  </div>
                </div>

                {/* Node 2: Send Email */}
                <div className="absolute top-[200px] left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-white rounded-[1.5rem] p-3 pr-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-4 w-[240px] group hover:-translate-y-1 transition-transform duration-300">
                    {/* Handle Top */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-200 rounded-full border-2 border-white"></div>

                    <div className="w-10 h-10 rounded-full bg-[#eff6ff] flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">Send Email</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Welcome Kit</p>
                    </div>

                    {/* Handle Bottom */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-200 rounded-full border-2 border-white"></div>
                  </div>
                </div>

                {/* Node 3: Add Tag (Bottom Center) */}
                <div className="absolute top-[380px] left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-white rounded-[1.5rem] p-3 pr-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center gap-4 w-[240px] group hover:-translate-y-1 transition-transform duration-300">
                    {/* Handle Top */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-200 rounded-full border-2 border-white"></div>

                    <div className="w-10 h-10 rounded-full bg-[#f5f3ff] flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-[#8b5cf6]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">Add Tag</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-purple-600 bg-purple-50 px-1.5 rounded">#pro-lead</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Content (Right) */}
          <div className="flex-1 flex flex-col gap-8 text-left order-2">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-extrabold text-white font-sans tracking-tight leading-[1.1]">Powerful Automation</h2>
              <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                Build workflows that work while you sleep. Trigger emails, messages, and more based on visitor actions.
              </p>
            </div>
            <button className="w-fit mt-2 font-bold text-white hover:text-primary transition-colors flex items-center gap-3 group text-xl">
              Create Workflows <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Feature 3: Scheduler */}
      <section className="w-full py-24 px-4 bg-blue-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <div className="flex-1 flex flex-col gap-8 text-left order-2 md:order-1">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-extrabold text-text-main font-sans tracking-tight leading-[1.1]">Smart Scheduler</h2>
              <p className="text-xl text-text-muted leading-relaxed max-w-lg">
                Let clients book you effortlessly. Syncs with Google Calendar to prevent double bookings. Set your availability and get booked.
              </p>
            </div>
            <button className="w-fit mt-2 font-bold text-text-main hover:text-primary transition-colors flex items-center gap-3 group text-xl">
              Start Booking <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex-1 w-full relative min-h-[400px] flex items-center justify-center order-1 md:order-2">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-8 relative z-10 rotate-[2deg] hover:rotate-0 transition-transform duration-500">
              <div className="mb-6 flex justify-between items-center">
                <span className="font-bold text-lg text-text-main">September 2025</span>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200">{"<"}</div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200">{">"}</div>
                </div>
              </div>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => <div key={d} className="text-xs font-bold text-gray-400 text-center">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-sm cursor-pointer transition-colors ${i === 14 ? 'bg-primary text-black font-bold shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-text-main">Discovery Call</p>
                  <p className="text-xs text-gray-400">10:00 AM - 10:30 AM</p>
                </div>
              </div>
            </div>
            {/* Badge */}
            <div className="absolute -left-4 top-1/2 bg-white text-text-main px-6 py-4 rounded-2xl shadow-xl z-20 rotate-[-5deg]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="font-bold text-sm">Confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Partnerships */}
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
              Get Sponsored <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex-1 w-full relative min-h-[400px] flex items-center justify-center order-1">
            {/* Visual: Primary Card */}
            <div className="w-full max-w-md bg-primary rounded-[2.5rem] shadow-xl p-8 relative z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm overflow-hidden">
                <img src="/Street Life - Head (1).svg" alt="Collaboration" className="w-full h-full object-cover scale-150 translate-y-2 opacity-80" />
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

      {/* Feature 5: Blog */}
      <section className="w-full py-24 px-4 bg-orange-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <div className="flex-1 w-full relative min-h-[400px] flex items-center justify-center order-1 md:order-2">
            {/* Visual: Beige Card */}
            <div className="w-full max-w-md bg-[#fcdba8] rounded-[2.5rem] shadow-xl p-8 relative z-10 rotate-[2deg] hover:rotate-0 transition-transform duration-500">
              <div className="w-full aspect-video bg-black/5 rounded-2xl mb-6 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-black/20">
                  <img src="/Street Life - Head (1).svg" alt="Blog Post" className="w-32 h-32 opacity-20" />
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
              Start Writing <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
