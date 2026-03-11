import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useI18n } from "@/lib/i18n";

const Contact = () => {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <main className="pt-20">
        <div className="px-5 md:px-12 lg:px-20 py-10 md:py-16 max-w-2xl mx-auto">
          <motion.h1
            className="text-2xl sm:text-3xl md:text-5xl font-display uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t("contact.title")}
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-sm md:text-base mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t("contact.info")}
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5 md:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <label className="font-display uppercase text-xs tracking-widest block mb-2">{t("contact.name")}</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors min-h-[48px]"
                required
              />
            </div>
            <div>
              <label className="font-display uppercase text-xs tracking-widest block mb-2">{t("contact.email")}</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors min-h-[48px]"
                required
              />
            </div>
            <div>
              <label className="font-display uppercase text-xs tracking-widest block mb-2">{t("contact.message")}</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                rows={5}
                className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full text-center min-h-[48px]">{t("contact.send")}</button>
          </motion.form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
