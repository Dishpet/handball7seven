import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DailyPoint { date: string; value: number }

interface AnalyticsData {
  visitors: { total: number; daily: DailyPoint[] };
  pageviews: { total: number; daily: DailyPoint[] };
  pagesPerVisit: { avg: number; daily: DailyPoint[] };
  sessionDuration: { avg: number; daily: DailyPoint[] };
  bounceRate: { avg: number; daily: DailyPoint[] };
  topPages: { page: string; count: number }[];
  topSources: { source: string; count: number }[];
  devices: { device: string; count: number }[];
  countries: { country: string; count: number }[];
}

export function useAnalytics(days = 7) {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics", days],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("get-analytics", {
        body: null,
        headers: {},
      });

      // supabase.functions.invoke uses GET-like behavior but we pass days via query
      // We need to use fetch directly to pass query params
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-analytics?days=${days}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const raw = await response.json();
      return transformAnalytics(raw);
    },
    staleTime: 5 * 60 * 1000, // 5 min
    refetchInterval: 5 * 60 * 1000,
  });
}

function transformAnalytics(raw: any): AnalyticsData {
  const mapDaily = (arr: any[]): DailyPoint[] =>
    (arr || []).map((p: any) => ({ date: p.date || p.Date, value: p.value || p.Value || 0 }));

  // Handle the Lovable analytics API response format
  const metrics = raw.metrics || raw;
  const dimensions = raw.dimensions || raw;

  return {
    visitors: {
      total: metrics?.visitors?.total ?? 0,
      daily: mapDaily(metrics?.visitors?.daily || []),
    },
    pageviews: {
      total: metrics?.pageviews?.total ?? 0,
      daily: mapDaily(metrics?.pageviews?.daily || []),
    },
    pagesPerVisit: {
      avg: metrics?.pageviewsPerVisit?.avg ?? metrics?.pagesPerVisit?.avg ?? 0,
      daily: mapDaily(metrics?.pageviewsPerVisit?.daily || metrics?.pagesPerVisit?.daily || []),
    },
    sessionDuration: {
      avg: metrics?.sessionDuration?.avg ?? 0,
      daily: mapDaily(metrics?.sessionDuration?.daily || []),
    },
    bounceRate: {
      avg: metrics?.bounceRate?.avg ?? 0,
      daily: mapDaily(metrics?.bounceRate?.daily || []),
    },
    topPages: (dimensions?.page || dimensions?.topPages || []).map((p: any) => ({
      page: p.page || p.name || p.key || '',
      count: p.count || p.value || 0,
    })),
    topSources: (dimensions?.source || dimensions?.topSources || []).map((s: any) => ({
      source: s.source || s.name || s.key || '',
      count: s.count || s.value || 0,
    })),
    devices: (dimensions?.device || dimensions?.devices || []).map((d: any) => ({
      device: d.device || d.name || d.key || '',
      count: d.count || d.value || 0,
    })),
    countries: (dimensions?.country || dimensions?.countries || []).map((c: any) => ({
      country: c.country || c.name || c.key || '',
      count: c.count || c.value || 0,
    })),
  };
}
