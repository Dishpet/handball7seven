import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { ProductGrid } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useStoreSizes, useStoreColors } from "@/hooks/useStoreCatalog";

const ProductDetail = () => {
  const { id } = useParams();
  const { t } = useI18n();
  const { addItem } = useCart();
  const { data: dbProducts } = useProducts();
  const { data: storeSizes } = useStoreSizes();
  const { data: storeColors } = useStoreColors();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const products = useMemo(() =>
    (dbProducts ?? []).map(p => ({
      id: p.slug,
      name: p.name,
      price: Number(p.price),
      badge: p.badge as any,
      sizes: p.sizes || [],
      colors: p.colors || [],
      description: p.description,
      image: p.image_url,
    })), [dbProducts]);

  // Compute available sizes for this product (intersection of store sizes and product sizes)
  const product = products.find(p => p.id === id);
  const availableSizes = useMemo(() => {
    if (!product || !storeSizes) return product?.sizes || [];
    const storeNames = storeSizes.map(s => s.name);
    if (product.sizes.length > 0) {
      return storeNames.filter(s => product.sizes.includes(s));
    }
    return storeNames;
  }, [product, storeSizes]);

  const availableColors = useMemo(() => {
    if (!product || !storeColors) return [];
    if (product.colors.length > 0) {
      return storeColors.filter(sc => product.colors.includes(sc.name));
    }
    return storeColors;
  }, [product, storeColors]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const related = products.filter(p => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: availableColors?.[0]?.name || product.colors?.[0] || undefined,
      quantity,
      image: product.image,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <main className="pt-20">
        <div className="px-5 md:px-12 lg:px-20 py-8 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-square bg-muted overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-col justify-center">
              {product.badge && (
                <span className={`inline-block w-fit mb-3 sm:mb-4 ${
                  product.badge === "new" ? "badge-new" : product.badge === "bestseller" ? "badge-bestseller" : "badge-vintage"
                }`}>
                  {product.badge === "new" ? "New" : product.badge === "bestseller" ? "Best Seller" : "Vintage"}
                </span>
              )}

              <h1 className="text-xl sm:text-2xl md:text-4xl font-display uppercase tracking-wider mb-2">{product.name}</h1>
              <p className="text-lg sm:text-xl font-display text-primary mb-4 sm:mb-6">€{product.price.toFixed(2)}</p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 sm:mb-8">{product.description}</p>

              <div className="mb-5 sm:mb-6">
                <p className="font-display uppercase text-xs tracking-widest mb-3">{t("shop.size")}</p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 border text-xs font-display uppercase tracking-wider transition-all min-w-[44px] min-h-[44px] ${
                        selectedSize === size ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-foreground/30"
                      }`}>{size}</button>
                  ))}
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <p className="font-display uppercase text-xs tracking-widest mb-3">{t("shop.quantity")}</p>
                <div className="flex items-center gap-4 border border-border w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 text-foreground/50 hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"><Minus size={16} /></button>
                  <span className="font-body text-sm min-w-[2rem] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2.5 text-foreground/50 hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"><Plus size={16} /></button>
                </div>
              </div>

              <button onClick={handleAddToCart} disabled={!selectedSize}
                className={`btn-primary w-full md:w-auto text-center min-h-[48px] ${!selectedSize ? "opacity-50 cursor-not-allowed" : ""}`}>
                {t("shop.addtocart")}
              </button>

              <div className="mt-8 sm:mt-12 space-y-5 sm:space-y-6 border-t border-border pt-6 sm:pt-8">
                <div>
                  <h3 className="font-display uppercase text-xs tracking-widest mb-2">{t("shop.details")}</h3>
                  <p className="text-muted-foreground text-sm">{product.description}</p>
                </div>
                <div>
                  <h3 className="font-display uppercase text-xs tracking-widest mb-2">{t("shop.shipping")}</h3>
                  <p className="text-muted-foreground text-sm">Free shipping on orders over €100. Returns within 30 days.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {related.length > 0 && (
            <div className="mt-16 md:mt-24">
              <h2 className="text-lg sm:text-xl md:text-2xl font-display uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 md:mb-8">{t("shop.related")}</h2>
              <ProductGrid items={related} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
