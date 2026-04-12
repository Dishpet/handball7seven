import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    const { order_id } = await req.json();
    if (!order_id) throw new Error("No order_id provided");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the order
    const { data: order, error } = await serviceClient
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (error || !order) {
      throw new Error("Order not found");
    }

    // Only update if still pending
    if (order.status === "pending") {
      await serviceClient
        .from("orders")
        .update({ status: "paid" })
        .eq("id", order_id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      order: {
        ...order,
        status: "paid",
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[confirm-order] error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
