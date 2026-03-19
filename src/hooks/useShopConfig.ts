import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Default fallback configuration (used only if no DB entry exists)
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
    alternatives: [],
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
    const { data: dbConfig, isLoading, error: queryError, refetch } = useQuery({
        queryKey: ['store_settings', 'shop_config'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('store_settings')
                .select('value')
                .eq('key', 'shop_config')
                .maybeSingle();
            if (error) throw error;
            return data?.value as ShopConfig | null;
        },
        staleTime: 60_000,
    });

    const config = useMemo<ShopConfig>(() => {
        if (!dbConfig) return DEFAULT_CONFIG;
        // Merge DB config with defaults to ensure all fields exist
        return {
            tshirt: { ...DEFAULT_CONFIG.tshirt, ...dbConfig.tshirt },
            hoodie: { ...DEFAULT_CONFIG.hoodie, ...dbConfig.hoodie },
            cap: { ...DEFAULT_CONFIG.cap, ...dbConfig.cap },
            bottle: { ...DEFAULT_CONFIG.bottle, ...dbConfig.bottle },
            alternatives: dbConfig.alternatives ?? DEFAULT_CONFIG.alternatives,
            design_color_map: dbConfig.design_color_map ?? DEFAULT_CONFIG.design_color_map,
        };
    }, [dbConfig]);

    const getProductConfig = useCallback((productId: string): ProductConfig => {
        const key = productId as keyof Pick<ShopConfig, 'tshirt' | 'hoodie' | 'cap' | 'bottle'>;
        return config[key] || DEFAULT_CONFIG.tshirt;
    }, [config]);

    const getAllowedColors = useCallback((productId: string): string[] => {
        return getProductConfig(productId).allowed_colors;
    }, [getProductConfig]);

    const getAlternativeDesign = useCallback((designFilename: string, currentColor: string): string | null => {
        const alt = config.alternatives.find(a =>
            a.design_id === designFilename &&
            a.trigger_colors.includes(currentColor.toLowerCase())
        );
        return alt ? alt.replace_with : null;
    }, [config.alternatives]);

    const isDesignRestricted = useCallback((productId: string, designFilename: string): boolean => {
        return getProductConfig(productId).restricted_designs.includes(designFilename);
    }, [getProductConfig]);

    const isColorAllowed = useCallback((productId: string, colorHex: string): boolean => {
        return getProductConfig(productId).allowed_colors.includes(colorHex.toLowerCase());
    }, [getProductConfig]);

    return {
        config,
        loading: isLoading,
        error: queryError?.message ?? null,
        refetch: () => { refetch(); },
        getProductConfig,
        getAllowedColors,
        getAlternativeDesign,
        isDesignRestricted,
        isColorAllowed
    };
}
