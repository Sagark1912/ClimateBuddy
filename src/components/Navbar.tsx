import React from 'react';
import { 
  MapPin, 
  User, 
  Globe, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  Search,
  Navigation,
  Loader2
} from 'lucide-react';
import { Language, LocationProfile, PersonaType, UserPersona } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../data/translations';
import { useTranslation } from '../context/TranslationContext';

interface NavbarProps {
  currentLocation: LocationProfile;
  userPersona: UserPersona;
  onSelectPersonaType: (type: PersonaType) => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  isPlayingAudio: boolean;
  onPlayAudioBrief: () => void;
  isEmergencyActive: boolean;
  onToggleEmergency: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuiz: () => void;
  onOpenLocationModal: () => void;
  onUseLiveGPS: () => void;
  isLocatingGPS: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  userPersona,
  onSelectPersonaType,
  currentLanguage,
  onSelectLanguage,
  isPlayingAudio,
  onPlayAudioBrief,
  isEmergencyActive,
  onToggleEmergency,
  activeTab,
  onSelectTab,
  onOpenQuiz,
  onOpenLocationModal,
  onUseLiveGPS,
  isLocatingGPS,
}) => {
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  const activeLang = currentLanguage || language;

  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
    if (onSelectLanguage) onSelectLanguage(lang);
  };

  const personaLabels: Record<PersonaType, { label: string; icon: string }> = {
    family:     { label: t.familyMode || 'Family Guardian', icon: '👨‍👩‍👧' },
    farmer:     { label: t.farmerMode || 'Agriculture', icon: '🌾' },
    gig_worker: { label: t.laborMode || 'Gig Worker', icon: '🛵' },
    commuter:   { label: t.commuterMode || 'Commuter', icon: '🚲' },
  };

  const sectorTabTitle =
    userPersona.type === 'family'     ? (t.familyMode || 'Family Guardian') :
    userPersona.type === 'farmer'     ? (t.farmerMode || 'Agriculture') :
    userPersona.type === 'gig_worker' ? (t.laborMode || 'Outdoor Safety') :
    (t.commuterMode || 'Clean Commute');

  const navTabs = [
    { id: 'dashboard',     label: t.navDashboard || 'AI Copilot',        icon: '🌍' },
    { id: 'sector',        label: sectorTabTitle,                         icon: '⚡' },
    { id: 'route',         label: t.navRoute || 'Safe Routes',            icon: '🗺️' },
    { id: 'whatif',        label: t.navWhatIf || 'Simulator',             icon: '🔬' },
    { id: 'impact',        label: t.navImpact || 'Impact',                icon: '📊' },
    { id: 'omnichannel',   label: t.navOmnichannel || 'WhatsApp/SMS',    icon: '📱' },
    { id: 'community_b2b', label: t.navCommunityB2B || 'Community',      icon: '🤝' },
  ];

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(249,115,22,0.3)',
        borderBottom: '2px solid transparent',
        borderImage: 'linear-gradient(90deg, #f97316, #0d9488, #f97316) 1',
      }}
    >
      {/* Orange top accent line */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, #f97316, #fb923c, #0d9488, #14b8a6)',
        boxShadow: '0 0 12px rgba(249,115,22,0.5)',
      }} />
      {/* Top Live Status Bar */}
      <div
        className="px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2"
        style={{ borderBottom: '1px solid rgba(249,115,22,0.15)', color: '#64748b' }}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold" style={{ color: '#fb923c' }}>
            <span className="neu-dot-live" style={{ width: 7, height: 7, display: 'inline-block', background: '#f97316', boxShadow: '0 0 8px rgba(249,115,22,0.7)' }} />
            {t.liveIngestion || 'Live Feed Active'}
          </span>
          <span className="hidden sm:inline" style={{ color: '#1e293b' }}>|</span>
          <span className="hidden sm:inline">IMD · Sentinel-5P · OpenAQ · Copernicus</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleEmergency}
            className="neu-btn px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1"
            style={isEmergencyActive ? {
              background: 'rgba(225,29,72,0.15)',
              boxShadow: 'var(--neu-inset-sm), 0 0 12px rgba(225,29,72,0.2)',
              color: '#fb7185',
            } : {}}
          >
            <AlertTriangle className="w-3 h-3" style={{ color: 'var(--accent-amber)' }} />
            {isEmergencyActive ? 'Alert Active' : 'Simulate Alert'}
          </button>
          <span className="hidden md:inline" style={{ color: '#1e293b' }}>|</span>
          <span className="hidden md:inline text-[11px]">India Climate OS</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onSelectTab('dashboard')}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              boxShadow: '-3px -3px 8px rgba(255,255,255,0.05), 3px 3px 8px rgba(0,0,0,0.5), 0 0 20px rgba(249,115,22,0.3)',
            }}
          >
            🌍
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight" style={{ color: '#fff' }}>
                {t.appTitle || 'ClimateBuddy'}
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(13,148,136,0.15))',
                  boxShadow: 'var(--neu-raised-sm)',
                  color: '#fb923c',
                }}
              >
                AI COPILOT
              </span>
            </div>
            <p className="text-[11px] hidden sm:block" style={{ color: '#64748b' }}>
              {t.subTagline ? t.subTagline.slice(0, 50) + '...' : 'Turning climate data into decisions'}
            </p>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">

          {/* Location Badge + GPS + Search */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: 'var(--neu-base)', boxShadow: 'var(--neu-inset-sm)' }}
          >
            {/* Location display */}
            <div className="flex items-center gap-1.5 px-2 py-1">
              {currentLocation.id === 'gps-live' ? (
                <Navigation className="w-3 h-3 shrink-0" style={{ color: 'var(--accent-emerald)' }} />
              ) : (
                <MapPin className="w-3 h-3 shrink-0" style={{ color: '#475569' }} />
              )}
              <span
                className="text-xs font-semibold max-w-[90px] sm:max-w-[140px] truncate"
                style={{ color: '#94a3b8' }}
                title={currentLocation.name}
              >
                {currentLocation.id === 'gps-live'
                  ? (currentLocation.areaName || currentLocation.name)
                  : currentLocation.name}
              </span>
            </div>

            {/* GPS Button */}
            <button
              type="button"
              onClick={onUseLiveGPS}
              disabled={isLocatingGPS}
              title="Use Live GPS"
              className="neu-btn flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold"
              style={{ color: 'var(--accent-emerald)' }}
            >
              {isLocatingGPS
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-emerald)' }} />
                : <Navigation className="w-3.5 h-3.5" style={{ color: 'var(--accent-emerald)' }} />
              }
              <span className="hidden sm:inline">{isLocatingGPS ? 'Locating…' : 'GPS'}</span>
            </button>

            {/* Search Button */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              title="Search Location"
              className="neu-btn flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium"
            >
              <Search className="w-3.5 h-3.5" style={{ color: '#64748b' }} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* Persona Selector */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: 'var(--neu-base)', boxShadow: 'var(--neu-inset-sm)' }}
          >
            <User className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-amber)' }} />
            <select
              aria-label="Select User Persona"
              value={userPersona.type}
              onChange={(e) => onSelectPersonaType(e.target.value as PersonaType)}
              className="text-xs font-semibold focus:outline-none cursor-pointer max-w-[120px] bg-transparent"
              style={{ color: '#94a3b8' }}
            >
              {Object.entries(personaLabels).map(([type, { label, icon }]) => (
                <option key={type} value={type} style={{ background: 'var(--neu-base-dark)', color: '#c8d6e5' }}>
                  {icon} {label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: 'var(--neu-base)', boxShadow: 'var(--neu-inset-sm)' }}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-teal)' }} />
            <select
              aria-label="Select Language"
              value={activeLang}
              onChange={(e) => handleLangChange(e.target.value as Language)}
              className="text-xs font-semibold focus:outline-none cursor-pointer bg-transparent"
              style={{ color: '#94a3b8' }}
            >
              {availableLanguages.map((l) => (
                <option key={l.code} value={l.code} style={{ background: 'var(--neu-base-dark)', color: '#c8d6e5' }}>
                  {l.nativeLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Audio Button */}
          <button
            onClick={onPlayAudioBrief}
            className="neu-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
            style={isPlayingAudio ? {
              background: 'linear-gradient(135deg, #059669, #0d9488)',
              boxShadow: 'var(--neu-inset-sm), var(--neu-glow-emerald)',
              color: '#fff',
            } : {}}
          >
            {isPlayingAudio
              ? <VolumeX className="w-3.5 h-3.5" />
              : <Volume2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-emerald)' }} />
            }
            <span className="hidden sm:inline">{isPlayingAudio ? 'Stop' : 'Voice'}</span>
          </button>

          {/* Personalize Button */}
          <button
            type="button"
            onClick={onOpenQuiz}
            className="neu-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs"
          >
            <span>⚙️</span>
            <span className="hidden lg:inline">Personalize</span>
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav
        aria-label="Main Navigation"
        className="overflow-x-auto no-scrollbar"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 py-2">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(5,150,105,0.25), rgba(13,148,136,0.2))',
                  boxShadow: 'var(--neu-inset-sm), 0 0 12px rgba(52,211,153,0.1)',
                  color: 'var(--accent-emerald)',
                } : {
                  color: '#475569',
                  boxShadow: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#475569';
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
