import React from 'react';
import { Link, useLocation } from 'react-router';
import { Twitter, Instagram, Linkedin } from "lucide-react";
import { TikTokIcon } from "~/components/shared/icons";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1];
  const withLang = (to: string) => (currentLang ? `/${currentLang}${to}` : to);

  return (
    <footer className="w-full bg-black text-white pt-24 pb-12 px-4 rounded-t-[3rem] mt-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">

        {/* Top Section: CTA & Links */}
        <div className="flex flex-col md:flex-row justify-between gap-12">

          {/* Brand & CTA */}
          <div className="flex-1 flex flex-col gap-6 max-w-md">
            <Link to={withLang("/")} className="text-3xl font-bold tracking-tighter flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg"></div>
              Portyo
            </Link>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-4 mt-4">
              <Link to={withLang("/sign-up")} className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                {t("footer.cta")}
              </Link>
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex-[1.5] grid grid-cols-2 md:grid-cols-3 gap-8">

            {/* Column 1 */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-lg">{t("footer.product.title")}</h3>
              <ul className="flex flex-col gap-3 text-gray-300">
                <li><Link to={withLang("/#features")} className="hover:text-white transition-colors">{t("footer.product.features")}</Link></li>
                <li><Link to={withLang("/pricing")} className="hover:text-white transition-colors">{t("footer.product.pricing")}</Link></li>
                <li><Link to={withLang("/#analytics")} className="hover:text-white transition-colors">{t("footer.product.analytics")}</Link></li>
                <li><Link to={withLang("/#themes")} className="hover:text-white transition-colors">{t("footer.product.themes")}</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-lg">{t("footer.resources.title")}</h3>
              <ul className="flex flex-col gap-3 text-gray-300">
                <li><Link to={withLang("/site-blog")} className="hover:text-white transition-colors">{t("footer.resources.blog")}</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">{t("footer.resources.community")}</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">{t("footer.resources.help")}</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">{t("footer.resources.creators")}</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-lg">{t("footer.company.title")}</h3>
              <ul className="flex flex-col gap-3 text-gray-300">
                <li><Link to={withLang("/about")} className="hover:text-white transition-colors">{t("footer.company.about")}</Link></li>
                <li><Link to={withLang("/privacy-policy")} className="hover:text-white transition-colors">{t("footer.company.privacy")}</Link></li>
                <li><Link to={withLang("/terms-of-service")} className="hover:text-white transition-colors">{t("footer.company.terms")}</Link></li>
                <li><Link to={withLang("/contact")} className="hover:text-white transition-colors">{t("footer.company.contact")}</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-300 text-sm">
          <p>{t("footer.copyright")}</p>

          <div className="flex items-center gap-6">
            <a href="#" aria-label="Twitter" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="#" aria-label="TikTok" className="hover:text-white transition-colors"><TikTokIcon className="w-5 h-5" /></a>
          </div>
        </div>

      </div>
    </footer>
  );
}
