import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      throw new Error("Missing required fields: name, email, message");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY not set, skipping email send");
      return new Response(JSON.stringify({ sent: false, reason: "no_api_key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#000;padding:24px;text-align:center;">
      <h1 style="color:#d4a24e;font-size:24px;margin:0;letter-spacing:4px;text-transform:uppercase;">HANDBALL 7EVEN</h1>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="color:#000;font-size:20px;margin:0 0 16px;">New Contact Form Message</h2>
      <div style="background:#f9f9f9;padding:16px;border-left:3px solid #d4a24e;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#666;">
          <strong>Name:</strong> ${name}<br/>
          <strong>Email:</strong> ${email}<br/>
          <strong>Date:</strong> ${new Date().toLocaleString()}
        </p>
      </div>
      <div style="background:#f9f9f9;padding:16px;border-radius:4px;">
        <p style="margin:0;font-size:14px;color:#333;white-space:pre-wrap;">${message}</p>
      </div>
    </div>
    <div style="background:#000;padding:16px;text-align:center;">
      <p style="color:#888;font-size:11px;margin:0;">© ${new Date().getFullYear()} Handball 7even · handball7seven.com</p>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.lovable.dev/api/v1/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        to: "info@handball7seven.com",
        subject: `Contact Form: ${name}`,
        html: adminHtml,
        replyTo: email,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Email send failed:", errText);
      return new Response(JSON.stringify({ sent: false, error: errText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-contact-email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
