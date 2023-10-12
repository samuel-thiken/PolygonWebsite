import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import I18n, { locales, useI18n } from "../utils/I18n";
import { Language, LanguageContext } from "../utils/Language";
import { pages, PageType } from "../App";

export default function Header(): React.ReactElement {
  const languageContext = useContext(LanguageContext);
  const locale = languageContext.language;
  const availableLanguages = locales.filter((lang) => lang != locale);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { getI18nText } = useI18n();

  const changeLanguage = (event: React.MouseEvent): void => {
    event.preventDefault();
    const language: Language = event.currentTarget.getAttribute("data-language") as Language;
    languageContext.changeLanguage(language);
  };

  const expandMenu = (): void => {
    setMenuOpen(true);
  };
  const closeMenu = (): void => {
    setMenuOpen(false);
  };

  return (
    <header>
      <nav className="header-nav nav-desktop">
        <Link className="brand" to={"/"}>
          POLYGON
        </Link>
        {pages.filter(page => page.type === PageType.DEFAULT).map((page, i) => (
          <Link to={page.path} key={i} className={`link ${page.special ? "link-special" : ""}`}>
            {getI18nText(page.name)}
          </Link>
        ))}
      </nav>
      <nav className="header-nav nav-mobile">
        <button className="brand btn-no-btn" onClick={expandMenu}>
          <svg viewBox="0 0 100 80" width="40" height="40">
            <rect width="100" height="10" rx="3"></rect>
            <rect y="30" width="100" height="10" rx="3"></rect>
            <rect y="60" width="100" height="10" rx="3"></rect>
          </svg>
          POLYGON
        </button>
        <div className={`overlay ${isMenuOpen ? "overlay-active" : ""}`}>
          <button className="overlay-close" onClick={closeMenu}>
            &times;
          </button>
          <div className="overlay-content">
            <Link onClick={closeMenu} className="brand" to={"/"}>
              HOME
            </Link>
            {pages.filter(page => page.type === PageType.DEFAULT).map((page, i) => (
              <Link onClick={closeMenu} to={page.path} key={i} className={`link ${page.special ? "link-special" : ""}`}>
                {getI18nText(page.name)}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <div className="header-options">
        {availableLanguages.map((la, i) => (
          <button key={i} className="btn-no-btn p-2" type="button" data-language={la} onClick={changeLanguage}>
            <img className="language-flag-icon" src={`/assets/images/language/${la}.png`} alt={`${la} flag`} />
          </button>
        ))}
      </div>
    </header>
  );
}
