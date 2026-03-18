import SupportPage from "./SupportPage";

const fallbackSections = [
  {
    title: { hr: "Opće odredbe", en: "General Provisions", de: "Allgemeine Bestimmungen" },
    content: {
      hr: "Ovi uvjeti korištenja reguliraju kupnju proizvoda putem web trgovine www.handball7seven.com\n\nKupnjom putem stranice korisnik potvrđuje da je upoznat s uvjetima te ih prihvaća.",
      en: "These terms of use regulate the purchase of products through the online store www.handball7seven.com\n\nBy purchasing through the website, the user confirms awareness and acceptance of these terms.",
      de: "Diese Nutzungsbedingungen regeln den Kauf von Produkten über den Online-Shop www.handball7seven.com\n\nMit dem Kauf über die Website bestätigt der Nutzer die Kenntnis und Akzeptanz dieser Bedingungen.",
    },
  },
  {
    title: { hr: "Podaci o prodavatelju", en: "Seller Information", de: "Verkäuferinformationen" },
    content: {
      hr: "021 d.o.o.\nDubrovačka 18\n21000 Split\nOIB: 58893783378\n\nE-mail: info@handball7seven.com",
      en: "021 d.o.o.\nDubrovačka 18\n21000 Split\nOIB: 58893783378\n\nEmail: info@handball7seven.com",
      de: "021 d.o.o.\nDubrovačka 18\n21000 Split\nOIB: 58893783378\n\nE-Mail: info@handball7seven.com",
    },
  },
  {
    title: { hr: "Cijene", en: "Prices", de: "Preise" },
    content: {
      hr: "Sve cijene prikazane na webshopu izražene su u eurima (€) i uključuju PDV.\n\nCijene vrijede u trenutku narudžbe.\n\nU slučaju tehničke pogreške u cijeni prodavatelj zadržava pravo poništenja narudžbe.",
      en: "All prices displayed on the webshop are in euros (€) and include VAT.\n\nPrices are valid at the time of order.\n\nIn case of a technical pricing error, the seller reserves the right to cancel the order.",
      de: "Alle im Webshop angezeigten Preise sind in Euro (€) und beinhalten die Mehrwertsteuer.\n\nPreise gelten zum Zeitpunkt der Bestellung.\n\nBei technischen Preisfehlern behält sich der Verkäufer das Recht vor, die Bestellung zu stornieren.",
    },
  },
  {
    title: { hr: "Narudžba", en: "Orders", de: "Bestellungen" },
    content: {
      hr: "Kupnja se vrši putem webshopa.\n\nNarudžba je potvrđena kada sustav automatski pošalje e-mail potvrdu narudžbe.\n\nKupac je dužan unijeti točne podatke.",
      en: "Purchases are made through the webshop.\n\nAn order is confirmed when the system automatically sends an order confirmation email.\n\nThe customer is obligated to enter accurate information.",
      de: "Einkäufe werden über den Webshop getätigt.\n\nEine Bestellung ist bestätigt, wenn das System automatisch eine Bestellbestätigung per E-Mail sendet.\n\nDer Kunde ist verpflichtet, korrekte Daten einzugeben.",
    },
  },
  {
    title: { hr: "Odgovornost", en: "Liability", de: "Haftung" },
    content: {
      hr: "Prodavatelj nije odgovoran za:\n• privremenu nedostupnost web stranice\n• netočne podatke koje unese kupac\n• kašnjenja uzrokovana dostavnim službama",
      en: "The seller is not responsible for:\n• temporary unavailability of the website\n• incorrect data entered by the customer\n• delays caused by delivery services",
      de: "Der Verkäufer ist nicht verantwortlich für:\n• vorübergehende Nichtverfügbarkeit der Website\n• vom Kunden eingegebene falsche Daten\n• durch Lieferdienste verursachte Verzögerungen",
    },
  },
  {
    title: { hr: "Autorska prava", en: "Copyright", de: "Urheberrecht" },
    content: {
      hr: "Sav sadržaj na stranici handball7seven.com (tekstovi, fotografije, grafike, logo, dizajn) zaštićen je autorskim pravima i nije ga dopušteno koristiti bez odobrenja.",
      en: "All content on handball7seven.com (texts, photographs, graphics, logo, design) is protected by copyright and may not be used without permission.",
      de: "Alle Inhalte auf handball7seven.com (Texte, Fotos, Grafiken, Logo, Design) sind urheberrechtlich geschützt und dürfen nicht ohne Genehmigung verwendet werden.",
    },
  },
  {
    title: { hr: "Primjenjivo pravo", en: "Applicable Law", de: "Anwendbares Recht" },
    content: {
      hr: "Na ove uvjete primjenjuje se pravo Republike Hrvatske.\n\nZa sve sporove nadležan je sud u Splitu.",
      en: "These terms are governed by the law of the Republic of Croatia.\n\nAll disputes are subject to the jurisdiction of the court in Split.",
      de: "Diese Bedingungen unterliegen dem Recht der Republik Kroatien.\n\nFür alle Streitigkeiten ist das Gericht in Split zuständig.",
    },
  },
];

export default function Terms() {
  return (
    <SupportPage
      contentKey="page_terms"
      fallbackTitle="Uvjeti korištenja"
      fallbackSections={fallbackSections}
    />
  );
}
