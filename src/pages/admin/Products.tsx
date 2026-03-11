import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState } from "react";
import { Search, Edit2, Check, X, Save, Plus, Trash2 } from "lucide-react";
import { useProducts, useUpsertProduct, useDeleteProduct, DbProduct } from "@/hooks/useProducts";
import { useCollections } from "@/hooks/useCollections";
import { Product3DThumbnail } from "@/components/Product3DCard";
import { toast } from "sonner";

type ProductForm = Partial<DbProduct> & { sizesStr?: string; colorsStr?: string };

// Product edit modal extracted
const ProductEditModal = ({ editing, setEditing, collections, onSave, isPending }: {
  editing: ProductForm;
  setEditing: (v: ProductForm | null) => void;
  collections: any[] | undefined;
  onSave: () => void;
  isPending: boolean;
}) => (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={() => setEditing(null)}>
    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 my-auto" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg sm:text-xl font-display uppercase tracking-widest text-white font-bold">{editing.id ? 'Edit Product' : 'New Product'}</h3>
        <button onClick={() => setEditing(null)} className="text-white/50 hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-body">
        {[
          { label: 'Name', key: 'name', type: 'text' },
          { label: 'Slug', key: 'slug', type: 'text' },
          { label: 'Price (€)', key: 'price', type: 'number' },
        ].map(field => (
          <div key={field.key}>
            <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">{field.label}</label>
            <input type={field.type} step={field.type === 'number' ? '0.01' : undefined}
              value={(editing as any)[field.key] || (field.type === 'number' ? 0 : '')}
              onChange={e => setEditing({ ...editing, [field.key]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white p-2.5 focus:outline-none focus:border-primary min-h-[44px]" />
          </div>
        ))}
        <div>
          <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Collection</label>
          <select value={editing.collection || 'classic'} onChange={e => setEditing({ ...editing, collection: e.target.value })}
            className="w-full bg-white/5 border border-white/10 text-white p-2.5 focus:outline-none focus:border-primary min-h-[44px]">
            {collections?.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            {!collections?.length && <option value="classic">Classic</option>}
          </select>
        </div>
        <div>
          <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Badge</label>
          <select value={editing.badge || ''} onChange={e => setEditing({ ...editing, badge: e.target.value || null })}
            className="w-full bg-white/5 border border-white/10 text-white p-2.5 focus:outline-none focus:border-primary min-h-[44px]">
            <option value="">None</option>
            <option value="new">New</option>
            <option value="bestseller">Bestseller</option>
            <option value="vintage">Vintage</option>
          </select>
        </div>
        <div>
          <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Stock Qty</label>
          <input type="number" value={editing.stock_quantity || 0} onChange={e => setEditing({ ...editing, stock_quantity: parseInt(e.target.value) })}
            className="w-full bg-white/5 border border-white/10 text-white p-2.5 focus:outline-none focus:border-primary min-h-[44px]" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Sizes (comma-separated)</label>
          <input value={editing.sizesStr || ''} onChange={e => setEditing({ ...editing, sizesStr: e.target.value })}
            className="w-full bg-white/5 border border-white/10 text-white p-2.5 focus:outline-none focus:border-primary min-h-[44px]" placeholder="S, M, L, XL" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Colors (comma-separated)</label>
          <input value={editing.colorsStr || ''} onChange={e => setEditing({ ...editing, colorsStr: e.target.value })}
            className="w-full bg-white/5 border border-white/10 text-white p-2.5 focus:outline-none focus:border-primary min-h-[44px]" placeholder="Black, White" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">3D Model URL</label>
          <input value={editing.image_url || ''} onChange={e => setEditing({ ...editing, image_url: e.target.value })}
            className="w-full bg-white/5 border border-white/10 text-white p-2.5 focus:outline-none focus:border-primary min-h-[44px]" placeholder="/models/product.glb" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Description</label>
          <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3}
            className="w-full bg-white/5 border border-white/10 text-white p-2.5 focus:outline-none focus:border-primary resize-none" />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-white/50 text-xs font-display uppercase tracking-widest">Visible</label>
          <input type="checkbox" checked={editing.is_visible !== false} onChange={e => setEditing({ ...editing, is_visible: e.target.checked })} className="w-5 h-5" />
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
        <button onClick={() => setEditing(null)} className="px-4 py-2.5 text-white/50 hover:text-white font-display uppercase tracking-widest text-sm min-h-[44px]">Cancel</button>
        <button onClick={onSave} disabled={isPending} className="bg-primary text-black flex items-center justify-center gap-2 font-display uppercase tracking-widest font-bold px-6 py-2.5 hover:bg-primary/90 transition-colors min-h-[44px]">
          <Save className="w-4 h-4" /> {isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  </div>
);

export default function Products() {
  const { data: products, isLoading } = useProducts(false);
  const { data: collections } = useCollections(false);
  const upsert = useUpsertProduct();
  const deleteMut = useDeleteProduct();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ProductForm | null>(null);

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const openNew = () => {
    setEditing({
      name: '', slug: '', description: '', price: 0, collection: 'classic',
      badge: null, sizes: [], colors: [], image_url: '', stock_status: 'instock',
      stock_quantity: 0, is_visible: true, sort_order: 0,
      sizesStr: '', colorsStr: '',
    });
  };

  const openEdit = (p: DbProduct) => {
    setEditing({ ...p, sizesStr: p.sizes?.join(', ') || '', colorsStr: p.colors?.join(', ') || '' });
  };

  const handleSave = async () => {
    if (!editing) return;
    const { sizesStr, colorsStr, ...rest } = editing;
    const payload = {
      ...rest,
      sizes: sizesStr?.split(',').map(s => s.trim()).filter(Boolean) || [],
      colors: colorsStr?.split(',').map(s => s.trim()).filter(Boolean) || [],
    };
    try {
      await upsert.mutateAsync(payload as any);
      toast.success('Product saved!');
      setEditing(null);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteMut.mutateAsync(id);
      toast.success('Product deleted');
    } catch (e: any) { toast.error(e.message); }
  };

  const isGlbUrl = (url: string) => url?.endsWith('.glb');

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display uppercase tracking-widest font-black text-white">Products</h2>
            <p className="text-white/60 font-body text-sm mt-1">Manage catalog, pricing, and stock</p>
          </div>
          <button onClick={openNew} className="bg-primary text-black flex items-center gap-2 font-display uppercase tracking-widest font-bold px-5 py-2.5 hover:bg-primary/90 transition-colors text-sm min-h-[44px]">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        <div className="bg-black border border-white/10 p-2 flex items-center gap-2">
          <Search className="w-5 h-5 text-white/40 ml-2 shrink-0" />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none text-white w-full py-2 px-2 focus:outline-none font-body min-h-[40px]" />
        </div>

        {editing && <ProductEditModal editing={editing} setEditing={setEditing} collections={collections} onSave={handleSave} isPending={upsert.isPending} />}

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-white/50 font-display uppercase tracking-widest">Loading...</div>
          ) : filtered.map(product => (
            <div key={product.id} className="bg-black border border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 shrink-0 overflow-hidden">
                  {isGlbUrl(product.image_url) ? (
                    <Product3DThumbnail modelUrl={product.image_url} />
                  ) : (
                    <div className="w-full h-full bg-white/10">
                      {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{product.name}</p>
                  <p className="text-xs text-white/50">{product.slug}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest shrink-0 ${
                  product.is_visible ? 'bg-accent/20 text-accent-foreground' : 'bg-destructive/10 text-destructive'
                }`}>
                  {product.is_visible ? <><Check className="w-3 h-3" /> On</> : 'Off'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white font-bold">€{Number(product.price).toFixed(2)}</span>
                <span className="text-white/50">Stock: {product.stock_quantity}</span>
                <span className="text-white/50 capitalize">{product.collection}</span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-white/5">
                <button onClick={() => openEdit(product)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xs font-display uppercase tracking-widest min-h-[44px]">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleDelete(product.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors text-xs font-display uppercase tracking-widest min-h-[44px]">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-black border border-white/10 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-white/50 font-display uppercase tracking-widest">Loading...</div>
          ) : (
            <table className="w-full text-left font-body">
              <thead className="border-b border-white/10 text-white/50 text-xs font-display uppercase tracking-widest">
                <tr>
                  <th className="p-4 font-normal">Product</th>
                  <th className="p-4 font-normal">Price</th>
                  <th className="p-4 font-normal">Stock</th>
                  <th className="p-4 font-normal">Collection</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 shrink-0 overflow-hidden">
                          {isGlbUrl(product.image_url) ? (
                            <Product3DThumbnail modelUrl={product.image_url} />
                          ) : (
                            <div className="w-full h-full bg-white/10">
                              {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{product.name}</p>
                          <p className="text-xs text-white/50 mt-1">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white">€{Number(product.price).toFixed(2)}</td>
                    <td className="p-4 text-white/70">{product.stock_quantity}</td>
                    <td className="p-4 text-white/70 capitalize">{product.collection}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase tracking-widest ${
                        product.is_visible ? 'bg-accent/20 text-accent-foreground' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {product.is_visible ? <><Check className="w-3 h-3" /> Visible</> : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEdit(product)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors inline-block" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-white/50 hover:text-destructive hover:bg-destructive/10 transition-colors inline-block" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
