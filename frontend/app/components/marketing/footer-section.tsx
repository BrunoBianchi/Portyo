import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import { Twitter, Instagram, Linkedin, Youtube, ArrowUpRight, Heart } from "lucide-react";
import { TikTokIcon } from "~/components/shared/icons";
import { useTranslation } from "react-i18next";
import { FadeInUp } from "./animation-components";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Themes", href: "/themes" },
      { label: "Integrations", href: "/#integrations" },
      { label: "Changelog", href: "/blog" },
    ]
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "#" },
      { label: "Community", href: "#" },
      { label: "Creator Guide", href: "#" },
      { label: "Templates", href: "/themes" },
    ]
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "/contact" },
      { label: "Partners", href: "#" },
    ]
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms-of-service" },
      { label: "Cookies", href: "#" },
      { label: "Licenses", href: "#" },
    ]
  }
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-blue-400" },
  { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-500" },
  { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-600" },
  { icon: Youtube, href: "#", label: "YouTube", color: "hover:text-red-500" },
  { icon: TikTokIcon, href: "#", label: "TikTok", color: "hover:text-white" },
];

export default function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1];
  const withLang = (to: string) => (currentLang ? `/${currentLang}${to}` : to);

  return (
    <footer className="w-full bg-surface-muted text-foreground relative overflow-hidden border-t border-border">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* CTA Section */}
      <div className="relative border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <FadeInUp>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                  {t("footer.ctaTitle", "Ready to grow your audience?")}
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl">
                  {t("footer.ctaSubtitle", "Join 10,000+ creators who trust Portyo to power their online presence.")}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to={withLang("/sign-up")}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                >
                  {t("footer.ctaButton", "Get Started Free")}
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </FadeInUp>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to={withLang("/")} className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-background font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">Portyo</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-xs leading-relaxed">
              {t("footer.tagline", "The all-in-one platform for creators to showcase their work, sell products, and grow their audience.")}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground transition-colors ${social.color} hover:bg-white/10`}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-bold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={withLang(link.href)}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
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
      <div className="relative border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              {t("footer.copyright", "© 2025 Portyo. Made with")}
              <Heart className="w-4 h-4 text-primary fill-primary" />
              {t("footer.forCreators", "for creators everywhere")}
            </p>
            
            <div className="flex items-center gap-6">
              <Link to={withLang("/privacy-policy")} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                {t("footer.privacy", "Privacy")}
              </Link>
              <Link to={withLang("/terms-of-service")} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                {t("footer.terms", "Terms")}
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground text-sm">{t("footer.status", "All systems operational")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
