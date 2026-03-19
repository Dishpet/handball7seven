import { useState, useEffect, useCallback } from 'react';

const WP_API_URL = '/api'; // Uses proxy in dev and prod

// Default fallback configuration (matches PHP defaults)
const DEFAULT_CONFIG: ShopConfig = {
    tshirt: {
        allowed_colors: ['#111111', '#F0F0F0', '#808080', '#C8AD7F', '#1C2E4A', '#008080', '#00BCD4', '#2196F3', '#9C27B0', '#E91E63', '#98FF98'],
        default_zone: 'back',
        locked_zone: 'front',
        restricted_designs: [],
        has_front_back: true
    },
    hoodie: {
        allowed_colors: ['#111111', '#F0F0F0', '#808080', '#C8AD7F', '#1C2E4A', '#008080', '#00BCD4', '#2196F3', '#9C27B0', '#E91E63', '#98FF98'],
        default_zone: 'back',
        locked_zone: 'front',
        restricted_designs: [],
        has_front_back: true
    },
    cap: {
        allowed_colors: ['#111111', '#F0F0F0', '#808080', '#C8AD7F'],
        default_zone: 'front',
        locked_zone: null,
        restricted_designs: ['street-5.png'],
        has_front_back: false
    },
    bottle: {
        allowed_colors: ['#111111', '#F0F0F0'],
        default_zone: 'front',
        locked_zone: null,
        restricted_designs: [],
        has_front_back: false
    },
    alternatives: [
        {
            design_id: 'street-3.png',
            trigger_colors: ['#e78fab', '#a1d7c0', '#00aeef'],
            replace_with: 'street-3-alt.png'
        }
    ],
    design_color_map: {}
};

export interface ProductConfig {
    allowed_colors: string[];
    default_zone: 'front' | 'back';
    locked_zone: 'front' | 'back' | null;
    restricted_designs: string[];
    has_front_back: boolean;
}

export interface AlternativeRule {
    design_id: string;
    trigger_colors: string[];
    replace_with: string;
}

export interface ShopConfig {
    tshirt: ProductConfig;
    hoodie: ProductConfig;
    cap: ProductConfig;
    bottle: ProductConfig;
    alternatives: AlternativeRule[];
    design_color_map: Record<string, string[]>;
}

interface UseShopConfigReturn {
    config: ShopConfig;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    getProductConfig: (productId: string) => ProductConfig;
    getAllowedColors: (productId: string) => string[];
    getAlternativeDesign: (designFilename: string, currentColor: string) => string | null;
    isDesignRestricted: (productId: string, designFilename: string) => boolean;
    isColorAllowed: (productId: string, colorHex: string) => boolean;
}

export function useShopConfig(): UseShopConfigReturn {
    const [config, setConfig] = useState<ShopConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Using static default config for Handball Seven app (Supabase-ready)
            setConfig(DEFAULT_CONFIG);
        } catch (err: any) {
            console.error('useShopConfig: Failed to load config', err);
            setError(err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    // Helper: Get product config
    const getProductConfig = useCallback((productId: string): ProductConfig => {
        const key = productId as keyof Pick<ShopConfig, 'tshirt' | 'hoodie' | 'cap' | 'bottle'>;
        return config[key] || DEFAULT_CONFIG.tshirt;
    }, [config]);

    // Helper: Get allowed colors for a product
    const getAllowedColors = useCallback((productId: string): string[] => {
        return getProductConfig(productId).allowed_colors;
    }, [getProductConfig]);

    // Helper: Check if a design should be substituted
    const getAlternativeDesign = useCallback((designFilename: string, currentColor: string): string | null => {
        const alt = config.alternatives.find(a =>
            a.design_id === designFilename &&
            a.trigger_colors.includes(currentColor.toLowerCase())
        );
        return alt ? alt.replace_with : null;
    }, [config.alternatives]);

    // Helper: Check if design is restricted for product
    const isDesignRestricted = useCallback((productId: string, designFilename: string): boolean => {
        const productConfig = getProductConfig(productId);
        return productConfig.restricted_designs.includes(designFilename);
    }, [getProductConfig]);

    // Helper: Check if color is allowed for product
    const isColorAllowed = useCallback((productId: string, colorHex: string): boolean => {
        const productConfig = getProductConfig(productId);
        return productConfig.allowed_colors.includes(colorHex.toLowerCase());
    }, [getProductConfig]);

    return {
        config,
        loading,
        error,
        refetch: fetchConfig,
        getProductConfig,
        getAllowedColors,
        getAlternativeDesign,
        isDesignRestricted,
        isColorAllowed
    };
}
