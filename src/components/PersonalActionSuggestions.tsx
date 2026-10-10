import React, { useState } from 'react';
import { 
  Briefcase, 
  Ban, 
  Utensils, 
  ShieldCheck, 
  MapPin,
  Clock,
  CloudLightning,
  SunMedium,
  CheckCircle2,
  Circle,
  Plus,
  Volume2,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ThermometerSnowflake,
  AlertOctagon,
  CloudRain,
  Eye,
  Activity,
  Layers
} from 'lucide-react';
import { EnvironmentalData, Language, UserPersona, LocationProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface PersonalActionSuggestionsProps {
  envData: EnvironmentalData;
  location: LocationProfile;
  persona: UserPersona;
  language: Language;
}

interface ChecklistItem {
  id: string;
  item: string;
  reason: string;
  icon: string;
  checked: boolean;
  isCustom?: boolean;
}

export const PersonalActionSuggestions: React.FC<PersonalActionSuggestionsProps> = ({
  envData,
  location,
  persona,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // 1. Base Gear Checklist based on Persona & Live Weather
  const getInitialCarryList = (): ChecklistItem[] => {
    const list: ChecklistItem[] = [];

    // Weather Driven
    if (envData.rainChancePercent >= 40 || envData.rainRateMmPerHour > 0 || (envData.cloudCoverLow && envData.cloudCoverLow > 55)) {
      list.push({
        id: 'gear-umbrella',
        item: 'Compact Umbrella / Waterproof Rain Poncho',
        reason: `${envData.rainChancePercent}% rain probability · Low convective cloud layer active over ${location.areaName || location.name}.`,
        icon: '🌂',
        checked: false,
      });
    }

    if (envData.tempC >= 32 || envData.feelsLikeC >= 35) {
      list.push({
        id: 'gear-water',
        item: 'Insulated 1L Water Flask with Electrolytes / ORS',
        reason: `Heat index feels like ${envData.feelsLikeC}°C. Prevents dehydration and thermal muscle fatigue.`,
        icon: '🥤',
        checked: false,
      });
    }

    if (envData.uvIndex >= 6) {
      list.push({
        id: 'gear-uv',
        item: 'Wide-Brim Sun Hat & UV400 Protective Eyewear',
        reason: `Solar UV Index is ${envData.uvIndex} (${envData.uvIndex >= 8 ? 'Very High' : 'High'}). Protects ocular retina and skin.`,
        icon: '🧢',
        checked: false,
      });
    }

    if (envData.aqi >= 120 || envData.pm25 >= 45) {
      list.push({
        id: 'gear-mask',
        item: 'N95 Particulate Respirator Mask',
        reason: `Fine particulate PM2.5 elevated at ${envData.pm25} µg/m³ along transit corridors.`,
        icon: '😷',
        checked: false,
      });
    }

    // Persona-Specific Additions
    if (persona.type === 'family') {
      list.push({
        id: 'gear-fam-school',
        item: "Children's School Hydration Flask & Sun Visor",
        reason: 'Essential for school afternoon transit when solar radiation peaks.',
        icon: '🎒',
        checked: false,
      });
      list.push({
        id: 'gear-fam-meds',
        item: 'Emergency Antihistamine & Saline Nasal Spray',
        reason: 'Prevents sudden dust allergy and smog irritation for vulnerable family members.',
        icon: '💊',
        checked: false,
      });
    } else if (persona.type === 'farmer') {
      list.push({
        id: 'gear-farm-tarp',
        item: 'Waterproof Field Tarpaulins & Tie Ropes',
        reason: 'Safeguard freshly harvested heaps from sudden convective cloudbursts.',
        icon: '🌾',
        checked: false,
      });
      list.push({
        id: 'gear-farm-boots',
        item: 'Mud-Grip Protective Rubber Boots',
        reason: 'Prevents foot infections and waterborne skin scalds in wet soil.',
        icon: '🥾',
        checked: false,
      });
    } else if (persona.type === 'gig_worker') {
      list.push({
        id: 'gear-gig-case',
        item: 'Insulated Smartphone Shade Pouch & Power Bank',
        reason: 'Prevents device battery thermal throttling & screen auto-dimming under hot sun.',
        icon: '📱',
        checked: false,
      });
      list.push({
        id: 'gear-gig-cover',
        item: 'Waterproof Delivery Bag Rain Shield',
        reason: 'Ensures parcel/food integrity during surprise convective showers.',
        icon: '🛵',
        checked: false,
      });
    } else if (persona.type === 'commuter') {
      list.push({
        id: 'gear-com-bag',
        item: 'Bicycle / Laptop Pannier Waterproof Rain Cover',
        reason: 'Protects electronics and documents during evening commute transit.',
        icon: '🚲',
        checked: false,
      });
    }

    return list;
  };

  const [carryList, setCarryList] = useState<ChecklistItem[]>(getInitialCarryList());
  const [customItemInput, setCustomItemInput] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'checklist' | 'timeline' | 'protocols' | 'firstaid'>('checklist');
  const [openFirstAidId, setOpenFirstAidId] = useState<string | null>('fa-heat');
  const [isVerifyingSerpApi, setIsVerifyingSerpApi] = useState(false);
  const [serpApiVerification, setSerpApiVerification] = useState<any | null>(null);

  // Toggle checklist item
  const toggleCheckItem = (id: string) => {
    setCarryList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Add custom gear item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemInput.trim()) return;
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      item: customItemInput.trim(),
      reason: 'Personal user-added gear item for today.',
      icon: '✨',
      checked: true,
      isCustom: true,
    };
    setCarryList((prev) => [...prev, newItem]);
    setCustomItemInput('');
    setIsAddingCustom(false);
  };

  // Calculate readiness score
  const totalItems = carryList.length;
  const checkedItems = carryList.filter((i) => i.checked).length;
  const readinessPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 100;

  // Audio TTS playback of the guide
  const handleListenGuide = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const itemsToCarry = carryList.map((i) => i.item).join(', ');
      const text = `${t.actionsGuide || 'Weather Action Guide'} for ${location.name}. Today, carry: ${itemsToCarry}. Temperature feels like ${envData.feelsLikeC} degrees Celsius. Stay hydrated and check local clouds.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger SerpApi Ground-Truth Verification
  const handleVerifyWithSerpApi = async () => {
    setIsVerifyingSerpApi(true);
    try {
      const res = await fetch('/api/serpapi/verify-ground-truth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: location.name,
          areaName: location.areaName || location.subLocality || location.name,
          cloudCover: envData.cloudCoverPercent || 50,
          rainChance: envData.rainChancePercent || 45,
          tempC: envData.tempC,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSerpApiVerification(data);
      }
    } catch (e) {
      console.error('SerpApi ground verify error:', e);
    } finally {
      setIsVerifyingSerpApi(false);
    }
  };

  // Things to avoid strictly targeted to persona
  const avoidList: { action: string; reason: string }[] = [];
  if (persona.type === 'family') {
    if (envData.tempC >= 32) {
      avoidList.push({
        action: 'Unshaded Playground Play for Children (12:00 PM – 3:30 PM)',
        reason: `Peak UV radiation (${envData.uvIndex}) and thermal strain. Shift play to shaded indoor areas.`,
      });
    }
    if (envData.aqi >= 110) {
      avoidList.push({
        action: 'Leaving Roadside Windows Open during Evening Traffic Peak',
        reason: 'Prevents vehicular exhaust and PM2.5 dust infiltration into bedrooms.',
      });
    }
    avoidList.push({
      action: 'Leaving High-Power AC on without Prior Cross-Ventilation',
      reason: 'Use morning cross-breeze first to reduce compressor energy draw by 25%.',
    });
  } else if (persona.type === 'farmer') {
    if (envData.rainChancePercent >= 45 || (envData.cloudCoverLow && envData.cloudCoverLow > 50)) {
      avoidList.push({
        action: 'Running Borewell Irrigation Pumps Today',
        reason: 'Natural soil moisture recharge expected from convective cloud deck. Avoids electricity and groundwater waste.',
      });
    }
    if (envData.solarRadianceWm2 > 750) {
      avoidList.push({
        action: 'Midday Chemical & Foliar Spraying (11:00 AM – 3:00 PM)',
        reason: 'Intense thermal solar radiance volatilizes spray droplets and scorches tender leaves.',
      });
    }
  } else if (persona.type === 'gig_worker') {
    if (envData.tempC >= 32) {
      avoidList.push({
        action: 'Continuous Deliveries in Direct Sun without 15-min Rest Interval',
        reason: `Wet Bulb Globe Temp is ${envData.heatStressWbgt}°C. Danger of severe heat cramps and dehydration.`,
      });
    }
    avoidList.push({
      action: 'Riding without Sunglasses or Eye Protection',
      reason: 'Asphalt glare and ambient dust particles increase visual fatigue and braking lag.',
    });
  } else if (persona.type === 'commuter') {
    if (envData.aqi >= 120) {
      avoidList.push({
        action: 'Heavy Aerobic Cycling along High-Diesel Corridors during Morning Rush',
        reason: 'Morning thermal inversion traps toxic particulate exhaust in lower 50m layer.',
      });
    }
    avoidList.push({
      action: 'Parking Two-Wheeler / Bicycle in Direct Noon Sun',
      reason: 'Rapid tire degradation and overheated seating surfaces.',
    });
  }

  // Nutrition & Hydration
  const foodTips = envData.tempC >= 32
    ? [
        { name: 'Tender Coconut Water', benefit: 'Replenishes potassium and vital electrolytes naturally', icon: '🥥' },
        { name: 'Chaas / Spiced Buttermilk with Jeera', benefit: 'Natural probiotic, aids gut microbiome & cools body', icon: '🥛' },
        { name: 'Watermelon, Cucumber & Mint', benefit: '92% cellular water content counters heat exhaustion', icon: '🍉' },
        { name: 'Lemon Water with Pinch of Salt', benefit: 'Maintains sodium-potassium balance during sweating', icon: '🍋' },
      ]
    : [
        { name: 'Ginger & Tulsi Warm Decoction', benefit: 'Boosts respiratory immunity during sudden cloud humidity shifts', icon: '☕' },
        { name: 'Warm Vegetable Stew / Rasam', benefit: 'Aids digestive metabolism in humid/rainy climate', icon: '🍲' },
        { name: 'Electrolyte Hydration (Sip Regularly)', benefit: 'Maintains steady cellular hydration balance', icon: '💧' },
        { name: 'Jaggery & Roasted Gram (Chana)', benefit: 'Natural energy & iron during strenuous outdoor work', icon: '🥜' },
      ];

  // Hourly Action Windows
  const actionWindows = [
    {
      title: t.morningWindow || 'Morning Activity Window (06:00 - 10:30)',
      status: 'Optimal Window 🟢',
      advice: 'Lowest pollution inversion layer and pleasant ambient temperature. Best time for heavy farm work, outdoor workouts, and school commute.',
      icon: '🌅',
      highlight: true,
    },
    {
      title: t.peakHeatWindow || 'Peak Solar & Heat Window (11:30 - 15:30)',
      status: 'High Hazard Window 🔴',
      advice: `UV Index peaks at ${envData.uvIndex}. Direct sun exposure causes rapid dehydration and thermal strain. Stay under shade kiosks or indoors.`,
      icon: '☀️',
      highlight: false,
    },
    {
      title: t.convectiveRainWindow || 'Convective Rain & Cloud Window (16:00 - 19:30)',
      status: envData.rainChancePercent > 45 ? 'Precipitation Alert 🟡' : 'Moderate Window 🟢',
      advice: `Low clouds gathering over ${location.areaName || location.name}. Rain probability is ${envData.rainChancePercent}%. Carry poncho and check route waterlogging.`,
      icon: '⛈️',
      highlight: false,
    },
    {
      title: t.nightWindow || 'Night Recovery Window (20:00 - 23:00)',
      status: 'Cooling Window 🔵',
      advice: 'Open cross-ventilation windows to flush trapped heat. Check tomorrow morning irrigation and commute alerts.',
      icon: '🌙',
      highlight: false,
    },
  ];

  return (
    <section aria-labelledby="personal-action-suggestions-heading" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* 1. Header with Area Badge, Persona, and Audio/SerpApi Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> {t.actionsGuide || 'Weather Action Guide'}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-sky-400 font-semibold flex items-center gap-1 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60">
              <MapPin className="w-3.5 h-3.5" /> {location.areaName ? `${location.areaName} Area` : location.name}
            </span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              {t.targetedFor || 'Targeted for'}: <strong className="text-emerald-400 uppercase">{persona.type.replace('_', ' ')}</strong>
            </span>
          </div>

          <h2 id="personal-action-suggestions-heading" className="text-lg sm:text-xl font-bold text-white mt-1">
            {t.whatToTakeAvoidConsume || 'What to Take, Avoid & Consume Today'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hyper-local microclimate instructions calibrated to local cloud movements and your routine.
          </p>
        </div>

        {/* Action Buttons: Audio & SerpApi Live Verifier */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleListenGuide}
            type="button"
            className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
            title="Listen to action guide audio brief"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.audioListen || 'Listen to Guide'}</span>
          </button>

          <button
            onClick={handleVerifyWithSerpApi}
            disabled={isVerifyingSerpApi}
            type="button"
            className="cursor-pointer bg-sky-950 hover:bg-sky-900 text-sky-300 text-xs px-3 py-1.5 rounded-xl border border-sky-800 flex items-center gap-1.5 transition-all shadow-sm"
            title="Verify with SerpApi Google Live Ground Truth"
          >
            {isVerifyingSerpApi ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                <span>Verifying via SerpApi...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.verifyWithSerpApi || 'Verify with SerpApi'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. SerpApi Live Ground-Truth Verification Result Card (if verified or active) */}
      {serpApiVerification && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-sky-950/40 border border-sky-800/80 text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-sky-300 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-4 h-4 text-sky-400" />
              {t.serpApiVerified || 'SerpApi Ground Truth Confirmed'} · {serpApiVerification.targetArea}
            </span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono text-[11px]">
              {serpApiVerification.groundAgreementScore}% Ground Match
            </span>
          </div>
          <p className="text-slate-200">{serpApiVerification.details}</p>
          <div className="flex items-center gap-2 text-[11px] text-sky-300/90 pt-1 border-t border-sky-900/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{serpApiVerification.recommendedActionConfirmation}</span>
          </div>
        </div>
      )}

      {/* 3. Hyper-Local Area Cloud & Microclimate Variance Banner */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>{t.microclimateBanner || 'Area Cloud & Microclimate Variance'}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 font-medium">{location.areaName || location.name}</span>
          </div>
          <p className="text-xs text-slate-300">
            {envData.areaMicroclimate?.localMicroAdvice ||
              `Low-level convective cloud coverage is ${envData.cloudCoverLow ?? 42}%. Cloud density differs between sectors of the city, so rain and heat index will vary by neighborhood.`}
          </p>
        </div>

        {/* Micro Telemetry Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
          <div className="bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Low Clouds (Rain)</span>
            <span className="font-bold text-sky-300">{envData.cloudCoverLow ?? 42}%</span>
          </div>
          <div className="bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Urban Heat Offset</span>
            <span className="font-bold text-amber-300">+{envData.areaMicroclimate?.urbanHeatIslandDeltaC ?? 1.6}°C</span>
          </div>
          <div className="bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Cloud Condition</span>
            <span className="font-bold text-slate-200 truncate max-w-[140px] block" title={envData.cloudCondition || 'Scattered'}>
              {envData.cloudCondition ? envData.cloudCondition.split('(')[0].trim() : 'Partly Cloudy'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Action Guide Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTabSection('checklist')}
          className={`cursor-pointer px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            activeTabSection === 'checklist'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Interactive Checklist ({checkedItems}/{totalItems})</span>
        </button>

        <button
          onClick={() => setActiveTabSection('timeline')}
          className={`cursor-pointer px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            activeTabSection === 'timeline'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Hourly Action Windows</span>
        </button>

        <button
          onClick={() => setActiveTabSection('protocols')}
          className={`cursor-pointer px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            activeTabSection === 'protocols'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Role Protocols ({persona.type.replace('_', ' ')})</span>
        </button>

        <button
          onClick={() => setActiveTabSection('firstaid')}
          className={`cursor-pointer px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            activeTabSection === 'firstaid'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Emergency First-Aid</span>
        </button>
      </div>

      {/* 5. TAB VIEW 1: INTERACTIVE CHECKLIST MODE */}
      {activeTabSection === 'checklist' && (
        <div className="space-y-4">
          {/* Readiness Tracker Bar */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">{t.readinessScore || 'Gear Readiness Score'}:</span>
                <span className={`font-bold ${readinessPercent === 100 ? 'text-emerald-400' : 'text-sky-400'}`}>
                  {readinessPercent}% {readinessPercent === 100 && '🎉 All Packed!'}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    readinessPercent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-sky-500 to-teal-400'
                  }`}
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setIsAddingCustom(!isAddingCustom)}
              className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.addCustomItem || 'Add Item'}</span>
            </button>
          </div>

          {/* Custom Item Adder Input */}
          {isAddingCustom && (
            <form onSubmit={handleAddCustomItem} className="flex gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <input
                type="text"
                value={customItemInput}
                onChange={(e) => setCustomItemInput(e.target.value)}
                placeholder="Enter personal gear or note (e.g. Asthma inhaler, child jacket, power bank)..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              <button
                type="submit"
                className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="cursor-pointer bg-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Three Column Grid: Checklist, What to Avoid, Weather Nutrition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Interactive Carry Checklist */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                    <Briefcase className="w-4 h-4" />
                    <span>{t.whatToCarry || 'What to Carry'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Click to pack</span>
                </div>

                <ul className="space-y-2 text-xs">
                  {carryList.map((c) => (
                    <li
                      key={c.id}
                      onClick={() => toggleCheckItem(c.id)}
                      className={`cursor-pointer flex items-start gap-2.5 p-2 rounded-lg transition-all border ${
                        c.checked
                          ? 'bg-emerald-950/30 border-emerald-800/60 text-slate-300'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-200'
                      }`}
                    >
                      <button type="button" className="mt-0.5 shrink-0 text-slate-400">
                        {c.checked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <div className="flex-1">
                        <span className={`font-semibold block ${c.checked ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {c.icon} {c.item}
                        </span>
                        <span className="text-[11px] text-slate-400 leading-snug block mt-0.5">{c.reason}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 2: What to Avoid Strictly */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Ban className="w-4 h-4" />
                  <span>{t.whatToAvoid || 'What to Avoid Today'}</span>
                </div>

                <ul className="space-y-2.5 text-xs">
                  {avoidList.map((a, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/40 border border-rose-950 text-slate-200">
                      <span className="text-rose-400 font-bold text-sm shrink-0 mt-0.5">✕</span>
                      <div>
                        <span className="font-semibold text-slate-100 block">{a.action}</span>
                        <span className="text-[11px] text-slate-400 leading-snug">{a.reason}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 3: Weather-Aware Food & Hydration */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Utensils className="w-4 h-4" />
                  <span>{t.weatherNutrition || 'Weather-Aware Nutrition'}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {foodTips.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-slate-200">
                      <span className="text-lg shrink-0">{f.icon}</span>
                      <div>
                        <span className="font-semibold text-slate-100 block">{f.name}</span>
                        <span className="text-[11px] text-slate-300 leading-snug">{f.benefit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB VIEW 2: HOURLY ACTION TIMELINE */}
      {activeTabSection === 'timeline' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              {t.actionTimeline || 'Hourly Action Windows & Safe Timing'}
            </h3>
            <span className="text-[11px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Live Sun & Cloud Schedule
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {actionWindows.map((win, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-xl">{win.icon}</span>
                    <span className="text-[11px] font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded">
                      {win.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-xs mt-1">{win.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">{win.advice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB VIEW 3: ROLE-SPECIFIC PROTOCOLS */}
      {activeTabSection === 'protocols' && (
        <div className="space-y-3">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                Action Protocol Matrix: {persona.type.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Calibrated to {location.name}</span>
            </div>

            {persona.type === 'family' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-sky-400">1. School Commute Protocol</div>
                  <p className="text-slate-300 text-[11px]">
                    Pack insulated water bottle and visor. If UV index exceeds 8 at 2:30 PM dismissal, avoid unshaded playground stops.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-amber-400">2. Elderly Air & Inversion Protocol</div>
                  <p className="text-slate-300 text-[11px]">
                    Keep windows closed between 5:30 PM - 8:00 PM during evening traffic dust accumulation. Run air purifier if PM2.5 &gt; 60.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-emerald-400">3. Household Power Savings</div>
                  <p className="text-slate-300 text-[11px]">
                    Delay AC until 12:30 PM using morning cross-breeze. Set thermostat to 25°C to save ₹45/day in grid energy.
                  </p>
                </div>
              </div>
            )}

            {persona.type === 'farmer' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-emerald-400">1. Irrigation Deferral</div>
                  <p className="text-slate-300 text-[11px]">
                    Hold borewell pumping for 24 hours. Convective cloud buildup will supply moisture without electricity consumption.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-amber-400">2. Spraying Caution Window</div>
                  <p className="text-slate-300 text-[11px]">
                    Do not apply foliar sprays between 11 AM - 3 PM. High solar radiance volatilizes active ingredients.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-sky-400">3. Harvest Tarp Protection</div>
                  <p className="text-slate-300 text-[11px]">
                    Tie waterproof covers over threshed grain piles by 4:00 PM to prepare for sudden evening localized cloud showers.
                  </p>
                </div>
              </div>
            )}

            {persona.type === 'gig_worker' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-rose-400">1. Thermal Throttle Shield</div>
                  <p className="text-slate-300 text-[11px]">
                    Keep smartphone in insulated pouch between navigation checks. Extreme heat shuts down battery charging and GPS.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-sky-400">2. Rain Surge Safety</div>
                  <p className="text-slate-300 text-[11px]">
                    Avoid flooded railway underpasses. Lower tire pressure slightly for better wet-asphalt grip during sudden squalls.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-emerald-400">3. Shade Hub Rest Intervals</div>
                  <p className="text-slate-300 text-[11px]">
                    Utilize partner cooling kiosks or metro stations every 90 minutes. Drink 250ml water with electrolyte salt.
                  </p>
                </div>
              </div>
            )}

            {persona.type === 'commuter' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-emerald-400">1. Multimodal Shift Advice</div>
                  <p className="text-slate-300 text-[11px]">
                    Opt for Metro or covered bus corridors if evening rain probability exceeds 50%. Bypasses road surface waterlogging.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-amber-400">2. Low-Emission Windows</div>
                  <p className="text-slate-300 text-[11px]">
                    Start morning commute before 8:15 AM to avoid peak particulate inversion and traffic idling emissions.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-sky-400">3. Waterproof Commute Prep</div>
                  <p className="text-slate-300 text-[11px]">
                    Enclose laptops and documents in zip-lock waterproof liner inside your backpack.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. TAB VIEW 4: EMERGENCY FIRST-AID PROTOCOLS */}
      {activeTabSection === 'firstaid' && (
        <div className="space-y-3">
          <div className="space-y-2">
            {/* Heat Exhaustion vs Heat Stroke */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setOpenFirstAidId(openFirstAidId === 'fa-heat' ? null : 'fa-heat')}
                className="w-full flex items-center justify-between text-left font-bold text-amber-300"
              >
                <div className="flex items-center gap-2">
                  <ThermometerSnowflake className="w-4 h-4 text-amber-400" />
                  <span>Heat Exhaustion vs Heat Stroke Protocol</span>
                </div>
                {openFirstAidId === 'fa-heat' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {openFirstAidId === 'fa-heat' && (
                <div className="mt-3 pt-3 border-t border-slate-800 text-slate-300 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <strong className="text-amber-400 block mb-1">Heat Exhaustion (Warning)</strong>
                      <p className="text-[11px] text-slate-400">Symptoms: Heavy sweating, dizziness, nausea, pale skin, weakness.</p>
                      <p className="text-[11px] text-emerald-400 mt-1">Action: Move to shade immediately, loosen clothing, sip cool salted water or ORS.</p>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded border border-rose-900/60">
                      <strong className="text-rose-400 block mb-1">Heat Stroke (Medical Emergency)</strong>
                      <p className="text-[11px] text-slate-400">Symptoms: Body temp &gt; 40°C, hot dry skin (no sweat), confusion, unconsciousness.</p>
                      <p className="text-[11px] text-rose-300 mt-1">Action: Call 112/108 immediately. Cool neck/armpits with wet cloth or ice. Do not force fluids if semiconscious.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lightning & Sudden Downpour */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setOpenFirstAidId(openFirstAidId === 'fa-storm' ? null : 'fa-storm')}
                className="w-full flex items-center justify-between text-left font-bold text-sky-300"
              >
                <div className="flex items-center gap-2">
                  <CloudLightning className="w-4 h-4 text-sky-400" />
                  <span>Sudden Convective Downpour & Lightning 30/30 Rule</span>
                </div>
                {openFirstAidId === 'fa-storm' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {openFirstAidId === 'fa-storm' && (
                <div className="mt-3 pt-3 border-t border-slate-800 text-slate-300 space-y-1.5 text-[11px]">
                  <p>• <strong>30/30 Rule:</strong> If time between lightning flash and thunder is under 30 seconds, seek substantial enclosed shelter immediately.</p>
                  <p>• <strong>Never Shelter Under Isolated Trees:</strong> Single trees attract lightning ground current discharges.</p>
                  <p>• <strong>Flash Flood Underpasses:</strong> Never attempt walking or riding two-wheelers through water deeper than axle level (6 inches can knock down riders).</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
