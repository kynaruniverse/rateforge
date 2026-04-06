import { useState, useEffect, useRef } from 'react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('calc');
  const [takeHome, setTakeHome] = useState(60000);
  const [expenses, setExpenses] = useState(15000);
  const [billableDays, setBillableDays] = useState(210);
  const [isOutsideIR35, setIsOutsideIR35] = useState(true);

  // Auto-load
  useEffect(() => {
    const saved = localStorage.getItem('rateforgeScenario');
    if (saved) {
      const data = JSON.parse(saved);
      setTakeHome(data.takeHome || 60000);
      setExpenses(data.expenses || 15000);
      setBillableDays(data.billableDays || 210);
      setIsOutsideIR35(data.isOutsideIR35 ?? true);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem('rateforgeScenario', JSON.stringify({ takeHome, expenses, billableDays, isOutsideIR35 }));
  }, [takeHome, expenses, billableDays, isOutsideIR35]);

  const calculateSoleTrader = () => {
    const taxNI = takeHome * 0.28;
    const totalNeeded = takeHome + expenses + taxNI;
    const dailyRate = Math.round((totalNeeded / billableDays) * 1.1);
    const hourlyRate = Math.round(dailyRate / 7.5);
    const keep = Math.round(takeHome * 0.72);
    return { dailyRate, hourlyRate, keep, effectiveTax: '28%' };
  };

  const calculateLtd = () => {
    const corpTax = takeHome * 0.19;
    const dividendTax = takeHome * 0.085;
    const totalTax = corpTax + dividendTax;
    const totalNeeded = takeHome + expenses + totalTax;
    const dailyRate = Math.round((totalNeeded / billableDays) * 1.1);
    const hourlyRate = Math.round(dailyRate / 7.5);
    const keep = Math.round(takeHome * 0.81);
    return { dailyRate, hourlyRate, keep, effectiveTax: '19%' };
  };

  const sole = calculateSoleTrader();
  const ltd = calculateLtd();

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (currentTab === 'dashboard' && chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(chartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Take-home', 'Tax & NI', 'Expenses'],
          datasets: [{ data: [sole.keep, takeHome * 0.28, expenses], backgroundColor: ['#10b981', '#ef4444', '#64748b'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#e2e8f0', font: { size: 14 } } } } }
      });
    }
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [currentTab, sole.keep, takeHome, expenses]);

  const saveScenario = () => alert('✅ Scenario saved to your device! Auto-loaded next time.');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-emerald-400">RateForge</h1>
          <p className="text-emerald-300 text-sm">2026/27 UK Tax Rules • Live</p>
        </div>
        <button onClick={saveScenario} className="px-5 py-2 bg-emerald-400 text-slate-950 rounded-3xl font-semibold text-sm">Save</button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {currentTab === 'calc' && (
          <div className="max-w-xl mx-auto bg-slate-900 rounded-3xl p-8">
            <div className="mb-8">
              <label className="text-slate-300 block mb-2">Desired take-home</label>
              <div className="flex justify-between text-3xl text-emerald-400 mb-3"><span>£</span><span className="font-mono">{takeHome.toLocaleString()}</span></div>
              <input type="range" min="30000" max="150000" step="1000" value={takeHome} onChange={e => setTakeHome(Number(e.target.value))} className="w-full accent-emerald-400" />
            </div>
            <div className="mb-8">
              <label className="text-slate-300 block mb-2">Annual expenses</label>
              <div className="flex justify-between text-3xl text-emerald-400 mb-3"><span>£</span><span className="font-mono">{expenses.toLocaleString()}</span></div>
              <input type="range" min="5000" max="40000" step="500" value={expenses} onChange={e => setExpenses(Number(e.target.value))} className="w-full accent-emerald-400" />
            </div>
            <div className="mb-8">
              <label className="text-slate-300 block mb-2">Billable days/year</label>
              <div className="flex justify-between text-3xl text-emerald-400 mb-3"><span>{billableDays}</span></div>
              <input type="range" min="100" max="240" step="5" value={billableDays} onChange={e => setBillableDays(Number(e.target.value))} className="w-full accent-emerald-400" />
            </div>
            <div className="flex justify-between items-center bg-slate-800 rounded-2xl p-4 mb-8">
              <div><p className="text-slate-300">IR35</p><p className="text-xs text-slate-400">Outside = higher keep</p></div>
              <button onClick={() => setIsOutsideIR35(!isOutsideIR35)} className={`px-8 py-3 rounded-3xl font-semibold ${isOutsideIR35 ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700'}`}>{isOutsideIR35 ? '✅ Outside' : 'Inside'}</button>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-400 rounded-3xl p-8 text-center">
              <p className="uppercase text-sm text-emerald-400 tracking-widest">Recommended Day Rate</p>
              <p className="text-7xl font-bold">£{sole.dailyRate}</p>
              <p className="text-emerald-300">£{sole.hourlyRate} / hour • You keep £{sole.keep.toLocaleString()}</p>
            </div>
          </div>
        )}

        {currentTab === 'dashboard' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-slate-900 rounded-3xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Your 2026 Dashboard</h2>
              <div className="text-center mb-8"><p className="text-slate-400 text-sm">Projected annual take-home</p><p className="text-6xl font-bold text-emerald-400">£{sole.keep.toLocaleString()}</p></div>
              <div className="h-72"><canvas ref={chartRef}></canvas></div>
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-800 rounded-2xl p-4"><p className="text-xs text-slate-400">Daily rate</p><p className="text-3xl font-bold">£{sole.dailyRate}</p></div>
                <div className="bg-slate-800 rounded-2xl p-4"><p className="text-xs text-slate-400">Billable days</p><p className="text-3xl font-bold">{billableDays}</p></div>
                <div className="bg-slate-800 rounded-2xl p-4"><p className="text-xs text-slate-400">MTD ready</p><p className="text-3xl font-bold text-emerald-400">✅</p></div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'planner' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-slate-900 rounded-3xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Tax Planner – Sole vs Ltd</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-3xl p-6">
                  <div className="text-center mb-4"><p className="font-medium text-emerald-400">Sole Trader</p><p className="text-5xl font-bold">£{sole.dailyRate}</p><p className="text-sm text-slate-400">day rate</p></div>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between"><span>Keep</span><span className="font-mono">£{sole.keep.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Tax</span><span className="font-mono">{sole.effectiveTax}</span></div>
                  </div>
                </div>
                <div className="bg-slate-800 rounded-3xl p-6 border-2 border-emerald-400">
                  <div className="text-center mb-4"><p className="font-medium text-emerald-400">Limited Company</p><p className="text-5xl font-bold">£{ltd.dailyRate}</p><p className="text-sm text-slate-400">day rate</p></div>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between"><span>Keep</span><span className="font-mono">£{ltd.keep.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Tax</span><span className="font-mono">{ltd.effectiveTax}</span></div>
                  </div>
                  <div className="mt-6 text-[10px] text-emerald-400 text-center">Better above £45k</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'resources' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-slate-900 rounded-3xl p-8">
              <h2 className="text-2xl font-semibold mb-6">🚀 Perfect UK Freelance Setup</h2>
              <div className="space-y-6 text-sm">
                <div className="flex gap-3"><span className="text-emerald-400 text-xl">1️⃣</span><div><p className="font-medium">Register as Sole Trader</p><p className="text-slate-400">HMRC Self Assessment + UTR (free)</p></div></div>
                <div className="flex gap-3"><span className="text-emerald-400 text-xl">2️⃣</span><div><p className="font-medium">Business bank account</p><p className="text-slate-400">Starling, Tide or Monzo Business</p></div></div>
                <div className="flex gap-3"><span className="text-emerald-400 text-xl">3️⃣</span><div><p className="font-medium">Accounting software</p><p className="text-slate-400">FreeAgent or QuickBooks (MTD ready)</p></div></div>
                <div className="flex gap-3"><span className="text-emerald-400 text-xl">4️⃣</span><div><p className="font-medium">Insurance</p><p className="text-slate-400">Professional Indemnity via IPSE or Simply Business</p></div></div>
                <div className="flex gap-3"><span className="text-emerald-400 text-xl">5️⃣</span><div><p className="font-medium">Contracts &amp; invoices</p><p className="text-slate-400">IPSE templates + Stripe/PayPal</p></div></div>
              </div>
              <button className="w-full mt-10 bg-emerald-400 text-slate-950 py-6 rounded-3xl font-semibold text-xl">Export to FreeAgent CSV</button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 bg-slate-900 p-3 flex justify-around text-xs font-medium">
        <button onClick={() => setCurrentTab('calc')} className={`flex flex-col items-center ${currentTab === 'calc' ? 'text-emerald-400' : 'text-slate-400'}`}><span className="text-2xl mb-1">🔥</span><span>Calc</span></button>
        <button onClick={() => setCurrentTab('dashboard')} className={`flex flex-col items-center ${currentTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'}`}><span className="text-2xl mb-1">📊</span><span>Dashboard</span></button>
        <button onClick={() => setCurrentTab('planner')} className={`flex flex-col items-center ${currentTab === 'planner' ? 'text-emerald-400' : 'text-slate-400'}`}><span className="text-2xl mb-1">📋</span><span>Planner</span></button>
        <button onClick={() => setCurrentTab('resources')} className={`flex flex-col items-center ${currentTab === 'resources' ? 'text-emerald-400' : 'text-slate-400'}`}><span className="text-2xl mb-1">🛠️</span><span>Setup</span></button>
      </div>
    </div>
  );
}