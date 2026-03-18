import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import collectionsImg from "@/assets/collections-banner.png";
import ScrollReveal from "@/components/ScrollReveal";

const FeaturedCollections = () => {
  const { t } = useI18n();

  const collections = [
    { id: "classic", name: t("col.classic"), desc: t("col.classic.desc") },
    { id: "vintage", name: t("col.vintage"), desc: t("col.vintage.desc") },
    { id: "street", name: t("col.street"), desc: t("col.street.desc") },
  ];

  return (
    <section className="px-5 md:px-12 lg:px-20 py-12 md:py-24">
      <ScrollReveal>
        <h2 className="text-center text-xl sm:text-2xl md:text-4xl font-display uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-8 md:mb-12">
          {t("featured.title")}
        </h2>
      </ScrollReveal>

      <ScrollReveal>
        <div className="relative overflow-hidden mb-8 md:mb-12">
          <img src={collectionsImg} alt="Collections" className="w-full h-auto object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {collections.map((col, i) => (
          <ScrollReveal key={col.id} delay={i * 0.1}>
            <Link to={`/collections?filter=${col.id}`} className="group block border border-border p-5 sm:p-6 md:p-8 hover:border-primary/50 transition-all duration-300 active:bg-muted/30">
              <h3 className="font-display uppercase text-base sm:text-lg tracking-wider mb-2 sm:mb-3">{col.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3 sm:mb-4">{col.desc}</p>
              <span className="text-primary text-xs font-display uppercase tracking-widest group-hover:tracking-[0.3em] transition-all">
                {t("hero.explore")} →
              </span>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollections;
