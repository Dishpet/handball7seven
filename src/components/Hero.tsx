import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/logo.png";
import Hero3DCarousel from "@/components/Hero3DCarousel";

const Hero = () => {
  const { t, getSiteContent } = useI18n();
  const heroContent = getSiteContent("hero") as Record<string, any> | undefined;
  const bgImage = heroContent?.bg_image || "/images/hero-bg.jpg";

  return (
    <section className="relative min-h-[100svh] flex items-end sm:items-center justify-start overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      {/* Extra bottom gradient for mobile readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent sm:hidden" />

      {/* Two-column layout on desktop */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center lg:items-center min-h-[100svh]">
        {/* Left column: text content */}
        <div className="px-5 md:px-12 lg:px-20 pb-10 sm:pb-20 pt-32 lg:pt-0 max-w-2xl lg:w-1/2 lg:flex-shrink-0">
          <motion.img
            src={logo}
            alt="Handball Seven"
            className="h-12 sm:h-16 md:h-24 mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          />
          <motion.p
            className="text-foreground/70 text-xs sm:text-sm md:text-base font-body tracking-wide mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t("hero.subtitle")}
          </motion.p>
          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display uppercase tracking-wider leading-[0.95] text-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t("hero.slogan")}
          </motion.h1>
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/shop" className="btn-primary text-center">{t("hero.shop")}</Link>
            <Link to="/collections" className="btn-outline text-center">{t("hero.explore")}</Link>
          </motion.div>
        </div>

        {/* Right column: 3D carousel */}
        <motion.div
          className="w-full lg:w-1/2 h-[50vh] sm:h-[60vh] lg:h-[80vh] relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          <Hero3DCarousel />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
