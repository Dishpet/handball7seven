import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

const Newsletter = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Welcome to the team!");
      setEmail("");
    }
  };

  return (
    <section className="px-5 md:px-12 lg:px-20 py-12 md:py-24 bg-card">
      <motion.div
        className="max-w-xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-display uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-3 sm:mb-4">
          {t("newsletter.title")}
        </h2>
        <p className="text-muted-foreground text-sm mb-6 sm:mb-8">{t("newsletter.sub")}</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t("newsletter.placeholder")}
            className="flex-1 bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors min-h-[48px]"
            required
          />
          <button type="submit" className="btn-primary whitespace-nowrap min-h-[48px]">{t("newsletter.button")}</button>
        </form>
      </motion.div>
    </section>
  );
};

export default Newsletter;
