import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ScrollCharRevealProps {
  text: string;
  className?: string;
  as?: "span" | "p" | "h2" | "h3" | "div";
  charDelay?: number;
}

const ScrollCharReveal = ({
  text,
  className = "",
  as: Tag = "span",
  charDelay = 0.02,
}: ScrollCharRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.4"],
  });

  const chars = text.split("");

  return (
    <motion.div ref={ref} className="inline">
      <Tag className={className}>
        {chars.map((char, i) => (
          <CharReveal
            key={i}
            char={char}
            index={i}
            total={chars.length}
            progress={scrollYProgress}
            charDelay={charDelay}
          />
        ))}
      </Tag>
    </motion.div>
  );
};

const CharReveal = ({
  char,
  index,
  total,
  progress,
  charDelay,
}: {
  char: string;
  index: number;
  total: number;
  progress: any;
  charDelay: number;
}) => {
  const start = index * charDelay;
  const end = Math.min(start + 0.3, 1);
  const opacity = useTransform(progress, [start, end], [0.1, 1]);
  const y = useTransform(progress, [start, end], [8, 0]);

  return (
    <motion.span
      style={{ opacity, y, display: "inline-block" }}
      className={char === " " ? "w-[0.3em]" : ""}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
};

export default ScrollCharReveal;
