import React from 'react';
import { 
  Check, 
  ShieldCheck, 
  Droplet, 
  Zap, 
  ArrowRight, 
  Sparkles,
  Info
} from 'lucide-react';
import { PrescriptiveNudge, Language, PersonaType } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface PrescriptiveNudgesProps {
  nudges: PrescriptiveNudge[];
  onLogAction: (nudge: PrescriptiveNudge) => void;
  loggedNudgeIds: Set<string>;
  language: Language;
  persona: PersonaType;
}

export const PrescriptiveNudges: React.FC<PrescriptiveNudgesProps> = ({
  nudges,
  onLogAction,
  loggedNudgeIds,
  language,
  persona,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Filter only high confidence (>85%) advisories targeted strictly to the user's active persona
  const verifiedNudges = nudges.filter(
    (n) => n.confidenceScore >= 85 && n.personaTarget === persona
  );

  return (
    <section aria-labelledby="prescriptive-nudges-heading" className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 id="prescriptive-nudges-heading" className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Prescriptive Nudge Engine</span>
            <span className="text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
              Confidence &gt;85% Verified
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Targeted specifically for your <strong className="text-slate-200 uppercase">{persona.replace('_', ' ')}</strong> routine. Log your action to verify real-world water & emission savings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {verifiedNudges.map((nudge) => {
          const isLogged = loggedNudgeIds.has(nudge.id);

          return (
            <div
              key={nudge.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isLogged
                  ? 'bg-emerald-950/20 border-emerald-800/80'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header row: Title + Confidence */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    {nudge.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{nudge.confidenceScore}%</span>
                  </div>
                </div>

                {/* Micro-Prompt Quote */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 text-xs sm:text-sm text-slate-200 font-medium leading-relaxed mb-3">
                  "{nudge.microPrompt}"
                </div>

                {/* AI Reasoning Context */}
                <p className="text-xs text-slate-400 mb-3 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{nudge.reasoning}</span>
                </p>

                {/* Resource Impact Preview */}
                {nudge.resourceBenefit && (
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                    {nudge.resourceBenefit.waterSavedL && (
                      <span className="flex items-center gap-1 text-sky-400 font-semibold bg-sky-950/50 px-2 py-0.5 rounded border border-sky-900">
                        <Droplet className="w-3 h-3" />
                        {nudge.resourceBenefit.waterSavedL.toLocaleString()} L Water Saved
                      </span>
                    )}
                    {nudge.resourceBenefit.kwhSaved && (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/50 px-2 py-0.5 rounded border border-amber-900">
                        <Zap className="w-3 h-3" />
                        {nudge.resourceBenefit.kwhSaved} kWh Grid Power
                      </span>
                    )}
                    {nudge.resourceBenefit.moneySavedINR && (
                      <span className="text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900">
                        ₹{nudge.resourceBenefit.moneySavedINR} Saved
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => onLogAction(nudge)}
                  disabled={isLogged}
                  className={`w-full cursor-pointer py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isLogged
                      ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow hover:shadow-emerald-900/30'
                  }`}
                >
                  {isLogged ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>{t.actionLogged}</span>
                    </>
                  ) : (
                    <>
                      <span>{nudge.suggestedActionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
