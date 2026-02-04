import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AuthLayoutBoldProps {
    children: React.ReactNode;
    heroImage?: string; // Optional custom image for the right side
    title?: string;
    subtitle?: string;
}

export function AuthLayoutBold({ children, heroImage, title, subtitle }: AuthLayoutBoldProps) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2 bg-white selection:bg-[#D2E823] selection:text-[#1A1A1A]">
            {/* LEFT COLUMN: Form Content */}
            <div className="flex flex-col relative p-6 sm:p-12 lg:p-20 overflow-y-auto">
                {/* Header / Logo */}
                <div className="flex items-center justify-between mb-12 lg:mb-20">
                    <Link
                        to="/"
                        className="font-display font-black text-3xl tracking-tighter text-[#1A1A1A] hover:opacity-80 transition-opacity"
                    >
                        Portyo
                    </Link>

                    <Link
                        to="/"
                        className="flex items-center text-sm font-bold text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors gap-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Voltar para home</span>
                    </Link>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {title && (
                            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl mb-4 tracking-tighter text-[#1A1A1A] leading-[0.95]">
                                {title}
                            </h1>
                        )}

                        {subtitle && (
                            <p className="font-body font-medium text-lg text-[#1A1A1A]/60 mb-10 leading-relaxed">
                                {subtitle}
                            </p>
                        )}

                        {children}
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="mt-12 lg:mt-20 text-center lg:text-left text-xs font-bold text-[#1A1A1A]/40 uppercase tracking-widest">
                    © 2025 Portyo Inc.
                </div>
            </div>

            {/* RIGHT COLUMN: Visuals */}
            <div className="hidden lg:flex relative bg-[#0047FF] items-center justify-center overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-[#0047FF]">
                    {/* Acid Green Blob */}
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#D2E823] rounded-full blur-[120px] opacity-40 mix-blend-hard-light animate-pulse duration-3000"></div>

                    {/* Pink Blob */}
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E94E77] rounded-full blur-[100px] opacity-40 mix-blend-hard-light"></div>

                    {/* Grid Pattern overlay */}
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}
                    ></div>
                </div>

                {/* Floating Content Card */}
                <motion.div
                    className="relative z-10 w-[80%] max-w-[600px] aspect-[4/5] bg-white/10 backdrop-blur-md rounded-[3rem] border border-white/20 shadow-2xl p-8 flex flex-col items-center justify-center overflow-hidden"
                    initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    {/* Decorative "Sticker" */}
                    <div className="absolute top-8 right-8 bg-[#D2E823] text-[#1A1A1A] font-black text-sm px-4 py-2 rounded-full rotate-12 shadow-lg z-20">
                        NEW V2.0
                    </div>

                    {/* Dynamic Image or Placeholder */}
                    <div className="w-full h-full rounded-[2rem] overflow-hidden bg-[#F3F3F1] relative group">
                        {heroImage ? (
                            <img src={heroImage} alt="Auth Visual" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                            // Default Visual: 3D-like composition
                            <div className="w-full h-full flex items-center justify-center bg-[#F3F3F1] relative">
                                {/* Circle */}
                                <div className="w-48 h-48 bg-[#E94E77] rounded-full absolute top-1/4 left-1/4 mix-blend-multiply opacity-80 animate-float"></div>
                                {/* Square */}
                                <div className="w-56 h-56 bg-[#0047FF] rounded-[2rem] absolute bottom-1/4 right-1/4 mix-blend-multiply opacity-80 animate-float-delayed"></div>

                                {/* Text */}
                                <div className="relative z-10 text-center">
                                    <h3 className="font-display font-black text-5xl text-[#1A1A1A] leading-none mb-2">
                                        CRIE.
                                    </h3>
                                    <h3 className="font-display font-black text-5xl text-[#1A1A1A] leading-none mb-2 text-transparent stroke-text" style={{ WebkitTextStroke: "2px #1A1A1A" }}>
                                        MONETIZE.
                                    </h3>
                                    <h3 className="font-display font-black text-5xl text-[#1A1A1A] leading-none">
                                        CRESÇA.
                                    </h3>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
