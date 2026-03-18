import SupportPage from "./SupportPage";

const fallbackSections = [
  {
    title: { hr: "Voditelj obrade", en: "Data Controller", de: "Verantwortlicher" },
    content: {
      hr: "Voditelj obrade osobnih podataka je:\n\n021 d.o.o.\nDubrovačka 18\n21000 Split\nOIB: 58893783378\n\n📧 info@handball7seven.com\n🌐 www.handball7seven.com",
      en: "The data controller is:\n\n021 d.o.o.\nDubrovačka 18\n21000 Split\nOIB: 58893783378\n\n📧 info@handball7seven.com\n🌐 www.handball7seven.com",
      de: "Der Verantwortliche für die Datenverarbeitung ist:\n\n021 d.o.o.\nDubrovačka 18\n21000 Split\nOIB: 58893783378\n\n📧 info@handball7seven.com\n🌐 www.handball7seven.com",
    },
  },
  {
    title: { hr: "Koje podatke prikupljamo", en: "What Data We Collect", de: "Welche Daten wir erheben" },
    content: {
      hr: "Prikupljamo samo podatke potrebne za obradu narudžbe:\n\nOsnovni podaci:\n• ime i prezime\n• adresa\n• e-mail\n• broj telefona\n\nPodaci o narudžbi:\n• naručeni proizvodi\n• način plaćanja\n• IP adresa\n\nPodaci o plaćanju:\nKartična plaćanja obrađuje Stripe. Ne pohranjujemo podatke o karticama.\n\nKolačići:\nStranica koristi kolačiće za:\n• funkcionalnost webshopa\n• analitiku (Google Analytics)\n• poboljšanje korisničkog iskustva",
      en: "We only collect data necessary for order processing:\n\nBasic data:\n• full name\n• address\n• email\n• phone number\n\nOrder data:\n• ordered products\n• payment method\n• IP address\n\nPayment data:\nCard payments are processed by Stripe. We do not store card details.\n\nCookies:\nThe site uses cookies for:\n• webshop functionality\n• analytics (Google Analytics)\n• improving user experience",
      de: "Wir erheben nur die für die Auftragsabwicklung notwendigen Daten:\n\nGrunddaten:\n• Vor- und Nachname\n• Adresse\n• E-Mail\n• Telefonnummer\n\nBestelldaten:\n• bestellte Produkte\n• Zahlungsmethode\n• IP-Adresse\n\nZahlungsdaten:\nKartenzahlungen werden von Stripe verarbeitet. Wir speichern keine Kartendaten.\n\nCookies:\nDie Website verwendet Cookies für:\n• Webshop-Funktionalität\n• Analytik (Google Analytics)\n• Verbesserung der Benutzererfahrung",
    },
  },
  {
    title: { hr: "Svrha obrade podataka", en: "Purpose of Data Processing", de: "Zweck der Datenverarbeitung" },
    content: {
      hr: "Podatke koristimo isključivo za:\n• obradu narudžbi\n• dostavu proizvoda\n• izdavanje računa\n• komunikaciju s kupcima\n• zakonske obveze",
      en: "We use data exclusively for:\n• order processing\n• product delivery\n• invoicing\n• customer communication\n• legal obligations",
      de: "Wir verwenden Daten ausschließlich für:\n• Auftragsabwicklung\n• Produktlieferung\n• Rechnungsstellung\n• Kundenkommunikation\n• gesetzliche Verpflichtungen",
    },
  },
  {
    title: { hr: "Dijeljenje podataka", en: "Data Sharing", de: "Datenweitergabe" },
    content: {
      hr: "Podaci mogu biti proslijeđeni samo:\n• dostavnim službama\n• Stripe sustavu za plaćanje\n• računovodstvu\n\nNikada ne prodajemo niti iznajmljujemo osobne podatke.",
      en: "Data may only be shared with:\n• delivery services\n• Stripe payment system\n• accounting\n\nWe never sell or rent personal data.",
      de: "Daten können nur weitergegeben werden an:\n• Lieferdienste\n• Stripe-Zahlungssystem\n• Buchhaltung\n\nWir verkaufen oder vermieten niemals personenbezogene Daten.",
    },
  },
  {
    title: { hr: "Koliko dugo čuvamo podatke", en: "Data Retention", de: "Datenspeicherung" },
    content: {
      hr: "Podaci se čuvaju:\n• računi → 11 godina\n• podaci o narudžbi → 5 godina\n• korisnička komunikacija → 1 godina\n\nNakon toga podaci se brišu ili anonimiziraju.",
      en: "Data is retained:\n• invoices → 11 years\n• order data → 5 years\n• customer communication → 1 year\n\nAfter that, data is deleted or anonymized.",
      de: "Daten werden aufbewahrt:\n• Rechnungen → 11 Jahre\n• Bestelldaten → 5 Jahre\n• Kundenkommunikation → 1 Jahr\n\nDanach werden die Daten gelöscht oder anonymisiert.",
    },
  },
  {
    title: { hr: "Prava korisnika", en: "User Rights", de: "Benutzerrechte" },
    content: {
      hr: "Korisnik ima pravo na:\n• pristup osobnim podacima\n• ispravak netočnih podataka\n• brisanje podataka\n• ograničenje obrade\n• prijenos podataka\n• povlačenje privole\n\nZa ostvarivanje prava kontakt: info@handball7seven.com",
      en: "Users have the right to:\n• access personal data\n• correct inaccurate data\n• delete data\n• restrict processing\n• data portability\n• withdraw consent\n\nTo exercise your rights, contact: info@handball7seven.com",
      de: "Benutzer haben das Recht auf:\n• Zugang zu personenbezogenen Daten\n• Berichtigung unrichtiger Daten\n• Löschung von Daten\n• Einschränkung der Verarbeitung\n• Datenübertragbarkeit\n• Widerruf der Einwilligung\n\nUm Ihre Rechte auszuüben, kontaktieren Sie: info@handball7seven.com",
    },
  },
];

export default function Privacy() {
  return (
    <SupportPage
      contentKey="page_privacy"
      fallbackTitle="Politika privatnosti"
      fallbackSections={fallbackSections}
    />
  );
}
