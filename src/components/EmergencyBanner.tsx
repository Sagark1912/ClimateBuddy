import React from 'react';
import { 
  AlertTriangle, 
  Flame, 
  CloudLightning, 
  Wind, 
  X, 
  PhoneCall, 
  ShieldAlert, 
  Share2
} from 'lucide-react';
import { EnvironmentalAlert, Language } from '../types';

interface EmergencyBannerProps {
  alerts: EnvironmentalAlert[];
  isActive: boolean;
  onDismiss: () => void;
  language: Language;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  alerts,
  isActive,
  onDismiss,
  language,
}) => {
  if (!isActive) return null;

  return (
    <aside aria-label="Severe Climate Emergency Alert" className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 border-b border-rose-800 text-white shadow-xl animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-900/50 animate-bounce">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-rose-800 text-rose-100 px-2 py-0.5 rounded">
                  RED ALERT · EMERGENCY MODE
                </span>
                <span className="text-xs text-rose-200 font-semibold">
                  NDMA / IMD Early Warning System
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {alerts.length > 0 ? alerts[0].title : 'Extreme Weather Disruption Advisory'}
              </h2>
              <p className="text-xs text-rose-100/90 mt-1 max-w-3xl leading-relaxed">
                {alerts.length > 0
                  ? alerts[0].description
                  : 'Severe heatwave and convective downpour active. Low-lying roads and unshaded work zones restricted. Stay indoors, keep mobile phones charged, and check on elderly neighbors.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <a
              href="tel:112"
              className="cursor-pointer bg-white text-rose-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow hover:bg-rose-50 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
              <span>SOS Helpline (112)</span>
            </a>
            <button
              onClick={onDismiss}
              className="cursor-pointer p-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 transition-colors"
              title="Close emergency alert banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
