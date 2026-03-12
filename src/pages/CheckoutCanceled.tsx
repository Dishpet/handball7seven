import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function CheckoutCanceled() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <div className="pt-24 pb-20 px-5 flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md space-y-6">
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-widest">
            Checkout Canceled
          </h1>
          <p className="text-muted-foreground font-body">
            Your order was not completed. No charges were made.
          </p>
          <Link to="/shop" className="btn-primary inline-block text-center min-h-[48px] leading-[48px]">
            Back to Shop
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
