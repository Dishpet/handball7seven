import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import ProductShowcase from "@/components/ProductShowcase";

const BestSellers = () => {
  const { t } = useI18n();

  return (
    <section className="bg-card">
      <div className="section-padding pb-4">
        <motion.h2
          className="text-center text-2xl md:text-4xl font-display uppercase tracking-[0.2em] mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t("bestsellers.title")}
        </motion.h2>
      </div>
      <ProductShowcase height="h-[60vh] md:h-[75vh]" />
    </section>
  );
};

export default BestSellers;
