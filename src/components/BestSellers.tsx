import { useI18n } from "@/lib/i18n";
import ProductShowcase from "@/components/ProductShowcase";
import ScrollReveal from "@/components/ScrollReveal";

const BestSellers = () => {
  const { t } = useI18n();

  return (
    <section className="bg-card">
      <div className="px-5 md:px-12 lg:px-20 pt-12 md:pt-24 pb-4 text-inherit bg-primary-foreground">
        <ScrollReveal>
          <h2 className="text-center text-xl sm:text-2xl md:text-4xl font-display uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-4">
            {t("bestsellers.title")}
          </h2>
        </ScrollReveal>
      </div>
      <ProductShowcase height="h-[50vh] sm:h-[60vh] md:h-[75vh]" />
    </section>);

};

export default BestSellers;