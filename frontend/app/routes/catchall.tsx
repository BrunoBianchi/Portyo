import { Link } from "react-router";

export default function CatchAll() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent px-4 relative overflow-hidden">
      {/* Background Decorative Elements matches Auth/Dashboard vibe - REMOVED for transparency */}
      {/* <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[120px] pointer-events-none" /> */}
      {/* <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" /> */}

      <div className="text-center relative z-10 max-w-lg mx-auto">
        <h1 className="text-[150px] font-black text-gray-900 leading-none tracking-tighter opacity-10">404</h1>
        <div className="mt-[-80px] mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Page not found</h2>
          <p className="text-lg text-gray-500 font-medium">
            Oops! The page you are looking for seems to have wandered off.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-gray-200"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
