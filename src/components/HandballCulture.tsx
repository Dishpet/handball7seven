import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const handballElements = [
  {
    key: "suspension",
    icon: (
      <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 2-minute timer icon */}
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
        <path d="M32 18V32L42 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
        <text x="32" y="54" textAnchor="middle" className="text-primary" fill="currentColor" fontSize="10" fontWeight="700" fontFamily="Oswald, sans-serif">2'</text>
      </svg>
    ),
  },
  {
    key: "yellow_card",
    icon: (
      <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Yellow card */}
        <rect x="16" y="8" width="32" height="48" rx="3" className="fill-yellow-500" />
        <rect x="16" y="8" width="32" height="48" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-yellow-600" />
      </svg>
    ),
  },
  {
    key: "red_card",
    icon: (
      <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Red card */}
        <rect x="16" y="8" width="32" height="48" rx="3" className="fill-red-600" />
        <rect x="16" y="8" width="32" height="48" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-red-700" />
      </svg>
    ),
  },
  {
    key: "seven_meter",
    icon: (
      <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 7m line with ball */}
        <line x1="8" y1="44" x2="56" y2="44" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" className="text-muted-foreground" />
        <circle cx="32" cy="28" r="12" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
        <text x="32" y="33" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Oswald, sans-serif" className="text-primary">7</text>
      </svg>
    ),
  },
  {
    key: "attack_foul",
    icon: (
      <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Whistle icon */}
        <circle cx="22" cy="28" r="10" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
        <path d="M30 24L50 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary" />
        <path d="M22 38V50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-muted-foreground" />
        <circle cx="22" cy="53" r="2.5" fill="currentColor" className="text-muted-foreground" />
      </svg>
    ),
  },
];

const HandballCulture = () => {
  const { t } = useI18n();

  return (
    <section className="px-5 md:px-12 lg:px-20 py-12 md:py-24">
      <motion.div
        className="text-center mb-10 md:mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-xl sm:text-2xl md:text-4xl font-display uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-3 sm:mb-4">
          {t("handball.title")}
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {t("handball.subtitle")}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {handballElements.map((el, i) => (
          <motion.div
            key={el.key}
            className="group relative border border-border p-5 sm:p-6 text-center hover:border-primary/40 transition-all duration-500"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4">
              <div className="transition-transform duration-500 group-hover:scale-110">
                {el.icon}
              </div>
              <h3 className="font-display uppercase text-xs sm:text-sm tracking-wider leading-tight">
                {t(`handball.${el.key}.title`)}
              </h3>
              <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed hidden sm:block">
                {t(`handball.${el.key}.desc`)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HandballCulture;
