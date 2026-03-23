import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductShowcase from "@/components/ProductShowcase";
import { useCollections } from "@/hooks/useCollections";
import { useI18n } from "@/lib/i18n";
import collectionsHero from "@/assets/collections-hero.webp";
import ScrollReveal from "@/components/ScrollReveal";

const COLLECTION_NAMES = ["Vintage", "Original", "Street"];

const Collections = () => {
  const { t } = useI18n();
  const { data: collections } = useCollections();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <main>
        {/* Hero — full-width image like homepage */}
        <section className="relative w-full pt-[60px] md:pt-[72px]">
          <div className="relative w-full">
            <img
              src={collectionsHero}
              alt="Collections"
              className="w-full h-auto block"
            />

            {/* Gradient overlay — same proportions as homepage hero */}
            <div className="absolute bottom-0 left-0 right-0 h-[60%] md:h-[80%] bg-gradient-to-t from-background via-background/60 to-transparent" />

            {/* Collection names overlaid at bottom */}
            <div className="absolute bottom-0 left-0 right-0 pb-8 sm:pb-12 md:pb-16 lg:pb-20">
              <div className="grid grid-cols-3 px-5 md:px-12 lg:px-20 gap-4 sm:gap-6">
                {COLLECTION_NAMES.map((name, i) => (
                  <motion.span
                    key={name}
                    className="font-display uppercase tracking-[0.15em] sm:tracking-[0.2em] text-lg sm:text-2xl md:text-4xl lg:text-5xl text-foreground text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
                  >
                    {name}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </section>

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
          <ProductShowcase height="h-[75vh] sm:h-[85vh] md:h-[85vh]" />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
};

export default Collections;
