import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedCollections from "@/components/FeaturedCollections";
import BestSellers from "@/components/BestSellers";
import BrandStory from "@/components/BrandStory";
import HandballCulture from "@/components/HandballCulture";
import LifestyleBanner from "@/components/LifestyleBanner";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <main>
        <Hero />
        <FeaturedCollections />
        <BestSellers />
        <BrandStory />
        <LifestyleBanner />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
