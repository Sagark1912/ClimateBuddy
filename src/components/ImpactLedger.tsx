import React, { useState } from 'react';
import { 
  Award, 
  Flame, 
  Droplet, 
  Zap, 
  Leaf, 
  IndianRupee, 
  PlusCircle, 
  CheckCircle2, 
  Trash2,
  Calendar
} from 'lucide-react';
import { GreenActionLog, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ImpactLedgerProps {
  logs: GreenActionLog[];
  onAddManualAction: (action: Omit<GreenActionLog, 'id' | 'timestamp'>) => void;
  onClearLogs: () => void;
  language: Language;
}

export const ImpactLedger: React.FC<ImpactLedgerProps> = ({
  logs,
  onAddManualAction,
  onClearLogs,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [showAddModal, setShowAddModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('Walked / Cycled 3 km instead of bike');
  const [customCategory, setCustomCategory] = useState<'water' | 'energy' | 'transit' | 'cooling'>('transit');

  // Aggregated totals
  const totalWaterL = logs.reduce((acc, l) => acc + (l.waterSavedL || 0), 0);
  const totalCo2Kg = logs.reduce((acc, l) => acc + (l.co2AvoidedKg || 0), 0);
  const totalKwh = logs.reduce((acc, l) => acc + (l.kwhSaved || 0), 0);
  const totalInr = logs.reduce((acc, l) => acc + (l.moneySavedINR || 0), 0);

  const streakDays = 6; // Current active streak

  const badges = [
    { title: '7-Day Water Saver', unlocked: totalWaterL > 10000, icon: '💧', desc: 'Saved >10,000L by timing irrigation' },
    { title: 'Clean Commuter Pro', unlocked: totalCo2Kg > 10, icon: '🚲', desc: 'Avoided >10 kg CO₂e emissions' },
    { title: 'Grid Reliever', unlocked: totalKwh > 20, icon: '⚡', desc: 'Cut 20+ kWh of peak cooling demand' },
    { title: 'Climate Sentinel', unlocked: logs.length >= 3, icon: '🌱', desc: 'Consistently logged 3+ verified habits' },
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let waterSavedL = 0;
    let co2AvoidedKg = 0;
    let kwhSaved = 0;
    let moneySavedINR = 0;

    if (customCategory === 'water') {
      waterSavedL = 250;
      moneySavedINR = 15;
    } else if (customCategory === 'energy' || customCategory === 'cooling') {
      kwhSaved = 2.4;
      co2AvoidedKg = 2.0;
      moneySavedINR = 18;
    } else {
      co2AvoidedKg = 1.2;
      moneySavedINR = 40;
    }

    onAddManualAction({
      title: customTitle,
      category: customCategory,
      waterSavedL,
      co2AvoidedKg,
      kwhSaved,
      moneySavedINR,
      source: 'manual',
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Totals & Streak */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Personal Behavioral Climate Ledger</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              🏆 Your Climate Impact & Savings Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Verified record of every climate-smart choice you make. Converts micro-actions into tangible resource metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Streak Indicator */}
            <div className="flex items-center gap-2 bg-amber-950/60 border border-amber-800/80 px-3 py-1.5 rounded-xl text-amber-300 text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{streakDays}-Day Climate Streak!</span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Action</span>
            </button>
          </div>
        </div>

        {/* 4 Key Ledger Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Droplet className="w-3.5 h-3.5 text-sky-400" /> Total Water Saved
            </span>
            <span className="text-2xl font-bold text-white">
              {totalWaterL.toLocaleString()} <span className="text-sm font-normal text-slate-400">Liters</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Emissions Avoided
            </span>
            <span className="text-2xl font-bold text-white">
              {totalCo2Kg.toFixed(1)} <span className="text-sm font-normal text-slate-400">kg CO₂e</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Electricity Conserved
            </span>
            <span className="text-2xl font-bold text-white">
              {totalKwh.toFixed(1)} <span className="text-sm font-normal text-slate-400">kWh</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <IndianRupee className="w-3.5 h-3.5 text-teal-400" /> Estimated Bill Saved
            </span>
            <span className="text-2xl font-bold text-white">
              ₹{totalInr.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Badges and Milestones */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Achievements & Climate Milestones
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((b, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center transition-all ${
                b.unlocked
                  ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                  : 'bg-slate-950/50 border-slate-800/70 opacity-60'
              }`}
            >
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-xs font-bold text-slate-100">{b.title}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{b.desc}</div>
              <div className="mt-2 text-[9px] font-semibold">
                {b.unlocked ? <span className="text-emerald-400 font-bold">✓ UNLOCKED</span> : <span className="text-slate-500">IN PROGRESS</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Action History Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Activity Log ({logs.length} logged)
          </h4>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="cursor-pointer text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Reset Ledger</span>
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No actions logged yet. Accept a prescriptive nudge from the dashboard to log your first savings!
          </p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-sm">
                    {log.category === 'water' ? '💧' : log.category === 'transit' ? '🚲' : log.category === 'cooling' ? '❄️' : '⚡'}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-100 block">{log.title}</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3" /> {log.timestamp} · {log.source === 'nudge' ? 'AI Nudge Verified' : 'Self-Reported'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto text-slate-300 font-mono text-[11px]">
                  {log.waterSavedL > 0 && <span className="text-sky-400">+{log.waterSavedL.toLocaleString()} L</span>}
                  {log.co2AvoidedKg > 0 && <span className="text-emerald-400">-{log.co2AvoidedKg} kg CO₂</span>}
                  {log.kwhSaved > 0 && <span className="text-amber-400">+{log.kwhSaved} kWh</span>}
                  {log.moneySavedINR > 0 && <span className="text-teal-400 font-bold">+₹{log.moneySavedINR}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Action Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-2">Log a Sustainable Micro-Action</h4>
            <p className="text-xs text-slate-400 mb-4">
              Add your daily green choice to update your personal and community impact counters.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Action Description</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Category</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="transit">Clean Transit / Walk / Cycle</option>
                  <option value="water">Rainwater Harvesting / Skipped Hose</option>
                  <option value="cooling">Natural Ventilation (Turned off AC)</option>
                  <option value="energy">Solar / Power Saving</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg"
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
