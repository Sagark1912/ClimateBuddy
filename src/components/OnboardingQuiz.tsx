import React, { useState } from 'react';
import { 
  Globe, 
  MapPin, 
  User, 
  Sliders, 
  Target, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  Droplet,
  Sun,
  Wind,
  Bike,
  Navigation
} from 'lucide-react';
import { Language, LocationProfile, PersonaType, UserPersona } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../data/translations';
import { LOCATIONS } from '../data/mockEnvironment';

interface OnboardingQuizProps {
  isOpen: boolean;
  onComplete: (data: {
    language: Language;
    location: LocationProfile;
    persona: UserPersona;
    goal: string;
  }) => void;
  initialLanguage: Language;
  initialLocation: LocationProfile;
  initialPersona: UserPersona;
}

export const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({
  isOpen,
  onComplete,
  initialLanguage,
  initialLocation,
  initialPersona,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(initialLanguage);
  const [selectedLocation, setSelectedLocation] = useState<LocationProfile>(initialLocation);
  const [selectedPersonaType, setSelectedPersonaType] = useState<PersonaType>(initialPersona.type);
  const [personaDetails, setPersonaDetails] = useState<UserPersona>(initialPersona);
  const [selectedGoal, setSelectedGoal] = useState<string>('water_power');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  if (!isOpen) return null;

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Step 5 finish
      setIsSynthesizing(true);
      setTimeout(() => {
        setIsSynthesizing(false);
        onComplete({
          language: selectedLanguage,
          location: selectedLocation,
          persona: {
            ...personaDetails,
            type: selectedPersonaType,
          },
          goal: selectedGoal,
        });
      }, 1200);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {isSynthesizing ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-950 animate-bounce">
              🌍
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Personalizing Your Climate Operating System...
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Aligning IMD radar feeds, Copernicus UV models, and your role as a {selectedPersonaType} in {selectedLocation.name}.
            </p>
            <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-emerald-500 animate-pulse w-3/4 rounded-full" />
            </div>
          </div>
        ) : (
          <div>
            {/* Step Progress Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-lg">🌍 ClimateBuddy</span>
                <span className="text-slate-600">/</span>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Personalization Questionnaire ({step}/5)
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={`w-6 h-1.5 rounded-full transition-all ${
                      s === step ? 'bg-emerald-400 w-8' : s < step ? 'bg-emerald-800' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* QUESTION 1: LANGUAGE */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Step 1: Language
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                    Select your preferred language
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    ClimateBuddy provides native word-to-word intelligence across 7 Indian languages.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setSelectedLanguage(lang.code)}
                        className={`cursor-pointer p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 text-white'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-slate-100">{lang.nativeLabel}</div>
                          <div className="text-[11px] text-slate-400">{lang.label}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUESTION 2: LOCATION */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Step 2: Location
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                    Where is your base location or agricultural belt?
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    We sync hyper-local radar telemetry and Doppler stations for this zone.
                  </p>
                </div>

                {/* Live GPS button in questionnaire */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if ('geolocation' in navigator) {
                        navigator.geolocation.getCurrentPosition(
                          async (pos) => {
                            const { latitude, longitude } = pos.coords;
                            try {
                              const res = await fetch(`/api/location/search?q=${latitude.toFixed(2)},${longitude.toFixed(2)}`);
                              const customLoc: LocationProfile = {
                                id: 'gps-live',
                                name: `Live GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
                                state: 'GPS Telemetry',
                                regionType: 'urban',
                                lat: latitude,
                                lng: longitude,
                                elevationMeters: 300,
                              };
                              setSelectedLocation(customLoc);
                            } catch {
                              setSelectedLocation({
                                id: 'gps-live',
                                name: `Live Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
                                state: 'GPS Telemetry',
                                regionType: 'urban',
                                lat: latitude,
                                lng: longitude,
                                elevationMeters: 300,
                              });
                            }
                          },
                          (err) => console.warn(err),
                          { timeout: 7000 }
                        );
                      }
                    }}
                    className="w-full cursor-pointer bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-200 font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all mb-3"
                  >
                    <Navigation className="w-4 h-4 text-emerald-400" />
                    <span>📍 Detect My Live GPS Location</span>
                  </button>
                </div>

                {selectedLocation.id === 'gps-live' && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500 rounded-xl text-xs text-emerald-200 flex items-center justify-between">
                    <span>Selected: <strong>{selectedLocation.name}</strong></span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-h-[220px] overflow-y-auto">
                  {LOCATIONS.map((loc) => {
                    const isSelected = selectedLocation.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setSelectedLocation(loc)}
                        className={`cursor-pointer p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 text-white'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-100">{loc.name}</div>
                          <div className="text-[10px] text-slate-400">{loc.state} · {loc.regionType}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUESTION 3: PERSONA */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Step 3: Who are you?
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                    Select your primary daily persona
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Everyday weather means different actions for farmers, delivery riders, and families.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    {
                      id: 'farmer',
                      icon: '🌾',
                      title: 'Farmer (ರೈತ / किसान)',
                      desc: 'Crop irrigation scheduling, rain alerts, soil moisture & pump power savings',
                    },
                    {
                      id: 'gig_worker',
                      icon: '🛵',
                      title: 'Outdoor / Gig Worker',
                      desc: 'Delivery rider, construction, street vendor; heat strain & safe rest windows',
                    },
                    {
                      id: 'family',
                      icon: '👨‍👩‍👧',
                      title: 'Family / Urban Resident',
                      desc: 'School commute safety, AC power saver, elderly & asthma lung protection',
                    },
                    {
                      id: 'commuter',
                      icon: '🚲',
                      title: 'Clean Commuter / Student',
                      desc: 'Daily cycling/metro navigation, shaded routes, emissions avoided ledger',
                    },
                  ].map((p) => {
                    const isSelected = selectedPersonaType === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPersonaType(p.id as PersonaType)}
                        className={`cursor-pointer p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 text-white'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{p.icon}</span>
                        <div className="font-bold text-xs text-slate-100">{p.title}</div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUESTION 4: ROLE-SPECIFIC CUSTOMIZATION */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> Step 4: Role Customization
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                    Fine-tune your daily routine details
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Enables our Prescriptive Nudge Engine to calculate exact resource numbers.
                  </p>
                </div>

                {selectedPersonaType === 'farmer' && (
                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1">Primary Crop</label>
                      <select
                        value={personaDetails.farmer.crop}
                        onChange={(e) =>
                          setPersonaDetails({
                            ...personaDetails,
                            farmer: { ...personaDetails.farmer, crop: e.target.value as any },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-medium"
                      >
                        <option value="paddy">Paddy / Rice (Water intensive)</option>
                        <option value="wheat">Wheat</option>
                        <option value="cotton">Cotton</option>
                        <option value="sugarcane">Sugarcane</option>
                        <option value="vegetables">Horticulture & Vegetables</option>
                        <option value="millets">Ragi / Millets (Drought resilient)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">Irrigation Source</label>
                      <select
                        value={personaDetails.farmer.irrigationMethod}
                        onChange={(e) =>
                          setPersonaDetails({
                            ...personaDetails,
                            farmer: { ...personaDetails.farmer, irrigationMethod: e.target.value as any },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-medium"
                      >
                        <option value="borewell">Borewell Pump (Electricity intensive)</option>
                        <option value="canal">Canal Gravity Feed</option>
                        <option value="drip">Drip Irrigation System</option>
                        <option value="rainfed">Rainfed Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">Land Area (Acres)</label>
                      <input
                        type="number"
                        min="0.5"
                        max="50"
                        step="0.5"
                        value={personaDetails.farmer.acres}
                        onChange={(e) =>
                          setPersonaDetails({
                            ...personaDetails,
                            farmer: { ...personaDetails.farmer, acres: parseFloat(e.target.value) || 1 },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-medium"
                      />
                    </div>
                  </div>
                )}

                {selectedPersonaType === 'gig_worker' && (
                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1">Outdoor Occupation</label>
                      <select
                        value={personaDetails.gigWorker.occupation}
                        onChange={(e) =>
                          setPersonaDetails({
                            ...personaDetails,
                            gigWorker: { ...personaDetails.gigWorker, occupation: e.target.value as any },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-medium"
                      >
                        <option value="delivery_rider">Food / Grocery Delivery Rider</option>
                        <option value="construction">Construction & Field Contractor</option>
                        <option value="street_vendor">Street Vendor / Stall Owner</option>
                        <option value="sanitation">Sanitation & Municipal Staff</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">Shift Start Time</label>
                      <input
                        type="text"
                        value={personaDetails.gigWorker.shiftStart}
                        onChange={(e) =>
                          setPersonaDetails({
                            ...personaDetails,
                            gigWorker: { ...personaDetails.gigWorker, shiftStart: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-medium"
                      />
                    </div>
                  </div>
                )}

                {selectedPersonaType === 'family' && (
                  <div className="space-y-3 pt-2 text-xs">
                    <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={personaDetails.family.hasChildrenInSchool}
                        onChange={(e) =>
                          setPersonaDetails({
                            ...personaDetails,
                            family: { ...personaDetails.family, hasChildrenInSchool: e.target.checked },
                          })
                        }
                        className="rounded accent-emerald-500"
                      />
                      <span>Children attending school (Monitor 12 PM - 3 PM UV & afternoon pickup)</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={personaDetails.family.hasElderlyOrAsthma}
                        onChange={(e) =>
                          setPersonaDetails({
                            ...personaDetails,
                            family: { ...personaDetails.family, hasElderlyOrAsthma: e.target.checked },
                          })
                        }
                        className="rounded accent-emerald-500"
                      />
                      <span>Elderly family members or asthma sensitivity (PM2.5 alerts)</span>
                    </label>
                  </div>
                )}

                {selectedPersonaType === 'commuter' && (
                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1">One-Way Commute Distance (km)</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={personaDetails.commuter.distanceKm}
                        onChange={(e) =>
                          setPersonaDetails({
                            ...personaDetails,
                            commuter: { ...personaDetails.commuter, distanceKm: parseFloat(e.target.value) || 5 },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">Primary Transit</label>
                      <select
                        value={personaDetails.commuter.primaryTransit}
                        onChange={(e) =>
                          setPersonaDetails({
                            ...personaDetails,
                            commuter: { ...personaDetails.commuter, primaryTransit: e.target.value as any },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-medium"
                      >
                        <option value="bicycle">Bicycle (Green commute)</option>
                        <option value="metro_bus">Metro / Public Bus</option>
                        <option value="two_wheeler">Motorcycle / Scooter</option>
                        <option value="walking">Walking</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* QUESTION 5: PRIMARY GOAL */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Step 5: Primary Climate Goal
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                    What is your number one priority today?
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    ClimateBuddy will position this advice prominently on your daily brief.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    {
                      id: 'water_power',
                      icon: '💧',
                      title: 'Save Water & Cut Energy Bills',
                      desc: 'Time irrigation with rain; use natural cross-ventilation before turning on AC.',
                    },
                    {
                      id: 'heat_safety',
                      icon: '☀️',
                      title: 'Prevent Heat Exhaustion & Thermal Strain',
                      desc: 'Safe rest windows, hydration triggers, and shaded route planning.',
                    },
                    {
                      id: 'clean_air',
                      icon: '😷',
                      title: 'Shield Family from Toxic Smog (PM2.5)',
                      desc: 'AQI-aligned morning window and mask recommendations.',
                    },
                    {
                      id: 'green_habits',
                      icon: '🌱',
                      title: 'Build Daily Sustainable Habits & Streaks',
                      desc: 'Track avoided CO2e, participate in community challenges and badges.',
                    },
                  ].map((g) => {
                    const isSelected = selectedGoal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGoal(g.id)}
                        className={`cursor-pointer p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 text-white'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{g.icon}</span>
                        <div className="font-bold text-xs text-slate-100">{g.title}</div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{g.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950"
              >
                <span>{step === 5 ? 'Launch ClimateBuddy Copilot' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
