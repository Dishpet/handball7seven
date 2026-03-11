import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/logo.png";

const Hero = () => {
  const { t, getSiteContent } = useI18n();
  const heroContent = getSiteContent("hero") as Record<string, any> | undefined;
  const bgImage = heroContent?.bg_image || "/images/hero-bg.jpg";

  return (
    <section className="relative min-h-screen flex items-center justify-start overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />

      <div className="relative z-10 px-5 md:px-12 lg:px-20 py-32 max-w-2xl">
        <motion.img
          src={logo}
          alt="Handball Seven"
          className="h-16 md:h-24 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        />
        <motion.p
          className="text-foreground/70 text-sm md:text-base font-body tracking-wide mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t("hero.subtitle")}
        </motion.p>
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-display uppercase tracking-wider leading-none text-foreground"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {t("hero.slogan")}
        </motion.h1>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-10"
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
