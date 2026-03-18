import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useI18n } from "@/lib/i18n";

const defaultManifesto = [
  { text: "Seven is not just a number.", style: "hero" },
  { text: "Seven is the game.", style: "hero" },
  { text: "7 days in a week.", style: "stat" },
  { text: "7 players on the court.", style: "stat" },
  { text: "7 positions in handball.", style: "stat" },
  { text: "The game was built around seven.", style: "accent" },
  { text: "So is this brand.", style: "accent" },
  { text: "From the wings to the line.", style: "normal" },
  { text: "From the backcourt to the goal.", style: "normal" },
  { text: "Every player has a role.", style: "normal" },
  { text: "Every role has a story.", style: "normal" },
  { text: "This is not just apparel.", style: "accent" },
  { text: "This is the culture of the game.", style: "accent" },
  { text: "Seven players. One court. One perfect game.", style: "hero" },
  { text: "Handball Seven.", style: "brand" },
];

const SevenManifesto = () => {
  const { getSiteContent } = useI18n();
  const cmsData = getSiteContent("manifesto") as { lines?: { text: string; style: string }[] } | undefined;
  const manifesto = (cmsData?.lines && cmsData.lines.length > 0) ? cmsData.lines : defaultManifesto;

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-background">
      {/* Subtle large "7" background watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ y: bgY }}
      >
        <span
          className="font-display text-[40vw] sm:text-[30vw] lg:text-[25vw] leading-none text-primary/[0.04]"
          aria-hidden="true"
        >
          7
        </span>
      </motion.div>

      <div className="relative z-10 px-5 md:px-12 lg:px-20 py-20 md:py-32 lg:py-40">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 lg:space-y-10">
          {manifesto.map((line, i) => (
            <ManifestoLine key={i} line={line} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ManifestoLine = ({
  line,
  index,
}: {
  line: { text: string; style: string };
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "start 0.4"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  const getClasses = () => {
    switch (line.style) {
      case "hero":
        return "text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display uppercase tracking-wider text-foreground";
      case "brand":
        return "text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display uppercase tracking-[0.2em] text-primary";
      case "accent":
        return "text-lg sm:text-xl md:text-2xl lg:text-3xl font-display uppercase tracking-wider text-primary/80";
      case "stat":
        return "text-xl sm:text-2xl md:text-3xl font-display uppercase tracking-widest text-foreground/70";
      default:
        return "text-base sm:text-lg md:text-xl text-muted-foreground font-body leading-relaxed";
    }
  };

  const getAlignment = () => {
    if (line.style === "brand") return "text-center";
    if (line.style === "hero") return index % 2 === 0 ? "text-left" : "text-right";
    if (line.style === "stat") return "text-center";
    return index % 2 === 0 ? "text-left md:text-left" : "text-right md:text-right";
  };

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={`${getAlignment()}`}
    >
      <span className={getClasses()}>{line.text}</span>
      {line.style === "brand" && (
        <div className="mt-6 flex justify-center">
          <div className="w-16 h-px bg-primary/40" />
        </div>
      )}
    </motion.div>
  );
};

export default SevenManifesto;
