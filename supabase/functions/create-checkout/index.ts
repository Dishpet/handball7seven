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
    console.log("[checkout] start");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

    console.log("[checkout] env check - url:", !!supabaseUrl, "anon:", !!supabaseAnonKey, "service:", !!supabaseServiceKey, "stripe:", !!stripeKey);

    const { items, shipping, shippingCost } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided");
    }

    console.log("[checkout] items:", items.length);

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

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

        console.log("[checkout] user authenticated:", userId);

        // Fetch profile for name and phone
        const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
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

    console.log("[checkout] stripe customer:", customerId || "new");

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
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const total = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    const totalWithShipping = total + (shippingCost || 0);

    const shippingAddress = shipping ? {
      fullName: shipping.fullName,
      phone: shipping.phone,
      address: shipping.address,
      city: shipping.city,
      postalCode: shipping.postalCode,
      country: shipping.country,
    } : {};

    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .insert({
        user_id: userId,
        customer_email: userEmail,
        customer_name: shipping?.fullName || userName || null,
        items: items,
        total: totalWithShipping,
        status: "pending",
        shipping_address: shippingAddress,
        notes: [
          shipping?.phone ? `phone:${shipping.phone}` : (userPhone ? `phone:${userPhone}` : ''),
          shippingCost !== undefined ? `shipping:€${shippingCost}` : '',
        ].filter(Boolean).join(' | '),
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    console.log("[checkout] order created:", order.id);

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, '') || "https://handball7seven.com";
    console.log("[checkout] origin:", origin);

    // Add shipping as a line item if applicable
    if (shippingCost && shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: `Shipping (${shipping?.country === 'Croatia' ? 'Croatia' : 'International'})`,
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout/success?order_id=${order.id}`,
      cancel_url: `${origin}/checkout/canceled`,
      metadata: {
        order_id: order.id,
      },
    });

    console.log("[checkout] stripe session created:", session.id);

    // Update order with stripe session id
    const currentNotes = [
      shipping?.phone ? `phone:${shipping.phone}` : (userPhone ? `phone:${userPhone}` : ''),
      `stripe_session:${session.id}`,
      shippingCost !== undefined ? `shipping:€${shippingCost}` : '',
    ].filter(Boolean).join(' | ');
    await serviceClient
      .from("orders")
      .update({ notes: currentNotes })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[checkout] error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
