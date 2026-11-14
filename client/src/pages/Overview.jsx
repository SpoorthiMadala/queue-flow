import { Link } from 'react-router-dom';
import { ListOrdered, Users, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react';
import useAsync from '../hooks/useAsync.js';
import { analyticsApi } from '../services/api.js';
import { PageLoader, ErrorBox, StatCard, EmptyState } from '../components/ui.jsx';
import { TrendChart, QueueBarChart } from '../components/Charts.jsx';
import { fmtDateTime } from '../utils/format.js';

export default function Overview() {
  const { data, loading, error, reload } = useAsync(async () => {
    const [overview, queues, trends] = await Promise.all([analyticsApi.overview(), analyticsApi.queues(), analyticsApi.trends(7)]);
    return { overview, queues, trends };
  });
  if (loading) return <PageLoader />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const { overview: o, queues, trends } = data;

  if (o.totalQueues === 0) {
    return (
      <div className="card">
        <EmptyState icon={ListOrdered} title="Create your first queue" text="Queues hold the people waiting for you. Add one to start issuing tokens."
          action={<Link to="/queues" className="btn-primary mt-2"><Plus className="h-4 w-4" />Create queue</Link>} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={ListOrdered} label="Total queues" value={o.totalQueues} />
        <StatCard icon={Users} label="Waiting now" value={o.waiting} tone="amber" />
        <StatCard icon={CheckCircle2} label="Served" value={o.served} tone="emerald" />
        <StatCard icon={XCircle} label="Cancelled" value={o.cancelled} tone="rose" />
        <StatCard icon={Clock} label="Avg. wait" value={`${o.avgWaitMinutes} min`} tone="sky" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-4"><h2 className="mb-3 font-semibold">Weekly activity</h2><TrendChart data={trends} /></section>
        <section className="card p-4"><h2 className="mb-3 font-semibold">People waiting by queue</h2><QueueBarChart data={queues} keys={[{ key: 'waiting', name: 'Waiting', color: '#6366f1' }]} /></section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="mb-3 font-semibold">Current waiting list</h2>
          {o.currentWaiting.length === 0 ? <EmptyState title="Nobody is waiting" text="New tokens will appear here." /> : (
            <ul className="divide-y divide-slate-100">
              {o.currentWaiting.map((t) => (
                <li key={t._id} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">#{t.tokenNumber}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{t.personName}</p><p className="truncate text-xs text-slate-500">{t.queue?.name}</p></div>
                  <span className="text-xs text-slate-500">{fmtDateTime(t.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-4">
          <h2 className="mb-3 font-semibold">Recently served</h2>
          {o.recentServed.length === 0 ? <EmptyState title="No one served yet" text="Served tokens show up here." /> : (
            <ul className="divide-y divide-slate-100">
              {o.recentServed.map((t) => (
                <li key={t._id} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-semibold text-emerald-700">#{t.tokenNumber}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{t.personName}</p><p className="truncate text-xs text-slate-500">{t.queue?.name}</p></div>
                  <span className="text-xs text-slate-500">{fmtDateTime(t.servedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
