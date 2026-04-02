import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin role
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Check user has admin role
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: SUPABASE_ANON_KEY },
    });
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = await userRes.json();

    const roleRes = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/has_role`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _user_id: user.id, _role: "admin" }),
      }
    );
    const isAdmin = await roleRes.json();
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "7");
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const granularity = days > 30 ? "daily" : "daily";

    const apiUrl = `https://api.lovable.dev/v1/projects/34009a94-f6a1-49b8-95e6-f98f9ee8a030/analytics?startDate=${fmt(startDate)}&endDate=${fmt(endDate)}&granularity=${granularity}`;

    const analyticsRes = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
    });

    if (!analyticsRes.ok) {
      const errText = await analyticsRes.text();
      console.error("Analytics API error:", analyticsRes.status, errText);
      return new Response(JSON.stringify({ error: "Failed to fetch analytics" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analyticsData = await analyticsRes.json();

    return new Response(JSON.stringify(analyticsData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
