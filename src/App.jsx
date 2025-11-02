import DailyDashboard from './components/DailyDashboard';
import PhaseNavigator from './components/PhaseNavigator';
import MusicMoodZone from './components/MusicMoodZone';
import HabitAnalytics from './components/HabitAnalytics';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-slate-800">Gaurav Version 2.0 — The Comeback App</h1>
              <p className="text-xs text-slate-600">Tu ruk gaya hai Gaurav, khatam nahi hua. Har din ek naya start hai.</p>
            </div>
            <div className="hidden text-xs text-slate-500 md:block">Warm • Caring • Dost jaisa</div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <DailyDashboard />

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PhaseNavigator />
          <MusicMoodZone />
        </section>

        <HabitAnalytics />

        {/* Footer note */}
        <footer className="pt-6 text-center text-xs text-slate-500">
          Gentle reminder: Small steps bhi progress hain. Aaj ka din apne liye jeet lo.
        </footer>
      </main>
    </div>
  );
}

export default App;
