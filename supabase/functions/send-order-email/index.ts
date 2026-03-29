import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  id?: string;
  name?: string;
  price?: number;
  size?: string;
  color?: string;
  collection?: string;
  design?: string;
  quantity?: number;
  image?: string;
}

function buildItemRows(items: OrderItem[], isAdmin: boolean): string {
  return items.map(item => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" width="50" height="50" style="object-fit:cover;border-radius:4px;" />` : ''}
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;">
        <strong>${item.name || 'Product'}</strong><br/>
        <span style="color:#888;font-size:12px;">
          ${[
            item.size ? `Size: ${item.size}` : '',
            item.color ? `Color: ${item.color}` : '',
            item.collection ? `Collection: ${item.collection}` : '',
          ].filter(Boolean).join(' · ')}
        </span>
        ${isAdmin && item.design ? `<br/><span style="color:#888;font-size:11px;">Design: <a href="${item.design}" style="color:#d4a24e;">View Design</a></span>` : ''}
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity ?? 1}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;">€${((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}</td>
    </tr>
  `).join('');
}

function buildEmailHTML(order: any, isAdmin: boolean): string {
  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const heading = isAdmin
    ? `New Order Received #${order.id.slice(0, 8)}`
    : `Order Confirmation #${order.id.slice(0, 8)}`;
  const intro = isAdmin
    ? `A new order has been placed by ${order.customer_name || order.customer_email || 'a customer'}.`
    : `Thank you for your order! Here are the details of your purchase.`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:0;">
    <!-- Header -->
    <div style="background:#000;padding:24px;text-align:center;">
      <h1 style="color:#d4a24e;font-size:24px;margin:0;letter-spacing:4px;text-transform:uppercase;">HANDBALL 7EVEN</h1>
    </div>

    <div style="padding:32px 24px;">
      <h2 style="color:#000;font-size:20px;margin:0 0 8px;">${heading}</h2>
      <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 24px;">${intro}</p>

      ${isAdmin ? `
      <div style="background:#f9f9f9;padding:16px;margin-bottom:24px;border-left:3px solid #d4a24e;">
        <p style="margin:0;font-size:13px;color:#666;">
          <strong>Customer:</strong> ${order.customer_name || 'N/A'}<br/>
          <strong>Email:</strong> ${order.customer_email || 'N/A'}<br/>
          <strong>Phone:</strong> ${order.customer_phone || 'N/A'}<br/>
          <strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}
        </p>
      </div>
      ` : ''}

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;"></th>
            <th style="padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;">Product</th>
            <th style="padding:10px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;">Qty</th>
            <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${buildItemRows(items, isAdmin)}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:16px 8px;text-align:right;font-weight:bold;font-size:16px;">Total:</td>
            <td style="padding:16px 8px;text-align:right;font-weight:bold;font-size:16px;color:#d4a24e;">€${Number(order.total).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      ${!isAdmin ? `
      <p style="color:#666;font-size:13px;line-height:1.6;">
        We'll send you another email when your order ships. If you have any questions, reply to this email or contact us at <a href="mailto:info@handball7seven.com" style="color:#d4a24e;">info@handball7seven.com</a>.
      </p>
      ` : ''}

      <p style="color:#999;font-size:12px;margin-top:24px;">Order ID: ${order.id}</p>
    </div>

    <!-- Footer -->
    <div style="background:#000;padding:16px;text-align:center;">
      <p style="color:#888;font-size:11px;margin:0;">© ${new Date().getFullYear()} Handball 7even · handball7seven.com</p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order, adminEmail } = await req.json();

    if (!order) throw new Error("No order provided");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY not set, skipping email send");
      return new Response(JSON.stringify({ sent: false, reason: "no_api_key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: string[] = [];

    // Send customer email
    if (order.customer_email) {
      const customerHtml = buildEmailHTML(order, false);
      try {
        const res = await fetch("https://api.lovable.dev/api/v1/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            to: order.customer_email,
            subject: `Order Confirmation #${order.id.slice(0, 8)} - Handball 7even`,
            html: customerHtml,
          }),
        });
        if (res.ok) {
          results.push("customer_sent");
        } else {
          const errText = await res.text();
          console.error("Customer email failed:", errText);
          results.push("customer_failed");
        }
      } catch (e) {
        console.error("Customer email error:", e);
        results.push("customer_error");
      }
    }

    // Send admin notification
    const adminAddr = adminEmail || "info@handball7seven.com";
    const adminHtml = buildEmailHTML(order, true);
    try {
      const res = await fetch("https://api.lovable.dev/api/v1/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          to: adminAddr,
          subject: `New Order #${order.id.slice(0, 8)} - €${Number(order.total).toFixed(2)}`,
          html: adminHtml,
        }),
      });
      if (res.ok) {
        results.push("admin_sent");
      } else {
        const errText = await res.text();
        console.error("Admin email failed:", errText);
        results.push("admin_failed");
      }
    } catch (e) {
      console.error("Admin email error:", e);
      results.push("admin_error");
    }

    return new Response(JSON.stringify({ sent: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-order-email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
