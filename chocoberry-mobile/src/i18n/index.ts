import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'

import tg from './locales/tg.json'
import ru from './locales/ru.json'
import en from './locales/en.json'

const LANG_KEY = 'chocoberry_lang'

const initI18n = async () => {
  let savedLang = 'tg'
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY)
    if (stored) savedLang = stored
  } catch {}

  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources: { tg: { translation: tg }, ru: { translation: ru }, en: { translation: en } },
    lng: savedLang,
    fallbackLng: 'tg',
    interpolation: { escapeValue: false },
  })
}

initI18n()

export const changeLanguage = async (lang: string) => {
  await i18n.changeLanguage(lang)
  await AsyncStorage.setItem(LANG_KEY, lang)
}

export default i18n
