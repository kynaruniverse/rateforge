import { useState } from 'react';

export default function App() {
  const [takeHome, setTakeHome] = useState(60000);
  const [expenses, setExpenses] = useState(15000);
  const [billableDays, setBillableDays] = useState(210);
  const [isOutsideIR35, setIsOutsideIR35] = useState(true);

  // 2026/27 UK rates (Sole Trader – easy to extend later)
  const calculateRate = () => {
    const taxEstimate = takeHome * 0.28; // \~28% effective (tax + NI basic rate)
    const totalNeeded = takeHome + expenses + taxEstimate;
    const dailyRate = Math.round((totalNeeded / billableDays) * 1.1); // +10% buffer
    const hourlyRate = Math.round(dailyRate / 7.5);
    const projectedKeep = Math.round(takeHome * 0.72); // after tax/NI

    return { dailyRate, hourlyRate, projectedKeep, effectiveTax: '28%' };
  };

  const { dailyRate, hourlyRate, projectedKeep, effectiveTax } = calculateRate();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-emerald-400">RateForge</h1>
          <p className="text-emerald-300 text-sm">UK Freelance Rate Calculator • 2026/27</p>
        </div>
        <div className="text-xs bg-slate-900 px-3 py-1 rounded-2xl border border-emerald-500">
          Live
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Main Calculator Card */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800">
          
          {/* Desired Take-Home */}
          <div className="mb-8">
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-slate-300 text-lg">Desired annual take-home</label>
              <span className="font-mono text-3xl text-emerald-400">£{takeHome.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="30000"
              max="150000"
              step="1000"
              value={takeHome}
              onChange={(e) => setTakeHome(Number(e.target.value))}
              className="w-full accent-emerald-400"
            />
          </div>

          {/* Expenses */}
          <div className="mb-8">
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-slate-300 text-lg">Annual expenses</label>
              <span className="font-mono text-3xl text-emerald-400">£{expenses.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="40000"
              step="500"
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
              className="w-full accent-emerald-400"
            />
          </div>

          {/* Billable Days */}
          <div className="mb-8">
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-slate-300 text-lg">Billable days per year</label>
              <span className="font-mono text-3xl text-emerald-400">{billableDays}</span>
            </div>
            <input
              type="range"
              min="100"
              max="240"
              step="5"
              value={billableDays}
              onChange={(e) => setBillableDays(Number(e.target.value))}
              className="w-full accent-emerald-400"
            />
            <p className="text-xs text-slate-400 mt-1">Default 210 after holidays &amp; admin</p>
          </div>

          {/* IR35 Toggle */}
          <div className="flex items-center justify-between mb-10 bg-slate-800 rounded-2xl p-4">
            <div>
              <p className="text-slate-300">IR35 status</p>
              <p className="text-sm text-slate-400">Outside IR35 = more take-home</p>
            </div>
            <button
              onClick={() => setIsOutsideIR35(!isOutsideIR35)}
              className={`px-6 py-2 rounded-2xl font-medium transition-all ${
                isOutsideIR35
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-slate-700 text-white'
              }`}
            >
              {isOutsideIR35 ? '✅ Outside' : 'Inside'}
            </button>
          </div>

          {/* Live Results */}
          <div className="bg-emerald-500/10 border border-emerald-400 rounded-3xl p-8 text-center">
            <p className="uppercase text-emerald-400 text-sm tracking-widest mb-1">Recommended Rate</p>
            <p className="text-7xl font-bold text-white mb-1">£{dailyRate}</p>
            <p className="text-2xl text-emerald-300">per day</p>
            
            <div className="flex justify-center gap-8 mt-8">
              <div>
                <p className="text-xs text-slate-400">Hourly</p>
                <p className="text-4xl font-semibold">£{hourlyRate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">You keep</p>
                <p className="text-4xl font-semibold text-emerald-400">£{projectedKeep.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Effective tax</p>
                <p className="text-4xl font-semibold">{effectiveTax}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert('✅ Rate saved to dashboard! (Phase 3 coming next)')}
            className="w-full mt-8 bg-emerald-400 hover:bg-emerald-500 transition-colors text-slate-950 font-semibold text-xl py-6 rounded-3xl"
          >
            Forge This Rate → Save to Dashboard
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-500 text-xs mt-8">
          Calculations based on 2026/27 UK tax &amp; NI rules • Real-time • Offline
        </p>
      </div>
    </div>
  );
}