import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Direction of entrance: up (default), left, right, scale */
  direction?: "up" | "left" | "right" | "scale";
  /** How far the element travels in px */
  distance?: number;
  /** Delay as a fraction of scroll progress (0-0.5) */
  delay?: number;
  /** Scroll offset for when animation starts/ends */
  startOffset?: string;
  endOffset?: string;
}

const ScrollReveal = ({
  children,
  className = "",
  direction = "up",
  distance = 40,
  delay = 0,
  startOffset = "start 0.95",
  endOffset = "start 0.55",
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [startOffset as any, endOffset as any],
  });

  const clampedStart = Math.min(delay, 0.5);
  const opacity = useTransform(scrollYProgress, [clampedStart, clampedStart + 0.5], [0, 1]);

  let style: Record<string, any> = { opacity };

  if (direction === "up") {
    style.y = useTransform(scrollYProgress, [clampedStart, clampedStart + 0.5], [distance, 0]);
  } else if (direction === "left") {
    style.x = useTransform(scrollYProgress, [clampedStart, clampedStart + 0.5], [-distance, 0]);
  } else if (direction === "right") {
    style.x = useTransform(scrollYProgress, [clampedStart, clampedStart + 0.5], [distance, 0]);
  } else if (direction === "scale") {
    style.scale = useTransform(scrollYProgress, [clampedStart, clampedStart + 0.5], [0.9, 1]);
  }

  return (
    <motion.div ref={ref} style={style} className={className}>
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
