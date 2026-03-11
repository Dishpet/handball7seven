import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState, useEffect } from "react";
import { Save, Globe, ChevronDown, ChevronRight } from "lucide-react";
import { useSiteContent, useUpdateSiteContent } from "@/hooks/useSiteContent";
import { toast } from "sonner";
import type { Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "hr", label: "Hrvatski" },
];

// Content sections config — maps DB keys to form fields
const SECTIONS = [
  {
    key: "hero",
    label: "Hero Banner",
    fields: [
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
      { name: "facebook", label: "Facebook URL", type: "text", i18n: false },
      { name: "tiktok", label: "TikTok URL", type: "text", i18n: false },
      { name: "youtube", label: "YouTube URL", type: "text", i18n: false },
    ],
  },
  {
    key: "features_bar",
    label: "Features Bar (Footer Strip)",
    fields: [], // special handling
  },
];

type ContentData = Record<string, any>;

export default function Content() {
  const { data: allContent, isLoading } = useSiteContent();
  const updateContent = useUpdateSiteContent();
  const [contentMap, setContentMap] = useState<Record<string, ContentData>>({});
  const [activeLang, setActiveLang] = useState<Lang>("en");
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["hero"]));
  const [saving, setSaving] = useState(false);

  // Load from DB
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
        section[fieldName] = { ...existing, [activeLang]: value };
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
      if (typeof val === "object" && val !== null) return val[activeLang] || "";
      return "";
    }
    return section[fieldName] || "";
  };

  // Features bar special handling
  const getFeaturesBar = () => {
    const fb = contentMap["features_bar"];
    if (!fb?.items || !Array.isArray(fb.items)) return [];
    return fb.items;
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
        items[index].label = { ...existing, [activeLang]: value };
      }
      fb.items = items;
      return { ...prev, features_bar: fb };
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(contentMap)) {
        await updateContent.mutateAsync({ key, value });
      }
      toast.success("All content saved!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display uppercase tracking-widest font-black text-white">Content Manager</h2>
            <p className="text-white/60 font-body mt-1">Edit all frontend text, contact info, and social links</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Tabs */}
            <div className="flex border border-white/10">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setActiveLang(l.code)}
                  className={`px-4 py-2 text-xs font-display uppercase tracking-widest transition-colors ${
                    activeLang === l.code ? "bg-primary text-black font-bold" : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Globe className="w-3 h-3 inline mr-1" />
                  {l.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-primary text-black flex items-center gap-2 font-display uppercase tracking-widest font-bold px-6 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save All"}
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
                      {/* Regular fields */}
                      {section.fields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-2">
                            {field.label}
                            {field.i18n && (
                              <span className="ml-2 text-primary/60">({activeLang.toUpperCase()})</span>
                            )}
                          </label>
                          {field.type === "textarea" ? (
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

                      {/* Special: Features Bar */}
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
                                  Label <span className="text-primary/60">({activeLang.toUpperCase()})</span>
                                </label>
                                <input
                                  type="text"
                                  value={(typeof item.label === "object" ? item.label[activeLang] : item.label) || ""}
                                  onChange={(e) => updateFeatureItem(idx, "label", e.target.value)}
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
