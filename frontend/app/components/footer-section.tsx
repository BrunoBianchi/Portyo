import React from 'react';
import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white pt-24 pb-12 px-4 rounded-t-[3rem] mt-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        
        {/* Top Section: CTA & Links */}
        <div className="flex flex-col md:flex-row justify-between gap-12">
          
          {/* Brand & CTA */}
          <div className="flex-1 flex flex-col gap-6 max-w-md">
            <Link to="/" className="text-3xl font-bold tracking-tighter flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg"></div>
              Portyo
            </Link>
            <p className="text-gray-400 text-lg leading-relaxed">
              Turn your bio into your business. The all-in-one platform for creators to grow, monetize, and own their audience.
            </p>
            <div className="flex gap-4 mt-4">
                <Link to="/signup" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Get Started for Free
                </Link>
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex-[1.5] grid grid-cols-2 md:grid-cols-3 gap-8">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-4">
                <h4 className="font-bold text-lg">Product</h4>
                <ul className="flex flex-col gap-3 text-gray-400">
                    <li><Link to="#" className="hover:text-white transition-colors">Features</Link></li>
                    <li><Link to="#" className="hover:text-white transition-colors">Pricing</Link></li>
                    <li><Link to="#" className="hover:text-white transition-colors">Analytics</Link></li>
                    <li><Link to="#" className="hover:text-white transition-colors">Themes</Link></li>
                </ul>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-4">
                <h4 className="font-bold text-lg">Resources</h4>
                <ul className="flex flex-col gap-3 text-gray-400">
                    <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
                    <li><Link to="#" className="hover:text-white transition-colors">Community</Link></li>
                    <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                    <li><Link to="#" className="hover:text-white transition-colors">Creators</Link></li>
                </ul>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-4">
                <h4 className="font-bold text-lg">Company</h4>
                <ul className="flex flex-col gap-3 text-gray-400">
                    <li><Link to="#" className="hover:text-white transition-colors">About</Link></li>
                    <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
                    <li><Link to="#" className="hover:text-white transition-colors">Legal</Link></li>
                    <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm">
            <p>© 2025 Portyo Inc. All rights reserved.</p>
            
            <div className="flex items-center gap-6">
                <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-twitter text-xl"></i></a>
                <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-instagram text-xl"></i></a>
                <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-linkedin text-xl"></i></a>
                <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-tiktok text-xl"></i></a>
            </div>
        </div>

      </div>
    </footer>
  );
}
