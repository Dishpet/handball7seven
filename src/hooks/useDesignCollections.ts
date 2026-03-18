import { useMemo } from "react";
import { useSiteContent, useUpdateSiteContent } from "@/hooks/useSiteContent";

export type DesignCollectionKey = "classic" | "vintage" | "street" | "front_logo";

export interface DesignAsset {
  id: string;
  name: string;
  /** Dark version URL (primary/default) */
  url: string;
  path?: string;
  /** Light version URL */
  lightUrl?: string;
  lightPath?: string;
  /** Hex colors that should show the dark version */
  darkColors?: string[];
  /** Hex colors that should show the light version */
  lightColors?: string[];
}

export type DesignCollectionsValue = Record<DesignCollectionKey, DesignAsset[]>;

export const EMPTY_DESIGN_COLLECTIONS: DesignCollectionsValue = {
  classic: [],
  vintage: [],
  street: [],
  front_logo: [],
};

const normalizeAssets = (input: unknown): DesignAsset[] => {
  if (!Array.isArray(input)) return [];
  return input
    .map((item: any) => ({
      id: typeof item?.id === "string" ? item.id : crypto.randomUUID(),
      name: typeof item?.name === "string" ? item.name : "design.png",
      url: typeof item?.url === "string" ? item.url : "",
      path: typeof item?.path === "string" ? item.path : undefined,
      lightUrl: typeof item?.lightUrl === "string" ? item.lightUrl : undefined,
      lightPath: typeof item?.lightPath === "string" ? item.lightPath : undefined,
      darkColors: Array.isArray(item?.darkColors) ? item.darkColors : undefined,
      lightColors: Array.isArray(item?.lightColors) ? item.lightColors : undefined,
    }))
    .filter((item) => item.url);
};

export const normalizeDesignCollections = (value: unknown): DesignCollectionsValue => {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    classic: normalizeAssets(raw.classic),
    vintage: normalizeAssets(raw.vintage),
    street: normalizeAssets(raw.street ?? raw.kids),
    front_logo: normalizeAssets(raw.front_logo),
  };
};

/**
 * Resolve the correct design URL (dark or light) based on the selected color.
 * Falls back to the dark (primary) URL if no variant mapping exists.
 */
export function resolveDesignVariant(design: DesignAsset, selectedColor: string): string {
  if (!design) return "";
  const hex = selectedColor.toLowerCase();

  // If light colors are defined and match, use lightUrl
  if (design.lightColors?.length && design.lightUrl) {
    if (design.lightColors.some(c => c.toLowerCase() === hex)) {
      return design.lightUrl;
    }
  }

  // If dark colors are defined and match, use url (dark)
  if (design.darkColors?.length) {
    if (design.darkColors.some(c => c.toLowerCase() === hex)) {
      return design.url;
    }
  }

  // No explicit mapping — default to dark version
  return design.url;
}

/**
 * Build a variant map: Record<darkUrl, DesignAsset> for quick lookups from URL lists.
 */
export function buildDesignVariantMap(collections: DesignCollectionsValue): Record<string, DesignAsset> {
  const map: Record<string, DesignAsset> = {};
  for (const key of Object.keys(collections) as DesignCollectionKey[]) {
    for (const asset of collections[key]) {
      map[asset.url] = asset;
      // Also map light URL to the same asset for reverse lookups
      if (asset.lightUrl) {
        map[asset.lightUrl] = asset;
      }
    }
  }
  return map;
}

export function useDesignCollections() {
  const { data, isLoading } = useSiteContent("design_collections");
  const update = useUpdateSiteContent();

  const collections = useMemo(() => {
    const value = (data as any)?.value;
    return normalizeDesignCollections(value);
  }, [data]);

  const saveCollections = async (next: DesignCollectionsValue) => {
    await update.mutateAsync({ key: "design_collections", value: next as any });
  };

  return {
    collections,
    isLoading,
    saveCollections,
    isSaving: update.isPending,
  };
}
