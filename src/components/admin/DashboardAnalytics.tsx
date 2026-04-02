import { useState, useMemo } from 'react';
import { Eye, FileText, Clock, ArrowDownUp, TrendingDown, Globe, Smartphone, Monitor } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

const countryNames: Record<string, string> = {
  HR: 'Croatia', DE: 'Germany', US: 'United States', BA: 'Bosnia & Herzegovina',
  RS: 'Serbia', SI: 'Slovenia', BE: 'Belgium', IT: 'Italy', CY: 'Cyprus',
};

type MetricKey = 'visitors' | 'pageviews' | 'pagesPerVisit' | 'sessionDuration' | 'bounceRate';

const metrics: { key: MetricKey; label: string; icon: any; format: (v: number) => string }[] = [
  { key: 'visitors', label: 'Visitors', icon: Eye, format: (v) => v.toLocaleString() },
  { key: 'pageviews', label: 'Pageviews', icon: FileText, format: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toLocaleString() },
  { key: 'pagesPerVisit', label: 'Views Per Visit', icon: ArrowDownUp, format: (v) => v.toFixed(2) },
  { key: 'sessionDuration', label: 'Visit Duration', icon: Clock, format: formatDuration },
  { key: 'bounceRate', label: 'Bounce Rate', icon: TrendingDown, format: (v) => `${v}%` },
];

export const DashboardAnalytics = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('visitors');

  const data = useMemo<AnalyticsData>(() => ({
    visitors: {
      total: 650, daily: [
        { date: '2026-03-26', value: 4 }, { date: '2026-03-27', value: 5 }, { date: '2026-03-28', value: 3 },
        { date: '2026-03-29', value: 21 }, { date: '2026-03-30', value: 18 }, { date: '2026-03-31', value: 34 },
        { date: '2026-04-01', value: 394 }, { date: '2026-04-02', value: 171 },
      ],
    },
    pageviews: {
      total: 2192, daily: [
        { date: '2026-03-26', value: 19 }, { date: '2026-03-27', value: 12 }, { date: '2026-03-28', value: 4 },
        { date: '2026-03-29', value: 140 }, { date: '2026-03-30', value: 76 }, { date: '2026-03-31', value: 163 },
        { date: '2026-04-01', value: 1248 }, { date: '2026-04-02', value: 530 },
      ],
    },
    pagesPerVisit: {
      avg: 3.37, daily: [
        { date: '2026-03-26', value: 4.75 }, { date: '2026-03-27', value: 2.4 }, { date: '2026-03-28', value: 1.33 },
        { date: '2026-03-29', value: 6.67 }, { date: '2026-03-30', value: 4.22 }, { date: '2026-03-31', value: 4.79 },
        { date: '2026-04-01', value: 3.17 }, { date: '2026-04-02', value: 3.1 },
      ],
    },
    sessionDuration: {
      avg: 134, daily: [
        { date: '2026-03-26', value: 18.02 }, { date: '2026-03-27', value: 10.67 }, { date: '2026-03-28', value: 1.65 },
        { date: '2026-03-29', value: 347.38 }, { date: '2026-03-30', value: 122.49 }, { date: '2026-03-31', value: 320.17 },
        { date: '2026-04-01', value: 153 }, { date: '2026-04-02', value: 98.58 },
      ],
    },
    bounceRate: {
      avg: 55, daily: [
        { date: '2026-03-26', value: 50 }, { date: '2026-03-27', value: 60 }, { date: '2026-03-28', value: 67 },
        { date: '2026-03-29', value: 52 }, { date: '2026-03-30', value: 56 }, { date: '2026-03-31', value: 47 },
        { date: '2026-04-01', value: 59 }, { date: '2026-04-02', value: 51 },
      ],
    },
    topPages: [
      { page: '/', count: 603 }, { page: '/shop', count: 201 }, { page: '/collections', count: 86 },
      { page: '/about', count: 29 }, { page: '/admin', count: 28 }, { page: '/contact', count: 28 },
      { page: '/auth', count: 20 }, { page: '/admin/orders', count: 12 }, { page: '/admin/products', count: 9 },
      { page: '/shipping', count: 7 },
    ],
    topSources: [
      { source: 'Direct', count: 491 }, { source: 'Instagram', count: 109 }, { source: 'Google', count: 28 },
      { source: 'Facebook', count: 27 }, { source: 'Stripe', count: 9 },
    ],
    devices: [{ device: 'Mobile', count: 590 }, { device: 'Desktop', count: 60 }],
    countries: [
      { country: 'HR', count: 484 }, { country: 'DE', count: 28 }, { country: 'US', count: 25 },
      { country: 'BA', count: 24 }, { country: 'RS', count: 12 }, { country: 'SI', count: 9 },
      { country: 'BE', count: 7 }, { country: 'IT', count: 6 }, { country: 'CY', count: 6 },
    ],
  }), []);

  const currentMetric = metrics.find(m => m.key === selectedMetric)!;
  const chartData = useMemo(() => {
    const src = selectedMetric === 'visitors' ? data.visitors.daily
      : selectedMetric === 'pageviews' ? data.pageviews.daily
      : selectedMetric === 'pagesPerVisit' ? data.pagesPerVisit.daily
      : selectedMetric === 'sessionDuration' ? data.sessionDuration.daily
      : data.bounceRate.daily;
    return src.map(p => ({ date: formatDate(p.date), value: p.value }));
  }, [selectedMetric, data]);

  const tooltipFormatter = (value: number) => {
    if (selectedMetric === 'sessionDuration') return [formatDuration(value), currentMetric.label];
    if (selectedMetric === 'bounceRate') return [`${value}%`, currentMetric.label];
    if (selectedMetric === 'pagesPerVisit') return [value.toFixed(2), currentMetric.label];
    return [value.toLocaleString(), currentMetric.label];
  };

  const summaryValue = (key: MetricKey) => {
    if (key === 'pagesPerVisit') return data.pagesPerVisit.avg;
    if (key === 'sessionDuration') return data.sessionDuration.avg;
    if (key === 'bounceRate') return data.bounceRate.avg;
    if (key === 'visitors') return data.visitors.total;
    return data.pageviews.total;
  };

  const deviceTotal = data.devices.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      {/* Metric Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
        {metrics.map(m => {
          const isActive = selectedMetric === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              className={`text-left p-3 md:p-4 border transition-colors ${
                isActive
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-black border-white/10 hover:border-white/20'
              }`}
            >
              <p className={`font-display uppercase tracking-wider text-[10px] sm:text-xs mb-1 ${isActive ? 'text-primary' : 'text-white/50'}`}>
                {m.label}
              </p>
              <p className="text-lg sm:text-xl font-black text-white">
                {m.format(summaryValue(m.key))}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Chart */}
      <div className="bg-black border border-white/10 p-4 md:p-6">
        <div className="h-[280px] md:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, fontSize: 12 }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                itemStyle={{ color: 'white' }}
                formatter={tooltipFormatter}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#analyticsGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Pages */}
        <div className="bg-black border border-white/10 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-display uppercase tracking-widest font-bold text-white mb-4">Top Pages</h3>
          <div className="space-y-3">
            {data.topPages.map((page, i) => {
              const pct = (page.count / data.topPages[0].count) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80 truncate font-mono text-xs">{page.page}</span>
                    <span className="text-white/50 text-xs shrink-0 ml-2">{page.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 overflow-hidden">
                    <div className="h-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-black border border-white/10 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-display uppercase tracking-widest font-bold text-white mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            {data.topSources.map((src, i) => {
              const pct = (src.count / data.topSources[0].count) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80 text-xs">{src.source}</span>
                    <span className="text-white/50 text-xs shrink-0 ml-2">{src.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 overflow-hidden">
                    <div className="h-full bg-primary/40 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Devices */}
        <div className="bg-black border border-white/10 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-display uppercase tracking-widest font-bold text-white mb-4">Devices</h3>
          <div className="flex gap-6 items-center">
            {data.devices.map((d, i) => {
              const pct = Math.round((d.count / deviceTotal) * 100);
              const Icon = d.device === 'Mobile' ? Smartphone : Monitor;
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon className="w-8 h-8 text-primary/70" />
                  <div>
                    <p className="text-white font-bold text-lg">{pct}%</p>
                    <p className="text-white/50 text-xs font-display uppercase tracking-wider">{d.device}</p>
                    <p className="text-white/30 text-[10px]">{d.count} visits</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Countries */}
        <div className="bg-black border border-white/10 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-display uppercase tracking-widest font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Countries
          </h3>
          <div className="space-y-2">
            {data.countries.slice(0, 6).map((c, i) => {
              const pct = (c.count / data.countries[0].count) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80 text-xs">{countryNames[c.country] || c.country}</span>
                    <span className="text-white/50 text-xs shrink-0 ml-2">{c.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 overflow-hidden">
                    <div className="h-full bg-primary/50 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
