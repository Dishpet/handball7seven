import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import ScrollReveal from "@/components/ScrollReveal";

const BrandStory = () => {
  const { t } = useI18n();

  return (
    <section className="px-5 md:px-12 lg:px-20 py-12 md:py-24">
      <div className="max-w-2xl mx-auto text-center">
        <ScrollReveal direction="up" distance={30}>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-display uppercase tracking-wider mb-4 md:mb-6 leading-tight">
            {t("brand.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6 md:mb-8 text-sm md:text-base">
            {t("brand.text")}
          </p>
          <Link to="/about" className="btn-outline inline-block">{t("brand.cta")}</Link>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BrandStory;
