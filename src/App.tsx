/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EnvironmentalDashboard } from './components/EnvironmentalDashboard';
import { DailyBriefCard } from './components/DailyBriefCard';
import { PrescriptiveNudges } from './components/PrescriptiveNudges';
import { SectorSpecificView } from './components/SectorSpecificView';
import { RoutePlanner } from './components/RoutePlanner';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { ImpactLedger } from './components/ImpactLedger';
import { OmnichannelDelivery } from './components/OmnichannelDelivery';
import { CommunityAndB2B } from './components/CommunityAndB2B';
import { AskClimateBuddyModal } from './components/AskClimateBuddyModal';
import { EmergencyBanner } from './components/EmergencyBanner';
import { SerpApiFeed } from './components/SerpApiFeed';
import { OnboardingQuiz } from './components/OnboardingQuiz';
import { ManualLocationModal } from './components/ManualLocationModal';
import { PersonalActionSuggestions } from './components/PersonalActionSuggestions';
import { 
  LOCATIONS, 
  INITIAL_ENV_DATA, 
  DEFAULT_USER_PERSONA, 
  DEFAULT_NUDGES, 
  INITIAL_COMMUNITY_REPORTS 
} from './data/mockEnvironment';
import { 
  Language, 
  LocationProfile, 
  PersonaType, 
  UserPersona, 
  EnvironmentalData, 
  PrescriptiveNudge, 
  GreenActionLog, 
  CommunityReport 
} from './types';
import { TRANSLATIONS, DEFAULT_BRIEFS, getPersonaBrief } from './data/translations';
import { useTranslation } from './context/TranslationContext';
import { MessageSquare, Sparkles, Shield, HeartHandshake } from 'lucide-react';
import { reverseGeocode, fetchLiveWeather } from './utils/api';

export default function App() {
  const { language: currentLanguage, setLanguage: setCurrentLanguage, t, getBrief } = useTranslation();
  const [currentLocation, setCurrentLocation] = useState<LocationProfile>(LOCATIONS[0]);
  const [userPersona, setUserPersona] = useState<UserPersona>(DEFAULT_USER_PERSONA);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [envData, setEnvData] = useState<EnvironmentalData>(INITIAL_ENV_DATA[LOCATIONS[0].id]);
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    // Open questionnaire if not completed yet
    try {
      return localStorage.getItem('climatebuddy_onboarded') !== 'true';
    } catch {
      return true;
    }
  });

  // Daily Brief state initialized strictly for active persona & language
  const [dailyBrief, setDailyBrief] = useState(() => getPersonaBrief(currentLanguage, DEFAULT_USER_PERSONA.type));
  const [isBriefLoading, setIsBriefLoading] = useState<boolean>(false);

  // Nudges state
  const [nudges, setNudges] = useState<PrescriptiveNudge[]>(DEFAULT_NUDGES);
  const [loggedNudgeIds, setLoggedNudgeIds] = useState<Set<string>>(new Set());

  // Impact ledger logs tailored to family by default
  const [actionLogs, setActionLogs] = useState<GreenActionLog[]>([
    {
      id: 'log-1',
      title: 'Natural Cross-Ventilation (AC avoided for 2.5 hrs)',
      category: 'cooling',
      waterSavedL: 0,
      co2AvoidedKg: 2.6,
      kwhSaved: 3.2,
      moneySavedINR: 24,
      timestamp: 'Yesterday, 09:15 AM',
      source: 'nudge',
    },
    {
      id: 'log-2',
      title: 'Household Water Filter & Rainwater Optimization',
      category: 'water',
      waterSavedL: 450,
      co2AvoidedKg: 0.8,
      kwhSaved: 1.1,
      moneySavedINR: 35,
      timestamp: '2 days ago',
      source: 'nudge',
    },
  ]);

  // Community reports
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(INITIAL_COMMUNITY_REPORTS);

  // Switch environmental data when preset location changes
  useEffect(() => {
    if (INITIAL_ENV_DATA[currentLocation.id]) {
      setEnvData(INITIAL_ENV_DATA[currentLocation.id]);
      if (currentLocation.id === 'delhi' || currentLocation.id === 'vidarbha') {
        setIsEmergencyActive(true);
      } else {
        setIsEmergencyActive(false);
      }
    }
  }, [currentLocation]);

  // Fetch or regenerate dynamic brief when location or persona changes
  const fetchBrief = async (
    overrideLang?: Language, 
    overrideLoc?: LocationProfile, 
    overrideEnv?: any,
    overridePersona?: UserPersona
  ) => {
    setIsBriefLoading(true);
    const langToUse = overrideLang || currentLanguage;
    const locToUse = overrideLoc || currentLocation;
    const envToUse = overrideEnv || envData;
    const personaToUse = overridePersona || userPersona;

    try {
      const res = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: {
            type: personaToUse.type,
            details: personaToUse,
          },
          location: locToUse.name,
          weatherData: {
            temp: `${envToUse.tempC}°C`,
            feelsLike: `${envToUse.feelsLikeC}°C`,
            aqi: envToUse.aqi,
            rain: `${envToUse.rainChancePercent}%`,
          },
          language: langToUse,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setDailyBrief(data);
        }
      }
    } catch (e) {
      console.warn('Using baseline brief:', e);
    } finally {
      setIsBriefLoading(false);
    }
  };

  // Handler for Live GPS Location (Resolves hyper-local sub-area & neighborhood)
  const handleUseLiveGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGPS(true);

    const doGeolocate = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            // 1. Reverse geocode — works directly on phone (no server needed)
            const areaData = await reverseGeocode(latitude, longitude);

            const resolvedName = areaData.formattedName;
            const resolvedArea = areaData.areaName || areaData.subLocality || 'Local Neighborhood';

            // 2. Fetch live weather — calls Open-Meteo directly in APK mode
            const liveData = await fetchLiveWeather({
              lat: latitude,
              lng: longitude,
              cityName: resolvedName,
              areaName: resolvedArea,
              subLocality: areaData.subLocality,
            });

            const newLoc: LocationProfile = {
              id: 'gps-live',
              name: resolvedName,
              areaName: resolvedArea,
              subLocality: areaData.subLocality,
              city: areaData.city,
              state: areaData.state || 'GPS Telemetry',
              country: areaData.country || 'India',
              regionType: 'urban',
              lat: latitude,
              lng: longitude,
              elevationMeters: 300,
            };
            setCurrentLocation(newLoc);
            setEnvData((prev) => ({
              ...prev,
              ...liveData,
              locationId: 'gps-live',
            }));
            fetchBrief(currentLanguage, newLoc, liveData);
          } catch (err) {
            console.error('Failed to fetch live GPS weather:', err);
          } finally {
            setIsLocatingGPS(false);
          }
        },
        (err) => {
          console.warn('GPS location error:', err);
          setIsLocatingGPS(false);
          if (err.code === err.PERMISSION_DENIED) {
            alert('Location permission denied. Please allow location access in your device settings, then try again.');
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            alert('Location unavailable. Please check your GPS/network and try again.');
          } else {
            alert('Could not get your location. Please try the manual search instead.');
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    };

    // Request permission then geolocate
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          setIsLocatingGPS(false);
          alert('Location permission is blocked. Please enable it in your device settings under Apps > ClimateBuddy > Permissions.');
        } else {
          doGeolocate();
        }
      }).catch(() => doGeolocate());
    } else {
      doGeolocate();
    }
  };

  // Handler for manual typed location or custom selected location
  const handleSelectCustomLocation = async (loc: LocationProfile) => {
    setCurrentLocation(loc);
    try {
      // Works in APK mode — calls Open-Meteo directly
      const liveData = await fetchLiveWeather({
        lat: loc.lat,
        lng: loc.lng,
        cityName: loc.name,
        areaName: loc.areaName || loc.name,
        subLocality: loc.subLocality,
      });
      setEnvData((prev) => ({
        ...prev,
        ...liveData,
        locationId: loc.id,
      }));
      fetchBrief(currentLanguage, loc, liveData);
    } catch (e) {
      console.error('Custom location weather error:', e);
    }
  };

  const handleSelectPersonaType = (type: PersonaType) => {
    const updated = { ...userPersona, type };
    setUserPersona(updated);
    setDailyBrief(getPersonaBrief(currentLanguage, type));
    fetchBrief(currentLanguage, currentLocation, envData, updated);
  };

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    setDailyBrief(getPersonaBrief(lang, userPersona.type));
    fetchBrief(lang, currentLocation, envData, userPersona);
  };

  const handleCompleteQuiz = (data: {
    language: Language;
    location: LocationProfile;
    persona: UserPersona;
    goal: string;
  }) => {
    setCurrentLanguage(data.language);
    setCurrentLocation(data.location);
    setUserPersona(data.persona);
    setDailyBrief(getPersonaBrief(data.language, data.persona.type));
    try {
      localStorage.setItem('climatebuddy_onboarded', 'true');
    } catch {}
    setIsOnboardingOpen(false);
    fetchBrief(data.language, data.location, undefined, data.persona);
  };

  // Play audio advisory — uses Web Speech API directly (works in APK WebView)
  const handlePlayAudioBrief = async () => {
    if (isPlayingAudio) {
      if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    const textToRead = [
      dailyBrief.summary,
      `What to carry: ${(dailyBrief.carry || []).join(', ')}.`,
      `What to avoid: ${(dailyBrief.avoid || []).join(', ')}.`,
      `Green action: ${dailyBrief.greenAction || ''}.`,
      `Safe window: ${dailyBrief.safeWindow || ''}.`,
    ].join(' ');

    // Use Web Speech API directly — works in Android WebView without a server
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Small delay needed on Android to let cancel() settle
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = currentLanguage === 'kn' ? 'kn-IN' : currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      }, 100);
    } else {
      setIsPlayingAudio(false);
    }
  };

  // Action logging
  const handleLogNudge = (nudge: PrescriptiveNudge) => {
    if (loggedNudgeIds.has(nudge.id)) return;

    setLoggedNudgeIds(new Set([...loggedNudgeIds, nudge.id]));
    const newLog: GreenActionLog = {
      id: `log-${Date.now()}`,
      title: nudge.title,
      category: nudge.actionLoggedType?.includes('irrigation') ? 'water' : nudge.actionLoggedType?.includes('cooling') ? 'cooling' : 'transit',
      waterSavedL: nudge.resourceBenefit?.waterSavedL || 0,
      co2AvoidedKg: nudge.resourceBenefit?.emissionsAvoidedKg || 0,
      kwhSaved: nudge.resourceBenefit?.kwhSaved || 0,
      moneySavedINR: nudge.resourceBenefit?.moneySavedINR || 0,
      timestamp: 'Just now',
      source: 'nudge',
    };
    setActionLogs([newLog, ...actionLogs]);
  };

  const handleAddManualAction = (action: Omit<GreenActionLog, 'id' | 'timestamp'>) => {
    const newLog: GreenActionLog = {
      ...action,
      id: `manual-${Date.now()}`,
      timestamp: 'Just now',
    };
    setActionLogs([newLog, ...actionLogs]);
  };

  const handleClearLogs = () => {
    setActionLogs([]);
    setLoggedNudgeIds(new Set());
  };

  const handleAddReport = (report: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes' | 'verified'>) => {
    const newRep: CommunityReport = {
      ...report,
      id: `rep-${Date.now()}`,
      timestamp: 'Just now',
      upvotes: 1,
      verified: true,
    };
    setCommunityReports([newRep, ...communityReports]);
  };

  const handleUpvoteReport = (id: string) => {
    setCommunityReports(
      communityReports.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  return (
    <div className="min-h-screen text-slate-300 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200" style={{ backgroundColor: 'var(--neu-base)' }}>
      {/* Top Navigation */}
      <Navbar
        currentLocation={currentLocation}
        userPersona={userPersona}
        onSelectPersonaType={handleSelectPersonaType}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleLanguageChange}
        isPlayingAudio={isPlayingAudio}
        onPlayAudioBrief={handlePlayAudioBrief}
        isEmergencyActive={isEmergencyActive}
        onToggleEmergency={() => setIsEmergencyActive(!isEmergencyActive)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuiz={() => setIsOnboardingOpen(true)}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onUseLiveGPS={handleUseLiveGPS}
        isLocatingGPS={isLocatingGPS}
      />

      {/* Manual & Live GPS Location Selector Modal */}
      <ManualLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleSelectCustomLocation}
        onUseLiveGPS={handleUseLiveGPS}
        isLocatingGPS={isLocatingGPS}
        language={currentLanguage}
      />

      {/* Onboarding / Personalization Questionnaire */}
      <OnboardingQuiz
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteQuiz}
        initialLanguage={currentLanguage}
        initialLocation={currentLocation}
        initialPersona={userPersona}
      />

      {/* Emergency Mode Banner */}
      <EmergencyBanner
        alerts={envData.activeAlerts}
        isActive={isEmergencyActive}
        onDismiss={() => setIsEmergencyActive(false)}
        language={currentLanguage}
      />

      {/* Main Content Viewport — pb-28 ensures FAB never covers content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5 pb-28">
        {/* TAB 1: COPILOT OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Real-Time Environmental Dashboard */}
            <EnvironmentalDashboard data={envData} language={currentLanguage} />

            {/* Weather & Location Action Guide: What to Take, Avoid & Consume */}
            <PersonalActionSuggestions
              envData={envData}
              location={currentLocation}
              persona={userPersona}
              language={currentLanguage}
            />

            {/* SerpApi Live Weather & Environmental Intelligence */}
            <SerpApiFeed location={currentLocation} language={currentLanguage} />

            {/* AI Daily Brief: Your Day in 30 Seconds */}
            <DailyBriefCard
              brief={dailyBrief}
              isLoading={isBriefLoading}
              onRefresh={() => fetchBrief()}
              language={currentLanguage}
              persona={userPersona}
              isPlayingAudio={isPlayingAudio}
              onPlayAudio={handlePlayAudioBrief}
            />

            {/* Prescriptive Nudge Engine (Strictly Targeted to Active Persona) */}
            <PrescriptiveNudges
              nudges={nudges}
              onLogAction={handleLogNudge}
              loggedNudgeIds={loggedNudgeIds}
              language={currentLanguage}
              persona={userPersona.type}
            />
          </div>
        )}

        {/* TAB 2: SECTOR-SPECIFIC TOOLS */}
        {activeTab === 'sector' && (
          <SectorSpecificView
            userPersona={userPersona}
            onUpdatePersona={setUserPersona}
            envData={envData}
            language={currentLanguage}
          />
        )}

        {/* TAB 3: CLIMATE-SAFE ROUTE PLANNER */}
        {activeTab === 'route' && (
          <RoutePlanner language={currentLanguage} />
        )}

        {/* TAB 4: WHAT-IF CLIMATE SIMULATOR */}
        {activeTab === 'whatif' && (
          <WhatIfSimulator language={currentLanguage} />
        )}

        {/* TAB 5: CLIMATE IMPACT LEDGER */}
        {activeTab === 'impact' && (
          <ImpactLedger
            logs={actionLogs}
            onAddManualAction={handleAddManualAction}
            onClearLogs={handleClearLogs}
            language={currentLanguage}
          />
        )}

        {/* TAB 6: OMNICHANNEL DELIVERY (WHATSAPP / SMS / IVR) */}
        {activeTab === 'omnichannel' && (
          <OmnichannelDelivery
            envData={envData}
            userPersona={userPersona}
            language={currentLanguage}
            onPlayAudioBrief={handlePlayAudioBrief}
            isPlayingAudio={isPlayingAudio}
          />
        )}

        {/* TAB 7: COMMUNITY NETWORK & B2B SAFETY */}
        {activeTab === 'community_b2b' && (
          <CommunityAndB2B
            reports={communityReports}
            onAddReport={handleAddReport}
            onUpvoteReport={handleUpvoteReport}
            envData={envData}
            language={currentLanguage}
          />
        )}
      </main>

      {/* Floating Action Button — Neumorphic Primary */}
      <button
        onClick={() => setIsChatModalOpen(true)}
        className="neu-btn-primary cursor-pointer fixed z-40 py-3 px-5 rounded-full flex items-center gap-2.5 transition-all"
        style={{ bottom: 'max(20px, env(safe-area-inset-bottom, 20px))', right: '16px' }}
        title="Ask ClimateBuddy AI Copilot"
      >
        <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-base">
          🤖
        </div>
        <span className="text-xs sm:text-sm font-bold tracking-wide">Ask ClimateBuddy</span>
      </button>

      {/* Conversational Assistant Modal */}
      <AskClimateBuddyModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        envData={envData}
        persona={userPersona}
        location={currentLocation}
        language={currentLanguage}
      />

      {/* Footer */}
      <footer className="py-6 text-xs mt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', backgroundColor: 'var(--neu-base-dark)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold" style={{ color: '#94a3b8' }}>🌍 ClimateBuddy</span>
            <span style={{ color: '#334155' }}>·</span>
            <span style={{ color: '#475569' }}>Turning climate data into decisions that protect people.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]" style={{ color: '#475569' }}>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" style={{ color: 'var(--accent-emerald)' }} /> Privacy-First
            </span>
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5" style={{ color: 'var(--accent-teal)' }} /> India-First Feeds
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
