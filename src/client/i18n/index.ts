import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 导入翻译文件
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enAbout from './locales/en/about.json';
import enUsers from './locales/en/users.json';
import zhCommon from './locales/zh-CN/common.json';
import zhHome from './locales/zh-CN/home.json';
import zhAbout from './locales/zh-CN/about.json';
import zhUsers from './locales/zh-CN/users.json';

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    about: enAbout,
    users: enUsers
  },
  'zh-CN': {
    common: zhCommon,
    home: zhHome,
    about: zhAbout,
    users: zhUsers
  }
};

i18n
  // 加载翻译文件的后端
  .use(Backend)
  // 语言检测
  .use(LanguageDetector)
  // React 绑定
  .use(initReactI18next)
  // 初始化
  .init({
    resources,
    fallbackLng: 'zh-CN',
    defaultNS: 'common',
    ns: ['common', 'home', 'about', 'users'],

    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      lookupCookie: 'i18nextLng',
      lookupLocalStorage: 'i18nextLng',
      caches: ['cookie', 'localStorage'],
    },

    interpolation: {
      escapeValue: false // React 已经安全地转义
    }
  });

export default i18n;
