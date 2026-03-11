import { AdminLayout } from "@/components/admin/AdminLayout";
import { Eye, EyeOff } from "lucide-react";
import { useState, useMemo } from "react";

// Import design collections using glob
const streetDesigns = import.meta.glob('/src/assets/design-collections/street/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const vintageDesigns = import.meta.glob('/src/assets/design-collections/vintage/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const logoDesigns = import.meta.glob('/src/assets/design-collections/logo/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const classicDesigns = import.meta.glob('/src/assets/design-collections/classic/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const kidsDesigns = import.meta.glob('/src/assets/design-collections/kids/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const colorCodedDesigns = import.meta.glob('/src/assets/design-collections/color-coded-logo/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

interface DesignCollection {
  id: string;
  name: string;
  designs: { path: string; url: string; filename: string }[];
}

const processGlob = (glob: Record<string, string>) =>
  Object.entries(glob).map(([path, url]) => ({
    path,
    url,
    filename: path.split('/').pop() || '',
  })).sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));

export default function Designs() {
  const collections = useMemo<DesignCollection[]>(() => [
    { id: 'vintage', name: 'VINTAGE', designs: processGlob(vintageDesigns) },
    { id: 'kids', name: 'KIDS', designs: processGlob(kidsDesigns) },
    { id: 'classic', name: 'CLASSIC', designs: processGlob(classicDesigns) },
    { id: 'logo', name: 'FRONT LOGO', designs: processGlob(logoDesigns) },
    { id: 'street', name: 'STREET', designs: processGlob(streetDesigns) },
    { id: 'color-coded', name: 'COLOR-CODED LOGO', designs: processGlob(colorCodedDesigns) },
  ].filter(c => c.designs.length > 0), []);

  const [expandedId, setExpandedId] = useState<string | null>(collections[0]?.id || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-display uppercase tracking-widest font-black text-white">Design Management</h2>
          <p className="text-white/60 font-body mt-1">View flat PNG designs used in the 3D configurator</p>
        </div>

        {/* Preview Modal */}
        {previewUrl && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
            <img src={previewUrl} alt="Design preview" className="max-w-full max-h-[80vh] object-contain" />
          </div>
        )}

        {/* Collections */}
        <div className="space-y-4">
          {collections.map(col => (
            <div key={col.id} className="bg-black border border-white/10">
              <button
                onClick={() => setExpandedId(expandedId === col.id ? null : col.id)}
                className="w-full flex justify-between items-center p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-display uppercase tracking-widest text-primary font-bold">{col.name}</h3>
                  <span className="text-white/40 text-sm font-body">{col.designs.length} designs</span>
                </div>
                <span className="text-white/50 text-xl">{expandedId === col.id ? '−' : '+'}</span>
              </button>

              {expandedId === col.id && (
                <div className="p-4 border-t border-white/10">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {col.designs.map(design => (
                      <button
                        key={design.path}
                        onClick={() => setPreviewUrl(design.url)}
                        className="group relative aspect-square bg-white/5 border border-white/10 hover:border-primary/50 transition-all overflow-hidden"
                      >
                        <img src={design.url} alt={design.filename} className="w-full h-full object-contain p-1" />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-white/60 text-[9px] px-1 py-0.5 truncate font-body">
                          {design.filename}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
