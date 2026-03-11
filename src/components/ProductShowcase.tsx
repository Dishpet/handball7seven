import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShopScene } from '@/components/3d/ShopScene';
import { useShopConfig } from '@/hooks/useShopConfig';
import { useDesignCollections } from '@/hooks/useDesignCollections';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

// Import all designs
// @ts-ignore
const classicDesigns = import.meta.glob('/src/assets/design-collections/classic/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
// @ts-ignore
const vintageDesigns = import.meta.glob('/src/assets/design-collections/vintage/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
// @ts-ignore
const kidsDesigns = import.meta.glob('/src/assets/design-collections/kids/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
// @ts-ignore
const fallbackLogoDesigns = import.meta.glob('/src/assets/design-collections/logo/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });

const STATIC_FRONT_LOGO = (Object.values(fallbackLogoDesigns)[0] as string) || '';

const URL_TO_FILENAME: Record<string, string> = {};
const FILENAME_TO_URL: Record<string, string> = {};

const HIDDEN_DESIGNS = [
  'street-9.png', 'logo-4.png', 'logo-6.png', 'logo-8.png', 'logo-10.png', 'logo-11.png',
  'KIDS-BADGE.png', 'STREET-BADGE.png', 'VINTAGE-BADGE.png',
  'street-2.png', 'street-4.png', 'street-8.png', 'street-3-alt.png'
];

const processDesigns = (globResult: Record<string, unknown>) => {
  Object.keys(globResult).forEach(path => {
    const url = globResult[path] as string;
    const filename = path.split('/').pop() || '';
    if (filename) {
      URL_TO_FILENAME[url] = filename;
      FILENAME_TO_URL[filename] = url;
    }
  });
  return Object.keys(globResult)
    .filter(path => {
      const filename = path.split('/').pop() || '';
      return !HIDDEN_DESIGNS.includes(filename);
    })
    .sort((a, b) => {
      const nameA = a.split('/').pop() || a;
      const nameB = b.split('/').pop() || b;
      const isBadgeA = nameA.toUpperCase().includes('BADGE');
      const isBadgeB = nameB.toUpperCase().includes('BADGE');
      if (isBadgeA && !isBadgeB) return 1;
      if (!isBadgeA && isBadgeB) return -1;
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    })
    .map(key => globResult[key] as string);
};

const DESIGN_COLLECTIONS: Record<string, string[]> = {
  'CLASSIC': processDesigns(classicDesigns),
  'VINTAGE': processDesigns(vintageDesigns),
  'KIDS': processDesigns(kidsDesigns),
};

interface ProductShowcaseProps {
  height?: string;
  showButton?: boolean;
}

const ProductShowcase = ({ height = 'h-[70vh] md:h-[80vh]', showButton = true }: ProductShowcaseProps) => {
  const { t } = useI18n();
  const { config: shopConfig } = useShopConfig();
  const { collections: dbDesignCollections } = useDesignCollections();

  // Resolve front logo: DB first, then static fallback
  const frontLogoUrl = useMemo(() => {
    const dbLogo = dbDesignCollections.front_logo?.[0]?.url;
    return dbLogo || STATIC_FRONT_LOGO;
  }, [dbDesignCollections]);

  const COLOR_TO_LOGO_MAP = useMemo(() => {
    const map: Record<string, string> = {};
    ['#231f20', '#d1d5db', '#00ab98', '#00aeef', '#387bbf', '#8358a4', '#ffffff', '#e78fab', '#a1d7c0'].forEach(color => {
      map[color] = frontLogoUrl;
    });
    return map;
  }, [frontLogoUrl]);

  const logoList = useMemo(() => frontLogoUrl ? [frontLogoUrl] : DESIGN_COLLECTIONS['KIDS'], [frontLogoUrl]);
  const hoodieBackList = useMemo(() => [...DESIGN_COLLECTIONS['CLASSIC']], []);
  const vintageList = useMemo(() => [...DESIGN_COLLECTIONS['VINTAGE']], []);
  const allDesignsList = useMemo(() => [
    ...DESIGN_COLLECTIONS['KIDS'],
    ...DESIGN_COLLECTIONS['CLASSIC'],
    ...DESIGN_COLLECTIONS['VINTAGE']
  ], []);

  const designReplacements = useMemo(() => ({}), []);

  const productAllowedColors = useMemo(() => ({
    tshirt: shopConfig?.tshirt?.allowed_colors,
    hoodie: shopConfig?.hoodie?.allowed_colors,
    cap: shopConfig?.cap?.allowed_colors,
    bottle: shopConfig?.bottle?.allowed_colors
  }), [shopConfig]);

  const productRestrictedDesigns = useMemo(() => ({
    tshirt: shopConfig?.tshirt?.restricted_designs,
    hoodie: shopConfig?.hoodie?.restricted_designs,
    cap: shopConfig?.cap?.restricted_designs,
    bottle: shopConfig?.bottle?.restricted_designs
  }), [shopConfig]);

  // No-op: products are not clickable in showcase mode
  const handleSelectProduct = () => {};

  return (
    <div className={`relative w-full ${height} pb-16 sm:pb-24 overflow-hidden bg-gradient-to-br from-muted/80 via-background to-muted/30`}>
      {/* 3D Scene - always in showcase mode, pointer-events enabled for hover */}
      <div className="absolute inset-0 z-10">
        <ShopScene
          onSelectProduct={handleSelectProduct}
          selectedProduct="tshirt"
          isCustomizing={false}
          selectedColor="#231f20"
          mode="showcase"
          isFullscreen={false}
          colorToLogoMap={COLOR_TO_LOGO_MAP}
          hasUserInteracted={false}
          logoList={logoList}
          hoodieBackList={hoodieBackList}
          vintageList={vintageList}
          allDesignsList={allDesignsList}
          designReplacements={designReplacements}
          productAllowedColors={productAllowedColors}
          productRestrictedDesigns={productRestrictedDesigns}
          designColorMap={shopConfig?.design_color_map}
          urlToFilename={URL_TO_FILENAME}
        />
      </div>

      {/* Visit Shop Button Overlay */}
      {showButton && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="pointer-events-auto"
          >
            <Link to="/shop">
              <Button
                size="lg"
                className="font-display uppercase tracking-[0.2em] text-sm md:text-base px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl border border-primary/20"
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                {t('hero.shop')}
              </Button>
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductShowcase;
