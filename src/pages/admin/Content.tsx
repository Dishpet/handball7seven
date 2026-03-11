import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useSiteContent, useUpdateSiteContent } from "@/hooks/useSiteContent";
import { toast } from "sonner";

export default function Content() {
  const { data: allContent, isLoading } = useSiteContent();
  const updateContent = useUpdateSiteContent();

  const [heroTitle, setHeroTitle] = useState('');
  const [heroSub, setHeroSub] = useState('');
  const [aboutStory, setAboutStory] = useState('');

  useEffect(() => {
    if (Array.isArray(allContent)) {
      const hero = allContent.find((c: any) => c.key === 'hero');
      const about = allContent.find((c: any) => c.key === 'about');
      if (hero?.value) {
        setHeroTitle(hero.value.title || '');
        setHeroSub(hero.value.subtitle || '');
      }
      if (about?.value) {
        setAboutStory(about.value.story || '');
      }
    }
  }, [allContent]);

  const handleSave = async () => {
    try {
      await updateContent.mutateAsync({ key: 'hero', value: { title: heroTitle, subtitle: heroSub } });
      await updateContent.mutateAsync({ key: 'about', value: { story: aboutStory } });
      toast.success('Content saved!');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display uppercase tracking-widest font-black text-white">Content Editor</h2>
            <p className="text-white/60 font-body mt-1">Manage text and banners on the storefront</p>
          </div>
          <button onClick={handleSave} disabled={updateContent.isPending}
            className="bg-primary text-black flex items-center gap-2 font-display uppercase tracking-widest font-bold px-6 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {updateContent.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {isLoading ? (
          <div className="text-white/50 font-display uppercase tracking-widest">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 max-w-4xl">
            <div className="bg-black border border-white/10 p-6">
              <h3 className="text-xl font-display uppercase tracking-widest font-bold text-white mb-6 border-b border-white/10 pb-4">Home / Hero Banner</h3>
              <div className="space-y-4 font-body">
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-2">Main Title</label>
                  <input type="text" value={heroTitle} onChange={e => setHeroTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-2">Subtitle</label>
                  <textarea value={heroSub} onChange={e => setHeroSub(e.target.value)} rows={2}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors resize-none" />
                </div>
              </div>
            </div>

            <div className="bg-black border border-white/10 p-6">
              <h3 className="text-xl font-display uppercase tracking-widest font-bold text-white mb-6 border-b border-white/10 pb-4">About Section</h3>
              <div className="space-y-4 font-body">
                <div>
                  <label className="block text-white/50 text-xs font-display uppercase tracking-widest mb-2">Brand Story</label>
                  <textarea value={aboutStory} onChange={e => setAboutStory(e.target.value)} rows={6}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
