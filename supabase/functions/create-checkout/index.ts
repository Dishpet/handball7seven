import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    console.log("SUPABASE_URL set:", !!supabaseUrl, "SUPABASE_ANON_KEY set:", !!supabaseAnonKey);
    
    const supabaseClient = createClient(
      supabaseUrl ?? "",
      supabaseAnonKey ?? ""
    );

    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Require authenticated user
    let userEmail: string | undefined;
    let userId: string | undefined;
    let userName: string | undefined;
    let userPhone: string | undefined;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user) {
        userEmail = data.user.email;
        userId = data.user.id;

        // Fetch profile for name and phone
        const serviceClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );
        const { data: profile } = await serviceClient
          .from("profiles")
          .select("full_name, phone")
          .eq("id", data.user.id)
          .single();
        if (profile) {
          userName = profile.full_name || undefined;
          userPhone = profile.phone || undefined;
        }
      }
    }

    if (!userId || !userEmail) {
      throw new Error("You must be signed in to checkout");
    }

    // Find or create Stripe customer
    let customerId: string | undefined;
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Build line items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: {
            product_id: item.id,
            size: item.size,
            color: item.color || '',
            design: item.design || '',
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Create order in database
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const total = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);

    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .insert({
        user_id: userId,
        customer_email: userEmail,
        customer_name: userName || null,
        items: items,
        total: total,
        status: "pending",
        notes: userPhone ? `phone:${userPhone}` : '',
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout/success?order_id=${order.id}`,
      cancel_url: `${req.headers.get("origin")}/checkout/canceled`,
      metadata: {
        order_id: order.id,
      },
    });

    // Update order with stripe session id
    const currentNotes = userPhone ? `phone:${userPhone} | stripe_session:${session.id}` : `stripe_session:${session.id}`;
    await serviceClient
      .from("orders")
      .update({ notes: currentNotes })
      .eq("id", order.id);

    // Send order confirmation emails (fire-and-forget)
    const orderData = {
      id: order.id,
      customer_email: userEmail,
      customer_name: userName || null,
      customer_phone: userPhone || null,
      items: items,
      total: total,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const emailUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const emailKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ order: orderData }),
    }).catch(e => console.error("Email send error:", e));

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
