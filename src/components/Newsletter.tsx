import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import ScrollReveal from "@/components/ScrollReveal";
import { supabase } from "@/integrations/supabase/client";

const Newsletter = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email });
      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("Welcome to the team!");
      }
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="px-5 md:px-12 lg:px-20 py-12 md:py-24 bg-card">
      <ScrollReveal className="max-w-xl mx-auto text-center">
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
          <button type="submit" disabled={submitting} className="btn-primary whitespace-nowrap min-h-[48px] disabled:opacity-50">
            {submitting ? "..." : t("newsletter.button")}
          </button>
        </form>
      </ScrollReveal>
    </section>
  );
};

export default Newsletter;
