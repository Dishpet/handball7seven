import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const LifestyleBanner = () => {
  const { t, getSiteContent } = useI18n();
  const lifestyleContent = getSiteContent("lifestyle") as Record<string, any> | undefined;
  const bgImage = lifestyleContent?.bg_image || "/images/lifestyle-banner.jpg";

  return (
    <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div className="absolute inset-0 bg-background/60" />

      <motion.div
        className="relative z-10 text-center px-5 max-w-3xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display uppercase tracking-wider mb-3 sm:mb-4">
          {t("lifestyle.headline")}
        </h2>
        <p className="text-foreground/60 font-body text-xs sm:text-sm md:text-base tracking-wide mb-6 sm:mb-8">
          {t("lifestyle.sub")}
        </p>
        <Link to="/shop" className="btn-outline">{t("brand.cta")}</Link>
      </motion.div>
    </section>
  );
};

export default LifestyleBanner;
