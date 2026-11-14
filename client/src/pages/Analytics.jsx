import { useState } from 'react';
import useAsync from '../hooks/useAsync.js';
import { analyticsApi } from '../services/api.js';
import { PageLoader, ErrorBox, EmptyState } from '../components/ui.jsx';
import { TrendChart, QueueBarChart } from '../components/Charts.jsx';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  const [days, setDays] = useState(7);
  const { data, loading, error, reload } = useAsync(async () => {
    const [queues, trends] = await Promise.all([analyticsApi.queues(), analyticsApi.trends(days)]);
    return { queues, trends };
  }, [days]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (data.queues.length === 0) return <div className="card"><EmptyState icon={BarChart3} title="No data yet" text="Create a queue and add people to see analytics." /></div>;

  return (
    <div className="space-y-6">
      <section className="card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Token activity</h2>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="input w-auto" aria-label="Time range">
            <option value={7}>Last 7 days</option><option value={14}>Last 14 days</option><option value={30}>Last 30 days</option>
          </select>
        </div>
        <TrendChart data={data.trends} />
      </section>

      <section className="card p-4">
        <h2 className="mb-3 font-semibold">Served vs cancelled by queue</h2>
        <QueueBarChart data={data.queues} keys={[{ key: 'served', name: 'Served', color: '#10b981' }, { key: 'cancelled', name: 'Cancelled', color: '#f43f5e' }, { key: 'waiting', name: 'Waiting', color: '#6366f1' }]} />
      </section>

      <section className="card overflow-hidden">
        <h2 className="p-4 font-semibold">Queue statistics</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500"><tr>
              <th className="px-4 py-2 font-medium">Queue</th><th className="px-4 py-2 font-medium">Waiting</th><th className="px-4 py-2 font-medium">Served</th><th className="px-4 py-2 font-medium">Cancelled</th><th className="px-4 py-2 font-medium">Avg. wait</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.queues.map((q) => (
                <tr key={q.queueId}><td className="px-4 py-2.5 font-medium">{q.name}</td><td className="px-4 py-2.5">{q.waiting}</td><td className="px-4 py-2.5">{q.served}</td><td className="px-4 py-2.5">{q.cancelled}</td><td className="px-4 py-2.5">{q.avgWaitMinutes} min</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
