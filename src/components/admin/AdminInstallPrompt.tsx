import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const AdminInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('h7-no-install') === '1');
  const [dontAsk, setDontAsk] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (dismissed || !deferredPrompt) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    if (dontAsk) localStorage.setItem('h7-no-install', '1');
    setDismissed(true);
  };

  return (
    <div className="bg-primary/10 border border-primary/20 p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Download className="w-5 h-5 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-sm text-white font-display uppercase tracking-wider">Install H7 Admin</p>
          <p className="text-xs text-white/50">Add to your home screen for quick access</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={dontAsk}
            onChange={(e) => setDontAsk(e.target.checked)}
            className="w-3 h-3 accent-primary"
          />
          <span className="text-[10px] text-white/40 whitespace-nowrap">Don't ask</span>
        </label>
        <button
          onClick={handleInstall}
          className="bg-primary text-black px-3 py-1.5 text-xs font-display uppercase tracking-wider font-bold hover:bg-primary/90 transition-colors"
        >
          Install
        </button>
        <button onClick={handleDismiss} className="text-white/40 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
