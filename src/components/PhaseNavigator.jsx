import { useState } from 'react';
import { Target, TrendingUp, CheckCircle2 } from 'lucide-react';

const phases = [
  {
    key: 'phase1',
    title: 'Phase 1: Control & Reset (21 Days)',
    color: 'from-blue-600 to-orange-500',
    bullets: [
      'Alcohol-Free Tracker — roz ka clean streak note kar',
      'Sleep Planner — bedtime aur wake-up goal set',
      'Emotional Journal — Aaj kis cheez ne smile di?',
      'Calm Corner — 5-min relax music + breathing'
    ],
    message: 'Tu broken nahi hai, bas pause pe tha. Ab restart gently.'
  },
  {
    key: 'phase2',
    title: 'Phase 2: Rebuild Energy & Relations',
    color: 'from-blue-500 to-cyan-500',
    bullets: [
      '15-min home workout/stretch',
      'Simple healthy meal ideas',
      'Relationship Reconnect — zaroori logon ko message',
      'Mind Detox — anger, ego aur patience par padhai'
    ],
    message: 'Jo log important hain unhe mat khona. Shaant reh, sab theek hoga.'
  },
  {
    key: 'phase3',
    title: 'Phase 3: Rise & Success',
    color: 'from-indigo-600 to-purple-500',
    bullets: [
      'Goal Tracker — Career, Health, Mindset',
      'Work Mastery tips & drive-time podcasts',
      'Financial Reset — expense + saving monitor',
      'Daily Affirmations & Spiritual Reflection'
    ],
    message: 'Discipline + Faith = Comeback. Tu kar sakta hai.'
  }
];

export default function PhaseNavigator() {
  const [active, setActive] = useState('phase1');
  const current = phases.find((p) => p.key === active);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {phases.map((p) => (
          <button
            key={p.key}
            onClick={() => setActive(p.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium text-white shadow transition bg-gradient-to-r ${
              active === p.key ? p.color : 'from-slate-400 to-slate-600'
            }`}
          >
            {p.title.split(':')[0]}
          </button>
        ))}
      </div>

      <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm`}>
        <div className={`rounded-xl bg-gradient-to-r ${current.color} p-4 text-white`}>
          <h3 className="text-lg font-semibold">{current.title}</h3>
          <p className="mt-1 text-sm/6 opacity-90">{current.message}</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {current.bullets.map((b) => (
            <div key={b} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-600" />
              <p className="text-sm text-slate-700">{b}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-lg border border-dashed border-slate-300 p-4">
          <Target className="h-5 w-5 text-orange-500" />
          <p className="text-sm text-slate-600">Tip: 21 din ke liye chhote, clear targets banao. Consistency > intensity.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <TrendingUp className="h-4 w-4" />
        <span>Jaise-jaise phases aage badhenge, tumhari energy aur clarity upar jayegi.</span>
      </div>
    </section>
  );
}
