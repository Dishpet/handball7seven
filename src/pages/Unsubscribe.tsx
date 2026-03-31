import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid === false && data.reason === "already_unsubscribed") setStatus("already");
        else if (data.valid) setStatus("valid");
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const { data } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-md mx-auto px-5 py-16 text-center">
          {status === "loading" && <p className="text-muted-foreground">Verifying…</p>}
          {status === "valid" && (
            <>
              <h1 className="text-2xl font-display uppercase tracking-widest mb-4">Unsubscribe</h1>
              <p className="text-muted-foreground mb-6">Click below to unsubscribe from our emails.</p>
              <button
                onClick={handleUnsubscribe}
                disabled={submitting}
                className="btn-primary px-8 py-3 min-h-[48px] disabled:opacity-50"
              >
                {submitting ? "Processing…" : "Confirm Unsubscribe"}
              </button>
            </>
          )}
          {status === "success" && (
            <>
              <h1 className="text-2xl font-display uppercase tracking-widest mb-4">Unsubscribed</h1>
              <p className="text-muted-foreground">You've been successfully unsubscribed.</p>
            </>
          )}
          {status === "already" && (
            <>
              <h1 className="text-2xl font-display uppercase tracking-widest mb-4">Already Unsubscribed</h1>
              <p className="text-muted-foreground">This email has already been unsubscribed.</p>
            </>
          )}
          {status === "invalid" && (
            <>
              <h1 className="text-2xl font-display uppercase tracking-widest mb-4">Invalid Link</h1>
              <p className="text-muted-foreground">This unsubscribe link is invalid or has expired.</p>
            </>
          )}
          {status === "error" && (
            <>
              <h1 className="text-2xl font-display uppercase tracking-widest mb-4">Error</h1>
              <p className="text-muted-foreground">Something went wrong. Please try again later.</p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Unsubscribe;
