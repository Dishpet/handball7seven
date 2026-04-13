import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FeaturedCollections from "@/components/FeaturedCollections";
import { useI18n } from "@/lib/i18n";

import ScrollReveal from "@/components/ScrollReveal";

const About = () => {
  const { t, getSiteContent } = useI18n();
  const aboutContent = getSiteContent("about") as Record<string, any> | undefined;
  const mainImage = aboutContent?.main_image || "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <main className="pt-20">
        <div className="px-5 md:px-12 lg:px-20 py-10 md:py-16">
          <ScrollReveal>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-display uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-8 md:mb-12">
              {t("about.title")}
            </h1>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center mb-16 md:mb-20">
            <div className="space-y-5 md:space-y-6 order-2 md:order-1">
              <ScrollReveal delay={0}>
                <p className="text-foreground/80 leading-relaxed text-sm md:text-base">{t("about.p1")}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="text-foreground/80 leading-relaxed text-sm md:text-base">{t("about.p2")}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="text-foreground/80 leading-relaxed text-sm md:text-base">{t("about.p3")}</p>
              </ScrollReveal>
            </div>
            <ScrollReveal direction="scale" className="order-1 md:order-2">
              {mainImage && <img src={mainImage} alt="Handball Seven" className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto" />}
            </ScrollReveal>
          </div>
        </div>

        <FeaturedCollections />
      </main>
      <Footer />
    </div>
  );
};

export default About;
