import React from 'react';
import {
  Thermometer,
  Wind,
  Sun,
  CloudRain,
  ShieldAlert,
  Radio,
  Satellite,
  CheckCircle2,
  Flame,
  Droplets
} from 'lucide-react';
import { EnvironmentalData, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface DashboardProps {
  data: EnvironmentalData;
  language: Language;
}

export const EnvironmentalDashboard: React.FC<DashboardProps> = ({ data, language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const getRiskColor = (score: number) => {
    if (score < 4.0) return { glow: 'rgba(52,211,153,0.15)', accent: 'var(--accent-emerald)', label: t.lowRisk || 'Low Risk' };
    if (score < 7.0) return { glow: 'rgba(251,191,36,0.15)', accent: 'var(--accent-amber)', label: t.moderateRisk || 'Moderate Risk' };
    if (score < 8.5) return { glow: 'rgba(251,146,60,0.15)', accent: '#fb923c', label: t.highRisk || 'High Risk' };
    return { glow: 'rgba(251,113,133,0.15)', accent: 'var(--accent-rose)', label: t.severeHazard || 'Severe Hazard' };
  };

  const getAqiDetails = (aqi: number) => {
    if (aqi <= 50)  return { label: t.goodAqi || 'Good',         color: 'var(--accent-emerald)' };
    if (aqi <= 100) return { label: t.satisfactoryAqi || 'Moderate', color: 'var(--accent-teal)' };
    if (aqi <= 200) return { label: t.moderateAqi || 'Unhealthy Sensitive', color: 'var(--accent-amber)' };
    if (aqi <= 300) return { label: t.poorAqi || 'Unhealthy',   color: '#fb923c' };
    return             { label: t.veryPoorAqi || 'Very Unhealthy', color: 'var(--accent-rose)' };
  };

  const risk = getRiskColor(data.compositeRiskScore);
  const aqiInfo = getAqiDetails(data.aqi);

  // Sub-risk breakdown data
  const subRisks = [
    {
      icon: <Flame className="w-3.5 h-3.5" />,
      label: t.heatLabel || 'Heat',
      value: data.tempC > 36 ? 'High' : data.tempC > 31 ? 'Moderate' : 'Low',
      color: data.tempC > 36 ? 'var(--accent-rose)' : data.tempC > 31 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
      pct: Math.min(100, ((data.tempC - 20) / 20) * 100),
    },
    {
      icon: <Wind className="w-3.5 h-3.5" />,
      label: t.pollutionLabel || 'AQI',
      value: data.aqi > 200 ? 'High' : data.aqi > 100 ? 'Mod' : 'Low',
      color: data.aqi > 200 ? 'var(--accent-rose)' : data.aqi > 100 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
      pct: Math.min(100, (data.aqi / 300) * 100),
    },
    {
      icon: <CloudRain className="w-3.5 h-3.5" />,
      label: t.rainLabel || 'Rain',
      value: `${data.rainChancePercent}%`,
      color: data.rainChancePercent > 60 ? 'var(--accent-sky)' : 'var(--accent-teal)',
      pct: data.rainChancePercent,
    },
    {
      icon: <Sun className="w-3.5 h-3.5" />,
      label: t.uvLabel || 'UV',
      value: `${data.uvIndex.toFixed(1)}`,
      color: data.uvIndex >= 8 ? 'var(--accent-rose)' : data.uvIndex >= 6 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
      pct: Math.min(100, (data.uvIndex / 12) * 100),
    },
  ];

  return (
    <section aria-labelledby="env-dashboard-heading" className="space-y-4">

      {/* ── Risk Score Banner ─────────────────────────── */}
      <div
        className="neu-card p-5 sm:p-6 neu-hover"
        style={{ boxShadow: `var(--neu-raised), 0 0 32px ${risk.glow}` }}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 neu-label">
              <ShieldAlert className="w-4 h-4" style={{ color: risk.accent }} />
              <span>{t.compositeVulnerability || 'Composite Climate Vulnerability Index (0–10)'}</span>
            </div>

            {/* Score display */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: risk.accent }}>
                {data.compositeRiskScore.toFixed(1)}
              </span>
              <div>
                <span className="text-sm" style={{ color: '#475569' }}>/10</span>
                <div
                  className="text-sm font-bold mt-0.5"
                  style={{ color: risk.accent }}
                >
                  {risk.label}
                </div>
              </div>
            </div>

            {/* Risk progress bar */}
            <div className="neu-progress-track" style={{ height: 8 }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(data.compositeRiskScore / 10) * 100}%`,
                  background: `linear-gradient(90deg, var(--accent-emerald), ${risk.accent})`,
                  boxShadow: `0 0 10px ${risk.glow}`,
                }}
              />
            </div>

            <p className="text-xs" style={{ color: '#475569' }}>
              {t.synthesizedRealtime || 'Synthesized from thermal strain, particulate AQI, UV radiance, and precipitation probability.'}
            </p>
          </div>

          {/* Sub-Risk Cards */}
          <div className="grid grid-cols-2 gap-2.5 shrink-0 sm:w-64">
            {subRisks.map((r, i) => (
              <div key={i} className="neu-inset-sm p-3 rounded-xl space-y-2" style={{ background: 'var(--neu-base-dark)', boxShadow: 'var(--neu-inset-sm)' }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1" style={{ color: r.color }}>
                    {r.icon}
                    <span className="font-medium" style={{ color: '#64748b' }}>{r.label}</span>
                  </span>
                  <span className="font-bold text-xs" style={{ color: r.color }}>{r.value}</span>
                </div>
                <div className="neu-progress-track">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${r.pct}%`,
                      background: r.color,
                      boxShadow: `0 0 6px ${r.color}60`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4 Metric Cards ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            icon: <Thermometer className="w-4 h-4" style={{ color: 'var(--accent-rose)' }} />,
            label: t.tempHeatIndex || 'Temperature',
            source: 'IMD AWS',
            primary: `${data.tempC.toFixed(1)}°C`,
            secondary: `Feels ${data.feelsLikeC.toFixed(1)}°C`,
            footer1: `Humidity: ${data.humidityPercent}%`,
            footer2: `WBGT: ${data.heatStressWbgt}°C`,
            accentColor: 'var(--accent-rose)',
          },
          {
            icon: <Wind className="w-4 h-4" style={{ color: 'var(--accent-emerald)' }} />,
            label: t.aqiPollutants || 'Air Quality',
            source: 'OpenAQ/CPCB',
            primary: `${data.aqi}`,
            secondary: aqiInfo.label,
            footer1: `PM2.5: ${data.pm25} µg/m³`,
            footer2: `NO₂: ${data.no2}`,
            accentColor: aqiInfo.color,
          },
          {
            icon: <Sun className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />,
            label: t.uvSolar || 'UV & Solar',
            source: 'Copernicus',
            primary: `${data.uvIndex.toFixed(1)}`,
            secondary: data.uvIndex >= 8 ? 'Very High' : data.uvIndex >= 6 ? 'High UV' : 'Moderate',
            footer1: `Solar: ${data.solarRadianceWm2} W/m²`,
            footer2: `Shade: ${data.uvIndex >= 6 ? 'Required' : 'Optional'}`,
            accentColor: data.uvIndex >= 8 ? 'var(--accent-rose)' : 'var(--accent-amber)',
          },
          {
            icon: <CloudRain className="w-4 h-4" style={{ color: 'var(--accent-sky)' }} />,
            label: t.rainRadar || 'Rain Radar',
            source: 'Doppler',
            primary: `${data.rainChancePercent}%`,
            secondary: data.rainChancePercent >= 60 ? 'Rain Likely' : 'Dry Outlook',
            footer1: `Soil: ${data.soilMoisturePercent}%`,
            footer2: `Rate: ${data.rainRateMmPerHour} mm/h`,
            accentColor: 'var(--accent-sky)',
          },
        ].map((card, idx) => (
          <div key={idx} className="neu-card p-4 neu-hover space-y-3">
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#64748b' }}>
                {card.icon}
                {card.label}
              </span>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{ background: 'var(--neu-base-dark)', boxShadow: 'var(--neu-inset-sm)', color: '#334155' }}
              >
                {card.source}
              </span>
            </div>

            {/* Primary value — inset trough */}
            <div className="neu-metric flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#f1f5f9' }}>
                {card.primary}
              </span>
              <span className="text-xs font-semibold" style={{ color: card.accentColor }}>
                {card.secondary}
              </span>
            </div>

            {/* Footer row */}
            <div
              className="flex items-center justify-between text-[11px] pt-1"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#475569' }}
            >
              <span>{card.footer1}</span>
              <span>{card.footer2}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Nearby Microclimate Comparison ───────────── */}
      {data.areaMicroclimate?.nearbyAreasComparison && (
        <div className="neu-card p-4 sm:p-5 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="neu-dot-live" style={{ display: 'inline-block', width: 8, height: 8 }} />
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                {t.areaVarianceTitle || 'Area-Wise Microclimate Variance'}
              </h4>
              <span style={{ color: '#1e293b' }}>·</span>
              <span className="text-[11px]" style={{ color: 'var(--accent-sky)' }}>
                {data.areaMicroclimate.resolvedArea}
              </span>
            </div>
            <span className="text-[10px]" style={{ color: '#334155' }}>Cloud formations differ by neighbourhood</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {data.areaMicroclimate.nearbyAreasComparison.map((area, idx) => (
              <div key={idx} className="neu-inset rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold truncate max-w-[100px]" style={{ color: '#94a3b8' }} title={area.areaName}>
                    {area.areaName}
                  </span>
                  <span className="font-bold" style={{ color: '#f1f5f9' }}>{area.tempC}°C</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span style={{ color: '#475569' }}>Cloud: <strong style={{ color: 'var(--accent-sky)' }}>{area.cloudPercent}%</strong></span>
                  <span style={{ color: '#475569' }}>Rain: <strong style={{ color: 'var(--accent-teal)' }}>{area.rainChance}%</strong></span>
                </div>
                <div className="neu-progress-track">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${area.cloudPercent}%`,
                      background: area.cloudPercent > 60
                        ? 'linear-gradient(90deg, var(--accent-sky), var(--accent-teal))'
                        : 'linear-gradient(90deg, var(--accent-amber), #f97316)',
                      boxShadow: area.cloudPercent > 60 ? '0 0 6px rgba(56,189,248,0.4)' : '0 0 6px rgba(251,191,36,0.4)',
                    }}
                  />
                </div>
                <p className="text-[10px] truncate" style={{ color: '#334155' }}>{area.condition}</p>
              </div>
            ))}
          </div>

          {/* Consensus footer */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            <span className="flex items-center gap-1.5" style={{ color: '#64748b' }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-emerald)' }} />
              Open-Meteo 1km · ECMWF IFS · NOAA GFS · SerpApi Ground
            </span>
            <span className="font-mono font-bold" style={{ color: 'var(--accent-emerald)' }}>
              94% Agreement
            </span>
          </div>
        </div>
      )}

      {/* ── Ingestion Telemetry Strip ─────────────────── */}
      <div
        className="rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-3"
        style={{ background: 'var(--neu-base-dark)', boxShadow: 'var(--neu-inset-sm)', color: '#475569' }}
      >
        <div className="flex flex-wrap items-center gap-4">
          {[
            { icon: <Radio className="w-3.5 h-3.5" style={{ color: 'var(--accent-emerald)' }} />, text: `IMD: ${data.feeds.imd.station} (${data.feeds.imd.latencyMs}ms)` },
            { icon: <Satellite className="w-3.5 h-3.5" style={{ color: 'var(--accent-sky)' }} />, text: `Sentinel-5P: ${data.feeds.sentinel5p.passTime} pass` },
            { icon: <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-teal)' }} />, text: `OpenAQ: ${data.feeds.openaq.stationsReporting} active` },
            { icon: <Droplets className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />, text: `IoT: ${data.feeds.regionalSensors.online}/${data.feeds.regionalSensors.total} online` },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        <span className="text-[10px]" style={{ color: '#334155' }}>
          {t.telemetryActive || 'Live Sensor Telemetry Active'}
        </span>
      </div>
    </section>
  );
};
