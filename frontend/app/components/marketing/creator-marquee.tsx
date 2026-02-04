"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getRandomPublicBios, type PublicBio } from "~/services/public-bios.service";
import { Link } from "react-router";

// Vibrant color palette
const vibrantColors = [
  { bg: "#D7F000", text: "#0a0a0f", accent: "#FF6B9D" },
  { bg: "#FF6B9D", text: "#ffffff", accent: "#D7F000" },
  { bg: "#9D4EDD", text: "#ffffff", accent: "#00D9FF" },
  { bg: "#00D9FF", text: "#0a0a0f", accent: "#D7F000" },
  { bg: "#FF9F1C", text: "#0a0a0f", accent: "#FF6B9D" },
  { bg: "#2EC4B6", text: "#0a0a0f", accent: "#9D4EDD" },
  { bg: "#4361EE", text: "#ffffff", accent: "#D7F000" },
  { bg: "#F72585", text: "#ffffff", accent: "#00D9FF" },
];

// Get consistent color for a name
function getColorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return vibrantColors[Math.abs(hash) % vibrantColors.length];
}

// Animated blob background
function AnimatedBlob({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute rounded-full blur-2xl opacity-20"
      style={{ background: color }}
      animate={{
        scale: [1, 1.3, 1],
        rotate: [0, 90, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function CreatorCard({ bio }: { bio: PublicBio }) {
  const colors = getColorFromName(bio.sufix);
  const displayName = bio.seoTitle || bio.fullName || bio.sufix;
  
  return (
    <Link to={`/p/${bio.sufix}`}>
      <motion.div
        whileHover={{ 
          scale: 1.08, 
          y: -10,
          rotate: [0, -2, 2, 0],
        }}
        whileTap={{ scale: 0.95 }}
        className="flex-shrink-0 w-44 h-44 md:w-52 md:h-52 rounded-[2rem] overflow-hidden cursor-pointer relative group"
        style={{ 
          background: colors.bg,
          boxShadow: `0 10px 40px ${colors.bg}40`,
        }}
      >
        {bio.profileImage ? (
          <>
            <motion.img 
              src={bio.profileImage} 
              alt={displayName}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <motion.div 
              className="absolute bottom-0 left-0 right-0 p-5"
              initial={{ y: 10, opacity: 0.8 }}
              whileHover={{ y: 0, opacity: 1 }}
            >
              <p className="text-white font-black text-xl truncate">{displayName}</p>
              <p className="text-white/70 text-sm font-medium">@{bio.sufix}</p>
            </motion.div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Animated background blobs */}
            <AnimatedBlob color={colors.accent} />
            <motion.div
              className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full"
              style={{ background: colors.accent, opacity: 0.3 }}
              animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            
            <motion.span 
              className="text-2xl md:text-3xl font-black text-center line-clamp-2 relative z-10"
              style={{ color: colors.text }}
              initial={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              {displayName}
            </motion.span>
            <motion.span 
              className="text-sm mt-3 font-bold relative z-10"
              style={{ color: colors.text, opacity: 0.7 }}
            >
              @{bio.sufix}
            </motion.span>

            {/* Decorative elements */}
            <motion.div
              className="absolute top-4 right-4 w-3 h-3 rounded-full"
              style={{ background: colors.accent }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        )}

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
          initial={{ x: "-200%" }}
          whileHover={{ x: "200%" }}
          transition={{ duration: 0.8 }}
        />
      </motion.div>
    </Link>
  );
}

// Animated floating dots decoration
function FloatingDots() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[colors.lime, colors.pink, colors.cyan, colors.purple].map((color, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ 
            background: color,
            left: `${20 + i * 20}%`,
            top: `${30 + (i % 2) * 40}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

export default function CreatorMarquee() {
  const { t } = useTranslation();
  const [bios, setBios] = useState<PublicBio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBios = async () => {
      try {
        const data = await getRandomPublicBios(12);
        setBios(data);
      } catch (error) {
        console.error("Error fetching bios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBios();
  }, []);

  // Fallback creators with vibrant colors
  const fallbackCreators = [
    { name: "HBO", handle: "hbo" },
    { name: "Comedy Central", handle: "comedycentral" },
    { name: "Pharrell", handle: "pharrell" },
    { name: "LA Clippers", handle: "laclippers" },
    { name: "Alicia Keys", handle: "aliciakeys" },
    { name: "Red Bull", handle: "redbull" },
    { name: "Selena Gomez", handle: "selenagomez" },
    { name: "Gary Vee", handle: "garyvee" },
  ];

  // Use real bios if available, otherwise fallback
  const displayItems = bios.length > 0 
    ? bios 
    : fallbackCreators.map((c, i) => ({
        id: `fallback-${i}`,
        sufix: c.handle,
        seoTitle: c.name,
      } as PublicBio));

  // Triple for seamless loop
  const tripleItems = [...displayItems, ...displayItems, ...displayItems];

  if (loading) {
    return (
      <section className="py-20 bg-white overflow-hidden relative">
        <FloatingDots />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center">
            <motion.div 
              className="h-10 w-72 bg-gray-200 rounded-2xl animate-pulse mx-auto"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
        <div className="flex gap-6 justify-center">
          {[...Array(4)].map((_, i) => (
            <motion.div 
              key={i} 
              className="w-44 h-44 md:w-52 md:h-52 rounded-[2rem] bg-gray-100"
              animate={{ 
                background: [
                  "rgba(0,0,0,0.05)",
                  "rgba(200,230,0,0.15)",
                  "rgba(0,0,0,0.05)",
                ]
              }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)' }}>
      <FloatingDots />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-black text-white mb-3"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {t("creatorMarquee.title", "Loved by")}{" "}
            <motion.span 
              style={{ color: "#D7F000" }}
              animate={{ 
                color: ["#D7F000", "#FF6B9D", "#00D9FF", "#D7F000"],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {t("creatorMarquee.highlight", "creators worldwide")}
            </motion.span>
            🌍
          </motion.h2>
          <motion.p 
            className="text-white/80 text-lg"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t("creatorMarquee.subtitle", "Join the community of creators who trust Portyo")}
          </motion.p>
        </motion.div>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Gradient fades */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-[#8b5cf6] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-[#8b5cf6] to-transparent z-10 pointer-events-none" />

        {/* Scrolling content */}
        <motion.div
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
          className="flex gap-6"
        >
          {tripleItems.map((item, index) => (
            'name' in item ? (
              <FallbackCard 
                key={`fallback-${index}`} 
                creator={item as unknown as { name: string; handle: string }} 
              />
            ) : (
              <CreatorCard 
                key={`${(item as PublicBio).id}-${index}`} 
                bio={item as PublicBio} 
              />
            )
          ))}
        </motion.div>
      </div>

      {/* Bottom decorative element */}
      <motion.div
        className="flex justify-center mt-12 gap-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {vibrantColors.slice(0, 5).map((c, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: c.bg }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </motion.div>
    </section>
  );
}

// Fallback card component
function FallbackCard({ creator }: { creator: { name: string; handle: string } }) {
  const colors = getColorFromName(creator.handle);

  return (
    <motion.div
      whileHover={{ 
        scale: 1.08, 
        y: -10,
        rotate: [0, -2, 2, 0],
      }}
      whileTap={{ scale: 0.95 }}
      className="flex-shrink-0 w-44 h-44 md:w-52 md:h-52 rounded-[2rem] overflow-hidden cursor-pointer relative group"
      style={{ 
        background: colors.bg,
        boxShadow: `0 10px 40px ${colors.bg}40`,
      }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Animated blobs */}
        <AnimatedBlob color={colors.accent} />
        <motion.div
          className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full"
          style={{ background: colors.accent, opacity: 0.3 }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        
        <motion.span 
          className="text-2xl md:text-3xl font-black text-center line-clamp-2 relative z-10"
          style={{ color: colors.text }}
        >
          {creator.name}
        </motion.span>
        <span 
          className="text-sm mt-3 font-bold relative z-10"
          style={{ color: colors.text, opacity: 0.7 }}
        >
          @{creator.handle}
        </span>

        <motion.div
          className="absolute top-4 right-4 w-3 h-3 rounded-full"
          style={{ background: colors.accent }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
        initial={{ x: "-200%" }}
        whileHover={{ x: "200%" }}
        transition={{ duration: 0.8 }}
      />
    </motion.div>
  );
}

// Need to import colors for the FallbackCard
const colors = {
  lime: "#D7F000",
  pink: "#FF6B9D",
  purple: "#9D4EDD",
  blue: "#4361EE",
  cyan: "#00D9FF",
  orange: "#FF9F1C",
  green: "#2EC4B6",
};
