import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DailyPoint { date: string; value: number }

export interface AnalyticsData {
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

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "analytics_snapshot")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("No analytics data available");

      const raw = data.value as any;
      return transformAnalytics(raw);
    },
    staleTime: 5 * 60 * 1000,
  });
}

function transformAnalytics(raw: any): AnalyticsData {
  const mapDaily = (arr: any[]): DailyPoint[] =>
    (arr || []).map((p: any) => ({ date: p.date, value: p.value || 0 }));

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
      avg: metrics?.pagesPerVisit?.avg ?? 0,
      daily: mapDaily(metrics?.pagesPerVisit?.daily || []),
    },
    sessionDuration: {
      avg: metrics?.sessionDuration?.avg ?? 0,
      daily: mapDaily(metrics?.sessionDuration?.daily || []),
    },
    bounceRate: {
      avg: metrics?.bounceRate?.avg ?? 0,
      daily: mapDaily(metrics?.bounceRate?.daily || []),
    },
    topPages: (dimensions?.topPages || []).map((p: any) => ({
      page: p.page || '',
      count: p.count || 0,
    })),
    topSources: (dimensions?.topSources || []).map((s: any) => ({
      source: s.source || '',
      count: s.count || 0,
    })),
    devices: (dimensions?.devices || []).map((d: any) => ({
      device: d.device || '',
      count: d.count || 0,
    })),
    countries: (dimensions?.countries || []).map((c: any) => ({
      country: c.country || '',
      count: c.count || 0,
    })),
  };
}
