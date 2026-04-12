import { X, Plus, Minus } from "lucide-react";
import { hexToColorName, isHexColor } from "@/lib/colorUtils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ShippingForm, { type ShippingInfo } from "@/components/ShippingForm";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart();
  const { t } = useI18n();
  const { user } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const { data: settings } = useStoreSettings();

  const freeThresholdCroatia = Number(settings?.free_shipping_threshold_croatia) || Number(settings?.free_shipping_threshold) || 0;
  const freeThresholdIntl = Number(settings?.free_shipping_threshold_international) || Number(settings?.free_shipping_threshold) || 0;
  const shippingCroatia = Number(settings?.shipping_rate_croatia) || 0;
  const shippingInternational = Number(settings?.shipping_rate_international) || 0;
  const lowestThreshold = Math.min(freeThresholdCroatia || Infinity, freeThresholdIntl || Infinity);
  const displayThreshold = lowestThreshold === Infinity ? 0 : lowestThreshold;
  const remaining = displayThreshold > 0 ? Math.max(0, displayThreshold - totalPrice) : 0;

  const handleCheckout = async (shippingInfo: ShippingInfo) => {
    setCheckingOut(true);
    try {
      const isCroatia = shippingInfo.country === 'Croatia';
      const threshold = isCroatia ? freeThresholdCroatia : freeThresholdIntl;
      const shippingCost = totalPrice >= threshold && threshold > 0
        ? 0
        : (isCroatia ? shippingCroatia : shippingInternational);

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items,
          shipping: shippingInfo,
          shippingCost,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e: any) {
      toast.error(e.message || "Checkout failed");
      setCheckingOut(false);
    }
  };

  const handleProceed = () => {
    setShowShipping(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[300]"
            onClick={() => { setIsOpen(false); setShowShipping(false); }}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-card border-l border-border z-[301] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <h2 className="font-display uppercase tracking-widest text-base sm:text-lg">
                {showShipping ? 'Shipping' : t("nav.cart")}
              </h2>
              <button 
                onClick={() => { setIsOpen(false); setShowShipping(false); }} 
                className="text-foreground/60 hover:text-foreground p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {showShipping ? (
                <ShippingForm onSubmit={handleCheckout} submitting={checkingOut} />
              ) : items.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">Your cart is empty.</p>
              ) : (
                <div className="space-y-5 sm:space-y-6">
                  {displayThreshold > 0 && (
                    <div className="bg-muted/50 border border-border p-3 text-sm">
                      {remaining > 0 ? (
                        <>
                          <p className="text-muted-foreground mb-1">
                            Add <span className="font-bold text-foreground">€{remaining.toFixed(2)}</span> more for free shipping!
                          </p>
                          <div className="text-xs text-muted-foreground mb-2">
                            🇭🇷 Free above €{freeThresholdCroatia} · 🌍 Free above €{freeThresholdIntl}
                          </div>
                          <div className="w-full bg-border h-1.5">
                            <div className="bg-primary h-1.5 transition-all" style={{ width: `${Math.min(100, (totalPrice / displayThreshold) * 100)}%` }} />
                          </div>
                        </>
                      ) : (
                        <p className="text-primary font-bold">🎉 You qualify for free shipping!</p>
                      )}
                    </div>
                  )}

                  {(shippingCroatia > 0 || shippingInternational > 0) && remaining > 0 && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>🇭🇷 Croatia: €{shippingCroatia.toFixed(2)}</p>
                      <p>🌍 International: €{shippingInternational.toFixed(2)}</p>
                    </div>
                  )}

                  {items.map(item => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-3 sm:gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover bg-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display uppercase text-xs sm:text-sm tracking-wider truncate">{item.name}</h3>
                        <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1 flex-wrap">
                          <span>{t("shop.size")}: {item.size}</span>
                          {item.color && (
                            <span className="inline-flex items-center gap-1">
                              ·
                              {isHexColor(item.color) && (
                                <span
                                  className="inline-block w-2.5 h-2.5 rounded-full border border-border"
                                  style={{ backgroundColor: item.color }}
                                />
                              )}
                              {hexToColorName(item.color)}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} 
                            className="text-foreground/50 hover:text-foreground p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-body">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} 
                            className="text-foreground/50 hover:text-foreground p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display text-sm">€{(item.price * item.quantity).toFixed(2)}</p>
                        <button onClick={() => removeItem(item.id, item.size)} className="text-muted-foreground text-xs hover:text-foreground mt-2 py-1">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && !showShipping && (
              <div className="p-4 sm:p-6 border-t border-border pb-safe">
                <div className="flex justify-between mb-4">
                  <span className="font-display uppercase tracking-wider text-sm">Total</span>
                  <span className="font-display text-lg">€{totalPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleProceed}
                  className="btn-primary w-full text-center min-h-[48px] flex items-center justify-center gap-2"
                >
                  Continue to Shipping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
