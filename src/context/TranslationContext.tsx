import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Language, PersonaType } from '../types';
import { TRANSLATIONS, LANGUAGES, getPersonaBrief } from '../data/translations';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Record<string, string>;
  getTranslation: (key: string, fallback?: string) => string;
  getBrief: (personaType: PersonaType) => any;
  availableLanguages: typeof LANGUAGES;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{
  children: ReactNode;
  initialLanguage?: Language;
}> = ({ children, initialLanguage = 'en' }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('climatebuddy_lang') as Language;
      if (stored && TRANSLATIONS[stored]) return stored;
    } catch {
      // ignore
    }
    return initialLanguage;
  });

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('climatebuddy_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // ignore
    }
  }, [language]);

  const currentTranslations = useMemo(() => {
    return TRANSLATIONS[language] || TRANSLATIONS.en;
  }, [language]);

  const getTranslation = useCallback((key: string, fallback?: string): string => {
    if (currentTranslations[key]) {
      return currentTranslations[key];
    }
    if (TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  }, [currentTranslations]);

  const getBrief = useCallback((personaType: PersonaType) => {
    return getPersonaBrief(language, personaType);
  }, [language]);

  const value = useMemo<TranslationContextType>(() => ({
    language,
    setLanguage,
    t: currentTranslations,
    getTranslation,
    getBrief,
    availableLanguages: LANGUAGES,
  }), [language, setLanguage, currentTranslations, getTranslation, getBrief]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
