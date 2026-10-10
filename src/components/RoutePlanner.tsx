import React, { useState } from 'react';
import { 
  Navigation, 
  Sun, 
  Wind, 
  CloudRain, 
  TreePine, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface RoutePlannerProps {
  language: Language;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [selectedRoute, setSelectedRoute] = useState<'safe' | 'fastest'>('safe');
  const [startPoint, setStartPoint] = useState('Indiranagar BDA Complex');
  const [endPoint, setEndPoint] = useState('Koramangala 4th Block');

  return (
    <div className="space-y-5">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Navigation className="w-4 h-4" />
            <span>AI Environmental Routing Engine</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
            🗺️ Climate-Safe Route Planner
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Normal navigation asks "Which route is fastest?". ClimateBuddy asks "Which route protects you from heatwaves, toxic exhaust, and waterlogged underpasses?".
          </p>
        </div>

        {/* Origin / Destination Input Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Origin</label>
            <input
              type="text"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Destination</label>
            <input
              type="text"
              value={endPoint}
              onChange={(e) => setEndPoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Route Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
          {/* Route A: Fastest Standard */}
          <div
            onClick={() => setSelectedRoute('fastest')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              selectedRoute === 'fastest'
                ? 'bg-slate-900 border-rose-500/80 ring-1 ring-rose-500'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-slate-300 block">Route A (Standard Navigation)</span>
                <span className="text-[11px] text-slate-500">Via Ring Road Express Flyover</span>
              </div>
              <span className="text-xs font-semibold text-rose-400 bg-rose-950/50 border border-rose-900 px-2 py-0.5 rounded">
                High Heat & AQI Risk
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-2xl font-bold text-white">21 mins</span>
              <span className="text-xs text-slate-400">7.2 km</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-rose-400" /> Direct Sun Exposure:
                </span>
                <strong className="text-rose-300">82% Unshaded Asphalt</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-rose-400" /> Particulate Exposure:
                </span>
                <strong className="text-rose-300">High (AQI 168 - Diesel Corridor)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-amber-400" /> Waterlog Hazard:
                </span>
                <strong className="text-amber-300">Moderate (Flyover descent dip)</strong>
              </div>
            </div>
          </div>

          {/* Route B: Climate-Safe & Shaded */}
          <div
            onClick={() => setSelectedRoute('safe')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              selectedRoute === 'safe'
                ? 'bg-emerald-950/30 border-emerald-500/80 ring-1 ring-emerald-500'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-300 block">Route B (ClimateBuddy Recommended)</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <span className="text-[11px] text-slate-400">Via 100ft Canopy Road & Defense Colony</span>
              </div>
              <span className="text-xs font-semibold text-emerald-300 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                Recommended Choice
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-2xl font-bold text-white">24 mins</span>
              <span className="text-xs text-slate-400">7.6 km (+3 mins)</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <TreePine className="w-3.5 h-3.5 text-emerald-400" /> Tree Canopy & Shade:
                </span>
                <strong className="text-emerald-300">74% Shaded Canopy (3.2°C cooler)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-emerald-400" /> Particulate Exposure:
                </span>
                <strong className="text-emerald-300">38% Lower (Residential greenery)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-emerald-400" /> Waterlog Hazard:
                </span>
                <strong className="text-emerald-300">Zero (Bypasses underpasses)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Route AI Verdict */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-slate-300">
              {selectedRoute === 'safe'
                ? 'Route B takes only 3 minutes more, but reduces your thermal strain by 3.2°C and cuts inhaled PM2.5 by ~42 µg/m³. Highly recommended for cycling and two-wheelers.'
                : 'Route A is slightly faster, but exposes you to unshaded noon heat and elevated diesel emissions along the arterial bypass.'}
            </p>
          </div>
          <button className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg text-xs shrink-0 flex items-center justify-center gap-1.5 transition-colors">
            <span>Send Directions to Phone</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
