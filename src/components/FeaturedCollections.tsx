import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import ScrollReveal from "@/components/ScrollReveal";
import vintageImg from "@/assets/vintage-collection.webp";
import classicImg from "@/assets/classic-collection.webp";
import streetImg from "@/assets/street-collection.webp";

const FeaturedCollections = () => {
  const { t } = useI18n();

  const collections = [
    { id: "vintage", name: t("col.vintage"), desc: t("col.vintage.desc"), image: vintageImg },
    { id: "classic", name: t("col.classic"), desc: t("col.classic.desc"), image: classicImg },
    { id: "street", name: t("col.street"), desc: t("col.street.desc"), image: streetImg },
  ];

  return (
    <section className="px-5 md:px-12 lg:px-20 py-12 md:py-24">
      <ScrollReveal>
        <h2 className="text-center text-xl sm:text-2xl md:text-4xl font-display uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-8 md:mb-12">
          {t("featured.title")}
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {collections.map((col, i) => (
          <ScrollReveal key={col.id} delay={i * 0.1}>
            <Link
              to={`/collections?filter=${col.id}`}
              className="group block relative overflow-hidden aspect-[3/4] rounded-sm"
            >
              {/* Background image */}
              <img
                src={col.image}
                alt={col.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

              {/* Text content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-8">
                <h3 className="font-display uppercase text-base sm:text-lg tracking-wider mb-1 sm:mb-2 text-foreground">
                  {col.name}
                </h3>
                <p className="text-foreground/70 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3 line-clamp-3">
                  {col.desc}
                </p>
                <span className="text-primary text-xs font-display uppercase tracking-widest group-hover:tracking-[0.3em] transition-all">
                  {t("hero.explore")} →
                </span>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollections;
