import { useMemo } from "react";
import { useSiteContent, useUpdateSiteContent } from "@/hooks/useSiteContent";

export type DesignCollectionKey = "classic" | "vintage" | "street" | "front_logo";

export interface DesignAsset {
  id: string;
  name: string;
  url: string;
  path?: string;
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
