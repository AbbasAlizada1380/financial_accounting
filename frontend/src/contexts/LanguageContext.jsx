import React, { createContext, useContext, useState, useEffect } from 'react';

// Import language files
import enTranslations from '../locales/en.json';
import faTranslations from '../locales/fa.json';

const LanguageContext = createContext();

const translations = {
  en: enTranslations,
  fa: faTranslations
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [direction, setDirection] = useState('ltr');

  // Load language from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
    setDirection(savedLanguage === 'fa' ? 'rtl' : 'ltr');
    
    // Update HTML direction and lang attributes
    document.documentElement.dir = savedLanguage === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLanguage;
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setDirection(newLanguage === 'fa' ? 'rtl' : 'ltr');
    localStorage.setItem('language', newLanguage);
    
    // Update HTML direction and lang attributes
    document.documentElement.dir = newLanguage === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = keys.reduce((obj, key) => obj?.[key], translations[language]);

    // If translation not found, fallback to English
    if (value === undefined) {
      value = keys.reduce((obj, key) => obj?.[key], translations.en);
    }

    // If still not found, return the key
    if (value === undefined) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    // Replace parameters in the translation
    if (typeof value === 'string') {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => params[param] || match);
    }

    return value;
  };

  const value = {
    language,
    direction,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};