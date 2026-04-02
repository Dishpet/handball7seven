import { useState, useMemo } from 'react';
import { Eye, FileText, Clock, ArrowDownUp, TrendingDown, Globe, Smartphone, Monitor, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';

interface DailyPoint { date: string; value: number }

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

const dayOptions = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
];

export const DashboardAnalytics = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('visitors');
  const [days, setDays] = useState(7);
  const { data, isLoading, error } = useAnalytics(days);

  const chartData = useMemo(() => {
    if (!data) return [];
    const src = data[selectedMetric === 'pagesPerVisit' ? 'pagesPerVisit' : selectedMetric];
    const daily = 'daily' in src ? src.daily : [];
    return daily.map((p: DailyPoint) => ({ date: formatDate(p.date), value: p.value }));
  }, [selectedMetric, data]);

  const currentMetric = metrics.find(m => m.key === selectedMetric)!;

  const tooltipFormatter = (value: number) => {
    if (selectedMetric === 'sessionDuration') return [formatDuration(value), currentMetric.label];
    if (selectedMetric === 'bounceRate') return [`${value}%`, currentMetric.label];
    if (selectedMetric === 'pagesPerVisit') return [value.toFixed(2), currentMetric.label];
    return [value.toLocaleString(), currentMetric.label];
  };

  const summaryValue = (key: MetricKey) => {
    if (!data) return 0;
    if (key === 'pagesPerVisit') return data.pagesPerVisit.avg;
    if (key === 'sessionDuration') return data.sessionDuration.avg;
    if (key === 'bounceRate') return data.bounceRate.avg;
    if (key === 'visitors') return data.visitors.total;
    return data.pageviews.total;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-white/50 font-display uppercase tracking-widest text-sm">Loading analytics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border border-white/10 bg-black p-8 text-center">
        <p className="text-white/50 font-display uppercase tracking-widest text-sm">
          {error ? 'Failed to load analytics' : 'No data available'}
        </p>
      </div>
    );
  }

  const deviceTotal = data.devices.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-1">
        {dayOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setDays(opt.value)}
            className={`px-3 py-1.5 text-xs font-display uppercase tracking-widest transition-colors border ${
              days === opt.value
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'border-white/10 text-white/50 hover:text-white/80'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

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
              const pct = data.topPages[0]?.count ? (page.count / data.topPages[0].count) * 100 : 0;
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
              const pct = data.topSources[0]?.count ? (src.count / data.topSources[0].count) * 100 : 0;
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
              const pct = deviceTotal ? Math.round((d.count / deviceTotal) * 100) : 0;
              const Icon = d.device.toLowerCase() === 'mobile' ? Smartphone : Monitor;
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
              const pct = data.countries[0]?.count ? (c.count / data.countries[0].count) * 100 : 0;
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
