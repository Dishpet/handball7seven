import React, { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Lang = "en" | "de" | "hr";

// Mapping from DB section.field → i18n key
const DB_TO_I18N_MAP: Record<string, Record<string, string>> = {
  hero: { subtitle: "hero.subtitle", slogan: "hero.slogan", shop_button: "hero.shop", explore_button: "hero.explore" },
  brand: { title: "brand.title", text: "brand.text", cta: "brand.cta" },
  lifestyle: { headline: "lifestyle.headline", sub: "lifestyle.sub" },
  newsletter: { title: "newsletter.title", sub: "newsletter.sub", placeholder: "newsletter.placeholder", button: "newsletter.button" },
  bestsellers: { title: "bestsellers.title" },
  collections_page: { title: "featured.title" },
  about: { title: "about.title", p1: "about.p1", p2: "about.p2", p3: "about.p3" },
  contact: { title: "contact.title", info: "contact.info" },
  footer: { tagline: "footer.tagline" },
};

// Hardcoded fallback translations (for keys not managed via CMS)
const fallbackTranslations: Record<string, Record<Lang, string>> = {
  // Nav
  "nav.home": { en: "Home", de: "Startseite", hr: "Početna" },
  "nav.shop": { en: "Shop", de: "Shop", hr: "Trgovina" },
  "nav.collections": { en: "Collections", de: "Kollektionen", hr: "Kolekcije" },
  "nav.about": { en: "About", de: "Über uns", hr: "O nama" },
  "nav.contact": { en: "Contact", de: "Kontakt", hr: "Kontakt" },
  "nav.cart": { en: "Cart", de: "Warenkorb", hr: "Košarica" },

  // Hero (fallbacks)
  "hero.subtitle": { en: "The first lifestyle handball brand.", de: "Die erste Lifestyle-Handballmarke.", hr: "Prvi lifestyle handball brend." },
  "hero.slogan": { en: "Stubborn by nature.", de: "Stur von Natur aus.", hr: "Tvrdoglavi po prirodi." },
  "hero.shop": { en: "Shop Now", de: "Jetzt kaufen", hr: "Kupi sada" },
  "hero.explore": { en: "Explore Collections", de: "Kollektionen entdecken", hr: "Istraži kolekcije" },

  // Sections
  "featured.title": { en: "Collections", de: "Kollektionen", hr: "Kolekcije" },
  "bestsellers.title": { en: "Best Sellers", de: "Bestseller", hr: "Najprodavanije" },
  "brand.title": { en: "Born from the Toughest Game", de: "Geboren aus dem härtesten Spiel", hr: "Rođeno iz najtvrđe igre" },
  "brand.text": {
    en: "Handball Seven is the first lifestyle handball brand. Built for the stubborn — the players, the fans, and everyone who lives the game beyond the court. We are inspired by handball culture, resilience, resin-stained hands, taped fingers, and the everyday identity of those who breathe this sport.",
    de: "Handball Seven ist die erste Lifestyle-Handballmarke. Gebaut für die Sturköpfe — die Spieler, die Fans und alle, die das Spiel über das Spielfeld hinaus leben.",
    hr: "Handball Seven je prvi lifestyle handball brend. Stvoren za tvrdoglave — igrače, navijače i sve koji žive igru izvan terena."
  },
  "brand.cta": { en: "Discover More", de: "Mehr entdecken", hr: "Saznaj više" },

  // Lifestyle
  "lifestyle.headline": { en: "No Excuses. Just Passion.", de: "Keine Ausreden. Nur Leidenschaft.", hr: "Nema izgovora. Samo strast." },
  "lifestyle.sub": { en: "Inspired by the game, built for the grind.", de: "Inspiriert vom Spiel, gemacht für den Kampf.", hr: "Inspirirano igrom, stvoreno za borbu." },

  // Newsletter
  "newsletter.title": { en: "Join the Team", de: "Tritt dem Team bei", hr: "Pridruži se timu" },
  "newsletter.sub": { en: "Be the first to know about new drops, exclusive collections, and the handball lifestyle.", de: "Erfahre als Erster von neuen Drops, exklusiven Kollektionen und dem Handball-Lifestyle.", hr: "Budi prvi koji saznaje o novim izdanjima, ekskluzivnim kolekcijama i handball načinu života." },
  "newsletter.placeholder": { en: "Your email address", de: "Deine E-Mail-Adresse", hr: "Tvoja email adresa" },
  "newsletter.button": { en: "Subscribe", de: "Abonnieren", hr: "Pretplati se" },

  // Footer
  "footer.tagline": { en: "The first lifestyle handball brand. Stubborn by nature.", de: "Die erste Lifestyle-Handballmarke. Stur von Natur aus.", hr: "Prvi lifestyle handball brend. Tvrdoglavi po prirodi." },
  "footer.support": { en: "Support", de: "Support", hr: "Podrška" },
  "footer.shop": { en: "Shop", de: "Shop", hr: "Trgovina" },
  "footer.connect": { en: "Stay Connected", de: "Bleib verbunden", hr: "Ostani povezan" },
  "footer.shipping": { en: "Shipping & Returns", de: "Versand & Rückgabe", hr: "Dostava i povrati" },
  "footer.faq": { en: "FAQ", de: "FAQ", hr: "Česta pitanja" },
  "footer.privacy": { en: "Privacy Policy", de: "Datenschutz", hr: "Politika privatnosti" },
  "footer.terms": { en: "Terms of Service", de: "AGB", hr: "Uvjeti korištenja" },
  "footer.rights": { en: "All rights reserved.", de: "Alle Rechte vorbehalten.", hr: "Sva prava pridržana." },

  // Features bar
  "features.shipping": { en: "Fast Shipping", de: "Schneller Versand", hr: "Brza dostava" },
  "features.quality": { en: "Premium Quality", de: "Premium Qualität", hr: "Premium kvaliteta" },
  "features.payments": { en: "Secure Payments", de: "Sichere Zahlungen", hr: "Sigurno plaćanje" },
  "features.team": { en: "Join the Team", de: "Tritt dem Team bei", hr: "Pridruži se timu" },

  // Collections
  "col.classic": { en: "Classic Collection", de: "Classic Kollektion", hr: "Classic kolekcija" },
  "col.vintage": { en: "Vintage Collection", de: "Vintage Kollektion", hr: "Vintage kolekcija" },
  "col.kids": { en: "Kids Collection", de: "Kids Kollektion", hr: "Kids kolekcija" },
  "col.classic.desc": { en: "Minimal logo pieces. Premium clean branding in black and dark grey.", de: "Minimale Logo-Teile. Premium-Branding in Schwarz und Dunkelgrau.", hr: "Minimalistički logo komadi. Premium branding u crnoj i tamno sivoj." },
  "col.vintage.desc": { en: "Retro handball culture. Cream, beige, and warm heritage tones.", de: "Retro-Handballkultur. Creme, Beige und warme Heritage-Töne.", hr: "Retro handball kultura. Krem, bež i topli heritage tonovi." },
  "col.kids.desc": { en: "Fun but premium. Youth handball inspired with playful graphics.", de: "Spaßig aber Premium. Jugend-Handball inspiriert mit verspielten Grafiken.", hr: "Zabavno ali premium. Inspirirano mladim rukometašima sa razigranijom grafikom." },

  // Shop
  "shop.title": { en: "Shop All", de: "Alle Produkte", hr: "Svi proizvodi" },
  "shop.filter": { en: "Filter", de: "Filter", hr: "Filter" },
  "shop.addtocart": { en: "Add to Cart", de: "In den Warenkorb", hr: "Dodaj u košaricu" },
  "shop.size": { en: "Size", de: "Größe", hr: "Veličina" },
  "shop.color": { en: "Color", de: "Farbe", hr: "Boja" },
  "shop.price": { en: "Price", de: "Preis", hr: "Cijena" },
  "shop.collection": { en: "Collection", de: "Kollektion", hr: "Kolekcija" },
  "shop.related": { en: "You May Also Like", de: "Das könnte dir auch gefallen", hr: "Moglo bi ti se svidjeti" },
  "shop.details": { en: "Product Details", de: "Produktdetails", hr: "Detalji proizvoda" },
  "shop.shipping": { en: "Shipping & Returns", de: "Versand & Rückgabe", hr: "Dostava i povrati" },
  "shop.quantity": { en: "Quantity", de: "Menge", hr: "Količina" },
  "shop.headline": { en: "The Court Collection", de: "Die Court Kollektion", hr: "Court kolekcija" },
  "shop.subheadline": { en: "Design your piece. Built for the stubborn.", de: "Gestalte dein Stück. Gebaut für die Sturköpfe.", hr: "Dizajniraj svoj komad. Stvoren za tvrdoglave." },
  "shop.outofstock": { en: "Out of Stock", de: "Ausverkauft", hr: "Nema na zalihi" },
  "shop.tab.details": { en: "Details", de: "Details", hr: "Detalji" },
  "shop.tab.features": { en: "Features", de: "Ausstattung", hr: "Karakteristike" },
  "shop.tab.reviews": { en: "Reviews", de: "Bewertungen", hr: "Recenzije" },
  "shop.noreviews": { en: "No reviews yet", de: "Noch keine Bewertungen", hr: "Još nema recenzija" },
  "shop.firstreviewer": { en: "Be the first to review", de: "Sei der Erste, der bewertet", hr: "Budi prvi koji recenzira" },
  "shop.back": { en: "Back", de: "Zurück", hr: "Nazad" },
  "shop.fronttoback": { en: "Front", de: "Vorderseite", hr: "Prednja" },
  "shop.collection.street": { en: "Street", de: "Street", hr: "Street" },
  "shop.collection.logo": { en: "Logo", de: "Logo", hr: "Logo" },
  "shop.collection.vintage": { en: "Vintage", de: "Vintage", hr: "Vintage" },
  "shop.ratedbased": { en: "Based on", de: "Basierend auf", hr: "Temeljem" },
  "shop.reviews.count": { en: "reviews", de: "Bewertungen", hr: "recenzija" },

  // About
  "about.title": { en: "Our Story", de: "Unsere Geschichte", hr: "Naša priča" },
  "about.p1": {
    en: "Handball Seven was born from a simple truth: handball players have a unique identity — on and off the court. We are the first lifestyle brand built entirely around handball culture.",
    de: "Handball Seven wurde aus einer einfachen Wahrheit geboren: Handballspieler haben eine einzigartige Identität — auf und neben dem Spielfeld.",
    hr: "Handball Seven je nastao iz jednostavne istine: rukometaši imaju jedinstven identitet — na terenu i izvan njega."
  },
  "about.p2": {
    en: "Our pieces are inspired by the resilience, the grit, the resin on your hands, the tape on your fingers, and the worn-out shoes that tell a thousand stories.",
    de: "Unsere Stücke sind inspiriert von der Widerstandsfähigkeit, dem Kampfgeist, dem Harz an den Händen, dem Tape an den Fingern.",
    hr: "Naši komadi inspirirani su otpornošću, borbenim duhom, smolom na rukama, trakom na prstima."
  },
  "about.p3": {
    en: "From the court to everyday life — Handball Seven bridges the gap between sport heritage and modern streetwear. Built for the stubborn.",
    de: "Vom Spielfeld ins tägliche Leben — Handball Seven schließt die Lücke zwischen Sporterbe und moderner Streetwear.",
    hr: "S terena u svakodnevni život — Handball Seven premošćuje jaz između sportske baštine i modernog streetweara."
  },

  // Contact
  "contact.title": { en: "Get in Touch", de: "Kontaktiere uns", hr: "Kontaktiraj nas" },
  "contact.name": { en: "Name", de: "Name", hr: "Ime" },
  "contact.email": { en: "Email", de: "E-Mail", hr: "Email" },
  "contact.message": { en: "Message", de: "Nachricht", hr: "Poruka" },
  "contact.send": { en: "Send Message", de: "Nachricht senden", hr: "Pošalji poruku" },
  "contact.info": { en: "We'd love to hear from you.", de: "Wir freuen uns von dir zu hören.", hr: "Voljeli bismo čuti od tebe." },
};

// Feature bar keys mapping (by index)
const FEATURE_I18N_KEYS = ["features.shipping", "features.quality", "features.payments", "features.team"];

type I18nContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  getSiteContent: (sectionKey: string) => Record<string, any> | undefined;
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  getSiteContent: () => undefined,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("en");

  // Fetch all site_content from DB
  const { data: dbContent } = useQuery({
    queryKey: ["site_content_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*");
      if (error) throw error;
      return data;
    },
    staleTime: 60_000, // cache for 1 min
  });

  // Build DB overrides map: i18n key → { en, de, hr }
  const dbOverrides = React.useMemo(() => {
    if (!dbContent) return {};
    const overrides: Record<string, Record<Lang, string>> = {};
    const contentMap: Record<string, any> = {};

    for (const row of dbContent) {
      contentMap[row.key] = row.value;
    }

    // Map standard sections
    for (const [sectionKey, fieldMap] of Object.entries(DB_TO_I18N_MAP)) {
      const section = contentMap[sectionKey];
      if (!section) continue;
      for (const [fieldName, i18nKey] of Object.entries(fieldMap)) {
        const val = section[fieldName];
        if (typeof val === "object" && val !== null) {
          overrides[i18nKey] = { en: val.en || "", de: val.de || "", hr: val.hr || "" };
        }
      }
    }

    // Map features_bar items
    const fb = contentMap["features_bar"];
    if (fb?.items && Array.isArray(fb.items)) {
      fb.items.forEach((item: any, idx: number) => {
        if (FEATURE_I18N_KEYS[idx] && typeof item.label === "object") {
          overrides[FEATURE_I18N_KEYS[idx]] = { en: item.label.en || "", de: item.label.de || "", hr: item.label.hr || "" };
        }
      });
    }

    return overrides;
  }, [dbContent]);

  // Build raw content map for non-i18n access (socials, contact details, etc.)
  const siteContentMap = React.useMemo(() => {
    if (!dbContent) return {};
    const map: Record<string, any> = {};
    for (const row of dbContent) {
      map[row.key] = row.value;
    }
    return map;
  }, [dbContent]);

  const t = (key: string) => {
    // DB overrides first
    const override = dbOverrides[key];
    if (override && override[lang]) return override[lang];
    // Fallback to hardcoded
    return fallbackTranslations[key]?.[lang] || fallbackTranslations[key]?.en || key;
  };

  const getSiteContent = (sectionKey: string) => siteContentMap[sectionKey];

  return <I18nContext.Provider value={{ lang, setLang, t, getSiteContent }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
