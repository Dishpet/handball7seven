import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState } from "react";
import { Plus, Trash2, Edit2, X, Save, Check } from "lucide-react";
import { toast } from "sonner";
import {
  useStoreSizes, useUpsertStoreSize, useDeleteStoreSize,
  useStoreColors, useUpsertStoreColor, useDeleteStoreColor,
  useCollectionSizes, useCollectionColors,
  useSetCollectionSizes, useSetCollectionColors,
  StoreSize, StoreColor,
} from "@/hooks/useStoreCatalog";
import { useCollections, DbCollection } from "@/hooks/useCollections";
import { useStoreSettings, useUpdateStoreSetting } from "@/hooks/useStoreSettings";

// ── Sizes Section ──
function SizesSection() {
  const { data: sizes, isLoading } = useStoreSizes();
  const upsert = useUpsertStoreSize();
  const del = useDeleteStoreSize();
  const [editing, setEditing] = useState<Partial<StoreSize> | null>(null);

  const handleSave = async () => {
    if (!editing?.name?.trim()) return toast.error('Name required');
    try {
      await upsert.mutateAsync({
        ...editing,
        name: editing.name.trim(),
        sort_order: editing.sort_order ?? (sizes?.length ?? 0) + 1,
      } as any);
      toast.success('Size saved');
      setEditing(null);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="bg-black border border-white/10 p-4 sm:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-display uppercase tracking-widest font-bold text-white">Sizes</h3>
        <button onClick={() => setEditing({ name: '', sort_order: (sizes?.length ?? 0) + 1 })}
          className="bg-primary text-black flex items-center gap-2 font-display uppercase tracking-widest font-bold px-4 py-2 text-xs min-h-[40px]">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {editing && (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3">
          <input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })}
            placeholder="Size name" className="flex-1 bg-transparent border border-white/10 text-white p-2 focus:outline-none focus:border-primary min-h-[40px]" />
          <input type="number" value={editing.sort_order ?? 0} onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) })}
            className="w-20 bg-transparent border border-white/10 text-white p-2 focus:outline-none focus:border-primary min-h-[40px]" placeholder="Order" />
          <button onClick={handleSave} disabled={upsert.isPending} className="p-2 text-primary hover:bg-primary/10 min-h-[40px] min-w-[40px] flex items-center justify-center">
            <Save className="w-4 h-4" />
          </button>
          <button onClick={() => setEditing(null)} className="p-2 text-white/50 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLoading ? <p className="text-white/50 text-sm">Loading...</p> : (
        <div className="flex flex-wrap gap-2">
          {sizes?.map(s => (
            <div key={s.id} className="group flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 text-sm text-white">
              <span>{s.name}</span>
              <button onClick={() => setEditing(s)} className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-white transition-opacity">
                <Edit2 className="w-3 h-3" />
              </button>
              <button onClick={async () => { if (confirm(`Delete "${s.name}"?`)) { try { await del.mutateAsync(s.id); toast.success('Deleted'); } catch (e: any) { toast.error(e.message); } } }}
                className="opacity-0 group-hover:opacity-100 text-destructive/50 hover:text-destructive transition-opacity">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Colors Section ──
function ColorsSection() {
  const { data: colors, isLoading } = useStoreColors();
  const upsert = useUpsertStoreColor();
  const del = useDeleteStoreColor();
  const [editing, setEditing] = useState<Partial<StoreColor> | null>(null);

  const handleSave = async () => {
    if (!editing?.name?.trim()) return toast.error('Name required');
    try {
      await upsert.mutateAsync({
        ...editing,
        name: editing.name.trim(),
        hex: editing.hex || '#000000',
        sort_order: editing.sort_order ?? (colors?.length ?? 0) + 1,
      } as any);
      toast.success('Color saved');
      setEditing(null);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="bg-black border border-white/10 p-4 sm:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-display uppercase tracking-widest font-bold text-white">Colors</h3>
        <button onClick={() => setEditing({ name: '', hex: '#000000', sort_order: (colors?.length ?? 0) + 1 })}
          className="bg-primary text-black flex items-center gap-2 font-display uppercase tracking-widest font-bold px-4 py-2 text-xs min-h-[40px]">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {editing && (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3">
          <input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })}
            placeholder="Color name" className="flex-1 bg-transparent border border-white/10 text-white p-2 focus:outline-none focus:border-primary min-h-[40px]" />
          <input type="color" value={editing.hex || '#000000'} onChange={e => setEditing({ ...editing, hex: e.target.value })}
            className="w-12 h-10 bg-transparent border border-white/10 cursor-pointer" />
          <input type="number" value={editing.sort_order ?? 0} onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) })}
            className="w-20 bg-transparent border border-white/10 text-white p-2 focus:outline-none focus:border-primary min-h-[40px]" placeholder="Order" />
          <button onClick={handleSave} disabled={upsert.isPending} className="p-2 text-primary hover:bg-primary/10 min-h-[40px] min-w-[40px] flex items-center justify-center">
            <Save className="w-4 h-4" />
          </button>
          <button onClick={() => setEditing(null)} className="p-2 text-white/50 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLoading ? <p className="text-white/50 text-sm">Loading...</p> : (
        <div className="flex flex-wrap gap-2">
          {colors?.map(c => (
            <div key={c.id} className="group flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 text-sm text-white">
              <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
              <span>{c.name}</span>
              <button onClick={() => setEditing(c)} className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-white transition-opacity">
                <Edit2 className="w-3 h-3" />
              </button>
              <button onClick={async () => { if (confirm(`Delete "${c.name}"?`)) { try { await del.mutateAsync(c.id); toast.success('Deleted'); } catch (e: any) { toast.error(e.message); } } }}
                className="opacity-0 group-hover:opacity-100 text-destructive/50 hover:text-destructive transition-opacity">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Collection Config Section ──
function CollectionConfig({ collection }: { collection: DbCollection }) {
  const { data: allSizes } = useStoreSizes();
  const { data: allColors } = useStoreColors();
  const { data: activeSizeIds } = useCollectionSizes(collection.id);
  const { data: activeColorIds } = useCollectionColors(collection.id);
  const setSizes = useSetCollectionSizes();
  const setColors = useSetCollectionColors();
  const [expanded, setExpanded] = useState(false);

  const toggleSize = (sizeId: string) => {
    const current = activeSizeIds || [];
    const next = current.includes(sizeId) ? current.filter(id => id !== sizeId) : [...current, sizeId];
    setSizes.mutate({ collectionId: collection.id, sizeIds: next }, {
      onSuccess: () => toast.success('Collection sizes updated'),
      onError: (e: any) => toast.error(e.message),
    });
  };

  const toggleColor = (colorId: string) => {
    const current = activeColorIds || [];
    const next = current.includes(colorId) ? current.filter(id => id !== colorId) : [...current, colorId];
    setColors.mutate({ collectionId: collection.id, colorIds: next }, {
      onSuccess: () => toast.success('Collection colors updated'),
      onError: (e: any) => toast.error(e.message),
    });
  };

  return (
    <div className="bg-white/5 border border-white/10">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <span className="font-display uppercase tracking-widest text-sm font-bold text-white">{collection.name}</span>
        <span className="text-white/50 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
          <div>
            <p className="text-white/50 text-xs font-display uppercase tracking-widest mb-2">Available Sizes</p>
            <div className="flex flex-wrap gap-2">
              {allSizes?.map(s => {
                const active = activeSizeIds?.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleSize(s.id)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest border transition-colors ${
                      active ? 'bg-primary text-black border-primary' : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'
                    }`}>
                    {active && <Check className="w-3 h-3 inline mr-1" />}{s.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-white/50 text-xs font-display uppercase tracking-widest mb-2">Available Colors</p>
            <div className="flex flex-wrap gap-2">
              {allColors?.map(c => {
                const active = activeColorIds?.includes(c.id);
                return (
                  <button key={c.id} onClick={() => toggleColor(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest border transition-colors ${
                      active ? 'bg-primary text-black border-primary' : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'
                    }`}>
                    <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                    {active && <Check className="w-3 h-3 inline" />}{c.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollectionsSection() {
  const { data: collections, isLoading } = useCollections(false);
  // Filter out "front-logo" / "front_logo" collection — it has separate logic
  const filtered = collections?.filter(c => !c.slug.includes('front-logo') && !c.slug.includes('front_logo') && !c.slug.includes('frontlogo'));

  return (
    <div className="bg-black border border-white/10 p-4 sm:p-6 space-y-4">
      <h3 className="text-lg font-display uppercase tracking-widest font-bold text-white">Collection Settings</h3>
      <p className="text-white/50 text-sm">Configure which sizes and colors are available for each collection.</p>
      {isLoading ? <p className="text-white/50 text-sm">Loading...</p> : (
        <div className="space-y-2">
          {filtered?.map(c => <CollectionConfig key={c.id} collection={c} />)}
        </div>
      )}
    </div>
  );
}

// ── Shipping Settings Section ──
function ShippingSection() {
  const { data: settings, isLoading } = useStoreSettings();
  const updateSetting = useUpdateStoreSetting();

  const [croatia, setCroatia] = useState<string>('');
  const [intl, setIntl] = useState<string>('');
  const [freeThresholdCroatia, setFreeThresholdCroatia] = useState<string>('');
  const [freeThresholdIntl, setFreeThresholdIntl] = useState<string>('');
  const [initialized, setInitialized] = useState(false);

  if (!initialized && settings && !isLoading) {
    setCroatia(String(settings.shipping_rate_croatia ?? '5'));
    setIntl(String(settings.shipping_rate_international ?? '15'));
    setFreeThresholdCroatia(String(settings.free_shipping_threshold_croatia ?? settings.free_shipping_threshold ?? '100'));
    setFreeThresholdIntl(String(settings.free_shipping_threshold_international ?? settings.free_shipping_threshold ?? '200'));
    setInitialized(true);
  }

  const handleSave = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'shipping_rate_croatia', value: Number(croatia) }),
        updateSetting.mutateAsync({ key: 'shipping_rate_international', value: Number(intl) }),
        updateSetting.mutateAsync({ key: 'free_shipping_threshold_croatia', value: Number(freeThresholdCroatia) }),
        updateSetting.mutateAsync({ key: 'free_shipping_threshold_international', value: Number(freeThresholdIntl) }),
      ]);
      toast.success('Shipping settings saved');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="bg-black border border-white/10 p-4 sm:p-6 space-y-4">
      <h3 className="text-lg font-display uppercase tracking-widest font-bold text-white">Shipping Rates</h3>
      <p className="text-white/50 text-sm">Configure shipping rates and free shipping thresholds for Croatia and international orders.</p>

      {isLoading ? <p className="text-white/50 text-sm">Loading...</p> : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-white/70 text-sm w-48">🇭🇷 Croatia shipping (€)</label>
            <input type="number" step="0.01" min="0" value={croatia} onChange={e => setCroatia(e.target.value)}
              className="flex-1 bg-transparent border border-white/10 text-white p-2 focus:outline-none focus:border-primary min-h-[40px]" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-white/70 text-sm w-48">🇭🇷 Free shipping above (€)</label>
            <input type="number" step="0.01" min="0" value={freeThresholdCroatia} onChange={e => setFreeThresholdCroatia(e.target.value)}
              className="flex-1 bg-transparent border border-white/10 text-white p-2 focus:outline-none focus:border-primary min-h-[40px]" />
          </div>
          <hr className="border-white/10 my-2" />
          <div className="flex items-center gap-3">
            <label className="text-white/70 text-sm w-48">🌍 International shipping (€)</label>
            <input type="number" step="0.01" min="0" value={intl} onChange={e => setIntl(e.target.value)}
              className="flex-1 bg-transparent border border-white/10 text-white p-2 focus:outline-none focus:border-primary min-h-[40px]" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-white/70 text-sm w-48">🌍 Free shipping above (€)</label>
            <input type="number" step="0.01" min="0" value={freeThresholdIntl} onChange={e => setFreeThresholdIntl(e.target.value)}
              className="flex-1 bg-transparent border border-white/10 text-white p-2 focus:outline-none focus:border-primary min-h-[40px]" />
          </div>
          <button onClick={handleSave} disabled={updateSetting.isPending}
            className="bg-primary text-black flex items-center gap-2 font-display uppercase tracking-widest font-bold px-4 py-2 text-xs min-h-[40px]">
            <Save className="w-4 h-4" /> Save Shipping Settings
          </button>
        </div>
      )}
    </div>
  );
}

export default function StoreSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display uppercase tracking-widest font-black text-white">Store Settings</h2>
          <p className="text-white/60 font-body text-sm mt-1">Manage available sizes, colors, collection configurations, and shipping</p>
        </div>
        <ShippingSection />
        <SizesSection />
        <ColorsSection />
        <CollectionsSection />
      </div>
    </AdminLayout>
  );
}
