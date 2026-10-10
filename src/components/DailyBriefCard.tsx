import React from 'react';
import {
  Briefcase,
  Ban,
  Leaf,
  Clock,
  Volume2,
  VolumeX,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Language, UserPersona } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface DailyBriefCardProps {
  brief: {
    summary: string;
    carry: string[];
    avoid: string[];
    greenAction: string;
    safeWindow: string;
    confidence: number;
  };
  isLoading: boolean;
  onRefresh: () => void;
  language: Language;
  persona: UserPersona;
  isPlayingAudio: boolean;
  onPlayAudio: () => void;
}

export const DailyBriefCard: React.FC<DailyBriefCardProps> = ({
  brief,
  isLoading,
  onRefresh,
  language,
  persona,
  isPlayingAudio,
  onPlayAudio,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const personaTitles: Record<string, string> = {
    farmer:     t.farmerMode || 'Farmer',
    gig_worker: t.laborMode  || 'Gig Worker',
    family:     t.familyMode || 'Family Guardian',
    commuter:   t.commuterMode || 'Commuter',
  };

  const quadrants = [
    {
      icon: <Briefcase className="w-3.5 h-3.5" />,
      title: t.whatToCarry || 'What to Carry',
      accentColor: 'var(--accent-sky)',
      glowColor: 'rgba(56,189,248,0.1)',
      content: (
        <ul className="space-y-1.5">
          {brief.carry?.map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5 text-xs" style={{ color: '#94a3b8' }}>
              <span className="font-bold mt-0.5 shrink-0" style={{ color: 'var(--accent-sky)' }}>✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      icon: <Ban className="w-3.5 h-3.5" />,
      title: t.whatToAvoid || 'What to Avoid',
      accentColor: 'var(--accent-rose)',
      glowColor: 'rgba(251,113,133,0.1)',
      content: (
        <ul className="space-y-1.5">
          {brief.avoid?.map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5 text-xs" style={{ color: '#94a3b8' }}>
              <span className="font-bold mt-0.5 shrink-0" style={{ color: 'var(--accent-rose)' }}>✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      icon: <Leaf className="w-3.5 h-3.5" />,
      title: t.greenAction || 'Green Action',
      accentColor: 'var(--accent-emerald)',
      glowColor: 'rgba(52,211,153,0.1)',
      content: (
        <p className="text-xs leading-relaxed" style={{ color: '#6ee7b7' }}>
          {brief.greenAction}
        </p>
      ),
    },
    {
      icon: <Clock className="w-3.5 h-3.5" />,
      title: t.safeWorkWindow || 'Safe Window',
      accentColor: 'var(--accent-amber)',
      glowColor: 'rgba(251,191,36,0.1)',
      content: (
        <div>
          <p className="text-xs font-bold mb-1" style={{ color: '#fde68a' }}>{brief.safeWindow}</p>
          <p className="text-[11px]" style={{ color: '#475569' }}>
            Peak heat & UV subsided outside these hours.
          </p>
        </div>
      ),
    },
  ];

  return (
    <article aria-labelledby="daily-brief-heading" className="neu-card p-5 sm:p-6 relative overflow-hidden">
      {/* Ambient emerald glow top-right */}
      <div
        className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top right, rgba(52,211,153,0.06), transparent 70%)',
        }}
      />

      {/* ── Header ─────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 relative">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <h2 id="daily-brief-heading" className="text-lg font-bold tracking-tight" style={{ color: '#e2e8f0' }}>
              {t.dailyBrief || 'Your Day in 30 Seconds'}
            </h2>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
            Tailored for <span style={{ color: '#64748b' }}>{personaTitles[persona.type]}</span> · Gemini AI + Live AQI
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Confidence pill */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{
              background: 'var(--neu-base-dark)',
              boxShadow: 'var(--neu-inset-sm), var(--neu-glow-emerald)',
              color: 'var(--accent-emerald)',
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{brief.confidence || 93}%</span>
          </div>

          {/* Voice */}
          <button
            onClick={onPlayAudio}
            className="neu-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
            style={isPlayingAudio ? {
              background: 'linear-gradient(135deg, #059669, #0d9488)',
              boxShadow: 'var(--neu-inset-sm), var(--neu-glow-emerald)',
              color: '#fff',
            } : {}}
          >
            {isPlayingAudio
              ? <><VolumeX className="w-3.5 h-3.5" /><span>Stop</span></>
              : <><Volume2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-emerald)' }} /><span>Listen</span></>
            }
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="neu-btn p-2 rounded-lg"
            title="Refresh AI Brief"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
              style={{ color: isLoading ? 'var(--accent-emerald)' : '#475569' }}
            />
          </button>
        </div>

        <div className="neu-accent-bar absolute bottom-0 left-0 right-0" />
      </header>

      {/* ── Summary ────────────────────────────────── */}
      <div className="py-4">
        {isLoading ? (
          <div className="space-y-2">
            {[0.75, 0.55, 0.35].map((w, i) => (
              <div
                key={i}
                className="h-4 rounded animate-pulse"
                style={{ width: `${w * 100}%`, background: 'var(--neu-base-dark)', boxShadow: 'var(--neu-inset-sm)' }}
              />
            ))}
          </div>
        ) : (
          <p className="text-base sm:text-lg font-medium leading-relaxed" style={{ color: '#c8d6e5' }}>
            {brief.summary}
          </p>
        )}
      </div>

      {/* ── Action Quadrants ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {quadrants.map((q, idx) => (
          <div
            key={idx}
            className="neu-inset rounded-xl p-3.5 space-y-2"
            style={{ boxShadow: `var(--neu-inset), 0 0 16px ${q.glowColor}` }}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: q.accentColor }}>
              {q.icon}
              <span>{q.title}</span>
            </div>
            {q.content}
          </div>
        ))}
      </div>
    </article>
  );
};
