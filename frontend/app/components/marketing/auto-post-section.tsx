import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Zap,
  BarChart3,
  Target,
  MessageSquare
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  isInView: boolean;
}

const FeatureCard = ({ icon, title, description, delay, isInView }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={isInView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className="group relative p-6 rounded-2xl bg-surface-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
    <div className="relative">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/70 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export default function AutoPostSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: t("autoPost.features.aiGeneration", "Geração com IA"),
      description: t("autoPost.features.aiGenerationDesc", "Posts gerados automaticamente com Groq AI (llama-3.3-70b), adaptados ao seu estilo e expertise.")
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: t("autoPost.features.seoOptimized", "SEO, GEO & AEO"),
      description: t("autoPost.features.seoOptimizedDesc", "Conteúdo otimizado para mecanismos de busca, engenhos de IA e respostas diretas.")
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: t("autoPost.features.scheduling", "Agendamento Inteligente"),
      description: t("autoPost.features.schedulingDesc", "Agende posts diários, semanais, quinzenais ou mensais no horário que preferir.")
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: t("autoPost.features.metrics", "Métricas de Performance"),
      description: t("autoPost.features.metricsDesc", "Acompanhe scores de SEO, GEO e AEO em tempo real para cada post gerado.")
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t("autoPost.features.timeSaving", "Economia de Tempo"),
      description: t("autoPost.features.timeSavingDesc", "Deixe a IA criar conteúdo relevante enquanto você foca no que realmente importa.")
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t("autoPost.features.proFeature", "10 Posts/mês no Pro"),
      description: t("autoPost.features.proFeatureDesc", "Planos Pro incluem até 10 posts automáticos por mês com análise de bio incluída.")
    }
  ];

  const highlights = [
    { icon: <MessageSquare className="w-4 h-4" />, text: t("autoPost.highlights.1", "Análise automática da bio") },
    { icon: <TrendingUp className="w-4 h-4" />, text: t("autoPost.highlights.2", "Conteúdo sempre atualizado") },
    { icon: <Target className="w-4 h-4" />, text: t("autoPost.highlights.3", "Foco no seu público-alvo") },
    { icon: <Zap className="w-4 h-4" />, text: t("autoPost.highlights.4", "Publicação automática") }
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 bg-background overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
              {t("autoPost.badge", "Recurso Pro")}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("autoPost.title.line1", "Auto")}{" "}
            <span className="text-primary">{t("autoPost.title.line2", "Post")}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            {t("autoPost.subtitle", "Geração automática de posts para sua bio com IA. Conteúdo otimizado, agendamento inteligente e métricas em tempo real.")}
          </motion.p>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
          >
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card border border-border"
              >
                <span className="text-primary">{highlight.icon}</span>
                <span className="text-sm font-medium text-white/80">{highlight.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={0.1 * (index + 1)}
              isInView={isInView}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-[#0a0a0f] rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            <Zap className="w-5 h-5" />
            {t("autoPost.cta", "Conheça o Plano Pro")}
          </a>
          <p className="mt-4 text-sm text-white/50">
            {t("autoPost.ctaHint", "Disponível exclusivamente no plano Pro")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
