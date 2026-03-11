import { AdminLayout } from "@/components/admin/AdminLayout";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Eye, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DesignAsset,
  DesignCollectionKey,
  DesignCollectionsValue,
  useDesignCollections,
} from "@/hooks/useDesignCollections";

const COLLECTION_ORDER: DesignCollectionKey[] = ["vintage", "kids", "classic", "front_logo"];
const COLLECTION_LABELS: Record<DesignCollectionKey, string> = {
  vintage: "VINTAGE",
  kids: "KIDS",
  classic: "CLASSIC",
  front_logo: "FRONT LOGO",
};

const toFolder = (key: DesignCollectionKey) => (key === "front_logo" ? "front-logo" : key);

export default function Designs() {
  const { collections, isLoading, saveCollections, isSaving } = useDesignCollections();
  const [localCollections, setLocalCollections] = useState<DesignCollectionsValue>(collections);
  const [expandedId, setExpandedId] = useState<DesignCollectionKey>("vintage");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const addInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const replaceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setLocalCollections(collections);
  }, [collections]);

  const persist = async (next: DesignCollectionsValue) => {
    setLocalCollections(next);
    await saveCollections(next);
  };

  const uploadToStorage = async (collection: DesignCollectionKey, file: File) => {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
    const path = `designs/${toFolder(collection)}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage.from("cms-images").upload(path, file, {
      upsert: false,
      cacheControl: "3600",
    });
    if (error) throw error;

    const { data } = supabase.storage.from("cms-images").getPublicUrl(path);
    return { path, url: data.publicUrl };
  };

  const handleCreate = async (collection: DesignCollectionKey, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Only image files are allowed");

    const opKey = `${collection}:create`;
    setBusyKey(opKey);
    try {
      const uploaded = await uploadToStorage(collection, file);
      const item: DesignAsset = {
        id: crypto.randomUUID(),
        name: file.name,
        url: uploaded.url,
        path: uploaded.path,
      };
      const next: DesignCollectionsValue = {
        ...localCollections,
        [collection]: [...localCollections[collection], item],
      };
      await persist(next);
      toast.success("Design added");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setBusyKey(null);
    }
  };

  const handleReplace = async (collection: DesignCollectionKey, item: DesignAsset, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Only image files are allowed");

    const opKey = `${collection}:replace:${item.id}`;
    setBusyKey(opKey);
    try {
      const uploaded = await uploadToStorage(collection, file);
      if (item.path) await supabase.storage.from("cms-images").remove([item.path]);

      const next: DesignCollectionsValue = {
        ...localCollections,
        [collection]: localCollections[collection].map((d) =>
          d.id === item.id ? { ...d, name: file.name, url: uploaded.url, path: uploaded.path } : d,
        ),
      };
      await persist(next);
      toast.success("Design replaced");
    } catch (e: any) {
      toast.error(e.message || "Replace failed");
    } finally {
      setBusyKey(null);
    }
  };

  const handleDelete = async (collection: DesignCollectionKey, item: DesignAsset) => {
    const opKey = `${collection}:delete:${item.id}`;
    setBusyKey(opKey);
    try {
      if (item.path) await supabase.storage.from("cms-images").remove([item.path]);
      const next: DesignCollectionsValue = {
        ...localCollections,
        [collection]: localCollections[collection].filter((d) => d.id !== item.id),
      };
      await persist(next);
      toast.success("Design deleted");
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    } finally {
      setBusyKey(null);
    }
  };

  const isBusy = (k: string) => busyKey === k || isSaving;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-display uppercase tracking-widest font-black text-white">Design Management</h2>
          <p className="text-white/60 font-body mt-1">Manage designs for VINTAGE, KIDS, CLASSIC and FRONT LOGO</p>
        </div>

        {previewUrl && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
            <img src={previewUrl} alt="Design preview" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        )}

        {isLoading ? (
          <p className="text-white/60 font-display uppercase tracking-widest">Loading designs...</p>
        ) : (
          <div className="space-y-4">
            {COLLECTION_ORDER.map((collectionKey) => {
              const designs = localCollections[collectionKey] || [];
              const createKey = `${collectionKey}:create`;
              return (
                <div key={collectionKey} className="bg-black border border-white/10">
                  <div className="w-full flex justify-between items-center p-4 border-b border-white/10">
                    <button
                      onClick={() => setExpandedId(expandedId === collectionKey ? "vintage" : collectionKey)}
                      className="flex items-center gap-4"
                    >
                      <h3 className="text-lg font-display uppercase tracking-widest text-primary font-bold">{COLLECTION_LABELS[collectionKey]}</h3>
                      <span className="text-white/40 text-sm font-body">{designs.length} designs</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <input
                        ref={(el) => (addInputRefs.current[collectionKey] = el)}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          void handleCreate(collectionKey, file);
                          e.currentTarget.value = "";
                        }}
                      />
                      <button
                        onClick={() => addInputRefs.current[collectionKey]?.click()}
                        disabled={isBusy(createKey)}
                        className="flex items-center gap-2 px-3 py-2 bg-primary text-black text-xs font-display uppercase tracking-widest font-bold disabled:opacity-60"
                      >
                        {isBusy(createKey) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        Add Design
                      </button>
                    </div>
                  </div>

                  {expandedId === collectionKey && (
                    <div className="p-4">
                      {designs.length === 0 ? (
                        <p className="text-white/40 text-sm font-body">No designs yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {designs.map((design) => {
                            const replaceKey = `${collectionKey}:replace:${design.id}`;
                            const deleteKey = `${collectionKey}:delete:${design.id}`;
                            const inputRefKey = `${collectionKey}:${design.id}`;
                            return (
                              <div key={design.id} className="border border-white/10 bg-white/5 p-2 space-y-2">
                                <button onClick={() => setPreviewUrl(design.url)} className="w-full aspect-square overflow-hidden bg-black/40">
                                  <img src={design.url} alt={design.name} className="w-full h-full object-contain" />
                                </button>
                                <p className="text-[10px] text-white/60 truncate font-body">{design.name}</p>

                                <div className="grid grid-cols-4 gap-1">
                                  <button onClick={() => setPreviewUrl(design.url)} className="p-1 text-white/70 hover:text-white"><Eye className="w-3 h-3" /></button>
                                  <button onClick={() => window.open(design.url, "_blank")} className="p-1 text-white/70 hover:text-white"><Download className="w-3 h-3" /></button>

                                  <input
                                    ref={(el) => (replaceInputRefs.current[inputRefKey] = el)}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      void handleReplace(collectionKey, design, file);
                                      e.currentTarget.value = "";
                                    }}
                                  />
                                  <button
                                    onClick={() => replaceInputRefs.current[inputRefKey]?.click()}
                                    disabled={isBusy(replaceKey)}
                                    className="p-1 text-white/70 hover:text-white disabled:opacity-60"
                                  >
                                    {isBusy(replaceKey) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pencil className="w-3 h-3" />}
                                  </button>

                                  <button
                                    onClick={() => void handleDelete(collectionKey, design)}
                                    disabled={isBusy(deleteKey)}
                                    className="p-1 text-red-400/70 hover:text-red-400 disabled:opacity-60"
                                  >
                                    {isBusy(deleteKey) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
