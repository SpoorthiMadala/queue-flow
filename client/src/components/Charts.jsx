import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const axis = { fontSize: 12, fill: '#64748b' };

export function TrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="arr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="arrivals" name="Arrivals" stroke="#6366f1" strokeWidth={2} fill="url(#arr)" />
        <Area type="monotone" dataKey="served" name="Served" stroke="#10b981" strokeWidth={2} fill="none" />
        <Area type="monotone" dataKey="cancelled" name="Cancelled" stroke="#f43f5e" strokeWidth={2} fill="none" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function QueueBarChart({ data, keys }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} interval={0} />
        <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} />
        {keys.length > 1 && <Legend />}
        {keys.map((k) => <Bar key={k.key} dataKey={k.key} name={k.name} fill={k.color} radius={[4, 4, 0, 0]} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}
