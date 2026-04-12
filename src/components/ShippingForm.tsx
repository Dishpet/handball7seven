import { useState } from 'react';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useAuth } from '@/hooks/useAuth';

export type ShippingInfo = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

type Props = {
  onSubmit: (info: ShippingInfo) => void;
  submitting?: boolean;
};

const COUNTRIES = [
  'Croatia',
  'Germany', 'Austria', 'Slovenia', 'Bosnia and Herzegovina', 'Serbia', 'Montenegro',
  'Hungary', 'Italy', 'France', 'Spain', 'United Kingdom', 'Netherlands', 'Belgium',
  'Switzerland', 'Czech Republic', 'Poland', 'Sweden', 'Denmark', 'Norway', 'Finland',
  'Portugal', 'Ireland', 'Romania', 'Bulgaria', 'Greece', 'Slovakia', 'Other',
];

export default function ShippingForm({ onSubmit, submitting }: Props) {
  const { user } = useAuth();
  const [info, setInfo] = useState<ShippingInfo>({
    fullName: '', email: user?.email || '', phone: '', address: '', city: '', postalCode: '', country: 'Croatia',
  });
  const { data: settings } = useStoreSettings();

  const shippingCroatia = settings?.shipping_rate_croatia ?? 0;
  const shippingInternational = settings?.shipping_rate_international ?? 0;
  const freeThresholdCroatia = Number(settings?.free_shipping_threshold_croatia) || Number(settings?.free_shipping_threshold) || 0;
  const freeThresholdIntl = Number(settings?.free_shipping_threshold_international) || Number(settings?.free_shipping_threshold) || 0;

  const isCroatia = info.country === 'Croatia';
  const shippingRate = isCroatia ? shippingCroatia : shippingInternational;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(info);
  };

  const inputClass = "w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors min-h-[48px]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-display uppercase tracking-widest text-sm font-bold">Shipping Information</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-display uppercase text-xs tracking-widest block mb-1">Full Name *</label>
          <input value={info.fullName} onChange={e => setInfo({ ...info, fullName: e.target.value })}
            className={inputClass} required />
        </div>
        <div>
          <label className="font-display uppercase text-xs tracking-widest block mb-1">Email *</label>
          <input type="email" value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })}
            className={inputClass} required placeholder="your@email.com" />
        </div>
      </div>

      <div>
        <label className="font-display uppercase text-xs tracking-widest block mb-1">Phone *</label>
        <input type="tel" value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })}
          className={inputClass} required placeholder="+385..." />
      </div>

      <div>
        <label className="font-display uppercase text-xs tracking-widest block mb-1">Address *</label>
        <input value={info.address} onChange={e => setInfo({ ...info, address: e.target.value })}
          className={inputClass} required />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="font-display uppercase text-xs tracking-widest block mb-1">City *</label>
          <input value={info.city} onChange={e => setInfo({ ...info, city: e.target.value })}
            className={inputClass} required />
        </div>
        <div>
          <label className="font-display uppercase text-xs tracking-widest block mb-1">Postal Code *</label>
          <input value={info.postalCode} onChange={e => setInfo({ ...info, postalCode: e.target.value })}
            className={inputClass} required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="font-display uppercase text-xs tracking-widest block mb-1">Country *</label>
          <select value={info.country} onChange={e => setInfo({ ...info, country: e.target.value })}
            className={inputClass}>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-muted/50 border border-border p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping ({isCroatia ? 'Croatia' : 'International'})</span>
          <span className="font-display font-bold">
            {shippingRate > 0 ? `€${Number(shippingRate).toFixed(2)}` : 'FREE'}
          </span>
        </div>
      </div>

      <button type="submit" disabled={submitting}
        className="btn-primary w-full text-center min-h-[48px] disabled:opacity-50">
        {submitting ? 'Processing...' : 'Proceed to Payment'}
      </button>
    </form>
  );
}
