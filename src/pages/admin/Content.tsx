import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState, useEffect, useRef } from "react";
import { Save, ChevronDown, ChevronRight, Languages, Loader2, Upload, X, ImageIcon, Download } from "lucide-react";
import { useSiteContent, useUpdateSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "textarea" | "image";
  i18n: boolean;
};

const SECTIONS: { key: string; label: string; fields: FieldConfig[] }[] = [
  {
    key: "hero",
    label: "Hero Banner",
    fields: [
      { name: "bg_image", label: "Background Image", type: "image", i18n: false },
      { name: "subtitle", label: "Subtitle", type: "text", i18n: true },
      { name: "slogan", label: "Main Slogan", type: "text", i18n: true },
      { name: "shop_button", label: "Shop Button Text", type: "text", i18n: true },
      { name: "explore_button", label: "Explore Button Text", type: "text", i18n: true },
    ],
  },
  {
    key: "brand",
    label: "Brand Story Section",
    fields: [
      { name: "title", label: "Title", type: "text", i18n: true },
      { name: "text", label: "Body Text", type: "textarea", i18n: true },
      { name: "cta", label: "CTA Button Text", type: "text", i18n: true },
    ],
  },
  {
    key: "lifestyle",
    label: "Lifestyle Banner",
    fields: [
      { name: "bg_image", label: "Background Image", type: "image", i18n: false },
      { name: "headline", label: "Headline", type: "text", i18n: true },
      { name: "sub", label: "Subheadline", type: "text", i18n: true },
    ],
  },
  {
    key: "newsletter",
    label: "Newsletter Section",
    fields: [
      { name: "title", label: "Title", type: "text", i18n: true },
      { name: "sub", label: "Description", type: "textarea", i18n: true },
      { name: "placeholder", label: "Input Placeholder", type: "text", i18n: true },
      { name: "button", label: "Button Text", type: "text", i18n: true },
    ],
  },
  {
    key: "bestsellers",
    label: "Best Sellers Section",
    fields: [
      { name: "title", label: "Section Title", type: "text", i18n: true },
    ],
  },
  {
    key: "collections_page",
    label: "Collections Page",
    fields: [
      { name: "title", label: "Page Title", type: "text", i18n: true },
    ],
  },
  {
    key: "about",
    label: "About Page",
    fields: [
      { name: "main_image", label: "Main Image", type: "image", i18n: false },
      { name: "banner_image", label: "Bottom Banner Image", type: "image", i18n: false },
      { name: "title", label: "Page Title", type: "text", i18n: true },
      { name: "p1", label: "Paragraph 1", type: "textarea", i18n: true },
      { name: "p2", label: "Paragraph 2", type: "textarea", i18n: true },
      { name: "p3", label: "Paragraph 3", type: "textarea", i18n: true },
    ],
  },
  {
    key: "contact",
    label: "Contact Page",
    fields: [
      { name: "title", label: "Page Title", type: "text", i18n: true },
      { name: "info", label: "Info Text", type: "textarea", i18n: true },
      { name: "email", label: "Contact Email", type: "text", i18n: false },
      { name: "phone", label: "Phone Number", type: "text", i18n: false },
      { name: "address", label: "Address", type: "text", i18n: false },
    ],
  },
  {
    key: "footer",
    label: "Footer",
    fields: [
      { name: "tagline", label: "Tagline", type: "text", i18n: true },
    ],
  },
  {
    key: "socials",
    label: "Social Media Links",
    fields: [
      { name: "instagram", label: "Instagram URL", type: "text", i18n: false },
      { name: "whatsapp", label: "WhatsApp Number", type: "text", i18n: false },
      { name: "facebook", label: "Facebook URL", type: "text", i18n: false },
      { name: "tiktok", label: "TikTok URL", type: "text", i18n: false },
      { name: "youtube", label: "YouTube URL", type: "text", i18n: false },
    ],
  },
  {
    key: "handball_elements",
    label: "Seven Elements of Handball",
    fields: [
      { name: "section_title", label: "Section Title", type: "text", i18n: false },
      { name: "closing_line_1", label: "Closing Line 1", type: "text", i18n: false },
      { name: "closing_line_2", label: "Closing Line 2", type: "text", i18n: false },
    ],
  },
  {
    key: "features_bar",
    label: "Features Bar (Footer Strip)",
    fields: [],
  },
];

type ContentData = Record<string, any>;

// Image upload component
function ImageUploadField({ value, onChange, sectionKey, fieldName }: {
  value: string;
  onChange: (url: string) => void;
  sectionKey: string;
  fieldName: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${sectionKey}/${fieldName}.${ext}`;

      // Delete old file if exists (ignore errors)
      await supabase.storage.from("cms-images").remove([path]);

      const { error } = await supabase.storage.from("cms-images").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (error) throw error;

      const { data: urlData } = supabase.storage.from("cms-images").getPublicUrl(path);
      // Add cache-buster
      onChange(urlData.publicUrl + "?t=" + Date.now());
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDownload = async () => {
    if (!value) return;
    try {
      const response = await fetch(value);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sectionKey}-${fieldName}.${blob.type.split("/")[1] || "jpg"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Preview" className="h-32 object-cover border border-white/10" />
          <button
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 hover:bg-destructive/90"
            title="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="h-32 w-48 border border-dashed border-white/20 flex items-center justify-center text-white/30">
          <ImageIcon className="w-8 h-8" />
        </div>
      )}
      <div className="flex gap-2">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white/70 text-xs font-display uppercase tracking-widest hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {uploading ? "Uploading..." : value ? "Replace" : "Upload"}
        </button>
        {value && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white/70 text-xs font-display uppercase tracking-widest hover:bg-white/5 transition-colors"
          >
            <Download className="w-3 h-3" /> Download
          </button>
        )}
      </div>
    </div>
  );
}

export default function Content() {
  const { data: allContent, isLoading } = useSiteContent();
  const updateContent = useUpdateSiteContent();
  const [contentMap, setContentMap] = useState<Record<string, ContentData>>({});
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["hero"]));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Array.isArray(allContent)) {
      const map: Record<string, ContentData> = {};
      allContent.forEach((item: any) => {
        map[item.key] = typeof item.value === "object" && item.value !== null ? item.value : {};
      });
      setContentMap(map);
    }
  }, [allContent]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const updateField = (sectionKey: string, fieldName: string, value: string, isI18n: boolean) => {
    setContentMap((prev) => {
      const section = { ...(prev[sectionKey] || {}) };
      if (isI18n) {
        const existing = typeof section[fieldName] === "object" ? section[fieldName] : {};
        section[fieldName] = { ...existing, hr: value };
      } else {
        section[fieldName] = value;
      }
      return { ...prev, [sectionKey]: section };
    });
  };

  const getFieldValue = (sectionKey: string, fieldName: string, isI18n: boolean): string => {
    const section = contentMap[sectionKey];
    if (!section) return "";
    if (isI18n) {
      const val = section[fieldName];
      if (typeof val === "object" && val !== null) return val.hr || "";
      return "";
    }
    return section[fieldName] || "";
  };

  const getFeaturesBar = () => {
    const fb = contentMap["features_bar"];
    if (!fb?.items || !Array.isArray(fb.items)) return [];
    return fb.items;
  };

  const getHandballElements = () => {
    const he = contentMap["handball_elements"];
    if (!he?.elements || !Array.isArray(he.elements)) {
      // Return defaults
      return [
        { title: "Fast Break", line1: "Speed changes everything.", line2: "The game can turn in seconds." },
        { title: "The Shot", line1: "Power. Precision. Instinct.", line2: "Every attack ends with a moment that decides it all." },
        { title: "The Save", line1: "One reaction. One movement.", line2: "Goalkeepers change the course of the game." },
        { title: "Defense", line1: "The heart of the game.", line2: "Every attack begins with a wall that refuses to break." },
        { title: "Contact", line1: "Handball is built on physical battles.", line2: "Strength, balance and courage decide every duel." },
        { title: "The System", line1: "Seven players. One structure.", line2: "Every role matters." },
        { title: "The Pass", line1: "The game moves faster than any player.", line2: "The ball decides everything." },
      ];
    }
    return he.elements;
  };

  const updateHandballElement = (index: number, field: "title" | "line1" | "line2", value: string) => {
    setContentMap((prev) => {
      const he = { ...(prev["handball_elements"] || {}) };
      const elements = [...(he.elements || getHandballElements())];
      elements[index] = { ...elements[index], [field]: value };
      he.elements = elements;
      return { ...prev, handball_elements: he };
    });
  };

  const updateFeatureItem = (index: number, field: "icon" | "label", value: string) => {
    setContentMap((prev) => {
      const fb = { ...(prev["features_bar"] || {}) };
      const items = [...(fb.items || [])];
      items[index] = { ...items[index] };
      if (field === "icon") {
        items[index].icon = value;
      } else {
        const existing = typeof items[index].label === "object" ? items[index].label : {};
        items[index].label = { ...existing, hr: value };
      }
      fb.items = items;
      return { ...prev, features_bar: fb };
    });
  };

  const collectI18nTexts = (sectionKey: string): Record<string, string> => {
    const section = contentMap[sectionKey];
    if (!section) return {};
    const sectionConfig = SECTIONS.find(s => s.key === sectionKey);
    if (!sectionConfig) return {};
    
    const texts: Record<string, string> = {};
    for (const field of sectionConfig.fields) {
      if (field.i18n) {
        const val = section[field.name];
        if (typeof val === "object" && val?.hr) {
          texts[field.name] = val.hr;
        }
      }
    }

    if (sectionKey === "features_bar" && section.items) {
      section.items.forEach((item: any, idx: number) => {
        if (typeof item.label === "object" && item.label?.hr) {
          texts[`item_${idx}_label`] = item.label.hr;
        }
      });
    }

    return texts;
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const allTexts: Record<string, string> = {};
      for (const section of SECTIONS) {
        const texts = collectI18nTexts(section.key);
        for (const [fieldName, value] of Object.entries(texts)) {
          allTexts[`${section.key}__${fieldName}`] = value;
        }
      }

      const finalMap: Record<string, ContentData> = JSON.parse(JSON.stringify(contentMap));

      if (Object.keys(allTexts).length > 0) {
        toast.info("Translating to English and German...");
        
        const { data: translateData, error: fnError } = await supabase.functions.invoke("translate", {
          body: { texts: allTexts, sourceLang: "hr", targetLangs: ["en", "de"] },
        });
        
        if (fnError) throw new Error(`Translation failed: ${fnError.message}`);
        if (translateData?.error) throw new Error(`Translation failed: ${translateData.error}`);

        const translations = translateData?.translations || {};
        
        for (const [uniqueKey, trans] of Object.entries(translations) as [string, { en: string; de: string }][]) {
          const [sectionKey, ...fieldParts] = uniqueKey.split("__");
          const fieldName = fieldParts.join("__");
          const section = finalMap[sectionKey] || {};

          if (fieldName.startsWith("item_") && fieldName.endsWith("_label")) {
            const idx = parseInt(fieldName.split("_")[1]);
            if (section.items && section.items[idx]) {
              const existing = typeof section.items[idx].label === "object" ? section.items[idx].label : {};
              section.items[idx] = { ...section.items[idx], label: { ...existing, en: trans.en, de: trans.de } };
            }
          } else {
            const existing = typeof section[fieldName] === "object" ? section[fieldName] : {};
            section[fieldName] = { ...existing, en: trans.en, de: trans.de };
          }
          
          finalMap[sectionKey] = section;
        }
      }

      for (const [key, value] of Object.entries(finalMap)) {
        await updateContent.mutateAsync({ key, value });
      }
      
      toast.success("All content saved with translations!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display uppercase tracking-widest font-black text-white">Content</h2>
            <p className="text-white/60 font-body text-sm mt-1">Edit in Croatian — auto-translates to EN/DE on save</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-white/10 text-white/50 text-xs font-display uppercase tracking-widest">
              <Languages className="w-3 h-3" />
              Editing: HR
            </div>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-primary text-black flex items-center justify-center gap-2 font-display uppercase tracking-widest font-bold px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm min-h-[44px]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Translating..." : "Save All"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-white/50 font-display uppercase tracking-widest">Loading content...</div>
        ) : (
          <div className="space-y-2 max-w-5xl">
            {SECTIONS.map((section) => {
              const isOpen = openSections.has(section.key);
              return (
                <div key={section.key} className="bg-black border border-white/10">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
                  >
                    <h3 className="text-lg font-display uppercase tracking-widest font-bold text-white">{section.label}</h3>
                    {isOpen ? <ChevronDown className="w-5 h-5 text-white/50" /> : <ChevronRight className="w-5 h-5 text-white/50" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                      {section.fields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-2">
                            {field.label}
                            {field.i18n && (
                              <span className="ml-2 text-primary/60">(HR — auto-translates to EN/DE)</span>
                            )}
                          </label>

                          {field.type === "image" ? (
                            <ImageUploadField
                              value={getFieldValue(section.key, field.name, false)}
                              onChange={(url) => updateField(section.key, field.name, url, false)}
                              sectionKey={section.key}
                              fieldName={field.name}
                            />
                          ) : field.type === "textarea" ? (
                            <textarea
                              value={getFieldValue(section.key, field.name, field.i18n)}
                              onChange={(e) => updateField(section.key, field.name, e.target.value, field.i18n)}
                              rows={4}
                              className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors resize-none font-body text-sm"
                            />
                          ) : (
                            <input
                              type="text"
                              value={getFieldValue(section.key, field.name, field.i18n)}
                              onChange={(e) => updateField(section.key, field.name, e.target.value, field.i18n)}
                              className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors font-body text-sm"
                            />
                          )}
                        </div>
                      ))}

                      {section.key === "features_bar" && (
                        <div className="space-y-4">
                          {getFeaturesBar().map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-3 items-start">
                              <div className="w-20">
                                <label className="block text-white/50 text-[10px] font-display uppercase tracking-widest mb-1">Icon</label>
                                <input
                                  type="text"
                                  value={item.icon || ""}
                                  onChange={(e) => updateFeatureItem(idx, "icon", e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 text-white p-2 text-center text-lg focus:outline-none focus:border-primary transition-colors"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-white/50 text-[10px] font-display uppercase tracking-widest mb-1">
                                  Label <span className="text-primary/60">(HR)</span>
                                </label>
                                <input
                                  type="text"
                                  value={(typeof item.label === "object" ? item.label.hr : item.label) || ""}
                                  onChange={(e) => updateFeatureItem(idx, "label", e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary transition-colors font-body text-sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.key === "handball_elements" && (
                        <div className="space-y-4">
                          <p className="text-white/40 text-xs font-display uppercase tracking-widest">7 Elements (title + 2 lines each)</p>
                          {getHandballElements().map((el: any, idx: number) => (
                            <div key={idx} className="border border-white/10 p-4 space-y-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-primary/40 font-display text-lg font-bold">{idx + 1}</span>
                              </div>
                              <div>
                                <label className="block text-white/50 text-[10px] font-display uppercase tracking-widest mb-1">Title</label>
                                <input
                                  type="text"
                                  value={el.title || ""}
                                  onChange={(e) => updateHandballElement(idx, "title", e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary transition-colors font-body text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-white/50 text-[10px] font-display uppercase tracking-widest mb-1">Line 1</label>
                                <input
                                  type="text"
                                  value={el.line1 || ""}
                                  onChange={(e) => updateHandballElement(idx, "line1", e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary transition-colors font-body text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-white/50 text-[10px] font-display uppercase tracking-widest mb-1">Line 2</label>
                                <input
                                  type="text"
                                  value={el.line2 || ""}
                                  onChange={(e) => updateHandballElement(idx, "line2", e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary transition-colors font-body text-sm"
                                />
                              </div>
                            </div>
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
