import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useSiteContent } from "@/hooks/useSiteContent";

const Hero = () => {
  const { t, getSiteContent } = useI18n();
  const heroContent = getSiteContent("hero") as Record<string, any> | undefined;
  const bgImage = heroContent?.bg_image || "/images/hero-bg.jpg";

  return (
    <section className="relative w-full pt-[60px] md:pt-[72px]">
      {/* Image container — preserves natural aspect ratio */}
      <div className="relative w-full">
        <img
          src={bgImage}
          alt=""
          className="w-full h-auto block"
        />

        {/* Gradient overlay: bottom to top (hidden on mobile where text is below) */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%] md:h-[80%] bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Text content — overlaid at bottom on desktop */}
        <div className="hidden md:flex absolute inset-0 items-end">
          <div className="px-12 lg:px-20 pb-14 md:pb-20 lg:pb-24 max-w-2xl text-left">
            <motion.p
              className="text-foreground/70 text-sm md:text-base font-body tracking-wide mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t("hero.subtitle")}
            </motion.p>
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-display uppercase tracking-wider leading-[0.95] text-foreground"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t("hero.slogan")}
            </motion.h1>
            <motion.div
              className="flex flex-row gap-4 mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/shop" className="btn-primary text-center">{t("hero.shop")}</Link>
              <Link to="/collections" className="btn-outline text-center">{t("hero.explore")}</Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile: text & buttons below the image */}
      <div className="md:hidden px-5 py-8 text-left">
        <motion.p
          className="text-foreground/70 text-xs font-body tracking-wide mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t("hero.subtitle")}
        </motion.p>
        <motion.h1
          className="text-3xl font-display uppercase tracking-wider leading-[0.95] text-foreground"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {t("hero.slogan")}
        </motion.h1>
        <motion.div
          className="flex flex-col gap-3 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link to="/shop" className="btn-primary text-center">{t("hero.shop")}</Link>
          <Link to="/collections" className="btn-outline text-center">{t("hero.explore")}</Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
