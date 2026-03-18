import SupportPage from "./SupportPage";

const fallbackFaq = [
  {
    question: { hr: "Kako mogu naručiti proizvod?", en: "How can I order a product?", de: "Wie kann ich ein Produkt bestellen?" },
    answer: {
      hr: "Proizvodi se naručuju putem webshopa na adresi www.handball7seven.com\n\nOdaberite željeni proizvod, dodajte ga u košaricu i slijedite korake naplate.",
      en: "Products are ordered through the webshop at www.handball7seven.com\n\nSelect the desired product, add it to the cart and follow the checkout steps.",
      de: "Produkte werden über den Webshop unter www.handball7seven.com bestellt.\n\nWählen Sie das gewünschte Produkt, legen Sie es in den Warenkorb und folgen Sie den Checkout-Schritten.",
    },
  },
  {
    question: { hr: "Koje načine plaćanja prihvaćate?", en: "What payment methods do you accept?", de: "Welche Zahlungsmethoden akzeptieren Sie?" },
    answer: {
      hr: "Plaćanje je moguće putem:\n• debitnih i kreditnih kartica (Visa, Mastercard, Maestro)\n• Apple Pay\n• Google Pay\n\nPlaćanje se vrši putem sigurnog Stripe sustava.",
      en: "Payment is possible via:\n• debit and credit cards (Visa, Mastercard, Maestro)\n• Apple Pay\n• Google Pay\n\nPayment is processed through the secure Stripe system.",
      de: "Zahlung ist möglich über:\n• Debit- und Kreditkarten (Visa, Mastercard, Maestro)\n• Apple Pay\n• Google Pay\n\nDie Zahlung erfolgt über das sichere Stripe-System.",
    },
  },
  {
    question: { hr: "Je li plaćanje sigurno?", en: "Is payment secure?", de: "Ist die Zahlung sicher?" },
    answer: {
      hr: "Da. Sve kartične transakcije obrađuju se putem Stripe sustava, koji koristi najviše sigurnosne standarde (PCI-DSS).\n\nWeb stranica koristi SSL enkripciju za zaštitu podataka.",
      en: "Yes. All card transactions are processed through the Stripe system, which uses the highest security standards (PCI-DSS).\n\nThe website uses SSL encryption to protect data.",
      de: "Ja. Alle Kartentransaktionen werden über das Stripe-System verarbeitet, das höchste Sicherheitsstandards (PCI-DSS) verwendet.\n\nDie Website verwendet SSL-Verschlüsselung zum Schutz der Daten.",
    },
  },
  {
    question: { hr: "Mogu li promijeniti ili otkazati narudžbu?", en: "Can I change or cancel my order?", de: "Kann ich meine Bestellung ändern oder stornieren?" },
    answer: {
      hr: "Ako narudžba još nije poslana, moguće ju je izmijeniti ili otkazati.\n\nZa izmjene kontaktirajte: info@handball7seven.com",
      en: "If the order has not yet been shipped, it can be modified or cancelled.\n\nFor changes contact: info@handball7seven.com",
      de: "Wenn die Bestellung noch nicht versandt wurde, kann sie geändert oder storniert werden.\n\nFür Änderungen kontaktieren Sie: info@handball7seven.com",
    },
  },
  {
    question: { hr: "Kako mogu pratiti svoju narudžbu?", en: "How can I track my order?", de: "Wie kann ich meine Bestellung verfolgen?" },
    answer: {
      hr: "Nakon slanja paketa kupac će primiti e-mail s informacijama o praćenju pošiljke.",
      en: "After the package is shipped, the customer will receive an email with tracking information.",
      de: "Nach dem Versand des Pakets erhält der Kunde eine E-Mail mit Tracking-Informationen.",
    },
  },
  {
    question: { hr: "Dostavljate li međunarodno?", en: "Do you deliver internationally?", de: "Liefern Sie international?" },
    answer: {
      hr: "Da. Dostava je moguća u većinu europskih zemalja.",
      en: "Yes. Delivery is available to most European countries.",
      de: "Ja. Die Lieferung ist in die meisten europäischen Länder möglich.",
    },
  },
];

export default function Faq() {
  return (
    <SupportPage
      contentKey="page_faq"
      fallbackTitle="Česta pitanja"
      fallbackFaq={fallbackFaq}
    />
  );
}
