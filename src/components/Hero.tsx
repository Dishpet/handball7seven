import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useShopConfig } from "@/hooks/useShopConfig";
import { useDesignCollections, buildDesignVariantMap, resolveDesignVariant } from "@/hooks/useDesignCollections";
import { useCollections } from "@/hooks/useCollections";
import { useCollectionColorMap } from "@/hooks/useStoreCatalog";
import logo from "@/assets/logo.png";
import Hero3DCarousel from "@/components/Hero3DCarousel";

// Static fallback designs
// @ts-ignore
const classicDesigns = import.meta.glob('/src/assets/design-collections/classic/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
// @ts-ignore
const vintageDesigns = import.meta.glob('/src/assets/design-collections/vintage/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
// @ts-ignore
const streetDesigns = import.meta.glob('/src/assets/design-collections/street/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
// @ts-ignore
const fallbackLogoDesigns = import.meta.glob('/src/assets/design-collections/logo/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });

const STATIC_FRONT_LOGO = (Object.values(fallbackLogoDesigns)[0] as string) || '';

const URL_TO_FILENAME: Record<string, string> = {};

const processDesigns = (globResult: Record<string, unknown>) => {
  return Object.keys(globResult).map(path => {
    const url = globResult[path] as string;
    const filename = path.split('/').pop() || '';
    if (filename) URL_TO_FILENAME[url] = filename;
    return url;
  });
};

const STATIC_COLLECTIONS = {
  classic: processDesigns(classicDesigns),
  vintage: processDesigns(vintageDesigns),
  street: processDesigns(streetDesigns),
};

const Hero = () => {
  const { t, getSiteContent } = useI18n();
  const { config: shopConfig } = useShopConfig();
  const { collections: dbDesignCollections } = useDesignCollections();
  const { data: dbCollections } = useCollections(false);
  const collectionColorMap = useCollectionColorMap(dbCollections?.map(c => ({ id: c.id, slug: c.slug })));
  const heroContent = getSiteContent("hero") as Record<string, any> | undefined;
  const bgImage = heroContent?.bg_image || "/images/hero-bg.jpg";

  // Resolve front logo from DB or static
  const frontLogoUrl = useMemo(() => {
    return dbDesignCollections.front_logo?.[0]?.url || STATIC_FRONT_LOGO;
  }, [dbDesignCollections]);

  // Effective design lists (DB first, static fallback)
  const effectiveCollections = useMemo(() => {
    const dbClassic = dbDesignCollections.classic?.map(d => d.url).filter(Boolean) || [];
    const dbVintage = dbDesignCollections.vintage?.map(d => d.url).filter(Boolean) || [];
    const dbStreet = dbDesignCollections.street?.map(d => d.url).filter(Boolean) || [];
    return {
      classic: dbClassic.length > 0 ? dbClassic : STATIC_COLLECTIONS.classic,
      vintage: dbVintage.length > 0 ? dbVintage : STATIC_COLLECTIONS.vintage,
      street: dbStreet.length > 0 ? dbStreet : STATIC_COLLECTIONS.street,
    };
  }, [dbDesignCollections]);

  const productAllowedColors = useMemo(() => {
    return {
      tshirt: shopConfig?.tshirt?.allowed_colors,
      hoodie: shopConfig?.hoodie?.allowed_colors,
      cap: shopConfig?.cap?.allowed_colors,
      bottle: shopConfig?.bottle?.allowed_colors
    };
  }, [shopConfig]);

  // Build colorToLogoMap covering ALL product colors (union)
  const allProductColors = useMemo(() => {
    const set = new Set<string>();
    [shopConfig?.tshirt, shopConfig?.hoodie, shopConfig?.cap, shopConfig?.bottle].forEach(pc => {
      pc?.allowed_colors?.forEach((c: string) => set.add(c));
    });
    return [...set];
  }, [shopConfig]);

  const frontLogoAsset = dbDesignCollections.front_logo?.[0] || null;
  const colorToLogoMap = useMemo(() => {
    const map: Record<string, string> = {};
    allProductColors.forEach((c: string) => {
      map[c] = frontLogoAsset ? resolveDesignVariant(frontLogoAsset, c) : frontLogoUrl;
    });
    return map;
  }, [allProductColors, frontLogoUrl, frontLogoAsset]);

  // Build per-product design lists (with restriction filtering like ShopScene)
  const allDesigns = useMemo(() => [
    ...effectiveCollections.classic,
    ...effectiveCollections.vintage,
    ...effectiveCollections.street,
  ], [effectiveCollections]);

  const designVariantMap = useMemo(() => buildDesignVariantMap(dbDesignCollections), [dbDesignCollections]);

  // Build designColorMap with collection color constraints
  const designColorMap = useMemo(() => {
    const normalizeHex = (hex: string) => hex.toLowerCase();
    const merged: Record<string, string[]> = {};

    Object.entries(shopConfig?.design_color_map || {}).forEach(([filename, colors]) => {
      merged[filename] = Array.isArray(colors) ? colors.map(normalizeHex) : [];
    });

    const applyCollectionConstraint = (collectionKey: string) => {
      const allowedByCollection = (collectionColorMap[collectionKey] || []).map(c => normalizeHex(c.hex));
      if (allowedByCollection.length === 0) return;

      const collKey = collectionKey.toLowerCase() as keyof typeof effectiveCollections;
      (effectiveCollections[collKey] || []).forEach((url: string) => {
        const filename = URL_TO_FILENAME[url] || url.split('/').pop()?.split('?')[0] || '';
        if (!filename) return;

        if (Object.prototype.hasOwnProperty.call(merged, filename)) {
          const existing = merged[filename] || [];
          merged[filename] = existing.length === 0 ? [] : existing.filter(c => allowedByCollection.includes(normalizeHex(c)));
        } else {
          merged[filename] = [...allowedByCollection];
        }
      });
    };

    applyCollectionConstraint('CLASSIC');
    applyCollectionConstraint('VINTAGE');
    applyCollectionConstraint('STREET');

    return merged;
  }, [shopConfig, collectionColorMap, effectiveCollections]);

  const logoList = useMemo(() => frontLogoUrl ? [frontLogoUrl] : [], [frontLogoUrl]);

  // Filter restricted designs per product (matching ShopScene capCleanList / bottleCleanList logic)
  const capFilteredDesigns = useMemo(() => {
    const restricted = shopConfig?.cap?.restricted_designs || ['street-5.png'];
    return allDesigns.filter(url => {
      const filename = url.split('/').pop()?.split('?')[0] || '';
      return !restricted.includes(filename);
    });
  }, [allDesigns, shopConfig]);

  const bottleFilteredDesigns = useMemo(() => {
    const restricted = shopConfig?.bottle?.restricted_designs || [];
    if (restricted.length === 0) return logoList.length > 0 ? logoList : allDesigns;
    return allDesigns.filter(url => {
      const filename = url.split('/').pop()?.split('?')[0] || '';
      return !restricted.includes(filename);
    });
  }, [allDesigns, logoList, shopConfig]);

  const frontDesigns = useMemo(() => ({
    tshirt: logoList,
    hoodie: logoList,
    cap: capFilteredDesigns,
    bottle: bottleFilteredDesigns,
  }), [logoList, capFilteredDesigns, bottleFilteredDesigns]);

  const backDesigns = useMemo(() => ({
    tshirt: allDesigns,
    hoodie: allDesigns,
    cap: [] as string[],
    bottle: [] as string[],
  }), [allDesigns]);

  return (
    <section className="relative min-h-[100svh] flex items-center justify-start overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent lg:hidden" />

      <div className="relative z-10 w-full flex flex-col-reverse lg:flex-row items-center min-h-[100svh]">
        {/* Text content — centered on mobile/tablet, left-aligned on desktop */}
        <div className="px-5 md:px-12 lg:px-20 pb-16 sm:pb-20 lg:pb-0 pt-4 lg:pt-0 max-w-2xl lg:w-1/2 lg:flex-shrink-0 text-center lg:text-left flex flex-col items-center lg:items-start">
          <motion.p
            className="text-foreground/70 text-xs sm:text-sm md:text-base font-body tracking-wide mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t("hero.subtitle")}
          </motion.p>
          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display uppercase tracking-wider leading-[0.95] text-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t("hero.slogan")}
          </motion.h1>
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/shop" className="btn-primary text-center">{t("hero.shop")}</Link>
            <Link to="/collections" className="btn-outline text-center">{t("hero.explore")}</Link>
          </motion.div>
        </div>

        {/* 3D carousel — on top on mobile/tablet, right on desktop */}
        <motion.div
          className="w-full lg:w-1/2 h-[55vh] sm:h-[60vh] lg:h-[100vh] relative mt-0 lg:mt-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          <Hero3DCarousel
            productAllowedColors={productAllowedColors}
            frontDesigns={frontDesigns}
            backDesigns={backDesigns}
            colorToLogoMap={colorToLogoMap}
            designVariantMap={designVariantMap}
            designColorMap={designColorMap}
            urlToFilename={URL_TO_FILENAME}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
