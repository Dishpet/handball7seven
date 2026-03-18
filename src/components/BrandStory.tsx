import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import hoodieImg from "@/assets/hoodie-vintage.png";
import ScrollReveal from "@/components/ScrollReveal";

const BrandStory = () => {
  const { t } = useI18n();

  return (
    <section className="px-5 md:px-12 lg:px-20 py-12 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        <ScrollReveal direction="left" distance={50} className="order-2 md:order-1">
          <img src={hoodieImg} alt="Handball Seven Vintage Hoodie" className="w-full max-w-sm md:max-w-lg mx-auto" />
        </ScrollReveal>

        <ScrollReveal direction="right" distance={50} className="order-1 md:order-2 text-center md:text-left">
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
