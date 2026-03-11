import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { useCollections, DbCollection } from "@/hooks/useCollections";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminCollections() {
  const { data: collections, isLoading } = useCollections(false);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<DbCollection> | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const save = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        const { error } = await supabase.from("collections").update({
          name: editing.name,
          slug: editing.slug,
          description: editing.description,
          image_url: editing.image_url,
          is_visible: editing.is_visible,
          sort_order: editing.sort_order,
        }).eq("id", editing.id);
        if (error) throw error;
        toast.success("Collection updated");
      } else {
        const { error } = await supabase.from("collections").insert([{
          name: editing.name || "",
          slug: editing.slug || "",
          description: editing.description || "",
          image_url: editing.image_url || "",
          is_visible: editing.is_visible ?? true,
          sort_order: editing.sort_order ?? 0,
        }]);
        if (error) throw error;
        toast.success("Collection created");
      }
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["collections"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
      toast.success("Collection deleted");
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ["collections"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleVisibility = async (col: DbCollection) => {
    const { error } = await supabase.from("collections").update({ is_visible: !col.is_visible }).eq("id", col.id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["collections"] });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-display uppercase tracking-widest font-black text-white">Collections</h2>
            <p className="text-white/60 font-body mt-1">Manage product collections</p>
          </div>
          <button
            onClick={() => setEditing({ name: "", slug: "", description: "", image_url: "", is_visible: true, sort_order: 0 })}
            className="bg-primary text-black flex items-center gap-2 font-display uppercase tracking-widest font-bold px-6 py-2 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
            <div className="bg-[#111] border border-white/10 p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-display uppercase tracking-widest text-white font-bold">
                {editing.id ? "Edit Collection" : "New Collection"}
              </h3>
              <div>
                <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Name</label>
                <input
                  value={editing.name || ""}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary font-body text-sm"
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Slug</label>
                <input
                  value={editing.slug || ""}
                  onChange={e => setEditing({ ...editing, slug: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary font-body text-sm"
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Description</label>
                <textarea
                  value={editing.description || ""}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary font-body text-sm resize-none"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editing.sort_order ?? 0}
                    onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary font-body text-sm"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.is_visible ?? true}
                      onChange={e => setEditing({ ...editing, is_visible: e.target.checked })}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-white/70 text-sm font-body">Visible on frontend</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={save} className="bg-primary text-black font-display uppercase tracking-widest font-bold px-6 py-2 hover:bg-primary/90 transition-colors">
                  Save
                </button>
                <button onClick={() => setEditing(null)} className="border border-white/20 text-white/70 font-display uppercase tracking-widest px-6 py-2 hover:bg-white/5 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleting && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setDeleting(null)}>
            <div className="bg-[#111] border border-white/10 p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-display uppercase tracking-widest text-white font-bold">Delete Collection?</h3>
              <p className="text-white/60 font-body text-sm">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => remove(deleting)} className="bg-red-600 text-white font-display uppercase tracking-widest font-bold px-6 py-2 hover:bg-red-700 transition-colors">
                  Delete
                </button>
                <button onClick={() => setDeleting(null)} className="border border-white/20 text-white/70 font-display uppercase tracking-widest px-6 py-2 hover:bg-white/5 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <p className="text-white/50 font-display uppercase tracking-widest">Loading...</p>
        ) : (
          <div className="border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-left p-4 text-xs font-display uppercase tracking-widest text-white/50">Name</th>
                  <th className="text-left p-4 text-xs font-display uppercase tracking-widest text-white/50">Slug</th>
                  <th className="text-left p-4 text-xs font-display uppercase tracking-widest text-white/50">Visible</th>
                  <th className="text-left p-4 text-xs font-display uppercase tracking-widest text-white/50">Order</th>
                  <th className="text-right p-4 text-xs font-display uppercase tracking-widest text-white/50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(collections ?? []).map(col => (
                  <tr key={col.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-display uppercase tracking-wider text-primary font-bold">{col.name}</td>
                    <td className="p-4 text-white/60 font-body text-sm">{col.slug}</td>
                    <td className="p-4">
                      <button onClick={() => toggleVisibility(col)} className="text-white/50 hover:text-white transition-colors">
                        {col.is_visible ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                      </button>
                    </td>
                    <td className="p-4 text-white/50 font-body text-sm">{col.sort_order}</td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditing(col)} className="p-2 hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleting(col.id)} className="p-2 hover:bg-red-500/10 transition-colors text-white/50 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
