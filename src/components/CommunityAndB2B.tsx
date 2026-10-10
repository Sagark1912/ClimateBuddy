import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ThumbsUp, 
  AlertTriangle, 
  PlusCircle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Users,
  Flame
} from 'lucide-react';
import { CommunityReport, Language, EnvironmentalData } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface CommunityAndB2BProps {
  reports: CommunityReport[];
  onAddReport: (report: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes' | 'verified'>) => void;
  onUpvoteReport: (id: string) => void;
  envData: EnvironmentalData;
  language: Language;
}

export const CommunityAndB2B: React.FC<CommunityAndB2BProps> = ({
  reports,
  onAddReport,
  onUpvoteReport,
  envData,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [activeTab, setActiveTab] = useState<'community' | 'b2b'>('community');

  // New report modal state
  const [showModal, setShowModal] = useState(false);
  const [newHazardType, setNewHazardType] = useState<any>('waterlogging');
  const [newLocation, setNewLocation] = useState('Sony World Junction Underpass');
  const [newDescription, setNewDescription] = useState('Road surface flooded by 6 inches, avoid two-wheeler traffic.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReport({
      hazardType: newHazardType,
      locationName: newLocation,
      description: newDescription,
      distanceKm: 1.5,
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('community')}
          className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'community'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4 text-emerald-300" />
          <span>🌐 Hyper-Local Community Network</span>
        </button>

        <button
          onClick={() => setActiveTab('b2b')}
          className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'b2b'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-300" />
          <span>🏢 B2B & Employer Heat Safety Portal</span>
        </button>
      </div>

      {/* 1. COMMUNITY CITIZEN OBSERVATIONS */}
      {activeTab === 'community' && (
        <section aria-labelledby="community-heading" className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  Crowdsourced Ground Truth Loop
                </span>
                <h3 id="community-heading" className="text-lg sm:text-xl font-bold text-white mt-1">
                  🌐 Community Climate Network
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Validates satellite predictions with on-the-ground citizen reports ("Did it rain in your sector?", waterlogging, fallen wires).
                </p>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Local Hazard</span>
              </button>
            </div>

            {/* Reports List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        {rep.hazardType === 'waterlogging' && '🌊 Waterlogging'}
                        {rep.hazardType === 'heat_spot' && '🔥 Urban Heat Island'}
                        {rep.hazardType === 'localized_rain' && '🌧️ Local Rain Confirmed'}
                        {rep.hazardType === 'smog_smoke' && '😷 Smoke / Smog Trap'}
                        {rep.hazardType === 'fallen_tree' && '⚠️ Road Obstruction'}
                      </span>
                      {rep.verified && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 mb-1">
                      {rep.locationName}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {rep.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {rep.timestamp}
                    </span>
                    <button
                      onClick={() => onUpvoteReport(rep.id)}
                      className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3 text-emerald-400" />
                      <span>{rep.upvotes} Confirmations</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. B2B / EMPLOYER HEAT SAFETY PORTAL */}
      {activeTab === 'b2b' && (
        <section aria-labelledby="b2b-heading" className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  Organizational Workforce Protection
                </span>
                <h3 id="b2b-heading" className="text-lg sm:text-xl font-bold text-white mt-1">
                  🏢 B2B & Employer Safety Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  For food delivery platforms, construction contractors, and logistics hubs to monitor fleet heat risk and enforce safe rest windows.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Active Outdoor Workers Monitored: <strong className="text-white">1,420</strong></span>
              </div>
            </div>

            {/* Heat Strain Gauge & Live Fleet Risk */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" /> Wet Bulb Globe Temp (WBGT)
                </span>
                <span className="text-2xl font-bold text-rose-400">{envData.heatStressWbgt}°C</span>
                <p className="text-xs text-slate-300 mt-2">
                  Exceeds OSHA / NDMA 28°C threshold. Mandate 15-minute shade break every hour between 12:00 PM – 3:30 PM.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Fleet Hydration Compliance
                </span>
                <span className="text-2xl font-bold text-emerald-400">94.2%</span>
                <p className="text-xs text-slate-300 mt-2">
                  1,338 riders verified hydration check-in via mobile push prompts at designated shaded hub kiosks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> Delivery SLA Adjustments
                </span>
                <span className="text-2xl font-bold text-sky-300">+10 Mins Dynamic Buffer</span>
                <p className="text-xs text-slate-300 mt-2">
                  Customer delivery expectations relaxed by 10 minutes during peak thermal strain to disincentivize reckless speeding.
                </p>
              </div>
            </div>

            {/* Compliance Log Table */}
            <div className="mt-5 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <h4 className="font-bold text-slate-200 mb-2">Automated Fleet Safety Protocols Triggered</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>11:30 AM:</strong> Dispatched hydration & shade kiosk directions to all riders in East Zone.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>12:00 PM:</strong> Enforced 15-minute cool-down breaks at partnered air-conditioned dark stores.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>02:00 PM:</strong> ORS electrolyte packets replenished at 18 distribution points across city.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-2">Report a Hyper-Local Hazard</h4>
            <p className="text-xs text-slate-400 mb-4">
              Your report updates the live community map and refines localized AI advisories for nearby citizens.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Hazard Category</label>
                <select
                  value={newHazardType}
                  onChange={(e) => setNewHazardType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="waterlogging">Waterlogging / Flooded Road</option>
                  <option value="heat_spot">Severe Heat Trap (No Shade)</option>
                  <option value="localized_rain">Localized Rain Shower</option>
                  <option value="smog_smoke">Garbage Smoke / Toxic Smog</option>
                  <option value="fallen_tree">Fallen Tree / Power Cable</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Location / Landmark</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Observation Details</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
