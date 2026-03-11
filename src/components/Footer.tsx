import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Instagram } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { t, getSiteContent } = useI18n();

  // Get social links from DB
  const socials = getSiteContent("socials") as Record<string, string> | undefined;
  
  // Get features bar from DB
  const featuresBar = getSiteContent("features_bar") as { items?: { icon: string; label: Record<string, string> }[] } | undefined;
  const features = featuresBar?.items?.length
    ? featuresBar.items.map(item => ({
        icon: item.icon,
        label: typeof item.label === "object" ? t("features.shipping") : item.icon, // use t() which reads from DB overrides
      }))
    : null;

  return (
    <footer className="bg-card border-t border-border">
      {/* Features Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-border">
        {[
          { icon: "📦", label: t("features.shipping") },
          { icon: "💎", label: t("features.quality") },
          { icon: "🔒", label: t("features.payments") },
          { icon: "🤝", label: t("features.team") },
        ].map((f, i) => (
          <div key={i} className="flex items-center justify-center gap-2 py-4 px-3 border-r border-border last:border-r-0 text-xs font-display uppercase tracking-widest text-foreground/60">
            <span>{featuresBar?.items?.[i]?.icon || f.icon}</span>
            <span>{f.label}</span>
          </div>
        ))}
      </div>

      <div className="section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <img src={logo} alt="Handball Seven" className="h-12 mb-4" />
            <p className="text-muted-foreground text-sm leading-relaxed">{t("footer.tagline")}</p>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] mb-4">{t("footer.support")}</h4>
            <div className="space-y-2">
              {[t("footer.shipping"), t("footer.faq"), t("footer.privacy"), t("footer.terms")].map(item => (
                <p key={item} className="text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer">{item}</p>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] mb-4">{t("footer.shop")}</h4>
            <div className="space-y-2">
              {[t("col.classic"), t("col.vintage"), t("col.kids")].map(item => (
                <Link key={item} to="/shop" className="block text-muted-foreground text-sm hover:text-foreground transition-colors">{item}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] mb-4">{t("footer.connect")}</h4>
            <div className="flex gap-4">
              {socials?.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-primary transition-colors">
                  <Instagram size={20} />
                </a>
              )}
              {!socials?.instagram && (
                <a href="#" className="text-foreground/40 hover:text-primary transition-colors"><Instagram size={20} /></a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 text-center">
          <p className="text-muted-foreground text-xs">© 2025 Handball Seven. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
