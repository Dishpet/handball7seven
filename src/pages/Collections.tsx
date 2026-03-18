import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductShowcase from "@/components/ProductShowcase";
import { useCollections } from "@/hooks/useCollections";
import { useI18n } from "@/lib/i18n";
import collectionsImg from "@/assets/collections-banner.png";
import ScrollReveal from "@/components/ScrollReveal";

const Collections = () => {
  const { t } = useI18n();
  const { data: collections } = useCollections();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <main className="pt-20">
        <div className="relative h-[30vh] sm:h-[40vh] md:h-[50vh] overflow-hidden">
          <motion.img
            src={collectionsImg}
            alt="Collections"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-5 md:px-12 lg:px-20 pb-6 sm:pb-10">
            <motion.h1
              className="text-2xl sm:text-3xl md:text-5xl font-display uppercase tracking-[0.15em] sm:tracking-[0.2em]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {t("featured.title")}
            </motion.h1>
          </div>
        </div>

        {/* Collection Cards */}
        <div className="px-5 md:px-12 lg:px-20 py-10 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {(collections ?? []).map((col, i) => (
              <ScrollReveal key={col.slug} delay={i * 0.1}>
                <div className="text-left border border-border p-5 sm:p-6 md:p-8 hover:border-primary/30 transition-all duration-300 active:bg-muted/30">
                  <h3 className="font-display uppercase tracking-wider text-base sm:text-lg mb-2">{col.name}</h3>
                  <p className="text-muted-foreground text-sm">{col.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* 3D Product Showcase */}
        <ScrollReveal>
          <ProductShowcase height="h-[50vh] sm:h-[65vh] md:h-[80vh]" />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
};

export default Collections;
