import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedCollections from "@/components/FeaturedCollections";
import BestSellers from "@/components/BestSellers";
import BrandStory from "@/components/BrandStory";
import HandballCulture from "@/components/HandballCulture";
import SevenManifesto from "@/components/SevenManifesto";
import LifestyleBanner from "@/components/LifestyleBanner";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useSiteContent } from "@/hooks/useSiteContent";

const Index = () => {
  const { data: heroContent } = useSiteContent("hero");
  const bgImage = (heroContent as any)?.value?.bg_image;

  useEffect(() => {
    if (!bgImage) return;
    const ogImage = document.querySelector('meta[property="og:image"]');
    const twImage = document.querySelector('meta[name="twitter:image"]');
    if (ogImage) ogImage.setAttribute("content", bgImage);
    if (twImage) twImage.setAttribute("content", bgImage);
  }, [bgImage]);
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <CartDrawer />
      <main>
        <Hero />
        <FeaturedCollections />
        <BestSellers />
        <BrandStory />
        <HandballCulture />
        <SevenManifesto />
        <LifestyleBanner />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
