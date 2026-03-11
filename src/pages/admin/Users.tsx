import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, ShieldOff, Users as UsersIcon, Search } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: string[];
}

function useAdminUsers() {
  return useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users");
      if (error) throw error;
      return data as UserRow[];
    },
  });
}

export default function AdminUsers() {
  const { data: users, isLoading } = useAdminUsers();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role, action }: { userId: string; role: string; action: string }) => {
      const { error } = await supabase.rpc("admin_set_role", {
        _user_id: userId,
        _role: role as any,
        _action: action,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_users"] });
      toast.success("Role updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (users ?? []).filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display uppercase tracking-widest font-black text-white flex items-center gap-3">
            <UsersIcon className="w-6 h-6 md:w-8 md:h-8" /> Users
          </h2>
          <p className="text-white/60 font-body text-sm mt-1">Manage users and their roles</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors font-body min-h-[48px]"
          />
        </div>

        {isLoading ? (
          <div className="text-white/50 font-display uppercase tracking-widest">Loading users...</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filtered.map((user) => {
                const isAdmin = user.roles.includes("admin");
                const isMod = user.roles.includes("moderator");
                return (
                  <div key={user.id} className="bg-black border border-white/10 p-4 space-y-3">
                    <div>
                      <p className="font-body text-white text-sm font-bold">{user.full_name || "—"}</p>
                      <p className="font-body text-white/40 text-xs mt-0.5">{user.email}</p>
                      <p className="text-white/30 text-xs mt-1">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {isAdmin && (
                        <span className="bg-primary/20 text-primary px-2 py-0.5 text-xs font-display uppercase tracking-widest">Admin</span>
                      )}
                      {isMod && (
                        <span className="bg-primary/15 text-primary/80 px-2 py-0.5 text-xs font-display uppercase tracking-widest">Moderator</span>
                      )}
                      {!isAdmin && !isMod && (
                        <span className="text-white/30 text-xs font-display uppercase tracking-widest">User</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                      {isAdmin ? (
                        <button
                          onClick={() => roleMutation.mutate({ userId: user.id, role: "admin", action: "revoke" })}
                          className="flex items-center gap-1 text-xs font-display uppercase tracking-widest px-3 py-2 border border-destructive/30 text-destructive active:bg-destructive/10 transition-colors min-h-[40px]"
                          disabled={roleMutation.isPending}
                        >
                          <ShieldOff className="w-3 h-3" /> Revoke Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => roleMutation.mutate({ userId: user.id, role: "admin", action: "grant" })}
                          className="flex items-center gap-1 text-xs font-display uppercase tracking-widest px-3 py-2 border border-primary/30 text-primary active:bg-primary/10 transition-colors min-h-[40px]"
                          disabled={roleMutation.isPending}
                        >
                          <Shield className="w-3 h-3" /> Make Admin
                        </button>
                      )}
                      {isMod ? (
                        <button
                          onClick={() => roleMutation.mutate({ userId: user.id, role: "moderator", action: "revoke" })}
                          className="flex items-center gap-1 text-xs font-display uppercase tracking-widest px-3 py-2 border border-destructive/30 text-destructive active:bg-destructive/10 transition-colors min-h-[40px]"
                          disabled={roleMutation.isPending}
                        >
                          <ShieldOff className="w-3 h-3" /> Revoke Mod
                        </button>
                      ) : (
                        <button
                          onClick={() => roleMutation.mutate({ userId: user.id, role: "moderator", action: "grant" })}
                          className="flex items-center gap-1 text-xs font-display uppercase tracking-widest px-3 py-2 border border-primary/30 text-primary/80 active:bg-primary/10 transition-colors min-h-[40px]"
                          disabled={roleMutation.isPending}
                        >
                          <Shield className="w-3 h-3" /> Make Mod
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-black border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 font-display uppercase tracking-widest text-xs text-white/50">User</th>
                      <th className="text-left p-4 font-display uppercase tracking-widest text-xs text-white/50">Joined</th>
                      <th className="text-left p-4 font-display uppercase tracking-widest text-xs text-white/50">Roles</th>
                      <th className="text-right p-4 font-display uppercase tracking-widest text-xs text-white/50">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user) => {
                      const isAdmin = user.roles.includes("admin");
                      const isMod = user.roles.includes("moderator");
                      return (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-body text-white text-sm">{user.full_name || "—"}</div>
                            <div className="font-body text-white/40 text-xs">{user.email}</div>
                          </td>
                          <td className="p-4 text-white/50 text-sm font-body">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {isAdmin && (
                                <span className="bg-primary/20 text-primary px-2 py-0.5 text-xs font-display uppercase tracking-widest">Admin</span>
                              )}
                              {isMod && (
                                <span className="bg-primary/15 text-primary/80 px-2 py-0.5 text-xs font-display uppercase tracking-widest">Moderator</span>
                              )}
                              {!isAdmin && !isMod && (
                                <span className="text-white/30 text-xs font-display uppercase tracking-widest">User</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              {isAdmin ? (
                                <button
                                  onClick={() => roleMutation.mutate({ userId: user.id, role: "admin", action: "revoke" })}
                                  className="flex items-center gap-1 text-xs font-display uppercase tracking-widest px-3 py-1.5 border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                                  disabled={roleMutation.isPending}
                                >
                                  <ShieldOff className="w-3 h-3" /> Revoke Admin
                                </button>
                              ) : (
                                <button
                                  onClick={() => roleMutation.mutate({ userId: user.id, role: "admin", action: "grant" })}
                                  className="flex items-center gap-1 text-xs font-display uppercase tracking-widest px-3 py-1.5 border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                                  disabled={roleMutation.isPending}
                                >
                                  <Shield className="w-3 h-3" /> Make Admin
                                </button>
                              )}
                              {isMod ? (
                                <button
                                  onClick={() => roleMutation.mutate({ userId: user.id, role: "moderator", action: "revoke" })}
                                  className="flex items-center gap-1 text-xs font-display uppercase tracking-widest px-3 py-1.5 border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                                  disabled={roleMutation.isPending}
                                >
                                  <ShieldOff className="w-3 h-3" /> Revoke Mod
                                </button>
                              ) : (
                                <button
                                  onClick={() => roleMutation.mutate({ userId: user.id, role: "moderator", action: "grant" })}
                                  className="flex items-center gap-1 text-xs font-display uppercase tracking-widest px-3 py-1.5 border border-primary/30 text-primary/80 hover:bg-primary/10 transition-colors"
                                  disabled={roleMutation.isPending}
                                >
                                  <Shield className="w-3 h-3" /> Make Mod
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-white/30 font-display uppercase tracking-widest">
                  No users found
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
