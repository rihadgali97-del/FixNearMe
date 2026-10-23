import React, { createContext, useContext, useState, useEffect } from 'react';

const TRANSLATIONS = {
  en: {
    brandName: 'FixNearMe',
    tagline: 'Bahir Dar Neighborhood Problem Reporting',
    navDashboard: 'Dashboard',
    navExplore: 'Explore Reports',
    navReportProblem: 'Report a Problem',
    navAdmin: 'Municipality Admin',
    statsTotal: 'Total Reports',
    statsUnresolved: 'Unresolved Issues',
    statsInProgress: 'Under Repair',
    statsResolved: 'Resolved',
    searchPlaceholder: 'Search by issue, neighborhood, or landmark...',
    filterCategory: 'Category',
    filterStatus: 'Status',
    filterPriority: 'Priority',
    filterNeighborhood: 'Neighborhood',
    all: 'All',
    submitReport: 'Submit Problem Report',
    confirmProblem: 'Confirm This Issue',
    alreadyConfirmed: 'You Confirmed This',
    updatesTimeline: 'Resolution Timeline',
    locationDetails: 'Location & Landmarks',
    backToList: 'Back to Reports',
    adminLogin: 'Admin Access',
    demoBadge: 'BDU BiT Hackathon 2026',
    onlineStatus: 'API Online',
    offlineStatus: 'API Disconnected'
  },
  am: {
    brandName: 'ፊክስ ኒየር ሚ (FixNearMe)',
    tagline: 'የባህር ዳር ከተማ የሰፈር ችግሮች ሪፖርት ማድረጊያ',
    navDashboard: 'ዳሽቦርድ',
    navExplore: 'ሪፖርቶችን አስስ',
    navReportProblem: 'ችግር ሪፖርት አድርግ',
    navAdmin: 'የከተማው አስተዳደር',
    statsTotal: 'ጠቅላላ ሪፖርቶች',
    statsUnresolved: 'ያልተፈቱ ችግሮች',
    statsInProgress: 'በጥገና ላይ ያሉ',
    statsResolved: 'የተፈቱ ችግሮች',
    searchPlaceholder: 'በችግሩ አይነት፣ ሰፈር ወይም ምልክት ይፈልጉ...',
    filterCategory: 'ምድብ',
    filterStatus: 'ሁኔታ',
    filterPriority: 'አስቸኳይነት',
    filterNeighborhood: 'ሰፈር / ቀበሌ',
    all: 'ሁሉም',
    submitReport: 'ችግሩን መዝግብ',
    confirmProblem: 'ችግሩ እንዳለ አረጋግጥ',
    alreadyConfirmed: 'አረጋግጠዋል',
    updatesTimeline: 'የእድገት ሂደት ታሪክ',
    locationDetails: 'አካባቢ እና መለያ ምልክት',
    backToList: 'ወደ ሪፖርቶች ተመለስ',
    adminLogin: 'የአስተዳዳሪ መግቢያ',
    demoBadge: 'የባ/ዳር ዩኒቨርሲቲ ሃካቶን 2026',
    onlineStatus: 'ሰርቨር ይሰራል',
    offlineStatus: 'ግንኙነት ተቋርጧል'
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('fixnearme_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('fixnearme_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'am' : 'en'));
  };

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
