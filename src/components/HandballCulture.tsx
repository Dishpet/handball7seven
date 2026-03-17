import { motion } from "framer-motion";
import { Zap, Target, Shield, Fence, Swords, Users, Warehouse } from "lucide-react";

const elements = [
  {
    num: 1,
    title: "Fast Break",
    lines: ["Speed changes everything.", "The game can turn in seconds."],
    icon: Zap,
  },
  {
    num: 2,
    title: "The Shot",
    lines: ["Power. Precision. Instinct.", "Every attack ends with a moment that decides it all."],
    icon: Target,
  },
  {
    num: 3,
    title: "The Save",
    lines: ["One reaction. One movement.", "Goalkeepers change the course of the game."],
    icon: Shield,
  },
  {
    num: 4,
    title: "Defense",
    lines: ["The heart of the game.", "Every attack begins with a wall that refuses to break."],
    icon: Fence,
  },
  {
    num: 5,
    title: "Contact",
    lines: ["Handball is built on physical battles.", "Strength, balance and courage decide every duel."],
    icon: Swords,
  },
  {
    num: 6,
    title: "The System",
    lines: ["Seven players. One structure.", "Every role matters."],
    icon: Users,
  },
  {
    num: 7,
    title: "The Pass",
    lines: ["The game moves faster than any player.", "The ball decides everything."],
    icon: Warehouse,
  },
];

const HandballCulture = () => {
  return (
    <section className="px-5 md:px-12 lg:px-20 py-16 md:py-28">
      <motion.div
        className="text-center mb-12 md:mb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-xl sm:text-2xl md:text-4xl font-display uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-3 sm:mb-4">
          The Seven Elements of Handball
        </h2>
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
        {elements.map((el, i) => {
          const Icon = el.icon;
          return (
            <motion.div
              key={el.num}
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
                    {el.num}
                  </span>
                  <Icon className="w-6 h-6 text-primary transition-transform duration-500 group-hover:scale-110" strokeWidth={1.8} />
                </div>

                <h3 className="font-display uppercase text-sm sm:text-base tracking-wider">
                  {el.title}
                </h3>

                <div className="space-y-1">
                  {el.lines.map((line, j) => (
                    <p key={j} className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Closing element spanning the 7th card position on large screens */}
        <motion.div
          className="sm:col-span-2 lg:col-span-3 text-center pt-8 md:pt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <p className="font-display uppercase text-lg sm:text-xl md:text-2xl tracking-[0.15em] text-foreground">
            Seven elements.
          </p>
          <p className="font-display uppercase text-lg sm:text-xl md:text-2xl tracking-[0.15em] text-primary mt-1">
            One game.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HandballCulture;
