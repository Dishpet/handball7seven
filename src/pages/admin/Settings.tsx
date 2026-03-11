import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useStoreSettings, useUpdateStoreSetting } from "@/hooks/useStoreSettings";
import { toast } from "sonner";

export default function Settings() {
  const { data: settings, isLoading } = useStoreSettings();
  const updateSetting = useUpdateStoreSetting();

  const [freeThreshold, setFreeThreshold] = useState(100);
  const [shippingCost, setShippingCost] = useState(5);
  const [storeName, setStoreName] = useState('Handball Seven');
  const [currency, setCurrency] = useState('EUR');

  useEffect(() => {
    if (settings) {
      if (settings.shipping) {
        setFreeThreshold(settings.shipping.free_threshold ?? 100);
        setShippingCost(settings.shipping.standard_cost ?? 5);
      }
      if (settings.general) {
        setStoreName(settings.general.store_name ?? 'Handball Seven');
        setCurrency(settings.general.currency ?? 'EUR');
      }
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({
        key: 'shipping',
        value: { free_threshold: freeThreshold, standard_cost: shippingCost },
      });
      await updateSetting.mutateAsync({
        key: 'general',
        value: { store_name: storeName, currency },
      });
      toast.success('Settings saved!');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display uppercase tracking-widest font-black text-white">Settings</h2>
            <p className="text-white/60 font-body text-sm mt-1">Configure global store behavior</p>
          </div>
          <button onClick={handleSave} disabled={updateSetting.isPending}
            className="bg-primary text-black flex items-center gap-2 font-display uppercase tracking-widest font-bold px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm min-h-[44px] w-full sm:w-auto justify-center">
            <Save className="w-4 h-4" /> {updateSetting.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {isLoading ? (
          <div className="text-white/50 font-display uppercase tracking-widest">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
            <div className="bg-black border border-white/10 p-6 flex flex-col">
              <h3 className="text-xl font-display uppercase tracking-widest font-bold text-white mb-6 border-b border-white/10 pb-4">Shipping Rules</h3>
              <div className="space-y-4 font-body flex-1">
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-2">Free Shipping Threshold (€)</label>
                  <input type="number" value={freeThreshold} onChange={e => setFreeThreshold(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-2">Standard Shipping Cost (€)</label>
                  <input type="number" value={shippingCost} onChange={e => setShippingCost(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
            </div>

            <div className="bg-black border border-white/10 p-6 flex flex-col">
              <h3 className="text-xl font-display uppercase tracking-widest font-bold text-white mb-6 border-b border-white/10 pb-4">General</h3>
              <div className="space-y-4 font-body flex-1">
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-2">Store Name</label>
                  <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-2">Currency</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors">
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-black border border-white/10 p-6">
              <h3 className="text-xl font-display uppercase tracking-widest font-bold text-white mb-4 border-b border-white/10 pb-4">Backend Status</h3>
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 p-4">
                <Check className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="text-green-500 font-bold font-display uppercase tracking-widest text-sm">Connected</h4>
                  <p className="text-green-500/70 text-xs mt-1 font-body">Lovable Cloud backend is active and running.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
