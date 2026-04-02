import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = 'BMAVuw9STRVgGsd_iA9t6peSyHeuA6kykUl9KHBEyb14MGGtOjI9oKcJ78way_w2JR061wUfzqnYbeBdAK322xM';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PushNotificationSetup = () => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setSupported(false);
        setLoading(false);
        return;
      }
      setSupported(true);

      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      } catch {
        // ignore
      }
      setLoading(false);
    };
    check();
  }, []);

  if (!supported || loading) return null;

  const subscribe = async () => {
    setToggling(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const key = sub.getKey('p256dh');
      const auth = sub.getKey('auth');
      if (!key || !auth) throw new Error('Missing push keys');

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(key)));
      const authKey = btoa(String.fromCharCode(...new Uint8Array(auth)));

      const { error } = await supabase.from('push_subscriptions' as any).upsert(
        {
          user_id: user?.id,
          endpoint: sub.endpoint,
          p256dh,
          auth: authKey,
        },
        { onConflict: 'user_id,endpoint' }
      );

      if (error) throw error;
      setIsSubscribed(true);
      toast.success('Push notifications enabled!');
    } catch (err: any) {
      console.error('Push subscribe error:', err);
      toast.error('Failed to enable notifications');
    }
    setToggling(false);
  };

  const unsubscribe = async () => {
    setToggling(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await supabase.from('push_subscriptions' as any).delete().eq('endpoint', sub.endpoint);
      }
      setIsSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (err) {
      console.error('Push unsubscribe error:', err);
      toast.error('Failed to disable notifications');
    }
    setToggling(false);
  };

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={toggling}
      className={`flex items-center gap-2 px-3 py-2 text-xs font-display uppercase tracking-wider transition-colors border ${
        isSubscribed
          ? 'border-primary/30 text-primary hover:bg-primary/10'
          : 'border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
      }`}
    >
      {toggling ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="w-4 h-4" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
      {isSubscribed ? 'Notifications On' : 'Enable Notifications'}
    </button>
  );
};
