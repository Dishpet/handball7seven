import SupportPage from "./SupportPage";

const fallbackSections = [
  {
    title: { hr: "Dostava", en: "Shipping", de: "Versand" },
    content: {
      hr: "Proizvodi naručeni putem web trgovine handball7seven.com dostavljaju se putem partnerskih dostavnih službi:\n• GLS\n• DPD\n• HP Express\n\nDostava se vrši na adresu koju kupac navede prilikom narudžbe.",
      en: "Products ordered through the handball7seven.com webshop are delivered via our partner delivery services:\n• GLS\n• DPD\n• HP Express\n\nDelivery is made to the address provided by the customer during the order.",
      de: "Über den handball7seven.com Webshop bestellte Produkte werden über unsere Partner-Lieferdienste geliefert:\n• GLS\n• DPD\n• HP Express\n\nDie Lieferung erfolgt an die vom Kunden bei der Bestellung angegebene Adresse.",
    },
  },
  {
    title: { hr: "Rok isporuke", en: "Delivery Time", de: "Lieferzeit" },
    content: {
      hr: "Standardni rok dostave je 3 – 7 radnih dana unutar Hrvatske.\n\nZa međunarodne narudžbe rok dostave može biti 5 – 14 radnih dana, ovisno o državi isporuke.\n\nU slučaju povećanog opterećenja ili izvanrednih okolnosti rok dostave može biti produžen.\n\nKupac će o statusu narudžbe biti obaviješten putem e-maila.",
      en: "Standard delivery time is 3–7 business days within Croatia.\n\nFor international orders, delivery may take 5–14 business days depending on the destination country.\n\nIn cases of high demand or extraordinary circumstances, delivery times may be extended.\n\nCustomers will be notified of order status via email.",
      de: "Die Standardlieferzeit beträgt 3–7 Werktage innerhalb Kroatiens.\n\nBei internationalen Bestellungen kann die Lieferzeit je nach Zielland 5–14 Werktage betragen.\n\nBei hoher Nachfrage oder außergewöhnlichen Umständen kann die Lieferzeit verlängert werden.\n\nKunden werden per E-Mail über den Bestellstatus informiert.",
    },
  },
  {
    title: { hr: "Trošak dostave", en: "Shipping Cost", de: "Versandkosten" },
    content: {
      hr: "Trošak dostave prikazan je prilikom završetka narudžbe i ovisi o:\n• lokaciji dostave\n• težini paketa\n• odabranoj dostavnoj službi",
      en: "Shipping cost is displayed at checkout and depends on:\n• delivery location\n• package weight\n• selected delivery service",
      de: "Die Versandkosten werden beim Checkout angezeigt und hängen ab von:\n• Lieferort\n• Paketgewicht\n• gewähltem Lieferdienst",
    },
  },
  {
    title: { hr: "Povrat proizvoda", en: "Product Returns", de: "Produktrückgabe" },
    content: {
      hr: "Kupac ima pravo odustati od kupnje u roku od 14 dana od dana primitka proizvoda bez navođenja razloga.\n\nZa ostvarivanje prava na povrat potrebno je poslati zahtjev na:\n📧 info@handball7seven.com",
      en: "The customer has the right to cancel the purchase within 14 days of receiving the product without giving a reason.\n\nTo exercise the right of return, please send a request to:\n📧 info@handball7seven.com",
      de: "Der Kunde hat das Recht, den Kauf innerhalb von 14 Tagen nach Erhalt des Produkts ohne Angabe von Gründen zu widerrufen.\n\nUm das Rückgaberecht auszuüben, senden Sie bitte eine Anfrage an:\n📧 info@handball7seven.com",
    },
  },
  {
    title: { hr: "Uvjeti povrata", en: "Return Conditions", de: "Rückgabebedingungen" },
    content: {
      hr: "Proizvod mora biti:\n• nekorišten\n• neoštećen\n• u originalnom pakiranju\n\nKupac snosi trošak povrata robe osim u slučaju:\n• pogrešno poslanog proizvoda\n• oštećenog proizvoda",
      en: "The product must be:\n• unused\n• undamaged\n• in original packaging\n\nThe customer bears the cost of returning goods except in case of:\n• incorrectly shipped product\n• damaged product",
      de: "Das Produkt muss:\n• unbenutzt\n• unbeschädigt\n• in Originalverpackung sein\n\nDer Kunde trägt die Rücksendekosten, außer bei:\n• falsch gesendetem Produkt\n• beschädigtem Produkt",
    },
  },
  {
    title: { hr: "Povrat novca", en: "Refund", de: "Rückerstattung" },
    content: {
      hr: "Nakon zaprimanja vraćenog proizvoda povrat novca izvršit će se u roku od do 14 dana na isti način plaćanja kojim je narudžba izvršena.",
      en: "After receiving the returned product, a refund will be issued within 14 days using the same payment method used for the order.",
      de: "Nach Erhalt des zurückgesendeten Produkts wird die Rückerstattung innerhalb von 14 Tagen über dieselbe Zahlungsmethode erfolgen.",
    },
  },
];

export default function Shipping() {
  return (
    <SupportPage
      contentKey="page_shipping"
      fallbackTitle="Dostava i povrati"
      fallbackSections={fallbackSections}
    />
  );
}
