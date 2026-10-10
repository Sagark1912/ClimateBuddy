import React, { useState } from 'react';
import { 
  MessageSquare, 
  PhoneCall, 
  Send, 
  Copy, 
  Check, 
  Smartphone, 
  Volume2, 
  VolumeX,
  Radio,
  Clock
} from 'lucide-react';
import { Language, UserPersona, EnvironmentalData } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface OmnichannelDeliveryProps {
  envData: EnvironmentalData;
  userPersona: UserPersona;
  language: Language;
  onPlayAudioBrief: () => void;
  isPlayingAudio: boolean;
}

export const OmnichannelDelivery: React.FC<OmnichannelDeliveryProps> = ({
  envData,
  userPersona,
  language,
  onPlayAudioBrief,
  isPlayingAudio,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'sms' | 'ivr'>('whatsapp');
  const [copied, setCopied] = useState(false);

  // WhatsApp Simulator State
  const [waMessages, setWaMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: `👋 Namaste! ClimateBuddy alert for ${envData.locationId === 'mandya' ? 'Mandya' : 'Bengaluru'}:\n\n🌧️ Rain forecast: ${envData.rainChancePercent}% likely this evening.\n💧 Action: Postpone irrigation to save groundwater & electricity.\n🌡️ Heat index: ${envData.feelsLikeC}°C.`,
      time: '07:30 AM',
    },
    {
      sender: 'user',
      text: 'Should I water my crop today?',
      time: '07:32 AM',
    },
    {
      sender: 'bot',
      text: `🌾 ClimateBuddy Advice (Confidence: 94%):\nNO, hold irrigation today! Doppler radar shows convective clouds approaching within 28 km. Soil moisture is already at ${envData.soilMoisturePercent}%. Waiting will save ~35,000 Liters and ₹185 in pump power.`,
      time: '07:32 AM',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');

  const handleSendWa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery.trim();
    const newMsgs = [...waMessages, { sender: 'user' as const, text: userText, time: 'Just now' }];
    setWaMessages(newMsgs);
    setInputQuery('');

    // Generate responsive bot reply
    setTimeout(() => {
      let reply = `✅ ClimateBuddy reply for ${userPersona.type}:\nCurrent Temp: ${envData.tempC}°C | AQI: ${envData.aqi} | Rain Chance: ${envData.rainChancePercent}%.\nRecommended: Stay hydrated, avoid peak outdoor hours between 12-3 PM, and carry rain protection after 5 PM.`;
      if (userText.toLowerCase().includes('water') || userText.toLowerCase().includes('crop')) {
        reply = `🌾 Farm Advisory: Rain probability is ${envData.rainChancePercent}%. We recommend delaying irrigation by 24 hours. Your soil moisture is healthy at ${envData.soilMoisturePercent}%.`;
      } else if (userText.toLowerCase().includes('cycle') || userText.toLowerCase().includes('run')) {
        reply = `🚲 Fitness / Commute Advisory: Best time is before 10 AM. Morning AQI is ${envData.aqi} and UV is low.`;
      }

      setWaMessages([...newMsgs, { sender: 'bot' as const, text: reply, time: 'Just now' }]);
    }, 700);
  };

  // Rural Low-Bandwidth SMS Preview
  const smsText = `[CLIMATEBUDDY] ${envData.locationId.toUpperCase()} ALERT: Rain ${envData.rainChancePercent}% expected late today. Postpone crop irrigation. Max heat ${envData.tempC}C. Drink water + salt/ORS. Helpline: 1800-CLIMATE`;

  const copySms = () => {
    navigator.clipboard.writeText(smsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Radio className="w-4 h-4" />
              <span>India-First Omnichannel Infrastructure</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              💬 Omnichannel Delivery Layer
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Reaching farmers without smartphones via low-bandwidth SMS, delivery riders via WhatsApp bots, and citizens via IVR audio calls.
            </p>
          </div>

          {/* Channel selector buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveChannel('whatsapp')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeChannel === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Bot</span>
            </button>

            <button
              onClick={() => setActiveChannel('sms')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeChannel === 'sms' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Low-Data SMS</span>
            </button>

            <button
              onClick={() => setActiveChannel('ivr')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeChannel === 'ivr' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Voice / IVR Call</span>
            </button>
          </div>
        </div>

        {/* 1. WHATSAPP BOT INTERFACE */}
        {activeChannel === 'whatsapp' && (
          <div className="pt-4 max-w-lg mx-auto">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              {/* WhatsApp Header */}
              <div className="bg-emerald-800 px-4 py-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-base border border-emerald-400/40">
                    🌍
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight flex items-center gap-1">
                      <span>ClimateBuddy Official</span>
                      <span className="text-[10px] bg-emerald-700 px-1 rounded">BOT</span>
                    </div>
                    <span className="text-[10px] text-emerald-200">Online · Powered by AI Studio</span>
                  </div>
                </div>
                <div className="text-[11px] text-emerald-200 font-mono">
                  +91 80-CLIMATE
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="p-4 space-y-3 bg-[#0d1418] min-h-[300px] max-h-[380px] overflow-y-auto text-xs">
                {waMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-[#005c4b] text-slate-100 rounded-tr-none'
                          : 'bg-[#202c33] text-slate-200 rounded-tl-none border border-slate-800'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] text-slate-400 block text-right mt-1">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendWa} className="p-2.5 bg-[#202c33] border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask: 'Should I water today?' or 'Is cycling safe?'"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="flex-1 bg-[#111b21] text-slate-100 text-xs px-3 py-2 rounded-lg border border-slate-700/60 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. LOW-DATA SMS SIMULATOR */}
        {activeChannel === 'sms' && (
          <div className="pt-4 max-w-lg mx-auto space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">GSM 7-bit Plain Text SMS Dispatch</span>
                <span className="font-mono text-emerald-400">144 / 160 Characters (1 SMS)</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs text-slate-200 leading-relaxed">
                {smsText}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Targeted at feature phones with zero 4G/5G data connectivity.
                </span>
                <button
                  onClick={copySms}
                  className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy SMS Text'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/60 text-xs text-emerald-300 flex items-start gap-2">
              <span className="text-base shrink-0">📡</span>
              <span>
                <strong>Rural Agri-Relay:</strong> SMS alerts are triggered when IMD rain confidence passes 85% or heat index crosses 40°C, reaching local panchayats without latency.
              </span>
            </div>
          </div>
        )}

        {/* 3. INTERACTIVE VOICE RESPONSE (IVR) */}
        {activeChannel === 'ivr' && (
          <div className="pt-4 max-w-md mx-auto space-y-4 text-center">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-700/60 mx-auto flex items-center justify-center text-2xl text-emerald-400">
                📞
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Interactive Voice Response (IVR)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Automated audio broadcast in Kannada, Hindi, and English for low-literacy communities.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono text-left">
                "ನಮಸ್ಕಾರ! ಕ್ಲೈಮೇಟ್ ಬಡ್ಡಿ ದಿನದ ಹವಾಮಾನ ಸಲಹೆ: ಇಂದು ಸಂಜೆ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ೬೮% ಇದೆ. ನಿಮ್ಮ ಪಂಪ್ ಆನ್ ಮಾಡುವುದನ್ನು ತಡೆಯಿರಿ..."
              </div>

              <button
                onClick={onPlayAudioBrief}
                className={`w-full cursor-pointer py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isPlayingAudio
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Hang Up / Stop Voice Call</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Simulate Incoming IVR Voice Call</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
