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

  // Send order confirmation email after payment success
  useEffect(() => {
    if (!orderId || emailSent) return;

    const sendOrderEmail = async () => {
      try {
        const { data: order, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (error || !order) {
          console.error("Failed to fetch order for email:", error);
          return;
        }

        // Update order status to paid
        await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("id", orderId);

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

        await supabase.functions.invoke("send-order-email", {
          body: { order: orderData },
        });

        setEmailSent(true);
      } catch (e) {
        console.error("Error sending order email:", e);
      }
    };

    sendOrderEmail();
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
            <Link to="/account" className="border border-border text-foreground font-display uppercase tracking-widest text-sm px-6 py-3 hover:bg-muted transition-colors text-center min-h-[48px] flex items-center justify-center">
              View Orders
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
