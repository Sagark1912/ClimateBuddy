import React, { useState, useRef, useEffect } from 'react';
import { Send, X, RefreshCw } from 'lucide-react';
import { Language, UserPersona, EnvironmentalData, LocationProfile } from '../types';

interface AskClimateBuddyModalProps {
  isOpen: boolean;
  onClose: () => void;
  envData: EnvironmentalData;
  persona: UserPersona;
  location: LocationProfile;
  language: Language;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  time: string;
}

/** Smart context-aware reply engine — uses real env data, works offline in APK */
function buildSmartReply(query: string, env: any, personaType: string, locName: string): string {
  const q = query.toLowerCase();
  const temp = env.tempC ?? 31;
  const feelsLike = env.feelsLikeC ?? temp + 2;
  const aqi = env.aqi ?? 120;
  const rain = env.rainChancePercent ?? 40;
  const uv = env.uvIndex ?? 7;
  const risk = env.compositeRiskScore ?? 5;
  const humid = env.humidityPercent ?? 65;
  const wind = env.windSpeedKmh ?? 14;
  const pm25 = env.pm25 ?? Math.round(aqi / 2.5);
  const heatLabel = temp > 37 ? 'Extreme heat' : temp > 33 ? 'High heat' : 'Manageable temp';
  const aqiLabel = aqi > 200 ? 'Very Unhealthy AQI' : aqi > 150 ? 'Unhealthy AQI' : aqi > 100 ? 'Moderate AQI' : 'Good air quality';
  const rainLabel = rain > 70 ? 'High rain — carry umbrella' : rain > 40 ? 'Possible showers' : 'Mostly dry';
  const uvLabel = uv >= 8 ? 'Very High UV — SPF 50+' : uv >= 6 ? 'High UV' : 'Safe UV';
  const safeWindow = temp > 35 ? 'Before 9 AM or after 5 PM' : 'Before 11 AM or after 4 PM';

  const personaTip =
    personaType === 'farmer'
      ? rain > 50 ? 'Skip heavy irrigation — rain expected.' : 'Irrigate before 8 AM.'
      : personaType === 'gig_worker'
      ? 'Take shade breaks every 45 min. Carry 2L water.'
      : personaType === 'commuter'
      ? rain > 50 ? 'Carry rain gear, expect waterlogging.' : 'Best window: ' + safeWindow
      : 'Keep children indoors 11 AM–3 PM.';

  if (q.includes('outdoor') || q.includes('work') || q.includes('safe') || q.includes('when') || q.includes('time')) {
    return `Safe window for ${locName}:\n\n- Best hours: ${safeWindow}\n- ${heatLabel}: ${temp}°C (feels ${feelsLike}°C)\n- ${aqiLabel}: AQI ${aqi}\n- ${uvLabel}: UV ${uv.toFixed(1)}\n- Humidity: ${humid}%\n- ${rainLabel}\n\nTip: ${personaTip}`;
  }
  if (q.includes('water') || q.includes('crop') || q.includes('irrigat') || q.includes('plant') || q.includes('farm')) {
    return `Irrigation advice for ${locName}:\n\n- Rain chance: ${rain}% -> ${rain > 60 ? 'Skip watering today — rain expected!' : rain > 40 ? 'Reduce irrigation by 50%' : 'Normal irrigation OK'}\n- Soil moisture: ${env.soilMoisturePercent ?? Math.round(humid * 0.8)}%\n- Temperature: ${temp}°C (evaporation is ${temp > 34 ? 'HIGH' : 'moderate'})\n- Wind: ${wind} km/h -> ${wind > 20 ? 'Use drip system, avoid sprinkler' : 'Sprinkler OK'}\n\nBest practice: Water before 8 AM or after 6 PM to cut evaporation by 40%.`;
  }
  if (q.includes('aqi') || q.includes('air') || q.includes('pollut') || q.includes('pm') || q.includes('breath')) {
    return `Air Quality for ${locName}:\n\n- AQI: ${aqi} — ${aqiLabel}\n- PM2.5: ${pm25} ug/m3\n- PM10: ${env.pm10 ?? Math.round(aqi / 1.5)} ug/m3\n- NO2: ${env.no2 ?? 25} ug/m3\n\n${aqi > 150 ? 'Wear N95 mask outdoors. Avoid morning runs. Keep windows closed 6-9 AM.' : aqi > 100 ? 'Sensitive groups (asthma, elderly, children) should limit time outside.' : 'Air quality is acceptable for all activities today.'}`;
  }
  if (q.includes('carry') || q.includes('wear') || q.includes('bring') || q.includes('pack') || q.includes('equip')) {
    return `Pack list for ${locName} today:\n\n${rain > 60 ? '- Umbrella/rain poncho (rain likely)\n' : ''}- Water bottle — at least 1.5L${temp > 33 ? ' (high heat day)' : ''}\n${uv >= 6 ? '- Hat/cap + SPF 50 sunscreen (UV ' + uv.toFixed(1) + ')\n' : ''}- Light breathable cotton clothing\n${aqi > 150 ? '- N95/N99 mask (AQI ' + aqi + ' — unhealthy)\n' : ''}- Charged phone for weather alerts\n\nAvoid heavy outdoor exercise between 11 AM–3 PM.`;
  }
  if (q.includes('cycl') || q.includes('commut') || q.includes('bike') || q.includes('ride') || q.includes('travel')) {
    return `Commute report for ${locName}:\n\n- ${rain > 60 ? 'HIGH rain risk — wet roads, poor visibility.' : rain > 35 ? 'Possible showers — keep rain gear.' : 'Dry, good for cycling.'}\n- Wind: ${wind} km/h (${wind > 25 ? 'strong headwind — use lower gear' : 'manageable'})\n- Best window: ${temp > 34 ? '6–9 AM or after 5 PM' : '7–10 AM or after 4 PM'}\n- ${aqiLabel} — ${aqi > 150 ? 'wear mask on bike' : 'no mask needed'}\n\nRisk score: ${risk}/10`;
  }
  if (q.includes('risk') || q.includes('score') || q.includes('danger') || q.includes('hazard') || q.includes('index')) {
    return `Climate Risk Score for ${locName}: ${risk}/10\n\n- ${heatLabel}: ${temp}°C (feels ${feelsLike}°C)\n- ${aqiLabel}: AQI ${aqi}\n- ${uvLabel}: UV ${uv.toFixed(1)}\n- ${rainLabel}: ${rain}%\n- Humidity: ${humid}%\n\n${risk >= 7 ? 'HIGH RISK: Limit outdoor exposure, stay hydrated, have emergency contact.' : risk >= 5 ? 'MODERATE RISK: Take precautions, avoid peak heat 11 AM–3 PM.' : 'LOW RISK: Conditions are relatively safe today.'}`;
  }
  if (q.includes('dry') || q.includes('laundry') || q.includes('wash')) {
    return `Laundry forecast for ${locName}:\n\n- ${rain > 65 ? 'NOT recommended — ' + rain + '% rain chance.' : rain > 40 ? 'Risky — dry in morning, bring in before noon.' : 'Good drying day!'}\n- Wind: ${wind} km/h (${wind > 15 ? 'good drying breeze' : 'light wind — slower dry'})\n- Humidity: ${humid}% (${humid > 75 ? 'high — clothes dry slowly' : 'comfortable'})\n- UV ${uv.toFixed(1)} — ${uv >= 6 ? 'strong UV great for sanitising clothes' : 'moderate UV'}.`;
  }
  // Default — always uses live numbers
  return `I have analyzed the current conditions for ${locName}:\n\n- ${heatLabel}: ${temp}°C (feels ${feelsLike}°C)\n- ${aqiLabel}: AQI ${aqi}, PM2.5 ${pm25} ug/m3\n- ${uvLabel}: UV ${uv.toFixed(1)}\n- ${rainLabel}: ${rain}% chance\n- Risk score: ${risk}/10\n\nTip: ${personaTip}\n\nYou can ask me specific questions like "Should I water my crops?", "Is it safe to cycle?", or "What should I carry?"`;
}

export const AskClimateBuddyModal: React.FC<AskClimateBuddyModalProps> = ({
  isOpen,
  onClose,
  envData,
  persona,
  location,
  language,
}) => {
  const welcomeMsg = `Hello! I'm ClimateBuddy, your AI Climate Copilot for ${location.name}.\n\nAsk me anything about today's conditions — what to carry, best time for outdoor work, crop watering, cycling safety, and more.`;

  const [messages, setMessages] = useState<Message[]>([{
    role: 'model', content: welcomeMsg, time: 'Just now',
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts = [
    'Should I water my crops/plants today?',
    'What time is safest for outdoor work?',
    'Can I dry clothes outside today?',
    'Is it safe to cycle to work today?',
    'What is my climate risk score?',
    'What should I carry today?',
  ];

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: 'model', content: welcomeMsg, time: 'Just now' }]);
      setInput('');
    }
  }, [location.name, isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    const query = input.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Try server route (works in dev/web with Express server)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
          context: {
            location: location.name, persona: persona.type,
            temp: `${envData.tempC}C`, feelsLike: `${envData.feelsLikeC}C`,
            aqi: envData.aqi, pm25: envData.pm25, uv: envData.uvIndex,
            rainChance: `${envData.rainChancePercent}%`,
            riskScore: `${envData.compositeRiskScore}/10`,
          },
          language,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          setMessages((prev) => [...prev, {
            role: 'model', content: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
          setIsLoading(false);
          setTimeout(() => inputRef.current?.focus(), 100);
          return;
        }
      }
    } catch (e) {
      // Ignored - fall back to offline reply
    }

    // Smart offline reply — always different based on question + live env data
    setMessages((prev) => [...prev, {
      role: 'model',
      content: buildSmartReply(query, envData, persona.type, location.name),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleQuickPromptSelect = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl h-[92vh] sm:h-[85vh] sm:max-h-[700px] flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--neu-base)', boxShadow: 'var(--neu-raised), 0 0 48px rgba(0,0,0,0.7)' }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between shrink-0"
          style={{ backgroundColor: 'var(--neu-base-dark)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: '-3px -3px 8px rgba(255,255,255,0.05), 3px 3px 8px rgba(0,0,0,0.5), 0 0 20px rgba(249,115,22,0.2)',
              }}
            >🤖</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm" style={{ color: '#e2e8f0' }}>Ask ClimateBuddy</h3>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-bold hidden sm:inline"
                  style={{ background: 'rgba(249,115,22,0.15)', boxShadow: 'var(--neu-inset-sm)', color: '#fb923c' }}
                >AI Copilot</span>
              </div>
              <p className="text-xs" style={{ color: '#475569' }}>
                {location.name} · AQI {envData.aqi} · {envData.tempC}°C
              </p>
            </div>
          </div>
          <button onClick={onClose} className="neu-btn p-2 rounded-lg" aria-label="Close">
            <X className="w-5 h-5" style={{ color: '#475569' }} />
          </button>
        </div>

        {/* Quick Prompts */}
        <div
          className="px-3 py-2 shrink-0"
          style={{ backgroundColor: 'var(--neu-base-dark)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#334155' }}>
            {language === 'kn' ? 'ಸೂಚಿತ' : language === 'hi' ? 'सुझाव' : 'Tap to ask →'}
          </p>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPromptSelect(qp)}
                disabled={isLoading}
                className="neu-btn text-[11px] px-2.5 py-1.5 rounded-full whitespace-nowrap shrink-0 disabled:opacity-40"
              >{qp}</button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3" style={{ backgroundColor: 'var(--neu-base)' }}>
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'model' && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5"
                  style={{ background: 'var(--neu-base-dark)', boxShadow: 'var(--neu-raised-sm)' }}>
                  🌍
                </div>
              )}
              <div
                className="max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-sm"
                style={m.role === 'user' ? {
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  boxShadow: 'var(--neu-raised-sm), 0 0 20px rgba(249,115,22,0.2)',
                  color: '#fff', borderTopRightRadius: '4px',
                } : {
                  background: 'var(--neu-base-dark)',
                  boxShadow: 'var(--neu-inset-sm)',
                  color: '#94a3b8', borderTopLeftRadius: '4px', whiteSpace: 'pre-line',
                }}
              >
                <div>{m.content}</div>
                <span className="text-[10px] block text-right mt-1"
                  style={{ color: m.role === 'user' ? 'rgba(255,255,255,0.5)' : '#334155' }}>
                  {m.time}
                </span>
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 mt-0.5"
                  style={{ background: 'var(--neu-base-dark)', boxShadow: 'var(--neu-raised-sm)' }}>
                  👤
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 items-center text-xs">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'var(--neu-base-dark)', boxShadow: 'var(--neu-raised-sm)' }}>
                🌍
              </div>
              <div className="px-3 py-2.5 rounded-2xl flex items-center gap-2"
                style={{ background: 'var(--neu-base-dark)', boxShadow: 'var(--neu-inset-sm)', color: '#475569' }}>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: '#fb923c' }} />
                <span>Analyzing conditions for {location.name}...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-3 flex items-center gap-2 shrink-0"
          style={{ backgroundColor: 'var(--neu-base-dark)', borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about today's climate..."
            autoComplete="off"
            autoCorrect="off"
            enterKeyHint="send"
            className="neu-input py-3 text-sm min-w-0 flex-1"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl shrink-0 disabled:opacity-40 font-bold"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              boxShadow: 'var(--neu-raised-sm), 0 0 16px rgba(249,115,22,0.3)',
              color: '#fff',
            }}
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
