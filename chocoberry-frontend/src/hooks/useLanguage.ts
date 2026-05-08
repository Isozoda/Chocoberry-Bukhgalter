import { useTranslation } from 'react-i18next'

export const useLanguage = () => {
  const { i18n } = useTranslation()

  const changeLanguage = (lang: 'tj' | 'ru' | 'en') => {
    i18n.changeLanguage(lang)
    localStorage.setItem('chocoberry_lang', lang)
  }

  const currentLang = i18n.language as 'tj' | 'ru' | 'en'

  return { changeLanguage, currentLang }
}
