import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState } from "react";
import { Search, Edit2, Archive, Check, X, Save, Plus, Trash2 } from "lucide-react";
import { useProducts, useUpsertProduct, useDeleteProduct, DbProduct } from "@/hooks/useProducts";
import { useCollections } from "@/hooks/useCollections";
import { toast } from "sonner";

type ProductForm = Partial<DbProduct> & { sizesStr?: string; colorsStr?: string };

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
    setEditing({
      ...p,
      sizesStr: p.sizes?.join(', ') || '',
      colorsStr: p.colors?.join(', ') || '',
    });
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
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteMut.mutateAsync(id);
      toast.success('Product deleted');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display uppercase tracking-widest font-black text-white">Product Management</h2>
            <p className="text-white/60 font-body mt-1">Manage catalog, pricing, and stock</p>
          </div>
          <button onClick={openNew} className="bg-primary text-black flex items-center gap-2 font-display uppercase tracking-widest font-bold px-6 py-2 hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        <div className="bg-black border border-white/10 p-2 flex items-center gap-2 max-w-md">
          <Search className="w-5 h-5 text-white/40 ml-2" />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none text-white w-full py-2 px-2 focus:outline-none font-body" />
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-display uppercase tracking-widest text-white font-bold">{editing.id ? 'Edit Product' : 'New Product'}</h3>
                <button onClick={() => setEditing(null)} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-body">
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Name</label>
                  <input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Slug</label>
                  <input value={editing.slug || ''} onChange={e => setEditing({ ...editing, slug: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Price (€)</label>
                  <input type="number" step="0.01" value={editing.price || 0} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Collection</label>
                  <select value={editing.collection || 'classic'} onChange={e => setEditing({ ...editing, collection: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary">
                    {collections?.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    {!collections?.length && <option value="classic">Classic</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Badge</label>
                  <select value={editing.badge || ''} onChange={e => setEditing({ ...editing, badge: e.target.value || null })}
                    className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary">
                    <option value="">None</option>
                    <option value="new">New</option>
                    <option value="bestseller">Bestseller</option>
                    <option value="vintage">Vintage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Stock Qty</label>
                  <input type="number" value={editing.stock_quantity || 0} onChange={e => setEditing({ ...editing, stock_quantity: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Sizes (comma-separated)</label>
                  <input value={editing.sizesStr || ''} onChange={e => setEditing({ ...editing, sizesStr: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary" placeholder="S, M, L, XL" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Colors (comma-separated)</label>
                  <input value={editing.colorsStr || ''} onChange={e => setEditing({ ...editing, colorsStr: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary" placeholder="Black, White" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Image URL</label>
                  <input value={editing.image_url || ''} onChange={e => setEditing({ ...editing, image_url: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Description</label>
                  <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3}
                    className="w-full bg-white/5 border border-white/10 text-white p-2 focus:outline-none focus:border-primary resize-none" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-white/50 text-xs font-display uppercase tracking-widest">Visible</label>
                  <input type="checkbox" checked={editing.is_visible !== false} onChange={e => setEditing({ ...editing, is_visible: e.target.checked })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={() => setEditing(null)} className="px-4 py-2 text-white/50 hover:text-white font-display uppercase tracking-widest text-sm">Cancel</button>
                <button onClick={handleSave} disabled={upsert.isPending} className="bg-primary text-black flex items-center gap-2 font-display uppercase tracking-widest font-bold px-6 py-2 hover:bg-primary/90 transition-colors">
                  <Save className="w-4 h-4" /> {upsert.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-black border border-white/10 overflow-x-auto">
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
                        <div className="w-12 h-12 bg-white/10 shrink-0 overflow-hidden">
                          {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />}
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
                        product.is_visible ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {product.is_visible ? <><Check className="w-3 h-3" /> Visible</> : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEdit(product)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors inline-block" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-colors inline-block" title="Delete">
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
