import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import { Twitter, Instagram, Linkedin, Youtube, Heart, Target } from "lucide-react";
import { TikTokIcon } from "~/components/shared/icons";
import { useTranslation } from "react-i18next";
import { isCompanySubdomain } from "~/lib/company-utils";

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: TikTokIcon, href: "#", label: "TikTok" },
];

interface FooterProps {
  isCompanyMode?: boolean;
}

export default function Footer({ isCompanyMode = false }: FooterProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1];
  const withLang = (to: string) => (currentLang ? `/${currentLang}${to}` : to);
  
  // Detect company mode from prop or URL
  const isCompany = isCompanyMode || isCompanySubdomain();

  const footerLinks = {
    product: {
      title: t("footer.product.title", "Product"),
      links: [
        { label: t("footer.product.features", "Features"), href: "/#features" },
        { label: t("footer.product.pricing", "Pricing"), href: "/pricing" },
        { label: t("footer.product.themes", "Themes"), href: "/themes" },
        { label: "Integrations", href: "/#integrations" },
      ]
    },
    resources: {
      title: t("footer.resources.title", "Resources"),
      links: [
        { label: t("footer.resources.blog", "Blog"), href: "/blog" },
        { label: t("footer.resources.help", "Help Center"), href: "#" },
        { label: t("footer.resources.community", "Community"), href: "#" },
        { label: "Templates", href: "/themes" },
      ]
    },
    company: {
      title: t("footer.company.title", "Company"),
      links: [
        { label: t("footer.company.about", "About"), href: "/about" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
        { label: t("footer.company.contact", "Contact"), href: "/contact" },
      ]
    },
    legal: {
      title: "Legal",
      links: [
        { label: t("footer.company.privacy", "Privacy Policy"), href: "/privacy-policy" },
        { label: t("footer.company.terms", "Terms of Service"), href: "/terms-of-service" },
        { label: "Cookies", href: "#" },
      ]
    }
  };

  // Company Footer - Same style as standard but with company content
  if (isCompany) {
    const companyFooterLinks = {
      product: {
        title: t("footer.company.product.title", "Product"),
        links: [
          { label: t("footer.company.product.features", "Features"), href: "/#features" },
          { label: t("footer.company.product.howItWorks", "How it Works"), href: "/#how-it-works" },
          { label: t("footer.company.product.pricing", "Pricing"), href: "/pricing" },
        ]
      },
      resources: {
        title: t("footer.company.resources.title", "Resources"),
        links: [
          { label: t("footer.company.resources.help", "Help Center"), href: "#" },
          { label: t("footer.company.resources.blog", "Blog"), href: "/blog" },
        ]
      },
      company: {
        title: t("footer.company.company.title", "Company"),
        links: [
          { label: t("footer.company.company.about", "About"), href: "/about" },
          { label: t("footer.company.company.contact", "Contact"), href: "/contact" },
        ]
      },
      legal: {
        title: "Legal",
        links: [
          { label: t("footer.company.legal.privacy", "Privacy Policy"), href: "/privacy-policy" },
          { label: t("footer.company.legal.terms", "Terms of Service"), href: "/terms-of-service" },
        ]
      }
    };

    return (
      <footer className="w-full text-gray-900 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }}>
        {/* Main Footer */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="col-span-2">
              <Link to={withLang("/")} className="inline-flex items-center gap-0 mb-6">
                <div className="w-10 h-10 bg-[#c8e600] rounded-xl flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-xl">P</span>
                </div>
                <span className="text-2xl font-bold tracking-tight text-gray-900 ml-3">Portyo</span>
                <span className="ml-2 text-sm font-medium text-gray-400">| Companies</span>
              </Link>
              <p className="text-gray-600 mb-6 max-w-xs leading-relaxed">
                {t("footer.company.tagline", "Reach creators directly. Sponsor specific links on Portyo bios and get guaranteed visibility where it matters.")}
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-300 transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(companyFooterLinks).map(([key, section]) => (
              <div key={key}>
                <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        to={withLang(link.href)}
                        className="text-gray-600 hover:text-[#D2E823] transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm flex items-center gap-1">
                © {new Date().getFullYear()} Portyo Sponsors. {t("footer.company.rights", "All rights reserved.")}
              </p>
              
              <div className="flex items-center gap-6">
                <Link to={withLang("/privacy-policy")} className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  {t("footer.privacy", "Privacy")}
                </Link>
                <Link to={withLang("/terms-of-service")} className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  {t("footer.terms", "Terms")}
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#D2E823] animate-pulse" />
                  <span className="text-gray-500 text-sm">{t("footer.status", "All systems operational")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full text-gray-900 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }}>
      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to={withLang("/")} className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#c8e600] rounded-xl flex items-center justify-center">
                <span className="text-gray-900 font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">Portyo</span>
            </Link>
            <p className="text-gray-600 mb-6 max-w-xs leading-relaxed">
              {t("footer.tagline", "The all-in-one platform for creators to showcase their work, sell products, and grow their audience.")}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-300 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={withLang(link.href)}
                      className="text-gray-600 hover:text-[#c8e600] transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm flex items-center gap-1">
              {t("footer.copyright", "© 2025 Portyo. Made with")}
              <Heart className="w-4 h-4 text-[#c8e600] fill-[#c8e600]" />
              {t("footer.forCreators", "for creators everywhere")}
            </p>
            
            <div className="flex items-center gap-6">
              <Link to={withLang("/privacy-policy")} className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                {t("footer.privacy", "Privacy")}
              </Link>
              <Link to={withLang("/terms-of-service")} className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                {t("footer.terms", "Terms")}
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#c8e600] animate-pulse" />
                <span className="text-gray-500 text-sm">{t("footer.status", "All systems operational")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
