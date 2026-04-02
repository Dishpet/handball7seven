import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { hexToColorName, isHexColor } from "@/lib/colorUtils";
import { useOrders } from "@/hooks/useOrders";
import { Package, ChevronDown, ChevronUp } from "lucide-react";

interface OrderItem {
  id?: string;
  name?: string;
  price?: number;
  size?: string;
  color?: string;
  collection?: string;
  quantity?: number;
  image?: string;
}

function OrderItemsDetail({ items }: { items: any }) {
  const parsed: OrderItem[] = Array.isArray(items) ? items : [];
  if (parsed.length === 0) return <p className="text-white/30 text-sm">No item details</p>;

  return (
    <div className="space-y-3">
      {parsed.map((item, i) => (
        <div key={i} className="flex gap-3 bg-white/5 p-3 border border-white/5">
          {item.image && (
            <img src={item.image} alt={item.name || ''} className="w-14 h-14 object-cover bg-white/10 shrink-0" />
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-white text-sm font-bold truncate">{item.name || 'Unknown product'}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
              {item.size && <span>Size: <span className="text-white/80">{item.size}</span></span>}
              {item.color && <span>Color: <span className="text-white/80">{item.color}</span></span>}
              {item.collection && <span>Collection: <span className="text-white/80 capitalize">{item.collection}</span></span>}
              <span>Qty: <span className="text-white/80">{item.quantity ?? 1}</span></span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-white text-sm font-bold">€{((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}</p>
            <p className="text-white/40 text-xs">€{(item.price ?? 0).toFixed(2)} ea</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const { data: orders, isLoading } = useOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const statusClass = (status: string) =>
    status === 'pending' ? 'bg-primary/10 text-primary' :
    status === 'completed' ? 'bg-accent/20 text-accent-foreground' :
    status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
    'bg-white/10 text-white/50';

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display uppercase tracking-widest font-black text-white">Orders</h2>
          <p className="text-white/60 font-body text-sm mt-1">View and manage customer orders</p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-white/50 font-display uppercase tracking-widest">Loading...</div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map(order => {
              const isExpanded = expandedId === order.id;
              const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];

              return (
                <div key={order.id} className="bg-black border border-white/10">
                  {/* Order header - clickable */}
                  <button
                    onClick={() => toggle(order.id)}
                    className="w-full text-left p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-sm text-white font-bold truncate">
                          {order.customer_name || order.customer_email || 'Guest'}
                        </p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-white/40">
                        <span>{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}</span>
                        <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                        <span className="text-white/60 font-mono">#{order.id.slice(0, 8)}</span>
                      </div>
                      {order.customer_email && order.customer_name && (
                        <p className="text-xs text-white/30 mt-0.5">{order.customer_email}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-3">
                      <p className="text-white font-bold text-lg">€{Number(order.total).toFixed(2)}</p>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4 space-y-4">
                      <div>
                        <h4 className="text-xs font-display uppercase tracking-widest text-white/50 mb-3">Order Items</h4>
                        <OrderItemsDetail items={order.items} />
                      </div>

                      {order.shipping_address && Object.keys(order.shipping_address).length > 0 && (
                        <div>
                          <h4 className="text-xs font-display uppercase tracking-widest text-white/50 mb-2">Shipping Address</h4>
                          <p className="text-white/70 text-sm whitespace-pre-line">
                            {typeof order.shipping_address === 'object'
                              ? Object.values(order.shipping_address).filter(Boolean).join('\n')
                              : String(order.shipping_address)}
                          </p>
                        </div>
                      )}

                      {order.notes && !order.notes.startsWith('stripe_session:') && (
                        <div>
                          <h4 className="text-xs font-display uppercase tracking-widest text-white/50 mb-2">Notes</h4>
                          <p className="text-white/70 text-sm">{order.notes}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/30 pt-2 border-t border-white/5">
                        <span>Order ID: {order.id}</span>
                        <span>Created: {new Date(order.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-black border border-white/10 p-12 text-center">
            <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-display uppercase tracking-widest">No orders yet</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
