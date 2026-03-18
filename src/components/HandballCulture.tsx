import { motion } from "framer-motion";
import { Zap, Target, Shield, Fence, Swords, Users, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const defaultElements = [
  { title: "Fast Break", line1: "Speed changes everything.", line2: "The game can turn in seconds.", icon: Zap },
  { title: "The Shot", line1: "Power. Precision. Instinct.", line2: "Every attack ends with a moment that decides it all.", icon: Target },
  { title: "The Save", line1: "One reaction. One movement.", line2: "Goalkeepers change the course of the game.", icon: Shield },
  { title: "Defense", line1: "The heart of the game.", line2: "Every attack begins with a wall that refuses to break.", icon: Fence },
  { title: "Contact", line1: "Handball is built on physical battles.", line2: "Strength, balance and courage decide every duel.", icon: Swords },
  { title: "The System", line1: "Seven players. One structure.", line2: "Every role matters.", icon: Users },
  { title: "The Pass", line1: "The game moves faster than any player.", line2: "The ball decides everything.", icon: Send },
];

const icons = [Zap, Target, Shield, Fence, Swords, Users, Send];

const HandballCulture = () => {
  const { getSiteContent } = useI18n();
  const cmsData = getSiteContent("handball_elements") as {
    section_title?: string;
    closing_line_1?: string;
    closing_line_2?: string;
    elements?: { title: string; line1: string; line2: string }[];
  } | undefined;

  const sectionTitle = cmsData?.section_title || "The Seven Elements of Handball";
  const closingLine1 = cmsData?.closing_line_1 || "Seven elements.";
  const closingLine2 = cmsData?.closing_line_2 || "One game.";
  const elements = (cmsData?.elements && cmsData.elements.length === 7)
    ? cmsData.elements.map((el, i) => ({ ...el, icon: icons[i] }))
    : defaultElements;

  return (
    <section className="px-5 md:px-12 lg:px-20 py-16 md:py-28">
      <motion.div
        className="text-center mb-12 md:mb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-xl sm:text-2xl md:text-4xl font-display uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-3 sm:mb-4">
          {sectionTitle}
        </h2>
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
        {elements.map((el, i) => {
          const Icon = el.icon;
          return (
            <motion.div
              key={i}
              className="group relative border border-border p-6 sm:p-8 hover:border-primary/40 transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-display text-3xl md:text-4xl text-primary/20 leading-none">
                    {i + 1}
                  </span>
                  <Icon className="w-6 h-6 text-primary transition-transform duration-500 group-hover:scale-110" strokeWidth={1.8} />
                </div>

                <h3 className="font-display uppercase text-sm sm:text-base tracking-wider">
                  {el.title}
                </h3>

                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{el.line1}</p>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{el.line2}</p>
                </div>
              </div>
            </motion.div>
          );
        })}

        <motion.div
          className="sm:col-span-2 lg:col-span-3 text-center pt-8 md:pt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <p className="font-display uppercase text-lg sm:text-xl md:text-2xl tracking-[0.15em] text-foreground">
            {closingLine1}
          </p>
          <p className="font-display uppercase text-lg sm:text-xl md:text-2xl tracking-[0.15em] text-primary mt-1">
            {closingLine2}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HandballCulture;