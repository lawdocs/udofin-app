import { useOnboardingStore } from '../store/onboardingStore';

type LanguageCode = 'English' | 'Hindi' | 'Marathi' | 'Tamil' | 'Telugu';

type Translations = {
  [key: string]: {
    [lang in LanguageCode]: string;
  };
};

const translations: Translations = {
  'My Profile': {
    English: 'My Profile',
    Hindi: 'मेरी प्रोफ़ाइल',
    Marathi: 'माझी प्रोफाइल',
    Tamil: 'என் சுயவிவரம்',
    Telugu: 'నా ప్రొఫైల్',
  },
  'Welcome back 👋': {
    English: 'Welcome back 👋',
    Hindi: 'वापसी पर स्वागत है 👋',
    Marathi: 'परत स्वागत आहे 👋',
    Tamil: 'மீண்டும் வரவேற்கிறோம் 👋',
    Telugu: 'తిరిగి స్వాగతం 👋',
  },
  'Tap to authenticate': {
    English: 'Tap to authenticate',
    Hindi: 'प्रमाणित करने के लिए टैप करें',
    Marathi: 'प्रमाणित करण्यासाठी टॅप करा',
    Tamil: 'அங்கீகரிக்க தட்டவும்',
    Telugu: 'ప్రామాణీకరించడానికి నొక్కండి',
  },
  'Use PIN Instead': {
    English: 'Use PIN Instead',
    Hindi: 'इसके बजाय पिन का उपयोग करें',
    Marathi: 'त्याऐवजी पिन वापरा',
    Tamil: 'அதற்கு பதிலாக பின்னைப் பயன்படுத்தவும்',
    Telugu: 'బదులుగా పిన్‌ని ఉపయోగించండి',
  },
  'Enter your PIN': {
    English: 'Enter your PIN',
    Hindi: 'अपना पिन दर्ज करें',
    Marathi: 'तुमचा पिन प्रविष्ट करा',
    Tamil: 'உங்கள் பின்னை உள்ளிடவும்',
    Telugu: 'మీ పిన్‌ని నమోదు చేయండి',
  },
  'ACCOUNT MANAGEMENT': {
    English: 'ACCOUNT MANAGEMENT',
    Hindi: 'खाता प्रबंधन',
    Marathi: 'खाते व्यवस्थापन',
    Tamil: 'கணக்கு மேலாண்மை',
    Telugu: 'ఖాతా నిర్వహణ',
  },
  'SECURITY': {
    English: 'SECURITY',
    Hindi: 'सुरक्षा',
    Marathi: 'सुरक्षा',
    Tamil: 'பாதுகாப்பு',
    Telugu: 'భద్రత',
  },
  'NOTIFICATIONS & HELP': {
    English: 'NOTIFICATIONS & HELP',
    Hindi: 'सूचनाएं और सहायता',
    Marathi: 'सूचना आणि मदत',
    Tamil: 'அறிவிப்புகள் மற்றும் உதவி',
    Telugu: 'నోటిఫికేషన్‌లు & సహాయం',
  },
  'Logout': {
    English: 'Logout',
    Hindi: 'लॉग आउट',
    Marathi: 'लॉगआउट',
    Tamil: 'வெளியேறு',
    Telugu: 'లాగ్అవుట్',
  },
  'Language': {
    English: 'Language',
    Hindi: 'भाषा',
    Marathi: 'भाषा',
    Tamil: 'மொழி',
    Telugu: 'భాష',
  },
  'App Theme': {
    English: 'App Theme',
    Hindi: 'ऐप थीम',
    Marathi: 'अॅप थीम',
    Tamil: 'பயன்பாட்டு தீம்',
    Telugu: 'యాప్ థీమ్',
  },
  // Add more generic fallbacks so app doesn't break if a string is missing
};

/**
 * Hook to translate text based on the current language in the onboardingStore.
 */
export function useTranslation() {
  const language = useOnboardingStore((state) => state.language) as LanguageCode;

  const t = (key: string): string => {
    // If the key exists in our translation map, use the requested language.
    // Otherwise fallback to English, or finally just return the key itself.
    if (translations[key]) {
      return translations[key][language] || translations[key]['English'] || key;
    }
    return key;
  };

  return { t, language };
}
