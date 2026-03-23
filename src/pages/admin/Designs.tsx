import { AdminLayout } from "@/components/admin/AdminLayout";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Plus, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DesignAsset,
  DesignCollectionKey,
  DesignCollectionsValue,
  useDesignCollections,
} from "@/hooks/useDesignCollections";
import { useStoreColors } from "@/hooks/useStoreCatalog";
import DesignCard from "@/components/admin/DesignCard";

const COLLECTION_ORDER: DesignCollectionKey[] = ["vintage", "street", "classic", "front_logo"];
const COLLECTION_LABELS: Record<DesignCollectionKey, string> = {
  vintage: "VINTAGE",
  street: "STREET",
  classic: "ORIGINAL",
  front_logo: "FRONT LOGO",
};

const toFolder = (key: DesignCollectionKey) => (key === "front_logo" ? "front-logo" : key);

export default function Designs() {
  const { collections, isLoading, saveCollections, isSaving } = useDesignCollections();
  const { data: storeColors } = useStoreColors();
  const [localCollections, setLocalCollections] = useState<DesignCollectionsValue>(collections);
  const [expandedId, setExpandedId] = useState<DesignCollectionKey>("vintage");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const addInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const handleCreate = async (collection: DesignCollectionKey, files: { dark: File; light: File }) => {
    if (!files.dark.type.startsWith("image/") || !files.light.type.startsWith("image/")) {
      return toast.error("Only image files are allowed");
    }

    if (collection === "front_logo" && localCollections.front_logo.length > 0) {
      return handleReplace(collection, localCollections.front_logo[0], files);
    }

    const opKey = `${collection}:create`;
    setBusyKey(opKey);
    try {
      const [darkUploaded, lightUploaded] = await Promise.all([
        uploadToStorage(collection, files.dark),
        uploadToStorage(collection, files.light),
      ]);
      const item: DesignAsset = {
        id: crypto.randomUUID(),
        name: files.dark.name,
        url: darkUploaded.url,
        path: darkUploaded.path,
        lightUrl: lightUploaded.url,
        lightPath: lightUploaded.path,
        darkColors: [],
        lightColors: [],
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

  const handleReplace = async (
    collection: DesignCollectionKey,
    item: DesignAsset,
    files: { dark: File; light: File }
  ) => {
    const opKey = `${collection}:replace:${item.id}`;
    setBusyKey(opKey);
    try {
      const [darkUploaded, lightUploaded] = await Promise.all([
        uploadToStorage(collection, files.dark),
        uploadToStorage(collection, files.light),
      ]);
      // Remove old files
      const toRemove = [item.path, item.lightPath].filter(Boolean) as string[];
      if (toRemove.length) await supabase.storage.from("cms-images").remove(toRemove);

      const next: DesignCollectionsValue = {
        ...localCollections,
        [collection]: localCollections[collection].map((d) =>
          d.id === item.id
            ? {
                ...d,
                name: files.dark.name,
                url: darkUploaded.url,
                path: darkUploaded.path,
                lightUrl: lightUploaded.url,
                lightPath: lightUploaded.path,
              }
            : d
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
      const toRemove = [item.path, item.lightPath].filter(Boolean) as string[];
      if (toRemove.length) await supabase.storage.from("cms-images").remove(toRemove);
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

  const handleUpdateColors = async (
    collection: DesignCollectionKey,
    designId: string,
    darkColors: string[],
    lightColors: string[]
  ) => {
    const next: DesignCollectionsValue = {
      ...localCollections,
      [collection]: localCollections[collection].map((d) =>
        d.id === designId ? { ...d, darkColors, lightColors } : d
      ),
    };
    await persist(next);
  };

  const handleReplaceSingleImage = async (
    collection: DesignCollectionKey,
    item: DesignAsset,
    variant: "dark" | "light",
    file: File
  ) => {
    if (!file.type.startsWith("image/")) return toast.error("Only image files are allowed");
    const opKey = `${collection}:replace-${variant}:${item.id}`;
    setBusyKey(opKey);
    try {
      const uploaded = await uploadToStorage(collection, file);
      const oldPath = variant === "dark" ? item.path : item.lightPath;
      if (oldPath) await supabase.storage.from("cms-images").remove([oldPath]);

      const updates =
        variant === "dark"
          ? { url: uploaded.url, path: uploaded.path, name: file.name }
          : { lightUrl: uploaded.url, lightPath: uploaded.path };

      const next: DesignCollectionsValue = {
        ...localCollections,
        [collection]: localCollections[collection].map((d) =>
          d.id === item.id ? { ...d, ...updates } : d
        ),
      };
      await persist(next);
      toast.success(`${variant === "dark" ? "Dark" : "Light"} version replaced`);
    } catch (e: any) {
      toast.error(e.message || "Replace failed");
    } finally {
      setBusyKey(null);
    }
  };

  const isBusy = (k: string) => busyKey === k || isSaving;
  const allColors = storeColors || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display uppercase tracking-widest font-black text-white">
              Designs
            </h2>
            <p className="text-white/60 font-body text-sm mt-1">Manage designs for collections</p>
          </div>
          {isSaving ? (
            <span className="flex items-center gap-2 text-primary text-xs font-display uppercase tracking-widest">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving…
            </span>
          ) : (
            <span className="flex items-center gap-2 text-emerald-400 text-xs font-display uppercase tracking-widest">
              <Check className="w-4 h-4" /> All changes saved
            </span>
          )}
        </div>

        {previewUrl && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewUrl(null)}
          >
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
                  <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border-b border-white/10">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === collectionKey ? "vintage" : collectionKey)
                      }
                      className="flex items-center gap-3"
                    >
                      <h3 className="text-base sm:text-lg font-display uppercase tracking-widest text-primary font-bold">
                        {COLLECTION_LABELS[collectionKey]}
                      </h3>
                      <span className="text-white/40 text-xs font-body">
                        {collectionKey === "front_logo"
                          ? designs.length > 0
                            ? "1 (max 1)"
                            : "0 (max 1)"
                          : `${designs.length}`}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <AddDesignButton
                        collectionKey={collectionKey}
                        designs={designs}
                        isBusy={isBusy(createKey)}
                        addInputRef={(el) => (addInputRefs.current[collectionKey] = el)}
                        onAdd={(files) => handleCreate(collectionKey, files)}
                      />
                    </div>
                  </div>

                  {expandedId === collectionKey && (
                    <div className="p-4">
                      {designs.length === 0 ? (
                        <p className="text-white/40 text-sm font-body">No designs yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {designs.map((design) => (
                            <DesignCard
                              key={design.id}
                              design={design}
                              collectionKey={collectionKey}
                              allColors={allColors}
                              isBusy={(k) => isBusy(k)}
                              onPreview={setPreviewUrl}
                              onDelete={() => handleDelete(collectionKey, design)}
                              onUpdateColors={(darkColors, lightColors) =>
                                handleUpdateColors(collectionKey, design.id, darkColors, lightColors)
                              }
                              onReplaceSingleImage={(variant, file) =>
                                handleReplaceSingleImage(collectionKey, design, variant, file)
                              }
                            />
                          ))}
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

/** Button that opens a two-file picker (dark + light) */
function AddDesignButton({
  collectionKey,
  designs,
  isBusy,
  addInputRef,
  onAdd,
}: {
  collectionKey: DesignCollectionKey;
  designs: DesignAsset[];
  isBusy: boolean;
  addInputRef: (el: HTMLInputElement | null) => void;
  onAdd: (files: { dark: File; light: File }) => void;
}) {
  const [step, setStep] = useState<null | "dark" | "light">(null);
  const [darkFile, setDarkFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    setStep("dark");
    setDarkFile(null);
    setTimeout(() => inputRef.current?.click(), 50);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) {
      setStep(null);
      return;
    }

    if (step === "dark") {
      setDarkFile(file);
      setStep("light");
      toast.info("Now select the LIGHT version of this design");
      setTimeout(() => inputRef.current?.click(), 100);
    } else if (step === "light" && darkFile) {
      onAdd({ dark: darkFile, light: file });
      setStep(null);
      setDarkFile(null);
    }
  };

  return (
    <>
      <input
        ref={(el) => {
          inputRef.current = el;
          addInputRef(el);
        }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={handleClick}
        disabled={isBusy}
        className="flex items-center gap-2 px-3 py-2 bg-primary text-black text-xs font-display uppercase tracking-widest font-bold disabled:opacity-60 min-h-[40px]"
      >
        {isBusy ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : collectionKey === "front_logo" && designs.length > 0 ? (
          <Pencil className="w-3 h-3" />
        ) : (
          <Plus className="w-3 h-3" />
        )}
        {step === "light"
          ? "Select Light…"
          : step === "dark"
          ? "Select Dark…"
          : collectionKey === "front_logo" && designs.length > 0
          ? "Replace"
          : "Add"}
      </button>
    </>
  );
}
