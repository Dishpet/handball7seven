import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { clearCart } = useCart();
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    clearCart();
  }, []);

  // Confirm order and send emails via edge function (works for both guests and logged-in users)
  useEffect(() => {
    if (!orderId || emailSent) return;

    const confirmAndNotify = async () => {
      try {
        // Use edge function to mark as paid (bypasses RLS)
        const { data: confirmData, error: confirmError } = await supabase.functions.invoke("confirm-order", {
          body: { order_id: orderId },
        });

        if (confirmError) {
          console.error("Failed to confirm order:", confirmError);
          return;
        }

        const order = confirmData?.order;
        if (!order) return;

        const orderData = {
          id: order.id,
          customer_email: order.customer_email,
          customer_name: order.customer_name,
          customer_phone: (order.shipping_address as any)?.phone || null,
          items: order.items,
          total: order.total,
          status: "paid",
          created_at: order.created_at,
          shipping_address: order.shipping_address,
        };

        await Promise.all([
          supabase.functions.invoke("send-order-email", {
            body: { order: orderData },
          }),
          supabase.functions.invoke("send-order-push", {
            body: { total: order.total },
          }),
        ]);

        setEmailSent(true);
      } catch (e) {
        console.error("Error confirming order:", e);
      }
    };

    confirmAndNotify();
  }, [orderId, emailSent]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <div className="pt-24 pb-20 px-5 flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md space-y-6">
          <CheckCircle className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-widest">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground font-body">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          {orderId && (
            <p className="text-muted-foreground font-body text-sm">
              Order ID: <span className="text-foreground font-mono">{orderId.slice(0, 8)}</span>
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link to="/shop" className="btn-primary text-center min-h-[48px] flex items-center justify-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
