import React from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, ListTodo, RotateCcw, TrendingUp } from 'lucide-react';
import type { DashboardStats, Task } from '../../types';

interface DashboardViewProps { stats: DashboardStats | null; tasks: Task[]; onRefresh: () => void; }
const panel = 'rounded-2xl border border-zinc-200/80 bg-white/75 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/65';
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, tasks, onRefresh }) => {
  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const complete = tasks.filter((task) => task.status === 'Complete');
  const active = tasks.filter((task) => task.status !== 'Complete');
  const overdue = active.filter((task) => task.due_at && new Date(task.due_at).getTime() < dayStart);
  const noDueDate = tasks.filter((task) => !task.due_at);

  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    return { date, label: dayName, day: date.getDate(), today: date.toDateString() === today.toDateString() };
  });
  const completeCounts = Array(7).fill(0) as number[];
  complete.forEach((task) => {
    const date = new Date(task.updated_at);
    const index = Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - weekStart.getTime()) / 86400000);
    if (index >= 0 && index < 7) completeCounts[index]++;
  });
  const maxCount = Math.max(1, ...completeCounts);
  const points = completeCounts.map((count, index) => ({ x: 32 + index * 62, y: 178 - (count / maxCount) * 126, count }));
  const linePath = points.map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ');
  const areaPath = `${linePath} L 404 190 L 32 190 Z`;
  const dueTasks = tasks.filter((task) => task.due_at && task.status !== 'Complete');
  const upcoming = [...dueTasks].sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime()).slice(0, 5);
  const metrics = [
    { title: 'Active tasks', value: active.length, note: `${complete.length} completed`, icon: <ListTodo className="h-4 w-4" />, tint: 'text-sky-700 dark:text-sky-300' },
    { title: 'Overdue tasks', value: overdue.length, note: 'Need attention', icon: <AlertTriangle className="h-4 w-4" />, tint: 'text-rose-700 dark:text-rose-300' },
    { title: 'Completed tasks', value: complete.length, note: `${stats?.completed_percentage.toFixed(0) ?? 0}% completion rate`, icon: <CheckCircle2 className="h-4 w-4" />, tint: 'text-emerald-700 dark:text-emerald-300' },
    { title: 'Without due dates', value: noDueDate.length, note: 'No deadline set', icon: <CalendarDays className="h-4 w-4" />, tint: 'text-amber-700 dark:text-amber-300' },
  ];

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 animate-linear-enter">
      <header className="mb-5 flex items-center justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Daybit overview</p><h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-2xl">Dashboard</h1></div><button onClick={onRefresh} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3.5 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:bg-zinc-800"><RotateCcw className="h-3.5 w-3.5" />Refresh</button></header>

      <div className="mb-4 grid auto-cols-[minmax(205px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2 no-scrollbar sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
        {metrics.map((metric, index) => <article key={metric.title} style={{ animationDelay: `${index * 45}ms` }} className={`${panel} min-w-0 animate-card-enter p-4 sm:p-5`}><div className="flex items-center justify-between gap-2"><span className="text-[11px] font-semibold capitalize text-zinc-500 dark:text-zinc-400">{metric.title}</span><span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 ${metric.tint}`}>{metric.icon}</span></div><div className="mt-3 flex items-baseline gap-2"><span className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">{metric.value}</span><span className="text-[10px] text-zinc-500">tasks</span></div><p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">{metric.note}</p></article>)}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className={`${panel} animate-card-enter p-4 sm:p-5 lg:col-span-2`}>
          <div className="mb-2 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Task completed trends</h2><p className="mt-0.5 text-[10px] text-zinc-500">Completed tasks this week</p></div><span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">This week</span></div>
          <div className="w-full overflow-hidden"><svg viewBox="0 0 440 220" className="h-[220px] w-full" role="img" aria-label="Completed tasks by day this week"><defs><linearGradient id="daybitTrendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity=".24" /><stop offset="100%" stopColor="#60a5fa" stopOpacity=".01" /></linearGradient></defs>{[45, 90, 135, 180].map((y) => <line key={y} x1="24" x2="416" y1={y} y2={y} stroke="currentColor" className="text-zinc-100 dark:text-zinc-900" strokeDasharray="3 5" />)}<path d={areaPath} fill="url(#daybitTrendFill)" /><path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />{points.map((point, index) => <g key={weekDays[index].label}><circle cx={point.x} cy={point.y} r="4" fill="white" stroke="#2563eb" strokeWidth="2.5" /><text x={point.x} y="210" textAnchor="middle" className="fill-zinc-400 text-[9px]">{weekDays[index].label}</text></g>)}</svg></div>
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-zinc-500"><TrendingUp className="h-3 w-3 text-blue-600" />Completed tasks</div>
        </article>

        <article className={`${panel} animate-card-enter p-4 sm:p-5`}>
          <div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Task calendar</h2><p className="mt-0.5 text-[10px] text-zinc-500">Your next deadlines</p></div><Clock3 className="h-4 w-4 text-zinc-500" /></div>
          <div className="mb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {weekDays.map((day) => (
              <div
                key={day.date.toISOString()}
                className={`shrink-0 w-11 rounded-xl py-2 text-center transition-all cursor-pointer ${
                  day.today
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                    : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="block text-[8.5px] uppercase tracking-wider">{day.label}</span>
                <span className="text-xs font-bold mt-0.5 block">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="max-h-[245px] space-y-2 overflow-y-auto pr-1">{upcoming.length ? upcoming.map((task) => <div key={task.id} className="rounded-xl border border-zinc-100 bg-white/70 p-3 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"><p className="line-clamp-1 text-xs font-semibold text-zinc-900 dark:text-white">{task.name}</p><p className="mt-1 text-[10px] text-zinc-500">{new Date(task.due_at!).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · {task.status}</p></div>) : <p className="rounded-xl bg-zinc-50 p-4 text-xs text-zinc-500 dark:bg-zinc-900/60">No upcoming deadlines.</p>}</div>
        </article>

        <article className={`${panel} animate-card-enter overflow-hidden lg:col-span-3`}><div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800 sm:px-5"><div><h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Task overview</h2><p className="mt-0.5 text-[10px] text-zinc-500">Latest updates across your workspace</p></div><span className="text-[10px] text-zinc-500">{tasks.length} total</span></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-zinc-50/80 text-[10px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/70"><tr><th className="px-4 py-2.5 font-semibold">Task name</th><th className="px-4 py-2.5 font-semibold">Place</th><th className="px-4 py-2.5 font-semibold">Due date</th><th className="px-4 py-2.5 font-semibold">Status</th><th className="px-4 py-2.5 font-semibold">Progress</th></tr></thead><tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">{tasks.slice(0, 6).map((task) => <tr key={task.id} className="transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50"><td className="max-w-[260px] truncate px-4 py-3 font-medium text-zinc-900 dark:text-white">{task.name}</td><td className="px-4 py-3 text-zinc-500">{task.place}</td><td className="px-4 py-3 text-zinc-500">{task.due_at ? new Date(task.due_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td><td className="px-4 py-3"><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{task.status}</span></td><td className="px-4 py-3 text-zinc-500">{task.progress_done}/{task.progress_total}</td></tr>)}{!tasks.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No tasks to show yet.</td></tr>}</tbody></table></div></article>
      </div>
    </section>
  );
};
