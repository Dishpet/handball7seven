import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Instagram, MessageCircle } from "lucide-react";
import { useSiteLogo } from "@/hooks/useSiteLogo";
import ScrollReveal from "@/components/ScrollReveal";

const Footer = () => {
  const { t, getSiteContent } = useI18n();
  const logo = useSiteLogo();

  const socials = getSiteContent("socials") as Record<string, string> | undefined;
  const featuresBar = getSiteContent("features_bar") as { items?: { icon: string; label: Record<string, string> }[] } | undefined;

  const whatsappNumber = socials?.whatsapp || "+385955144085";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`;

  return (
    <footer className="bg-card border-t border-border">
      {/* Features Bar */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
        {(() => {
          const defaults = [
            { icon: "💥", title: "Foul", label: "No easy plays." },
            { icon: "✌️", title: "2 Minutes", label: "Take a moment." },
            { icon: "🟨", title: "Yellow Card", label: "Limited pieces." },
            { icon: "🟥", title: "Red Card", label: "When it's gone, it's gone." },
          ];
          const cmsItems = featuresBar?.items as { icon?: string; title?: string; label?: string | Record<string, string> }[] | undefined;
          return defaults.map((d, i) => {
            const cms = cmsItems?.[i];
            const icon = cms?.icon || d.icon;
            const title = cms?.title || d.title;
            const label = cms?.label
              ? (typeof cms.label === "object" ? (cms.label as any).hr || d.label : cms.label)
              : d.label;
            return (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="flex flex-col items-center justify-center gap-1 py-4 px-2 sm:px-3 text-center">
                  <span className="text-lg">{icon}</span>
                  <span className="font-display text-[10px] sm:text-xs uppercase tracking-wider text-foreground/80">{title}</span>
                  <span className="text-[9px] sm:text-[10px] text-foreground/50 leading-tight">{label}</span>
                </div>
              </ScrollReveal>
            );
          });
        })()}
      </div>

      <div className="px-5 md:px-12 lg:px-20 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
            <ScrollReveal className="flex flex-col items-center md:items-start">
              <img src={logo} alt="Handball Seven" className="h-10 md:h-12 mb-4" />
              <p className="text-muted-foreground text-sm leading-relaxed">{t("footer.tagline")}</p>
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="flex flex-col items-center md:items-start">
              <h4 className="text-xs tracking-[0.2em] mb-4">{t("footer.support")}</h4>
              <div className="space-y-3">
                {[
                  { label: t("footer.shipping"), to: "/shipping" },
                  { label: t("footer.faq"), to: "/faq" },
                  { label: t("footer.privacy"), to: "/privacy" },
                  { label: t("footer.terms"), to: "/terms" },
                ].map(item => (
                  <Link key={item.to} to={item.to} className="block text-muted-foreground text-sm hover:text-foreground transition-colors py-0.5">{item.label}</Link>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="flex flex-col items-center md:items-start">
              <h4 className="text-xs tracking-[0.2em] mb-4">{t("footer.shop")}</h4>
              <div className="space-y-3">
                {[t("col.classic"), t("col.vintage"), t("col.street")].map(item => (
                  <Link key={item} to="/shop" className="block text-muted-foreground text-sm hover:text-foreground transition-colors py-0.5">{item}</Link>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3} className="flex flex-col items-center md:items-start">
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
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.2} className="border-t border-border mt-10 md:mt-12 pt-6 text-center">
            <p className="text-muted-foreground text-xs">© 2025 Handball Seven. {t("footer.rights")}</p>
          </ScrollReveal>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
