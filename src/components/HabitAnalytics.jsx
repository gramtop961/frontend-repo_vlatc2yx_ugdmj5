import { useEffect, useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';

function getDayKeys(n = 7) {
  const arr = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(d);
    t.setDate(d.getDate() - i);
    arr.push(t.toISOString().slice(0, 10));
  }
  return arr;
}

function completionForDay(dayKey) {
  const mealsRaw = localStorage.getItem(`meals:${dayKey}`);
  const routineRaw = localStorage.getItem(`routine:${dayKey}`);
  let mealDone = 0;
  let routineDone = 0;
  try {
    if (mealsRaw) mealDone = Object.values(JSON.parse(mealsRaw)).filter(Boolean).length;
    if (routineRaw) routineDone = Object.values(JSON.parse(routineRaw)).filter(Boolean).length;
  } catch {}
  const total = 9; // 3 meals + 6 routines
  return Math.round(((mealDone + routineDone) / total) * 100);
}

export default function HabitAnalytics() {
  const [keys, setKeys] = useState(getDayKeys());

  useEffect(() => {
    const id = setInterval(() => setKeys(getDayKeys()), 60_000);
    return () => clearInterval(id);
  }, []);

  const data = useMemo(() => keys.map((k) => ({ key: k, value: completionForDay(k) })), [keys]);
  const avg = useMemo(() => Math.round(data.reduce((a, b) => a + b.value, 0) / (data.length || 1)), [data]);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <p className="text-sm font-medium text-slate-700">Habit Tracker • Last 7 days</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-end gap-2">
          {data.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end rounded bg-slate-100 p-1">
                <div
                  className="w-full rounded bg-gradient-to-t from-orange-500 to-blue-600 transition-all"
                  style={{ height: `${d.value}%` }}
                  title={`${d.value}%`}
                />
              </div>
              <span className="text-[10px] text-slate-500">{new Date(d.key).toLocaleDateString(undefined, { weekday: 'short' })}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">Weekly average completion</p>
          <p className="text-sm font-semibold text-slate-800">{avg}%</p>
        </div>
        <p className="mt-1 text-xs text-slate-500">Insight: Chhote steps daily — consistency build ho rahi hai.</p>
      </div>
    </section>
  );
}
