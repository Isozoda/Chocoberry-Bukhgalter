import { useTranslation } from 'react-i18next'
import { changeLanguage } from '@i18n/index'

export function useLanguage() {
  const { i18n } = useTranslation()

  const setLanguage = async (lang: 'tg' | 'ru' | 'en') => {
    await changeLanguage(lang)
  }

  return { language: i18n.language, setLanguage }
}
