import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { ShopScene } from '../components/3d/ShopScene';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Palette, Ruler, ChevronLeft, ChevronRight, Box, X, Star, Check, Plus, Minus, RefreshCcw, ChevronDown } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useToast } from '@/components/ui/use-toast';
import { useShopConfig } from '@/hooks/useShopConfig';
import { useI18n } from '@/lib/i18n';
import { useDesignCollections, buildDesignVariantMap } from '@/hooks/useDesignCollections';
import { useProducts as useDbProducts } from '@/hooks/useProducts';
import { useStoreColors, useStoreSizes, useCollectionColorMap } from '@/hooks/useStoreCatalog';
import { useCollections } from '@/hooks/useCollections';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

// Fallback local designs
// @ts-ignore
const classicDesigns = import.meta.glob('/src/assets/design-collections/classic/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
// @ts-ignore
const vintageDesigns = import.meta.glob('/src/assets/design-collections/vintage/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
// @ts-ignore
const streetDesigns = import.meta.glob('/src/assets/design-collections/street/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
// @ts-ignore
const frontLogoDesigns = import.meta.glob('/src/assets/design-collections/logo/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });

const URL_TO_FILENAME: Record<string, string> = {};
const FILENAME_TO_URL: Record<string, string> = {};

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
        .sort((a, b) => {
            const nameA = a.split('/').pop() || a;
            const nameB = b.split('/').pop() || b;
            return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
        })
        .map(key => globResult[key] as string);
};

const DESIGN_COLLECTIONS: Record<string, string[]> = {
    'CLASSIC': processDesigns(classicDesigns),
    'VINTAGE': processDesigns(vintageDesigns),
    'STREET': processDesigns(streetDesigns),
};

const FRONT_LOGO_DESIGNS: string[] = processDesigns(frontLogoDesigns);

const ALL_DESIGNS: string[] = [
    ...DESIGN_COLLECTIONS['CLASSIC'],
    ...DESIGN_COLLECTIONS['VINTAGE'],
    ...DESIGN_COLLECTIONS['STREET']
];

// Static fallback front logo (used if DB has none)
const STATIC_FRONT_LOGO = FRONT_LOGO_DESIGNS[0] || '';

// Helper to find design URL by filename (for URL deep-linking)
const findDesignUrlByFilename = (filename: string): string | null => {
    if (FILENAME_TO_URL[filename]) return FILENAME_TO_URL[filename];

    const lowerFilename = filename.toLowerCase();
    for (const [fn, url] of Object.entries(FILENAME_TO_URL)) {
        if (fn.toLowerCase() === lowerFilename) return url;
    }

    const match = [...ALL_DESIGNS, ...FRONT_LOGO_DESIGNS].find(url => {
        const fn = URL_TO_FILENAME[url] || url.split('/').pop()?.split('?')[0] || '';
        return fn.toLowerCase() === lowerFilename;
    });

    return match || null;
};

// Static fallback colors (used if DB hasn't loaded yet)
const FALLBACK_COLORS = [
    { name: 'Crna', hex: '#231f20' },
    { name: 'Siva', hex: '#d1d5db' },
    { name: 'Tirkizna', hex: '#00ab98' },
    { name: 'Cijan', hex: '#00aeef' },
    { name: 'Plava', hex: '#387bbf' },
    { name: 'Ljubičasta', hex: '#8358a4' },
    { name: 'Bijela', hex: '#ffffff' },
    { name: 'Roza', hex: '#e78fab' },
    { name: 'Mint', hex: '#a1d7c0' }
];

// Design to Color Availability Map now comes from shop config API
// See: useShopConfig().config?.design_color_map

// Helper function moved inside component to access shopConfig
// See getDesignColorsFromConfig inside the Shop component

const INITIAL_PRODUCTS = {
    tshirt: {
        id: 'tshirt-001',
        name: 'Court Classic Tee',
        price: 25.00,
        description: 'Premium cotton tee with your choice of design. Made for the court and the street.',
        colors: FALLBACK_COLORS,
        stockStatus: 'instock',
        stockQuantity: null as number | null,
        averageRating: 0,
        ratingCount: 0,
        variations: [] as number[],
    },
    hoodie: {
        id: 'hoodie-001',
        name: 'Court Classic Hoodie',
        price: 45.00,
        description: 'Premium heavyweight hoodie. Built for the stubborn, designed for the court.',
        colors: FALLBACK_COLORS,
        stockStatus: 'instock',
        stockQuantity: null as number | null,
        averageRating: 0,
        ratingCount: 0,
        variations: [] as number[],
    },
    cap: {
        id: 'cap-001',
        name: 'Court Classic Cap',
        price: 20.00,
        description: 'Structured cap with Handball Seven branding. One size fits all.',
        colors: FALLBACK_COLORS,
        stockStatus: 'instock',
        stockQuantity: null as number | null,
        averageRating: 0,
        ratingCount: 0,
        variations: [] as number[],
    },
    bottle: {
        id: 'bottle-001',
        name: 'Court Thermal Bottle',
        price: 20.00,
        description: 'Premium stainless steel thermal bottle. Keeps hot 12h, cold 24h.',
        colors: [
            { name: 'Crna', hex: '#231f20' },
            { name: 'Bijela', hex: '#ffffff' }
        ],
        stockStatus: 'instock',
        stockQuantity: null as number | null,
        averageRating: 0,
        ratingCount: 0,
        variations: [] as number[],
    }
};

const FALLBACK_SIZES = ['6-8 g.', '8-10 g.', '10-12 g.', 'S', 'M', 'L', 'XL'];

const Shop = () => {
    // i18n
    const { t } = useI18n();
    const { collections: dbDesignCollections } = useDesignCollections();
    const { data: dbProducts } = useDbProducts();
    const { data: storeColors } = useStoreColors();
    const { data: storeSizes } = useStoreSizes();
    const { data: dbCollections } = useCollections(false);
    const collectionColorMap = useCollectionColorMap(dbCollections?.map(c => ({ id: c.id, slug: c.slug })));

    // Dynamic SHARED_COLORS from store catalog (with fallback)
    const SHARED_COLORS = useMemo(() => {
        if (storeColors && storeColors.length > 0) {
            return storeColors.map(c => ({ name: c.name, hex: c.hex }));
        }
        return FALLBACK_COLORS;
    }, [storeColors]);

    // Dynamic sizes from store catalog (with fallback)  
    const SIZES = useMemo(() => {
        if (storeSizes && storeSizes.length > 0) {
            return storeSizes.map(s => s.name);
        }
        return FALLBACK_SIZES;
    }, [storeSizes]);

    // Get product-level allowed colors (intersection of store colors and product DB colors)
    const getProductColors = useCallback((productSlug: string) => {
        const dbProduct = dbProducts?.find(p => p.slug === productSlug);
        if (dbProduct?.colors && dbProduct.colors.length > 0) {
            // Intersection: only colors that are both in store catalog AND product settings
            return SHARED_COLORS.filter(sc => dbProduct.colors!.includes(sc.name));
        }
        return SHARED_COLORS; // If no product-level restriction, all store colors
    }, [dbProducts, SHARED_COLORS]);

    // Get product-level allowed sizes (intersection of store sizes and product DB sizes)
    const getProductSizes = useCallback((productSlug: string) => {
        const dbProduct = dbProducts?.find(p => p.slug === productSlug);
        if (dbProduct?.sizes && dbProduct.sizes.length > 0) {
            return SIZES.filter(s => dbProduct.sizes!.includes(s));
        }
        return SIZES;
    }, [dbProducts, SIZES]);

    // Merge DB product data into INITIAL_PRODUCTS (prices, names, descriptions)
    const products = useMemo(() => {
        const merged = { ...INITIAL_PRODUCTS };
        if (dbProducts) {
            for (const dbp of dbProducts) {
                const key = dbp.slug as keyof typeof INITIAL_PRODUCTS;
                if (merged[key]) {
                    merged[key] = {
                        ...merged[key],
                        name: dbp.name || merged[key].name,
                        price: Number(dbp.price) || merged[key].price,
                        description: dbp.description || merged[key].description,
                    };
                }
            }
        }
        return merged;
    }, [dbProducts]);

    // Resolve front logo: DB first, then static fallback
    const frontLogoUrl = useMemo(() => {
        const dbLogo = dbDesignCollections.front_logo?.[0]?.url;
        return dbLogo || STATIC_FRONT_LOGO;
    }, [dbDesignCollections]);

    // Build effective design collections: DB designs take priority, fallback to static
    const effectiveCollections = useMemo(() => {
        const dbClassic = dbDesignCollections.classic?.map(d => d.url).filter(Boolean) || [];
        const dbVintage = dbDesignCollections.vintage?.map(d => d.url).filter(Boolean) || [];
        const dbStreet = dbDesignCollections.street?.map(d => d.url).filter(Boolean) || [];

        // Register DB URLs in the filename maps so config lookups work
        [dbClassic, dbVintage, dbStreet].flat().forEach(url => {
            if (!URL_TO_FILENAME[url]) {
                const filename = url.split('/').pop()?.split('?')[0] || '';
                if (filename) {
                    URL_TO_FILENAME[url] = filename;
                    FILENAME_TO_URL[filename] = url;
                }
            }
        });

        return {
            'CLASSIC': dbClassic.length > 0 ? dbClassic : DESIGN_COLLECTIONS['CLASSIC'],
            'VINTAGE': dbVintage.length > 0 ? dbVintage : DESIGN_COLLECTIONS['VINTAGE'],
            'STREET': dbStreet.length > 0 ? dbStreet : DESIGN_COLLECTIONS['STREET'],
        };
    }, [dbDesignCollections]);

    // Build color-to-logo map dynamically from DB front logo
    const COLOR_TO_LOGO_MAP = useMemo(() => {
        const map: Record<string, string> = {};
        ['#231f20', '#d1d5db', '#00ab98', '#00aeef', '#387bbf', '#8358a4', '#ffffff', '#e78fab', '#a1d7c0'].forEach(color => {
            map[color] = frontLogoUrl;
        });
        return map;
    }, [frontLogoUrl]);
    // State
    const [searchParams, setSearchParams] = useSearchParams();
    const [variationCache, setVariationCache] = useState<Record<string, any[]>>({});
    const [selectedProduct, setSelectedProduct] = useState<'hoodie' | 'tshirt' | 'cap' | 'bottle'>('tshirt');
    const [isCustomizing, setIsCustomizing] = useState(false);

    // Customization State
    const [selectedColor, setSelectedColor] = useState<string>(() => {
        return SHARED_COLORS[Math.floor(Math.random() * SHARED_COLORS.length)].hex;
    });
    const [hasUserInteracted, setHasUserInteracted] = useState(false);

    // Dual-zone state - Initialize empty, let Cycle sync populate it initially
    const [designs, setDesigns] = useState<{ front: string; back: string }>({ front: '', back: '' });
    const [activeZone, setActiveZone] = useState<'front' | 'back'>('front');

    const [selectedSize, setSelectedSize] = useState<string>('L');

    // UI States
    // Default to showcase mode - cycling should happen on initial load
    const [viewMode, setViewMode] = useState<'showcase' | 'customizing'>('showcase');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false); // Kept for potential mobile use

    const [isSizePickerOpen, setIsSizePickerOpen] = useState(false);
    const [expandedCollection, setExpandedCollection] = useState<string>('STREET');
    const [activeTab, setActiveTab] = useState<'details' | 'features' | 'reviews'>('details');
    const [cartCount, setCartCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Resolve current variation for price and matching
    const currentVariation = useMemo(() => {
        const product = products[selectedProduct];
        const productId = product.id?.toString();
        const cachedVars = productId ? variationCache[productId] : null;

        if (cachedVars && cachedVars.length > 0) {
            const colorObj = SHARED_COLORS.find(c => c.hex === selectedColor);
            const colorName = colorObj ? colorObj.name.toLowerCase() : '';
            const sizeVal = selectedSize.toLowerCase();

            return cachedVars.find((v: any) => {
                if (!v.attributes || !Array.isArray(v.attributes)) return false;
                let sizeMatch = true;
                let colorMatch = true;

                for (const attr of v.attributes) {
                    const attrName = (attr.name || '').toLowerCase();
                    const attrOption = (attr.option || '').toLowerCase();

                    if (attrName.includes('veli') || attrName.includes('size')) {
                        sizeMatch = (attrOption === sizeVal);
                    } else if (attrName.includes('boja') || attrName.includes('color')) {
                        colorMatch = (attrOption === colorName);
                    }
                }
                return sizeMatch && colorMatch;
            });
        }
        return null;
    }, [selectedProduct, products, variationCache, selectedColor, selectedSize]);

    const displayPrice = currentVariation ? parseFloat(currentVariation.price) : products[selectedProduct].price;

    const [quantity, setQuantity] = useState(1);

    const { addItem } = useCart();
    const { toast } = useToast();
    const { getAllowedColors, isDesignRestricted, getAlternativeDesign, config: shopConfig } = useShopConfig();

    // Dynamic helper that uses API config for design-to-color mapping
    const getDesignColorsFromConfig = (designUrl: string | null): typeof SHARED_COLORS => {
        if (!designUrl) return SHARED_COLORS;

        // Get filename from URL
        const filename = URL_TO_FILENAME[designUrl] || designUrl.split('/').pop()?.split('?')[0] || '';

        // Check API config first (priority)
        if (shopConfig?.design_color_map && shopConfig.design_color_map[filename]) {
            const allowedHexCodes = shopConfig.design_color_map[filename];
            // If explicitly empty array in config, return empty (design not available in any color)
            if (allowedHexCodes.length === 0) return [];
            return SHARED_COLORS.filter(c => allowedHexCodes.includes(c.hex));
        }

        // No restriction in config = all colors allowed
        return SHARED_COLORS;
    };

    // Sync ViewMode, Product, Design, Color, and Zone from URL
    useEffect(() => {
        const mode = searchParams.get('mode');
        console.log('URL mode param:', mode, '-> setting viewMode to:', mode === 'customizing' ? 'customizing' : 'showcase');
        if (mode === 'customizing') {
            if (viewMode !== 'customizing') setViewMode('customizing');
        } else {
            if (viewMode !== 'showcase') setViewMode('showcase');
        }

        const productParam = searchParams.get('product');
        if (productParam && Object.keys(INITIAL_PRODUCTS).includes(productParam as string)) {
            setSelectedProduct(productParam as any);

            // Parse additional parameters when product is specified
            const designParam = searchParams.get('design');
            const colorParam = searchParams.get('color');
            const zoneParam = searchParams.get('zone');

            // Apply design if specified
            if (designParam) {
                const designUrl = findDesignUrlByFilename(designParam);
                if (designUrl) {
                    // Determine which zone to apply design to
                    const targetZone = zoneParam === 'front' || zoneParam === 'back'
                        ? zoneParam
                        : (productParam === 'hoodie' || productParam === 'tshirt' ? 'back' : 'front');

                    setDesigns(prev => ({
                        ...prev,
                        [targetZone]: designUrl
                    }));
                    setHasUserInteracted(true); // Mark as interacted since URL specified a design
                }
            }

            // Apply color if specified (hex format, URL-encoded # as %23)
            if (colorParam) {
                const decodedColor = decodeURIComponent(colorParam);
                // Validate color format (# followed by 3 or 6 hex digits)
                if (/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(decodedColor)) {
                    setSelectedColor(decodedColor.toLowerCase());
                }
            }

            // Apply zone if specified
            if (zoneParam === 'front' || zoneParam === 'back') {
                setActiveZone(zoneParam);
            } else if (productParam) {
                // Default zone based on product
                setActiveZone(productParam === 'hoodie' || productParam === 'tshirt' ? 'back' : 'front');
            }
        }
    }, [searchParams]);

    // Auto-update color when design or collection changes and current color is not available
    useEffect(() => {
        const currentDesignUrl = designs[activeZone];

        // Start with design-level color restrictions (if a design is selected)
        let availableColors = currentDesignUrl
            ? getDesignColorsFromConfig(currentDesignUrl)
            : [...SHARED_COLORS];

        // Intersect with product-level colors
        const productColors = getProductColors(selectedProduct);
        availableColors = availableColors.filter(c => productColors.some(pc => pc.hex === c.hex));

        // Intersect with collection colors
        const collectionColors = collectionColorMap[expandedCollection];
        if (collectionColors && collectionColors.length > 0) {
            const collectionHexes = collectionColors.map(c => c.hex);
            availableColors = availableColors.filter(c => collectionHexes.includes(c.hex));
        }

        // If current color is not in available colors, switch to first available
        if (availableColors.length > 0 && !availableColors.some(c => c.hex === selectedColor)) {
            setSelectedColor(availableColors[0].hex);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [designs, activeZone, shopConfig, expandedCollection, collectionColorMap, selectedProduct, SHARED_COLORS, getProductColors]);


    // DB products are now reactive via useMemo - no need for static init

    // Reset defaults when product changes
    useEffect(() => {
        if (selectedProduct) {
            // REMOVE default color override to keep cycle or random previous state

            if (selectedProduct === 'cap') {
                setActiveZone('front');
            } else if (selectedProduct === 'bottle') {
                setActiveZone('front');
            } else if (selectedProduct === 'hoodie' || selectedProduct === 'tshirt') {
                setActiveZone('back');
            } else {
                setActiveZone('front');
            }
        }
    }, [selectedProduct]);

    // Listen for global reset event
    useEffect(() => {
        const handleReset = () => {
            setSearchParams({}); // Clear params to go back to showcase
            setViewMode('showcase');
            setSelectedProduct('tshirt');
            setIsCustomizing(false);
            setSelectedColor('#231f20'); // Default to new black
            setActiveZone('front');
        };

        window.addEventListener('reset-shop-view', handleReset);
        return () => window.removeEventListener('reset-shop-view', handleReset);
    }, [setSearchParams]);

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (designClickTimeoutRef.current) {
                clearTimeout(designClickTimeoutRef.current);
            }
        };
    }, []);

    // Sync Hoodie/T-shirt Front Logo with Color (and when DB logo changes)
    useEffect(() => {
        if (selectedProduct === 'hoodie' || selectedProduct === 'tshirt') {
            setDesigns(prev => ({
                ...prev,
                front: frontLogoUrl
            }));
        }
    }, [selectedProduct, selectedColor, frontLogoUrl]);

    // Sync viewMode and isCustomizing with URL params for Back button support
    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'customizing') {
            setViewMode('customizing');
            setIsCustomizing(true);
        } else {
            setViewMode('showcase');
            setIsCustomizing(false);
        }
    }, [searchParams]);

    // Sync changes to isFullScreen from URL (enables browser back button for fullscreen)
    useEffect(() => {
        setIsFullScreen(searchParams.get('fullscreen') === 'true');
    }, [searchParams]);

    // Logic to swap street-3 for street-3-alt on specific colors (and back)
    // Track if we're currently showing the alt version
    const [isShowingAltDesign, setIsShowingAltDesign] = useState(false);

    useEffect(() => {
        const street3Url = classicDesigns[Object.keys(classicDesigns).find(k => k.includes('classic-1')) || ''] as string;
        const street3AltUrl = street3Url;

        // Pink, Mint, Cyan (Light Blue) - trigger colors for alt design
        const altColors = ['#e78fab', '#a1d7c0', '#00aeef'];
        const shouldUseAlt = altColors.includes(selectedColor);

        if (!street3Url || !street3AltUrl) return;

        setDesigns(prev => {
            let next = { ...prev };
            let hasChanged = false;

            (['front', 'back'] as const).forEach(zone => {
                const current = prev[zone];

                // If current is street-3 original AND we need alt
                if (current === street3Url && shouldUseAlt) {
                    next[zone] = street3AltUrl;
                    hasChanged = true;
                    setIsShowingAltDesign(true);
                }
                // If current is street-3-alt AND we DON'T need alt anymore
                else if (current === street3AltUrl && !shouldUseAlt) {
                    next[zone] = street3Url;
                    hasChanged = true;
                    setIsShowingAltDesign(false);
                }
            });

            return hasChanged ? next : prev;
        });
    }, [selectedColor]);

    const handleProductSelect = (product: 'hoodie' | 'tshirt' | 'cap' | 'bottle') => {
        const isSameProduct = selectedProduct === product && viewMode === 'customizing';
        const isComingFromShowcase = viewMode === 'showcase';

        setSelectedProduct(product);

        // When coming from showcase, DON'T reset interaction - let the cycle continue
        // The cycle will provide the initial design/color
        if (isComingFromShowcase) {
            // Keep hasUserInteracted as false so cycle continues
            // The cycle's current state will be synced via handleCycleDesignUpdate
            setIsCustomizing(false); // Will be set to true by mode change
        } else if (viewMode !== 'customizing') {
            setIsCustomizing(false);
        }

        // Only reset interaction if switching to a DIFFERENT product in customize mode
        // or if already in customizing mode (not from showcase)
        if (!isSameProduct && !isComingFromShowcase) {
            setHasUserInteracted(false);
            // Clear designs to let cycle populate them
            setDesigns({ front: '', back: '' });
        }

        // Set activeZone synchronously to avoid first-render issue
        if (product === 'hoodie' || product === 'tshirt') {
            setActiveZone('back');
        } else {
            setActiveZone('front');
        }

        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('mode', 'customizing');
            newParams.set('product', product);
            // Clear design/color/zone when switching products to avoid conflicts
            newParams.delete('design');
            newParams.delete('color');
            newParams.delete('zone');
            return newParams;
        }, { replace: viewMode === 'customizing' });

        setViewMode('customizing');
    };

    const handleInteraction = () => {
        if (!isCustomizing) setIsCustomizing(true);
        setHasUserInteracted(true);
    };

    // Handler to sync Cycle state to Parent state WITHOUT triggering interaction
    // This keeps the "designs" state warm with whatever is currently visible in the cycle
    // so when the user DOES interact, there's no visual jump.
    const handleCycleDesignUpdate = (newDesigns: { front: string; back: string }) => {
        // Update designs from cycle if user hasn't interacted yet
        // This works both in showcase (to keep state warm) and in customizing mode
        if (!hasUserInteracted) {
            setDesigns(prev => {
                // Prevent unnecessary rerenders if identical
                if (prev.front === newDesigns.front && prev.back === newDesigns.back) return prev;
                return newDesigns;
            });
        }
    };

    const handleAddToCart = () => {
        const product = products[selectedProduct];
        
        const mainImage = (selectedProduct === 'hoodie' || selectedProduct === 'tshirt')
            ? (designs.back || designs.front)
            : designs.front;

        addItem({
            id: product.id + '-' + btoa(JSON.stringify({ c: selectedColor, d: designs, z: selectedSize })),
            name: product.name,
            price: Number(displayPrice),
            size: selectedSize,
            quantity: quantity,
            image: mainImage
        });

        toast({
            title: "Dodano u koĹˇaricu",
            description: `${quantity}x ${product.name} (${selectedSize}) je dodan u vaĹˇu koĹˇaricu.`,
        });
    };



    // Debounce ref to prevent rapid clicking
    const designClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isDesignClickPendingRef = useRef(false);

    const handleDesignSelect = (designUrl: string) => {
        // Prevent rapid clicking - 150ms debounce
        if (isDesignClickPendingRef.current) return;

        isDesignClickPendingRef.current = true;
        if (designClickTimeoutRef.current) {
            clearTimeout(designClickTimeoutRef.current);
        }
        designClickTimeoutRef.current = setTimeout(() => {
            isDesignClickPendingRef.current = false;
        }, 150);

        if (selectedProduct === 'hoodie' || selectedProduct === 'tshirt') {
            // Hoodie/T-shirt Logic: Selection applies to Back. Front is managed by color sync.
            setDesigns(prev => ({
                ...prev,
                back: designUrl
                // do NOT override front here
            }));
        } else {
            setDesigns(prev => ({
                ...prev,
                [activeZone]: designUrl
            }));
        }
        handleInteraction();

        // Update URL with selected design
        const filename = URL_TO_FILENAME[designUrl] || designUrl.split('/').pop()?.split('?')[0] || '';
        if (filename) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set('design', filename);
                // Also update zone parameter to match where design was applied
                const targetZone = (selectedProduct === 'hoodie' || selectedProduct === 'tshirt') ? 'back' : activeZone;
                newParams.set('zone', targetZone);
                return newParams;
            }, { replace: true });
        }
    };

    const currentDesign = designs[activeZone];

    // Smart Color Selection with Design Reconciliation
    const handleColorSelect = (newHex: string) => {
        setSelectedColor(newHex);
        handleInteraction();

        // Update URL with selected color (URL-encode the #)
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('color', encodeURIComponent(newHex));
            return newParams;
        }, { replace: true });

        // Check if current design works with new color
        const availableForCurrent = getDesignColorsFromConfig(currentDesign);
        const isCompatible = availableForCurrent.some(c => c.hex === newHex);

        if (!isCompatible) {
            // Design clash! Find a better design in the CURRENT collection
            // 1. Identify current collection
            let currentCollectionName = expandedCollection;

            // Fallback: If expandedCollection is null (intro mode), try to guess or default
            if (!currentCollectionName) {
                // Heuristic: check where current design exists
                if (effectiveCollections['CLASSIC'].includes(currentDesign)) currentCollectionName = 'CLASSIC';
                else if (effectiveCollections['VINTAGE'].includes(currentDesign)) currentCollectionName = 'VINTAGE';
                else currentCollectionName = 'STREET';
            }

            const collectionDesigns = effectiveCollections[currentCollectionName] || [];

            // 2. Find first design in this collection that SUPPORTS the new color
            const compatibleDesign = collectionDesigns.find(d => {
                // Check restrictions from shop config
                const filename = URL_TO_FILENAME[d] || d.split('/').pop()?.split('?')[0] || '';
                const restrictedDesigns = shopConfig?.[selectedProduct]?.restricted_designs || [];
                if (restrictedDesigns.includes(filename)) return false;

                const allowed = getDesignColorsFromConfig(d);
                return allowed.some(c => c.hex === newHex);
            });

            if (compatibleDesign) {
                // Switch to the compatible design
                if (selectedProduct === 'hoodie' || selectedProduct === 'tshirt') {
                    setDesigns(prev => ({ ...prev, back: compatibleDesign }));
                } else {
                    setDesigns(prev => ({ ...prev, [activeZone]: compatibleDesign }));
                }

                // Update URL with the new compatible design
                const filename = URL_TO_FILENAME[compatibleDesign] || compatibleDesign.split('/').pop()?.split('?')[0] || '';
                if (filename) {
                    setSearchParams(prev => {
                        const newParams = new URLSearchParams(prev);
                        newParams.set('design', filename);
                        return newParams;
                    }, { replace: true });
                }
            }
        }
    };

    const PRODUCT_KEYS: ('hoodie' | 'tshirt' | 'cap' | 'bottle')[] = ['hoodie', 'tshirt', 'cap', 'bottle'];

    const cycleProduct = (direction: 'next' | 'prev') => {
        const currentIndex = PRODUCT_KEYS.indexOf(selectedProduct);
        let newIndex;
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % PRODUCT_KEYS.length;
        } else {
            newIndex = (currentIndex - 1 + PRODUCT_KEYS.length) % PRODUCT_KEYS.length;
        }
        handleProductSelect(PRODUCT_KEYS[newIndex]);
    };

    const activeProductData = useMemo(() => ({
        ...products[selectedProduct],
        price: displayPrice
    }), [products, selectedProduct, displayPrice]);

    return (
        <>
        <Navbar />
        <CartDrawer />
        <div className="min-h-screen bg-background pt-16">
            {/* 1. Header Section (Carousel) */}
            <motion.div
                layout
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`w-full overflow-hidden ${isFullScreen ? 'fixed inset-0 z-[100] h-screen' : 'relative h-[75vh] sm:h-[85vh] md:h-[85vh]'}`}
            >

                {/* Navigation Arrows & Back Button */}
                {viewMode === 'customizing' && !isFullScreen && (
                    <>
                        {/* Back Button */}
                        <div className="absolute top-4 left-4 z-50 pointer-events-auto">
                            <button
                                onClick={() => {
                                    setViewMode('showcase');
                                    setSearchParams({});
                                    setIsFullScreen(false);
                                }}
                                className="bg-background hover:bg-muted text-foreground px-4 py-2 border border-border shadow-md flex items-center gap-2 font-display uppercase tracking-widest text-xs md:text-sm font-bold transition-all hover:scale-105"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {t('shop.back')}
                            </button>
                        </div>
                        
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-50 flex justify-between px-4 md:px-8 pointer-events-none">
                            <button
                                onClick={() => cycleProduct('prev')}
                                className="pointer-events-auto w-12 h-12 md:w-16 md:h-16 bg-background/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-background hover:text-black transition-all hover:scale-110 shadow-lg"
                            >
                                <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
                            </button>
                            <button
                                onClick={() => cycleProduct('next')}
                                className="pointer-events-auto w-12 h-12 md:w-16 md:h-16 bg-background/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-background hover:text-black transition-all hover:scale-110 shadow-lg"
                            >
                                <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
                            </button>
                        </div>
                    </>
                )}

                {/* 3D Scene Background */}
                <div className="absolute inset-0 z-40 pointer-events-none">
                    <div className="w-full h-full pointer-events-auto relative">
                        <ShopScene
                            onSelectProduct={handleProductSelect}
                            selectedProduct={selectedProduct}
                            isCustomizing={isCustomizing}
                            selectedColor={selectedColor}
                            designs={designs}
                            activeZone={activeZone}
                            mode={viewMode}
                            isFullscreen={isFullScreen}
                            products={products}
                            colorToLogoMap={COLOR_TO_LOGO_MAP}
                            hasUserInteracted={hasUserInteracted}
                            logoList={frontLogoUrl ? [frontLogoUrl] : effectiveCollections['STREET']}
                            hoodieBackList={useMemo(() => [
                                ...effectiveCollections['CLASSIC']
                            ], [effectiveCollections])}
                            vintageList={useMemo(() => [
                                ...effectiveCollections['VINTAGE']
                            ], [effectiveCollections])}
                            allDesignsList={useMemo(() => [
                                ...effectiveCollections['STREET'],
                                ...effectiveCollections['CLASSIC'],
                                ...effectiveCollections['VINTAGE']
                            ], [effectiveCollections])}
                            designReplacements={useMemo(() => ({}), [])}
                            onCycleDesignUpdate={handleCycleDesignUpdate}
                            productAllowedColors={useMemo(() => {
                                // Build per-product allowed colors intersecting product-level + collection-level constraints
                                const getColors = (productSlug: string, collectionSlug: string) => {
                                    // Product-level colors
                                    const prodColors = getProductColors(productSlug);
                                    let hexes = prodColors.map(c => c.hex);

                                    // Collection-level colors
                                    const cols = collectionColorMap[collectionSlug];
                                    if (cols && cols.length > 0) {
                                        const colHexes = cols.map(c => c.hex);
                                        hexes = hexes.filter(h => colHexes.includes(h));
                                    }
                                    return hexes.length > 0 ? hexes : undefined;
                                };
                                return {
                                    tshirt: getColors('tshirt', 'VINTAGE') || getColors('tshirt', 'CLASSIC'),
                                    hoodie: getColors('hoodie', 'CLASSIC'),
                                    cap: getColors('cap', 'STREET') || shopConfig?.cap?.allowed_colors,
                                    bottle: getColors('bottle', 'STREET') || ['#231f20', '#ffffff']
                                };
                            }, [collectionColorMap, shopConfig, getProductColors])}
                            productRestrictedDesigns={useMemo(() => ({
                                tshirt: shopConfig?.tshirt?.restricted_designs,
                                hoodie: shopConfig?.hoodie?.restricted_designs,
                                cap: shopConfig?.cap?.restricted_designs,
                                bottle: shopConfig?.bottle?.restricted_designs
                            }), [shopConfig])}
                            designColorMap={shopConfig?.design_color_map}
                            urlToFilename={URL_TO_FILENAME}
                        />

                    </div>
                </div>



                {/* Overlay Text (Title & Price) */}
                {viewMode === 'customizing' && (
                <div className="absolute inset-0 z-20 pointer-events-none container mx-auto px-4 sm:px-6 md:px-8">
                        <div className="relative w-full h-full flex flex-col justify-between pt-16 sm:pt-20 md:pt-28 pb-48">
                            {/* Top Area titles */}
                            <div className="flex justify-between items-start w-full gap-2">
                                <motion.h2
                                    key={`title-${selectedProduct}`}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-lg sm:text-2xl md:text-5xl font-black text-white drop-shadow-lg font-display uppercase tracking-wider w-[45%] sm:w-[40%] leading-[0.9] md:leading-tight text-left break-words"
                                >
                                    {activeProductData.name}
                                </motion.h2>

                                <motion.div
                                    key={`price-${selectedProduct}`}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-lg sm:text-2xl md:text-5xl font-black text-white drop-shadow-md font-display uppercase tracking-wider text-right"
                                >
                                    {activeProductData.price.toFixed(2)}€
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FLOATING CONTROLS - z-50 to be on top of everything */}

                {/* 3. Central Controls (Bottom Center) */}
                {viewMode === 'customizing' && (
                    <div className="absolute bottom-4 left-0 right-0 z-50 flex flex-col items-center justify-end pointer-events-none">
                        <div className="pointer-events-auto w-full max-w-4xl px-4 flex flex-col items-center gap-4">

                            {/* ZONE SELECTOR (Only for Hoodie) - REMOVED DESKTOP PILLS TO UNIFY WITH MOBILE STYLE */}


                            {/* 1. Color Picker (Top) - Style matched to Design Bar */}
                            {selectedProduct !== 'cap' && (() => {
                                // Get colors allowed by DESIGN rules (from API config)
                                const designColors = getDesignColorsFromConfig(currentDesign);

                                // Get colors allowed by PRODUCT rules (from dashboard product settings)
                                const productColors = getProductColors(selectedProduct);

                                // Get colors allowed by COLLECTION rules (from dashboard collection settings)
                                const collectionColors = collectionColorMap[expandedCollection];
                                const collectionHexes = collectionColors?.map(c => c.hex);

                                // Intersect: design rules AND product rules AND collection rules
                                let availableColors = designColors.filter(dc =>
                                    productColors.some(pc => pc.hex === dc.hex)
                                );
                                if (collectionHexes && collectionHexes.length > 0) {
                                    availableColors = availableColors.filter(c => collectionHexes.includes(c.hex));
                                }

                                return availableColors.length > 0 ? (
                                    <div className="flex gap-2 bg-background/5 backdrop-blur-sm p-3 rounded-full border border-white/10 shadow-2xl mb-1">
                                        {availableColors.map((c) => (
                                            <button
                                                key={c.name}
                                                onClick={() => handleColorSelect(c.hex)}
                                                className={`w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/20 transition-transform hover:scale-110 ${selectedColor === c.hex
                                                    ? 'ring-2 ring-white scale-110 shadow-md'
                                                    : 'opacity-80 hover:opacity-100'
                                                    }`}
                                                style={{ backgroundColor: c.hex }}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                ) : null;
                            })()}

                            {/* 2. Collection Toggles (Tabs) with side buttons */}
                            <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
                                {/* Zone Toggle - Left side, icon only, visible on all screens */}
                                {(selectedProduct === 'hoodie' || selectedProduct === 'tshirt') && (
                                    <button
                                        onClick={() => {
                                            const newZone = activeZone === 'front' ? 'back' : 'front';
                                            setActiveZone(newZone);
                                            // Update URL with new zone
                                            setSearchParams(prev => {
                                                const newParams = new URLSearchParams(prev);
                                                newParams.set('zone', newZone);
                                                return newParams;
                                            }, { replace: true });
                                        }}
                                        className="bg-black/80 hover:bg-black backdrop-blur-md p-2.5 text-white transition-all shadow-lg border border-white/10 group pointer-events-auto"
                                        title={activeZone === 'front' ? 'Switch to Back' : 'Switch to Front'}
                                    >
                                        <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                    </button>
                                )}

                                <div className="flex justify-center md:gap-4 bg-black/80 backdrop-blur-md p-1.5 rounded-none shadow-xl border border-white/10 w-fit max-w-[60vw] md:max-w-none overflow-x-auto custom-scrollbar">
                                {['CLASSIC', 'STREET', 'VINTAGE']
                                        .map(name => (
                                            <button
                                                key={name}
                                                onClick={() => setExpandedCollection(name)}
                                                className={`px-3 md:px-4 py-1.5 rounded-none text-[10px] md:text-xs font-bold tracking-[0.15em] md:tracking-widest whitespace-nowrap transition-all font-display uppercase tracking-widest ${expandedCollection === name
                                                    ? 'bg-foreground text-background shadow-md'
                                                    : 'text-white/60 hover:text-white hover:bg-background/10'}`}
                                            >
                                                {name}
                                            </button>
                                        ))}
                                </div>



                                {/* Expand Button - Right side, icon only, visible on all screens */}
                                <button
                                    onClick={() => {
                                        const isFs = !isFullScreen;
                                        setSearchParams(prev => {
                                            const newParams = new URLSearchParams(prev);
                                            if (isFs) newParams.set('fullscreen', 'true');
                                            else newParams.delete('fullscreen');
                                            return newParams;
                                        });
                                    }}
                                    className="bg-black/80 hover:bg-black backdrop-blur-md p-2.5 rounded-none text-white transition-all shadow-lg border border-white/10 group pointer-events-auto"
                                    title={isFullScreen ? "Close Fullscreen" : "Expand 3D View"}
                                >
                                    {isFullScreen ? (
                                        <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <Box className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    )}
                                </button>
                            </div>

                            {/* 3. Design Thumbnails (Bottom - Large Single Row) */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={expandedCollection}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex justify-start flex-nowrap gap-2 p-2 bg-background/5 backdrop-blur-sm rounded-none border border-white/10 shadow-2xl overflow-x-auto w-full max-w-full custom-scrollbar touch-pan-x"
                                >
                                    {(effectiveCollections[expandedCollection] || [])
                                        .filter(design => {
                                            const filename = URL_TO_FILENAME[design] || design.split('/').pop()?.split('?')[0] || '';
                                            // Use dynamic config for restrictions
                                            if (isDesignRestricted(selectedProduct, filename)) return false;
                                            return true;
                                        })
                                        .map((design, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleDesignSelect(design)}
                                                className={`w-20 h-20 md:w-28 md:h-28 flex-shrink-0 rounded-none border-2 overflow-hidden bg-background transition-all transform hover:scale-105 ${currentDesign === design
                                                    ? 'border-white ring-2 ring-white/50 scale-105 shadow-xl'
                                                    : 'border-transparent opacity-90 hover:opacity-100'
                                                    }`}
                                            >
                                                <img
                                                    src={design}
                                                    alt="Design"
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            </button>
                                        ))}
                                </motion.div>
                            </AnimatePresence>


                        </div>
                    </div>
                )}

                {/* Desktop Expand/Collapse Button - REMOVED to unify with mobile style in control bar */}


                {/* Cloud Separator */}
                
            </motion.div>

            {/* Placeholder to prevent layout shift when header becomes fixed */}
            {isFullScreen && <div className="h-[75vh] sm:h-[85vh] md:h-[85vh]" />}

            {viewMode === 'showcase' ? (
                <div className="w-full relative z-40 bg-background -mt-2 pt-8 md:pt-16 pb-16">
                    <div className="container mx-auto px-5 py-8 md:py-16 relative z-50 text-center">
                        <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-primary font-display uppercase tracking-wider sm:tracking-widest mb-4 sm:mb-6 drop-shadow-sm">
                            {t('shop.title')}
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                            {t('hero.subtitle')}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="container mx-auto px-4 py-12 md:py-20 bg-transparent relative z-40 rounded-none border-t-0 shadow-none">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* 1. Top Section: Controls (Size + Quantity + Cart) */}
                        <div className="flex flex-col xl:flex-row items-stretch xl:items-end gap-6 my-8">

                            {/* Controls Wrapper */}
                            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto shrink-0 justify-center">

                                {/* Size Picker */}
                                {selectedProduct !== 'cap' && selectedProduct !== 'bottle' && (() => {
                                    const availableSizes = getProductSizes(selectedProduct);
                                    return availableSizes.length > 0 ? (
                                    <div className="flex-1 sm:flex-none flex flex-col gap-3 min-w-[200px]">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 font-display uppercase tracking-widest">Veličina</label>
                                        </div>

                                        {/* Mobile: Native Select Dropdown */}
                                        <div className="sm:hidden">
                                            <div className="relative">
                                                <select
                                                    value={selectedSize}
                                                    onChange={(e) => setSelectedSize(e.target.value)}
                                                    className="w-full h-11 pl-4 pr-10 bg-background rounded-none border border-border shadow-sm font-display uppercase tracking-widest font-bold text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/10"
                                                >
                                                    {availableSizes.map(size => (
                                                        <option key={size} value={size}>{size}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <ChevronDown className="w-5 h-5 text-muted-foreground/70" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Desktop: Buttons */}
                                        <div className="hidden sm:flex justify-between items-center gap-3 bg-background rounded-none border border-border shadow-sm px-3 py-2">
                                            {availableSizes.map(size => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`w-11 h-11 rounded-none font-bold text-xs transition-all duration-300 flex items-center justify-center font-display uppercase tracking-widest leading-tight shrink-0 ${selectedSize === size
                                                        ? 'bg-black text-white shadow-md scale-110'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-black'
                                                        }`}
                                                >
                                                    {size.includes(' ') ? <>{size.split(' ')[0]}<br/>{size.split(' ')[1]}</> : size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    ) : null;
                                })()}

                                {/* Quantity Picker */}
                                <div className="flex-1 sm:flex-none flex flex-col gap-3 min-w-[140px]">
                                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 px-1 font-display uppercase tracking-widest">{t('shop.quantity')}</label>
                                    <div className="flex items-center justify-between gap-1 bg-background rounded-none border border-border shadow-sm p-1.5 h-[62px] sm:h-[62px]">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-full flex items-center justify-center text-muted-foreground/70 hover:text-black hover:bg-muted rounded-none transition-all active:scale-95"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <span className="flex-1 text-center font-black text-xl text-foreground font-display uppercase tracking-widest">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-full flex items-center justify-center text-muted-foreground/70 hover:text-black hover:bg-muted rounded-none transition-all active:scale-95"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <div className="flex-1 w-full sm:min-w-[320px] group/btn">
                                {activeProductData.stockStatus === 'outofstock' ? (
                                    <Button
                                        size="lg"
                                        disabled
                                        className="w-full h-[58px] sm:h-[64px] text-lg sm:text-xl font-bold rounded-none bg-muted text-muted-foreground/70 cursor-not-allowed border-2 border-border font-display uppercase tracking-widest"
                                    >
                                        {t('shop.outofstock')}
                                    </Button>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full h-[58px] sm:h-[64px] rounded-none relative group/active"
                                        style={{
                                            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                                            padding: '2px'
                                        }}
                                        onMouseMove={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const x = e.clientX - rect.left;
                                            const y = e.clientY - rect.top;
                                            e.currentTarget.style.background = `radial-gradient(circle at ${x}px ${y}px, hsl(var(--accent)) 0%, hsl(var(--primary)) 50%, hsl(var(--secondary)) 100%)`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))';
                                        }}
                                    >
                                        {/* Inner button */}
                                        <div className="w-full h-full rounded-none bg-gradient-to-r from-primary to-accent flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3">
                                            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform group-hover/active:rotate-12 shrink-0" />
                                            <span className="text-white text-sm sm:text-lg font-bold whitespace-nowrap font-display uppercase tracking-widest">{t('shop.addtocart')}</span>
                                            <div className="w-px h-5 sm:h-6 bg-background/30 mx-1 shrink-0" />
                                            <span className="text-white text-sm sm:text-lg font-bold tabular-nums whitespace-nowrap font-display uppercase tracking-widest">{(activeProductData.price * quantity).toFixed(2)}€</span>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 2. Bottom Section: Tabs */}
                        <div className="border border-border overflow-hidden min-h-[400px]">
                            {/* Tab Headers */}
                            <div className="flex border-b border-border overflow-x-auto bg-background/50 backdrop-blur-sm rounded-none">
                                {[
                                    { id: 'details', label: t('shop.tab.details') },
                                    { id: 'features', label: t('shop.tab.features') },
                                    { id: 'reviews', label: `${t('shop.tab.reviews')} (${activeProductData.ratingCount})` }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 py-4 px-2 md:px-8 text-sm md:text-lg font-bold font-heading transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? 'text-primary border-b-4 border-primary bg-primary/10'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="bg-background/80 backdrop-blur-md p-8 md:p-12 rounded-none border-t-0">
                                {activeTab === 'details' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h3 className="text-3xl font-black font-heading mb-6 text-foreground">{activeProductData.name}</h3>
                                        <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                                            {activeProductData.description || "Vrhunska kvaliteta i udobnost. Naši proizvodi izrađeni su od najfinijih materijala, pružajući savršen balans između stila i funkcionalnosti."}
                                        </p>

                                        {selectedProduct === 'bottle' ? (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-muted p-4 rounded-none text-center border border-border">
                                                    <div className="text-primary font-black text-2xl mb-1">500ml</div>
                                                    <div className="text-muted-foreground text-xs font-bold uppercase">Kapacitet</div>
                                                </div>
                                                <div className="bg-muted p-4 rounded-none text-center border border-border">
                                                    <div className="text-primary font-black text-2xl mb-1">Inox</div>
                                                    <div className="text-muted-foreground text-xs font-bold uppercase">Materijal</div>
                                                </div>
                                                <div className="bg-muted p-4 rounded-none text-center border border-border">
                                                    <div className="text-primary font-black text-2xl mb-1">12h/24h</div>
                                                    <div className="text-muted-foreground text-xs font-bold uppercase">Toplo/Hladno</div>
                                                </div>
                                                <div className="bg-muted p-4 rounded-none text-center border border-border">
                                                    <div className="text-primary font-black text-2xl mb-1">283g</div>
                                                    <div className="text-muted-foreground text-xs font-bold uppercase">Težina</div>
                                                </div>
                                            </div>
                                        ) : (selectedProduct === 'hoodie' || selectedProduct === 'tshirt') ? (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-muted p-4 rounded-none text-center border border-border">
                                                    <div className="text-primary font-black text-2xl mb-1">100%</div>
                                                    <div className="text-muted-foreground text-xs font-bold uppercase">Pamuk</div>
                                                </div>
                                                <div className="bg-muted p-4 rounded-none text-center border border-border">
                                                    <div className="text-primary font-black text-2xl mb-1">2%</div>
                                                    <div className="text-muted-foreground text-xs font-bold uppercase">Skupljanje</div>
                                                </div>
                                                <div className="bg-muted p-4 rounded-none text-center border border-border">
                                                    <div className="text-primary font-black text-2xl mb-1">40°C</div>
                                                    <div className="text-muted-foreground text-xs font-bold uppercase">Pranje</div>
                                                </div>
                                                <div className="bg-muted p-4 rounded-none text-center border border-border">
                                                    <div className="text-primary font-black text-2xl mb-1">HR</div>
                                                    <div className="text-muted-foreground text-xs font-bold uppercase">Proizvodnja</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-muted p-4 rounded-2xl text-center">
                                                    <div className="text-primary font-black text-2xl mb-1">100%</div>
                                                    <div className="text-muted-foreground text-xs font-bold uppercase">Poliester</div>
                                                </div>
                                                <div className="bg-muted p-4 rounded-2xl text-center">
                                                    <div className="text-primary font-black text-2xl mb-1">DTF</div>
                                                    <div className="text-muted-foreground text-xs font-bold uppercase">Print</div>
                                                </div>
                                                <div className="bg-muted p-4 rounded-2xl text-center">
                                                    <div className="text-primary font-black text-2xl mb-1">EU</div>
                                                    <div className="text-muted-foreground text-xs font-bold uppercase">Kvaliteta</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'features' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid md:grid-cols-2 gap-8">
                                        {selectedProduct === 'bottle' ? (
                                            <ul className="space-y-4">
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Nepropusno (Leakproof)</span>
                                                </li>
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center text-destructive shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Toplinska izolacija: 12h</span>
                                                </li>
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent-foreground shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Hladna izolacija: 24h</span>
                                                </li>
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Dvostruka stijenka s bakrenom izolacijom</span>
                                                </li>
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Dimenzije: Ă¸70Ă—263 mm</span>
                                                </li>
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive/70 shrink-0">
                                                        <X className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Nije za mikrovalnu</span>
                                                </li>
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive/70 shrink-0">
                                                        <X className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Nije za perilicu posuđa</span>
                                                </li>
                                            </ul>
                                        ) : (selectedProduct === 'hoodie' || selectedProduct === 'tshirt') ? (
                                            <ul className="space-y-4">
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Sastav: 100% Pamuk</span>
                                                </li>
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Skupljanje: po visini 2%, po dužini 2%</span>
                                                </li>
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent-foreground shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Održavanje: Pranje na 40°C, Glačanje</span>
                                                </li>
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Proizvođač: Tina-co Solin d.o.o.</span>
                                                </li>
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Stavlja na tržište: 021 d.o.o.</span>
                                                </li>
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Tehnika tiska: DTF</span>
                                                </li>
                                            </ul>
                                        ) : (
                                            <ul className="space-y-4">
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">100% Poliester</span>
                                                </li>
                                                <li className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-foreground text-lg">Tehnika tiska: DTF</span>
                                                </li>
                                            </ul>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                                        {activeProductData.ratingCount > 0 ? (
                                            <>
                                                <div className="flex items-center gap-4 mb-8 p-6 bg-primary/10 rounded-2xl border border-primary/20">
                                                    <div className="text-5xl font-black text-primary">{activeProductData.averageRating.toFixed(1)}</div>
                                                    <div>
                                                        <div className="flex text-primary mb-1">
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-5 h-5 ${i <= Math.round(activeProductData.averageRating) ? 'fill-current' : 'text-muted-foreground'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="text-muted-foreground font-medium">Temeljeno na {activeProductData.ratingCount} recenzija</div>
                                                    </div>
                                                </div>

                                                {/* Sample Review - kept static for now as actual review text isn't fetched yet */}
                                                <div className="border-b border-border pb-6">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="font-bold text-foreground">Marko P.</div>
                                                        <span className="text-sm text-muted-foreground/70">Prije 2 dana</span>
                                                    </div>
                                                    <div className="flex text-primary mb-2">
                                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="fill-current w-4 h-4" />)}
                                                    </div>
                                                    <p className="text-muted-foreground">"Vrhunska hoodica, print je jasan i boje su žive. Dostava je bila super brza!"</p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="flex justify-center mb-4">
                                                    <Star className="w-12 h-12 text-muted-foreground" />
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground mb-2">{t('shop.noreviews')}</h3>
                                                <p className="text-muted-foreground">
                                                    {t('shop.firstreviewer')} "{activeProductData.name}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <Footer />
        </>
    );
};

export default Shop;

