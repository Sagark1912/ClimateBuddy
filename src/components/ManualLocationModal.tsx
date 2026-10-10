import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Navigation, X, Check, Loader2 } from 'lucide-react';
import { LocationProfile, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { searchLocations, LocationResult } from '../utils/api';

interface ManualLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: LocationProfile) => void;
  onUseLiveGPS: () => void;
  isLocatingGPS: boolean;
  language: Language;
}

export const ManualLocationModal: React.FC<ManualLocationModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  onUseLiveGPS,
  isLocatingGPS,
  language,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSearchResults([]);
      setHasSearched(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      // Uses Open-Meteo directly in APK mode, server route in dev/web
      const results = await searchLocations(q);
      setSearchResults(results as unknown as LocationProfile[]);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch(query);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col max-h-[88vh]"
        style={{ backgroundColor: 'var(--neu-base)', boxShadow: 'var(--neu-raised), 0 0 40px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 shrink-0" style={{ color: 'var(--accent-emerald)' }} />
            <h3 className="text-sm font-bold" style={{ color: '#e2e8f0' }}>
              {t.searchLocation || 'Set Your Location'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="neu-btn p-2 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ color: '#475569' }} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">

          {/* Live GPS Button */}
          <button
            type="button"
            onClick={() => {
              onUseLiveGPS();
              onClose();
            }}
            disabled={isLocatingGPS}
            className="neu-btn-primary w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold active:scale-95 disabled:opacity-60"
          >
            {isLocatingGPS ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.gpsAcquiring || 'Acquiring GPS Signal...'}</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>{t.useMyGps || 'Use My Live GPS Location'}</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-grow" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
            <span className="flex-shrink mx-3 text-xs uppercase font-medium" style={{ color: '#334155' }}>
              {t.orTypeManually || 'or search manually'}
            </span>
            <div className="flex-grow" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
          </div>

          {/* Search Input — live search as you type */}
          <form onSubmit={handleFormSubmit} className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
              {isSearching && (
                <Loader2 className="w-4 h-4 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent-emerald)' }} />
              )}
              <input
                ref={inputRef}
                type="text"
                inputMode="text"
                placeholder={t.searchPlaceholder || 'City, town or village… (e.g. Mysuru, Pune)'}
                value={query}
                onChange={handleQueryChange}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="words"
                spellCheck={false}
                enterKeyHint="search"
                className="neu-input pl-10 pr-10 py-3 text-sm"
              />
            </div>
            {/* Hidden submit to allow keyboard "Search" key */}
            <button type="submit" className="sr-only">Search</button>
          </form>

          {/* Results List */}
          {searchResults.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--neu-base-dark)', boxShadow: 'var(--neu-inset)' }}>
              <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#475569' }}>
                  {searchResults.length} {t.searchResults || 'Results'}
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {searchResults.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => { onSelectLocation(res); onClose(); }}
                    className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-all"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#94a3b8' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <div className="min-w-0">
                      <strong className="text-sm block font-semibold truncate" style={{ color: '#e2e8f0' }}>
                        {res.name}
                      </strong>
                      <span className="text-xs" style={{ color: '#475569' }}>
                        {res.state}{res.country ? `, ${res.country}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold shrink-0" style={{ color: 'var(--accent-emerald)' }}>
                      <span>Select</span>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasSearched && !isSearching && searchResults.length === 0 && query.trim().length >= 2 && (
            <div className="p-4 text-center text-xs rounded-xl" style={{ background: 'var(--neu-base-dark)', boxShadow: 'var(--neu-inset-sm)', color: '#475569' }}>
              No locations found for "<span style={{ color: '#94a3b8' }}>{query}</span>". Try another city or district.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
