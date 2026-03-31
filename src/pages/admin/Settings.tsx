import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, Check, Upload, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useStoreSettings, useUpdateStoreSetting } from "@/hooks/useStoreSettings";
import { useSiteContent, useUpdateSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import staticLogo from "@/assets/logo.png";

export default function Settings() {
  const { data: settings, isLoading } = useStoreSettings();
  const updateSetting = useUpdateStoreSetting();

  const [storeName, setStoreName] = useState('Handball Seven');
  const [currency, setCurrency] = useState('EUR');

  useEffect(() => {
    if (settings) {
      if (settings.general) {
        setStoreName(settings.general.store_name ?? 'Handball Seven');
        setCurrency(settings.general.currency ?? 'EUR');
      }
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({
        key: 'general',
        value: { store_name: storeName, currency },
      });
      toast.success('Settings saved!');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  function LogoManagement() {
    const { data: logoContent } = useSiteContent('logo');
    const updateContent = useUpdateSiteContent();
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const currentUrl = (logoContent as any)?.value?.url || '';

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const ext = file.name.split('.').pop();
        const path = `logo/site-logo-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('cms-images').upload(path, file, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: pubData } = supabase.storage.from('cms-images').getPublicUrl(path);
        await updateContent.mutateAsync({ key: 'logo', value: { url: pubData.publicUrl } });
        toast.success('Logo updated!');
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    };

    const handleRemove = async () => {
      await updateContent.mutateAsync({ key: 'logo', value: { url: '' } });
      toast.success('Logo reset to default');
    };

    return (
      <div className="md:col-span-2 bg-black border border-white/10 p-6">
        <h3 className="text-xl font-display uppercase tracking-widest font-bold text-white mb-6 border-b border-white/10 pb-4">Site Logo</h3>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="bg-white/5 border border-white/10 p-4 flex items-center justify-center min-w-[160px] min-h-[80px]">
            <img src={currentUrl || staticLogo} alt="Current logo" className="max-h-16 max-w-[200px] object-contain" />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-white/50 text-xs font-body">Upload a PNG or SVG logo. It will replace the logo across the entire site (navbar, footer, etc.).</p>
            <div className="flex items-center gap-3">
              <label className="bg-primary text-black flex items-center gap-2 font-display uppercase tracking-widest font-bold px-4 py-2.5 hover:bg-primary/90 transition-colors cursor-pointer text-xs min-h-[44px]">
                <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Logo'}
                <input ref={fileRef} type="file" accept="image/png,image/svg+xml,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
              {currentUrl && (
                <button onClick={handleRemove} className="text-white/40 hover:text-destructive transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors min-h-[48px]" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-2">Standard Shipping Cost (€)</label>
                  <input type="number" value={shippingCost} onChange={e => setShippingCost(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors min-h-[48px]" />
                </div>
              </div>
            </div>

            <div className="bg-black border border-white/10 p-6 flex flex-col">
              <h3 className="text-xl font-display uppercase tracking-widest font-bold text-white mb-6 border-b border-white/10 pb-4">General</h3>
              <div className="space-y-4 font-body flex-1">
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-2">Store Name</label>
                  <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors min-h-[48px]" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-2">Currency</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors min-h-[48px]">
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <LogoManagement />

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
