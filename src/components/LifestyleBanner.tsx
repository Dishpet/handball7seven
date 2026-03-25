import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollCharReveal from "@/components/ScrollCharReveal";

const LifestyleBanner = () => {
  const { t, getSiteContent } = useI18n();
  const lifestyleContent = getSiteContent("lifestyle") as Record<string, any> | undefined;
  const bgImage = lifestyleContent?.bg_image || "/images/lifestyle-banner.jpg";

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full">
        <img
          src={bgImage}
          alt=""
          className="w-full h-auto block"
        />
        <div className="absolute bottom-0 left-0 right-0 h-[60%] md:h-[80%] bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Desktop: text overlaid at bottom */}
        <div className="hidden md:flex absolute inset-0 items-end justify-center">
          <div className="pb-14 md:pb-20 lg:pb-24 text-center max-w-3xl px-12">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display uppercase tracking-wider mb-3 sm:mb-4">
                {t("lifestyle.headline")}
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-foreground/60 font-body text-sm md:text-base tracking-wide mb-6 sm:mb-8">
                {t("lifestyle.sub")}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <Link to="/shop" className="btn-outline">{t("brand.cta")}</Link>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Mobile: text below the image */}
      <div className="md:hidden px-5 py-8 text-center">
        <ScrollReveal>
          <h2 className="text-2xl font-display uppercase tracking-wider mb-3">
            {t("lifestyle.headline")}
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-foreground/60 font-body text-xs tracking-wide mb-6">
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
