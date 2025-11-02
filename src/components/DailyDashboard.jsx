import { useEffect, useMemo, useRef, useState } from 'react';
import { Droplet, CheckCircle2, Play, Pause } from 'lucide-react';

function useLocalState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

const QUOTES = [
  'Tu ruk gaya hai Gaurav, khatam nahi hua. Har din ek naya start hai.',
  'Aaj halka sa bhi progress = kal ka bada confidence.',
  'Shanti ke 60 second, din bhar ki clarity.',
  'Jitni baar girta hai, utni hi badi wapsi hoti hai.',
  'Slow is smooth. Smooth becomes fast.'
];

const MOODS = ['Calm', 'Tired', 'Stressed', 'Hopeful', 'Focused'];

export default function DailyDashboard() {
  const dayKey = todayKey();
  const [mood, setMood] = useLocalState(`mood:${dayKey}`, 'Calm');
  const [water, setWater] = useLocalState(`water:${dayKey}`, 0);
  const [meals, setMeals] = useLocalState(`meals:${dayKey}`, {
    Breakfast: false,
    Lunch: false,
    Dinner: false,
  });
  const [routine, setRoutine] = useLocalState(`routine:${dayKey}`, {
    'Wake 5am': false,
    '10-min silence': false,
    '15-min walk': false,
    'Work focus': false,
    'No drink today': false,
    'Message ek zaroori insaan': false,
  });

  // Calculate daily completion score
  const completion = useMemo(() => {
    const mealDone = Object.values(meals).filter(Boolean).length;
    const routineDone = Object.values(routine).filter(Boolean).length;
    const total = 3 + 6; // meals + routine items
    return Math.round(((mealDone + routineDone) / total) * 100);
  }, [meals, routine]);

  // Rotate quote daily
  const quote = useMemo(() => {
    const idx = new Date(dayKey).getDate() % QUOTES.length;
    return QUOTES[idx];
  }, [dayKey]);

  // Breathing timer using Web Audio for soft tone and a simple animation
  const [calmRunning, setCalmRunning] = useState(false);
  const [calmSeconds, setCalmSeconds] = useState(60);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!calmRunning) return;
    setCalmSeconds(60);
    let remaining = 60;

    // Start soft sine pad
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 432; // calming A4 variant
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 1);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
    } catch {}

    const timer = setInterval(() => {
      remaining -= 1;
      setCalmSeconds(remaining);
      if (remaining <= 0) {
        setCalmRunning(false);
      }
    }, 1000);

    // subtle breathing guidance loop
    const start = performance.now();
    function animate(ts) {
      const t = (ts - start) / 1000;
      animRef.current?.(t);
      if (remaining > 0 && calmRunning) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    return () => {
      clearInterval(timer);
      try {
        const ctx = audioCtxRef.current;
        const osc = oscRef.current;
        if (ctx && osc) {
          const gainNode = ctx.createGain();
          osc.disconnect();
          osc.connect(gainNode).connect(ctx.destination);
          gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
          setTimeout(() => {
            osc.stop();
            ctx.close();
          }, 600);
        }
      } catch {}
    };
  }, [calmRunning]);

  const [breathScale, setBreathScale] = useState(1);
  useEffect(() => {
    animRef.current = (t) => {
      // 4-4-4-4 box breathing approximation
      const phase = Math.floor((t % 16) / 4);
      const progress = (t % 4) / 4;
      let scale = 1;
      if (phase === 0) scale = 1 + progress * 0.3; // inhale
      else if (phase === 1) scale = 1.3; // hold
      else if (phase === 2) scale = 1.3 - progress * 0.3; // exhale
      else scale = 1; // hold
      setBreathScale(scale);
    };
  }, []);

  const handleMealToggle = (k) => setMeals((m) => ({ ...m, [k]: !m[k] }));
  const handleRoutineToggle = (k) => setRoutine((r) => ({ ...r, [k]: !r[k] }));

  return (
    <section className="w-full space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-orange-500 p-6 text-white shadow-lg">
        <p className="text-sm/6 opacity-90">Aaj ka Power Quote</p>
        <h1 className="mt-1 text-xl font-semibold md:text-2xl">{quote}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Mood Meter */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Mood Meter</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  mood === m
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-500">Selected: <span className="font-semibold text-slate-700">{mood}</span></p>
        </div>

        {/* Water Tracker */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Water Tracker</p>
            <Droplet className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setWater((w) => Math.max(0, w - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-50"
            >
              –
            </button>
            <div className="text-2xl font-semibold text-slate-800">{water} glasses</div>
            <button
              onClick={() => setWater((w) => Math.min(20, w + 1))}
              className="rounded-lg border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Meals */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Meal Checklist</p>
          <div className="mt-3 space-y-2">
            {Object.keys(meals).map((k) => (
              <label key={k} className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={meals[k]}
                  onChange={() => handleMealToggle(k)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${meals[k] ? 'text-slate-800' : 'text-slate-600'}`}>{k}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Routine + Progress */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
          <p className="text-sm font-medium text-slate-600">Daily Routine</p>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {Object.keys(routine).map((k) => (
              <button
                key={k}
                onClick={() => handleRoutineToggle(k)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                  routine[k]
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm">{k}</span>
                {routine[k] ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="h-5 w-5 rounded-full border border-slate-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-600">Aaj ka Score</p>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-orange-500 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800">{completion}% complete</p>
          </div>

          {/* Minute of Calm */}
          <div className="mt-6 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Minute of Calm</p>
              <button
                onClick={() => setCalmRunning((s) => !s)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-white transition ${
                  calmRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {calmRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {calmRunning ? 'Pause' : 'Start'}
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
              <span>Timer</span>
              <span className="font-semibold text-slate-800">{calmSeconds}s</span>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <div
                className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-100 to-orange-100 shadow-inner"
                style={{ transform: `scale(${breathScale})`, transition: 'transform 300ms ease' }}
                aria-label="Breathing guide"
              />
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">4-4-4-4 breathing — dheere se saans lo, roko, chhodo, phir roko.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
