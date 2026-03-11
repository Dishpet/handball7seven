import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductShowcase from "@/components/ProductShowcase";
import { useCollections } from "@/hooks/useCollections";
import { useI18n } from "@/lib/i18n";
import collectionsImg from "@/assets/collections-banner.png";

const Collections = () => {
  const { t } = useI18n();
  const { data: collections } = useCollections();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <main className="pt-20">
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img src={collectionsImg} alt="Collections" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-5 md:px-12 lg:px-20 pb-10">
            <motion.h1
              className="text-3xl md:text-5xl font-display uppercase tracking-[0.2em]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {t("featured.title")}
            </motion.h1>
          </div>
        </div>

        {/* Collection Cards */}
        <div className="section-padding">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(collections ?? []).map((col, i) => (
              <motion.div
                key={col.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-left border border-border p-8 hover:border-primary/30 transition-all duration-300"
              >
                <h3 className="font-display uppercase tracking-wider text-lg mb-2">{col.name}</h3>
                <p className="text-muted-foreground text-sm">{col.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3D Product Showcase */}
        <ProductShowcase height="h-[65vh] md:h-[80vh]" />
      </main>
      <Footer />
    </div>
  );
};

export default Collections;
