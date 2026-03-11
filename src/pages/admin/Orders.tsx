import { AdminLayout } from "@/components/admin/AdminLayout";
import { useOrders } from "@/hooks/useOrders";
import { Package } from "lucide-react";

export default function Orders() {
  const { data: orders, isLoading } = useOrders();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-display uppercase tracking-widest font-black text-white">Orders</h2>
          <p className="text-white/60 font-body mt-1">View and manage customer orders</p>
        </div>

        <div className="bg-black border border-white/10 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-white/50 font-display uppercase tracking-widest">Loading...</div>
          ) : orders && orders.length > 0 ? (
            <table className="w-full text-left font-body">
              <thead className="border-b border-white/10 text-white/50 text-xs font-display uppercase tracking-widest">
                <tr>
                  <th className="p-4 font-normal">Order</th>
                  <th className="p-4 font-normal">Customer</th>
                  <th className="p-4 font-normal">Items</th>
                  <th className="p-4 font-normal">Total</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white text-sm">{order.id.slice(0, 8)}...</td>
                    <td className="p-4 text-white/80 text-sm">{order.customer_name || order.customer_email || 'Guest'}</td>
                    <td className="p-4 text-white/60 text-sm">{Array.isArray(order.items) ? order.items.length : 0} items</td>
                    <td className="p-4 text-white font-bold">€{Number(order.total).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${
                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                        order.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                        'bg-white/10 text-white/50'
                      }`}>{order.status}</span>
                    </td>
                    <td className="p-4 text-white/50 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 font-display uppercase tracking-widest">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
