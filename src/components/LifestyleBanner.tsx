import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollCharReveal from "@/components/ScrollCharReveal";

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

      <div className="relative z-10 text-center px-5 max-w-3xl">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display uppercase tracking-wider mb-3 sm:mb-4">
            {t("lifestyle.headline")}
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-foreground/60 font-body text-xs sm:text-sm md:text-base tracking-wide mb-6 sm:mb-8">
            {t("lifestyle.sub")}
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <Link to="/shop" className="btn-outline">{t("brand.cta")}</Link>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default LifestyleBanner;
