import React from "react";
import { useCookies } from "react-cookie";

export type Language = "fr" | "en";
const defaultLanguage: Language = "en";

export const LanguageContext = React.createContext<{
  language: Language;
  changeLanguage:(lang: Language) => void;
}>({
  language: defaultLanguage,
  changeLanguage: () => null
});

export function LanguageProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [cookies, setCookie] = useCookies(["language"]);
  const [language, changeLanguage] = React.useState<Language>(cookies.language || defaultLanguage);

  const handleChanges = (lang: Language): void => {
    setCookie("language", lang);
    changeLanguage(lang);
  };

  return <LanguageContext.Provider value={{ language, changeLanguage: handleChanges }}>{children}</LanguageContext.Provider>;
}
