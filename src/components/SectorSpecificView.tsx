import React, { useState } from 'react';
import { 
  Users, 
  Droplet, 
  Sun, 
  Wind, 
  Clock, 
  CheckCircle2, 
  Zap, 
  HeartPulse, 
  ShieldCheck, 
  Layers, 
  Plus, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { UserPersona, EnvironmentalData, Language, FamilyMember } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface SectorSpecificViewProps {
  userPersona: UserPersona;
  onUpdatePersona: (persona: UserPersona) => void;
  envData: EnvironmentalData;
  language: Language;
}

export const SectorSpecificView: React.FC<SectorSpecificViewProps> = ({
  userPersona,
  onUpdatePersona,
  envData,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // State for adding a new family member
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<FamilyMember['role']>('school_child');
  const [newDepTime, setNewDepTime] = useState('08:00');
  const [newRetTime, setNewRetTime] = useState('15:00');
  const [newSensitivity, setNewSensitivity] = useState<FamilyMember['sensitivity']>('general');

  // Irrigation Savings Calculator values based on farmer inputs
  const acreage = userPersona.farmer.acres || 3.0;
  const waterSavedPerDayLiters = Math.round(acreage * 38000);
  const electricityKwhSaved = Math.round(acreage * 12.5);

  const familyMembers = userPersona.family.members || [];

  const handleUpdateMemberTime = (id: string, field: 'departureTime' | 'returnTime', val: string) => {
    const updated = familyMembers.map((m) => (m.id === id ? { ...m, [field]: val } : m));
    onUpdatePersona({
      ...userPersona,
      family: {
        ...userPersona.family,
        members: updated,
      },
    });
  };

  const handleShiftTime = (id: string, field: 'departureTime' | 'returnTime', deltaMinutes: number) => {
    const member = familyMembers.find((m) => m.id === id);
    if (!member) return;
    const [hh, mm] = member[field].split(':').map((x) => parseInt(x, 10));
    let totalMinutes = (hh || 0) * 60 + (mm || 0) + deltaMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;
    const newH = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const newM = (totalMinutes % 60).toString().padStart(2, '0');
    handleUpdateMemberTime(id, field, `${newH}:${newM}`);
  };

  const handleRemoveMember = (id: string) => {
    const updated = familyMembers.filter((m) => m.id !== id);
    onUpdatePersona({
      ...userPersona,
      family: {
        ...userPersona.family,
        members: updated,
      },
    });
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMem: FamilyMember = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole,
      departureTime: newDepTime,
      returnTime: newRetTime,
      sensitivity: newSensitivity,
    };

    onUpdatePersona({
      ...userPersona,
      family: {
        ...userPersona.family,
        members: [...familyMembers, newMem],
      },
    });

    setNewMemberName('');
    setShowAddMember(false);
  };

  return (
    <div className="space-y-6">
      {/* Sector Header: Strictly displaying the selected active sector only */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              {userPersona.type === 'farmer' && `🌾 ${t.farmerMode || 'Climate-Smart Agriculture'}`}
              {userPersona.type === 'gig_worker' && `🛵 ${t.laborMode || 'Outdoor Labor & Mobility'}`}
              {userPersona.type === 'family' && `👨‍👩‍👧 ${t.familyMode || 'Family Climate Guardian'}`}
              {userPersona.type === 'commuter' && `🚲 ${t.commuterMode || 'Clean Commute Planner'}`}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              {userPersona.type === 'farmer' && 'Agronomic Intelligence & Irrigation Delay Dashboard'}
              {userPersona.type === 'gig_worker' && 'Occupational Thermal Strain & Work Window Scheduler'}
              {userPersona.type === 'family' && (t.familyRoutineSafety || 'Family Member Routine Timings & Household Safety')}
              {userPersona.type === 'commuter' && 'Clean Commuter & Micro-Mobility Route Engine'}
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span>{t.targetedFor || 'Targeted for'}:</span>
            <strong className="text-emerald-400 font-bold uppercase">{userPersona.type.replace('_', ' ')}</strong>
          </div>
        </div>

        {/* ==============================================================
            1. FAMILY PERSONA VIEW (MANUAL TIME ADJUSTMENT FOR EVERY MEMBER)
            ============================================================== */}
        {userPersona.type === 'family' && (
          <div className="pt-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>{t.manualFamilyAdjustment || 'Manual Schedule Adjustment for Family Members'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.manualFamilyDesc || 'Set exact departure and return hours for each family member to receive real-time weather & pollution warnings tailored to their routine.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddMember(true)}
                className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addMember || 'Add Family Member'}</span>
              </button>
            </div>

            {/* List of Configured Family Members with Manual Time Adjustment */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {familyMembers.map((member) => {
                const depHour = parseInt(member.departureTime.split(':')[0], 10) || 8;
                const retHour = parseInt(member.returnTime.split(':')[0], 10) || 15;
                const isReturnDuringPeakHeat = retHour >= 12 && retHour <= 15;
                const isDepEarlyMorningPollution = depHour <= 7 && envData.aqi > 100;

                return (
                  <div
                    key={member.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                          {member.role === 'school_child' && '🎒'}
                          {member.role === 'elderly' && '👵'}
                          {member.role === 'working_adult' && '💼'}
                          {member.role === 'infant' && '👶'}
                          {member.role === 'homemaker' && '🏡'}
                          <span>{member.name}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="cursor-pointer text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          title={t.removeMember || 'Remove member'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Manual Time Inputs with Quick Buttons */}
                      <div className="space-y-2.5 my-2.5 p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-slate-400 font-medium">
                              {t.departureTime || 'Departure Time'}
                            </label>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleShiftTime(member.id, 'departureTime', -30)}
                                className="px-1.5 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
                                title="Subtract 30 mins"
                              >
                                -30m
                              </button>
                              <button
                                type="button"
                                onClick={() => handleShiftTime(member.id, 'departureTime', 30)}
                                className="px-1.5 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
                                title="Add 30 mins"
                              >
                                +30m
                              </button>
                            </div>
                          </div>
                          <input
                            type="time"
                            value={member.departureTime}
                            onChange={(e) => handleUpdateMemberTime(member.id, 'departureTime', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-slate-400 font-medium">
                              {t.returnTime || 'Return Time'}
                            </label>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleShiftTime(member.id, 'returnTime', -30)}
                                className="px-1.5 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
                                title="Subtract 30 mins"
                              >
                                -30m
                              </button>
                              <button
                                type="button"
                                onClick={() => handleShiftTime(member.id, 'returnTime', 30)}
                                className="px-1.5 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
                                title="Add 30 mins"
                              >
                                +30m
                              </button>
                            </div>
                          </div>
                          <input
                            type="time"
                            value={member.returnTime}
                            onChange={(e) => handleUpdateMemberTime(member.id, 'returnTime', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Sensitivity Badge */}
                      <div className="text-[11px] text-slate-400 mb-2">
                        {t.healthSensitivity || 'Health Sensitivity'}: <strong className="text-slate-200 capitalize">{member.sensitivity}</strong>
                      </div>

                      {/* Tailored Real-Time Alert Dynamically Computed for this Member */}
                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                        {isReturnDuringPeakHeat && (
                          <div className="text-amber-300 flex items-start gap-1.5 leading-snug">
                            <Sun className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                            <span>Return at {member.returnTime} coincides with peak UV ({envData.uvIndex}). Send sun hat & water bottle.</span>
                          </div>
                        )}
                        {isDepEarlyMorningPollution && member.sensitivity === 'asthma' && (
                          <div className="text-rose-300 flex items-start gap-1.5 leading-snug">
                            <Wind className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                            <span>Early departure at {member.departureTime} during morning dust inversion (AQI {envData.aqi}). Wear N95 mask.</span>
                          </div>
                        )}
                        {!isReturnDuringPeakHeat && !isDepEarlyMorningPollution && (
                          <div className="text-emerald-300 flex items-start gap-1.5 leading-snug">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                            <span>Routine window has favorable thermal & air conditions today.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Household Energy & Indoor Air Quality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/60 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <Zap className="w-4 h-4" />
                  <span>Household Natural Cross-Ventilation Window</span>
                </div>
                <div className="text-sm font-semibold text-white">
                  Natural Cooling Window: Until 11:30 AM
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Outdoor morning air is cooler and fresher than indoor stale air. Keep windows open for cross ventilation before turning on AC to save ~3.2 kWh (~₹24/day).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                  <Wind className="w-4 h-4" />
                  <span>Indoor Air & Allergy Precaution</span>
                </div>
                <div className="text-sm font-semibold text-white">
                  Current AQI: {envData.aqi} ({envData.aqiCategory})
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fine particulates PM2.5 are {envData.pm25} µg/m³. Keep windows closed between 12 PM - 3 PM to prevent afternoon road dust ingress.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            2. FARMER PERSONA VIEW (ONLY DISPLAYED WHEN FARMER IS ACTIVE)
            ============================================================== */}
        {userPersona.type === 'farmer' && (
          <div className="pt-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2">
                  <Droplet className="w-4 h-4" />
                  <span>{t.delayIrrigation || 'Rain-Aligned Irrigation Delay'}</span>
                </div>
                <div className="text-sm font-semibold text-white mb-2">
                  {envData.rainChancePercent >= 50
                    ? `⚠️ Delay Borewell Irrigation by 24–36h`
                    : `✅ Safe to Irrigate (Low Rain Probability)`}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {envData.rainChancePercent >= 50
                    ? `Precipitation probability is ${envData.rainChancePercent}%. Pumping now causes excess standing water and fertilizer runoff.`
                    : `Soil moisture is at ${envData.soilMoisturePercent}%. Drip system irrigation recommended.`}
                </p>
                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>{t.waterSaved || 'Est. Water Saved'}:</span>
                    <strong className="text-emerald-300">{waterSavedPerDayLiters.toLocaleString()} Liters</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{t.energySaved || 'Pump Power Saved'}:</span>
                    <strong className="text-amber-300">{electricityKwhSaved} kWh</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold mb-2">
                  <Layers className="w-4 h-4" />
                  <span>{t.soilMoisture || 'Soil Moisture & Root Zone'}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-white">{envData.soilMoisturePercent}%</span>
                  <span className="text-xs text-slate-400">
                    {envData.soilMoisturePercent > 50 ? 'Adequate Moisture' : 'Depleting'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Radar telemetry confirms healthy moisture retention in root zone for {userPersona.farmer.crop}.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-2">
                  <Sun className="w-4 h-4" />
                  <span>Neem Spray & Foliar Window</span>
                </div>
                <div className="text-sm font-semibold text-white mb-1">
                  Best Window: 06:30 AM – 09:30 AM
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  High afternoon solar radiance ({envData.solarRadianceWm2} W/m²). Avoid foliar sprays after 10 AM to prevent leaf scorch.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            3. GIG WORKER PERSONA VIEW (ONLY DISPLAYED WHEN GIG WORKER IS ACTIVE)
            ============================================================== */}
        {userPersona.type === 'gig_worker' && (
          <div className="pt-4 space-y-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Safe Work Window & Thermal Stress Timeline (WBGT {envData.heatStressWbgt}°C)</span>
            </h3>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-center text-xs">
              {[
                { time: '06:00', temp: 24, status: 'safe' },
                { time: '08:00', temp: 27, status: 'safe' },
                { time: '10:00', temp: 31, status: 'moderate' },
                { time: '11:00', temp: 33, status: 'moderate' },
                { time: '12:00', temp: 35, status: 'extreme' },
                { time: '13:00', temp: 36, status: 'extreme' },
                { time: '14:00', temp: 36, status: 'extreme' },
                { time: '15:00', temp: 35, status: 'extreme' },
                { time: '16:00', temp: 33, status: 'moderate' },
                { time: '17:30', temp: 31, status: 'safe' },
                { time: '19:00', temp: 29, status: 'safe' },
                { time: '21:00', temp: 27, status: 'safe' },
              ].map((slot, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                    slot.status === 'extreme'
                      ? 'bg-rose-950/70 border-rose-800 text-rose-300'
                      : slot.status === 'moderate'
                      ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                      : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-300">{slot.time}</span>
                  <span className="font-bold my-1">{slot.temp}°C</span>
                  <span className="text-[9px] font-semibold uppercase">
                    {slot.status === 'extreme' ? 'Danger' : slot.status === 'moderate' ? 'Rest q30m' : 'Safe'}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4" /> Hydration & Electrolytes
                </span>
                <p className="text-xs text-slate-300">
                  During 12 PM - 3 PM, drink 250ml water every 20 minutes with ORS or buttermilk to prevent cramps and heat exhaustion.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Shaded Rest Cycle
                </span>
                <p className="text-xs text-slate-300">
                  Mandatory 15-minute shaded rest per 45 minutes of active outdoor deliveries.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            4. COMMUTER PERSONA VIEW (ONLY DISPLAYED WHEN COMMUTER IS ACTIVE)
            ============================================================== */}
        {userPersona.type === 'commuter' && (
          <div className="pt-4 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Cycling / Walking Index</span>
                <span className="text-xl font-bold text-emerald-400">92 / 100 (Optimal)</span>
                <p className="text-xs text-slate-300 mt-2">
                  Mild morning breeze ({envData.windSpeedKmh} km/h) and moderate AQI. Excellent conditions for bicycle commute.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Estimated Emissions Avoided</span>
                <span className="text-xl font-bold text-sky-400">1.04 kg CO₂e</span>
                <p className="text-xs text-slate-300 mt-2">
                  Avoids petrol tailpipe exhaust and cuts travel fuel costs by ~₹45 per trip.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Evening Return Route</span>
                <span className="text-xl font-bold text-amber-400">Carry Rain Cover</span>
                <p className="text-xs text-slate-300 mt-2">
                  Rain likelihood rises to {envData.rainChancePercent}% after 5:30 PM.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Family Member */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              {t.addMember || 'Add Family Member Schedule'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {t.manualFamilyDesc || 'Configure manual routine hours and specific health sensitivities.'}
            </p>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Member Name & Title</label>
                <input
                  type="text"
                  placeholder="e.g. Diya (Daughter) or Grandmother"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="school_child">School Child (Student)</option>
                  <option value="elderly">Elderly Senior</option>
                  <option value="working_adult">Working Adult</option>
                  <option value="infant">Infant / Toddler</option>
                  <option value="homemaker">Homemaker</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    {t.departureTime || 'Departure Time'}
                  </label>
                  <input
                    type="time"
                    value={newDepTime}
                    onChange={(e) => setNewDepTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    {t.returnTime || 'Return Time'}
                  </label>
                  <input
                    type="time"
                    value={newRetTime}
                    onChange={(e) => setNewRetTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  {t.healthSensitivity || 'Health Sensitivity'}
                </label>
                <select
                  value={newSensitivity}
                  onChange={(e) => setNewSensitivity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="general">{t.generalHealth || 'General (Normal)'}</option>
                  <option value="asthma">{t.asthmaHealth || 'Asthma / Dust Sensitive (PM2.5)'}</option>
                  <option value="heat">{t.heatHealth || 'Heat Exhaustion Sensitive'}</option>
                  <option value="uv">{t.uvHealth || 'Sun & UV Sensitive'}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  {t.cancel || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  {t.saveSchedule || 'Save Member Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
