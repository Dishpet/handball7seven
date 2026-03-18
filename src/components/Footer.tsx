import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Instagram, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { t, getSiteContent } = useI18n();

  const socials = getSiteContent("socials") as Record<string, string> | undefined;
  const featuresBar = getSiteContent("features_bar") as { items?: { icon: string; label: Record<string, string> }[] } | undefined;

  const whatsappNumber = socials?.whatsapp || "+385955144085";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`;

  return (
    <footer className="bg-card border-t border-border">
      {/* Features Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-border">
        {[
          { icon: "💥", label: "Foul — No easy plays." },
          { icon: "⏱", label: "2 Minutes — Take a moment." },
          { icon: "🟨", label: "Yellow Card — Limited pieces." },
          { icon: "🟥", label: "Red Card — When it's gone, it's gone." },
        ].map((f, i) => (
          <div key={i} className="flex items-center justify-center gap-2 py-4 px-2 sm:px-3 border-r border-border last:border-r-0 text-[10px] sm:text-xs font-display uppercase tracking-wider sm:tracking-widest text-foreground/60">
            <span>{featuresBar?.items?.[i]?.icon || f.icon}</span>
            <span className="text-center leading-tight">{(typeof featuresBar?.items?.[i]?.label === 'string' ? featuresBar.items[i].label : null) || f.label}</span>
          </div>
        ))}
      </div>

      <div className="px-5 md:px-12 lg:px-20 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <img src={logo} alt="Handball Seven" className="h-10 md:h-12 mb-4" />
            <p className="text-muted-foreground text-sm leading-relaxed">{t("footer.tagline")}</p>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] mb-4">{t("footer.support")}</h4>
            <div className="space-y-3">
              {[t("footer.shipping"), t("footer.faq"), t("footer.privacy"), t("footer.terms")].map(item => (
                <p key={item} className="text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer py-0.5">{item}</p>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] mb-4">{t("footer.shop")}</h4>
            <div className="space-y-3">
              {[t("col.classic"), t("col.vintage"), t("col.street")].map(item => (
                <Link key={item} to="/shop" className="block text-muted-foreground text-sm hover:text-foreground transition-colors py-0.5">{item}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] mb-4">{t("footer.connect")}</h4>
            <div className="flex gap-4">
              {socials?.instagram ? (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-primary transition-colors p-1">
                  <Instagram size={22} />
                </a>
              ) : (
                <a href="#" className="text-foreground/40 hover:text-primary transition-colors p-1"><Instagram size={22} /></a>
              )}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-[#25D366] transition-colors p-1">
                <MessageCircle size={22} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 md:mt-12 pt-6 text-center">
          <p className="text-muted-foreground text-xs">© 2025 Handball Seven. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
