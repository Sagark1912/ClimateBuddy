import React, { useState } from 'react';
import { 
  Sparkles, 
  Droplet, 
  Zap, 
  Leaf, 
  IndianRupee, 
  Sliders, 
  Calculator,
  RefreshCw
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface WhatIfSimulatorProps {
  language: Language;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [scenarioType, setScenarioType] = useState<'ac_reduction' | 'irrigation_delay' | 'active_commute'>('irrigation_delay');
  const [scaleCount, setScaleCount] = useState<number>(5000);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Dynamic scientific calculations
  let waterSavedLiters = 0;
  let co2AvoidedKg = 0;
  let kwhSaved = 0;
  let costSavedINR = 0;
  let explanation = '';

  if (scenarioType === 'irrigation_delay') {
    // 1 day delay of borewell irrigation on 1 acre saves ~35,000L and 10 kWh
    const events = Math.ceil(durationDays / 7);
    waterSavedLiters = scaleCount * 35000 * events;
    kwhSaved = scaleCount * 10 * events;
    co2AvoidedKg = Math.round(kwhSaved * 0.82);
    costSavedINR = Math.round(kwhSaved * 6.5);
    explanation = `When ${scaleCount.toLocaleString()} farmers delay pump irrigation ahead of forecasted showers, the district saves ${(waterSavedLiters / 1000000).toFixed(1)} Million Liters of precious groundwater and relieves ${kwhSaved.toLocaleString()} kWh of agricultural grid load.`;
  } else if (scenarioType === 'ac_reduction') {
    // 2 hours less AC per day saves ~2.5 kWh/day per household
    kwhSaved = scaleCount * 2.5 * durationDays;
    co2AvoidedKg = Math.round(kwhSaved * 0.82);
    waterSavedLiters = Math.round(kwhSaved * 3.5); // cooling tower & hydro grid water saved
    costSavedINR = Math.round(kwhSaved * 8.0);
    explanation = `If ${scaleCount.toLocaleString()} urban homes replace 2 hours of afternoon AC with natural cross-ventilation for ${durationDays} days, household electricity bills drop by ₹${(costSavedINR / 100000).toFixed(2)} Lakhs and ${co2AvoidedKg.toLocaleString()} kg CO₂e greenhouse gas emissions are eliminated.`;
  } else {
    // Active commute 4 km daily instead of petrol two-wheeler/car
    co2AvoidedKg = Math.round(scaleCount * 4 * 0.16 * durationDays);
    kwhSaved = Math.round(co2AvoidedKg * 0.9);
    waterSavedLiters = 0;
    costSavedINR = Math.round(scaleCount * 4 * 3.8 * durationDays);
    explanation = `If ${scaleCount.toLocaleString()} commuters cycle or take the metro for 4 km daily for ${durationDays} days, traffic congestion drops and ${co2AvoidedKg.toLocaleString()} kg CO₂e vehicle exhaust is kept out of city air, saving ₹${(costSavedINR / 100000).toFixed(2)} Lakhs in fuel.`;
  }

  return (
    <div className="space-y-5">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>Collective Environmental Impact Modeling</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
            🔮 What-If Climate Simulator
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Explore how small, coordinated micro-decisions scale across communities into colossal water, energy, and carbon savings.
          </p>
        </div>

        {/* Scenario Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <button
            onClick={() => setScenarioType('irrigation_delay')}
            className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
              scenarioType === 'irrigation_delay'
                ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-lg block mb-1">🌾</span>
            <div className="text-xs font-bold text-slate-100">Farmers Delay Irrigation</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Aligned with rain forecast</div>
          </button>

          <button
            onClick={() => setScenarioType('ac_reduction')}
            className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
              scenarioType === 'ac_reduction'
                ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-lg block mb-1">❄️</span>
            <div className="text-xs font-bold text-slate-100">Households Cut 2h AC</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Natural cross-ventilation</div>
          </button>

          <button
            onClick={() => setScenarioType('active_commute')}
            className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
              scenarioType === 'active_commute'
                ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-lg block mb-1">🚲</span>
            <div className="text-xs font-bold text-slate-100">Commuters Cycle 4 km</div>
            <div className="text-[11px] text-slate-400 mt-0.5">On mild weather days</div>
          </button>
        </div>

        {/* Sliders for Scale and Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5 pb-4 border-b border-slate-800">
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
              <span>Community Scale (Participants):</span>
              <strong className="text-emerald-400 font-bold">{scaleCount.toLocaleString()}</strong>
            </div>
            <input
              type="range"
              min="100"
              max="50000"
              step="500"
              value={scaleCount}
              onChange={(e) => setScaleCount(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>100 (Apartment / Village)</span>
              <span>10,000 (Ward)</span>
              <span>50,000 (District)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
              <span>Simulation Duration (Days):</span>
              <strong className="text-emerald-400 font-bold">{durationDays} Days</strong>
            </div>
            <input
              type="range"
              min="7"
              max="90"
              step="1"
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>7 Days (1 Week)</span>
              <span>30 Days (1 Month)</span>
              <span>90 Days (Season)</span>
            </div>
          </div>
        </div>

        {/* Projected Impact Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Droplet className="w-3.5 h-3.5 text-sky-400" /> Water Saved
            </span>
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {waterSavedLiters > 1000000
                ? `${(waterSavedLiters / 1000000).toFixed(1)} M Liters`
                : `${waterSavedLiters.toLocaleString()} L`}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Grid Energy Saved
            </span>
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {kwhSaved.toLocaleString()} kWh
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" /> CO₂e Avoided
            </span>
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {co2AvoidedKg.toLocaleString()} kg
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <IndianRupee className="w-3.5 h-3.5 text-teal-400" /> Estimated Savings
            </span>
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ₹{costSavedINR.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Scientific Narrative */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <p className="font-medium text-slate-200">
            🌱 <strong>Ecological Proof Point:</strong> {explanation}
          </p>
        </div>
      </div>
    </div>
  );
};
