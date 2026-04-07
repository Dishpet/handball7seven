import { motion } from "framer-motion";

interface ShippingWorldwideProps {
  className?: string;
  center?: boolean;
  delay?: number;
}

const ShippingWorldwide = ({ className = "", center = false, delay = 0.8 }: ShippingWorldwideProps) => (
  <motion.div
    className={`${center ? "text-center" : ""} ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
  >
    <p className="text-foreground/50 text-xs md:text-sm font-body tracking-wide">
      7 Continents. Handball Seven.
    </p>
    <p className="text-foreground font-display uppercase tracking-wider text-sm md:text-base mt-0.5">
      Shipping worldwide
    </p>
  </motion.div>
);

export default ShippingWorldwide;
