import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type SupportSection = {
  title: Record<string, string> | string;
  content: Record<string, string> | string;
};

type FaqItem = {
  question: Record<string, string> | string;
  answer: Record<string, string> | string;
};

type PageData = {
  title?: Record<string, string> | string;
  sections?: SupportSection[];
  faq_items?: FaqItem[];
};

function getLocalized(val: Record<string, string> | string | undefined, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.hr || val.en || "";
}

export default function SupportPage({ contentKey, fallbackTitle, fallbackSections, fallbackFaq }: {
  contentKey: string;
  fallbackTitle: string;
  fallbackSections?: SupportSection[];
  fallbackFaq?: FaqItem[];
}) {
  const { lang, getSiteContent } = useI18n();
  const data = getSiteContent(contentKey) as PageData | undefined;

  const title = getLocalized(data?.title || fallbackTitle, lang);
  const sections = data?.sections || fallbackSections || [];
  const faqItems = data?.faq_items || fallbackFaq || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16 px-5 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <h1 className="text-3xl md:text-5xl font-display uppercase tracking-wider font-black mb-10">
              {title}
            </h1>
          </ScrollReveal>

          {sections.map((section, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className="mb-10">
                <h2 className="text-lg md:text-xl font-display uppercase tracking-wider font-bold mb-4 text-primary">
                  {getLocalized(section.title, lang)}
                </h2>
                <div
                  className="text-foreground/70 font-body text-sm leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: getLocalized(section.content, lang).replace(/\n/g, "<br/>") }}
                />
              </div>
            </ScrollReveal>
          ))}

          {faqItems.length > 0 && (
            <ScrollReveal delay={0.1}>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                    <AccordionTrigger className="text-left font-display uppercase tracking-wider text-sm">
                      {getLocalized(item.question, lang)}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/70 font-body text-sm leading-relaxed whitespace-pre-line">
                      {getLocalized(item.answer, lang)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollReveal>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
