import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useI18n } from "@/lib/i18n";
import hoodieImg from "@/assets/hoodie-vintage.png";
import collectionsImg from "@/assets/collections-banner.png";

const About = () => {
  const { t, getSiteContent } = useI18n();
  const aboutContent = getSiteContent("about") as Record<string, any> | undefined;
  const mainImage = aboutContent?.main_image || hoodieImg;
  const bannerImage = aboutContent?.banner_image || collectionsImg;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <main className="pt-20">
        <div className="section-padding">
          <motion.h1
            className="text-3xl md:text-5xl font-display uppercase tracking-[0.2em] mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t("about.title")}
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-foreground/80 leading-relaxed">{t("about.p1")}</p>
              <p className="text-foreground/80 leading-relaxed">{t("about.p2")}</p>
              <p className="text-foreground/80 leading-relaxed">{t("about.p3")}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img src={mainImage} alt="Handball Seven" className="w-full max-w-md mx-auto" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <img src={bannerImage} alt="Collections" className="w-full" />
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
