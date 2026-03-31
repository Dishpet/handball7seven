import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendEmailSMTP } from "../_shared/smtp.ts";

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

    await sendEmailSMTP({
      to: "info@handball7seven.com",
      subject: `Contact Form: ${name}`,
      html: adminHtml,
      replyTo: email,
    });

    // Send confirmation to the sender
    const confirmHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#000;padding:24px;text-align:center;">
      <h1 style="color:#d4a24e;font-size:24px;margin:0;letter-spacing:4px;text-transform:uppercase;">HANDBALL 7EVEN</h1>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="color:#000;font-size:20px;margin:0 0 16px;">${name ? `Thank you, ${name}!` : 'Thank you for reaching out!'}</h2>
      <p style="font-size:14px;color:#555;line-height:1.6;">We have received your message and will get back to you as soon as possible.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="font-size:13px;color:#888;">Best regards,<br/>The Handball 7even Team</p>
    </div>
    <div style="background:#000;padding:16px;text-align:center;">
      <p style="color:#888;font-size:11px;margin:0;">© ${new Date().getFullYear()} Handball 7even · handball7seven.com</p>
    </div>
  </div>
</body>
</html>`;

    await sendEmailSMTP({
      to: email,
      subject: "Thanks for contacting us — Handball 7even",
      html: confirmHtml,
    });

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
