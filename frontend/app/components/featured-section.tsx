
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
            <i className="fa-brands fa-x-twitter text-3xl text-text-main group-hover:scale-110 transition-transform duration-300"></i>
          </div>

          {/* TikTok */}
          <div className="bg-white rounded-full px-10 py-6 shadow-sm flex items-center justify-center min-w-[200px] transition-transform hover:-translate-y-1 duration-300 group cursor-default">
            <i className="fa-brands fa-tiktok text-3xl text-text-main group-hover:scale-110 transition-transform duration-300"></i>
          </div>

          {/* Product Hunt */}
          <div className="bg-white rounded-full px-10 py-6 shadow-sm flex items-center justify-center min-w-[200px] transition-transform hover:-translate-y-1 duration-300 group cursor-default">
            <i className="fa-brands fa-product-hunt text-3xl text-text-main group-hover:scale-110 transition-transform duration-300"></i>
          </div>

          {/* LinkedIn */}
          <div className="bg-white rounded-full px-10 py-6 shadow-sm flex items-center justify-center min-w-[200px] transition-transform hover:-translate-y-1 duration-300 group cursor-default">
            <i className="fa-brands fa-linkedin text-3xl text-text-main group-hover:scale-110 transition-transform duration-300"></i>
          </div>
        </div>
      </div>
    </section>
  );
}
