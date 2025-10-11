export const locales = ['ja', 'zh', 'en', 'vi', 'ko'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'ja';

export const ogLocaleMap: Record<Locale, string> = {
	ja: 'ja_JP',
	en: 'en_US',
	zh: 'zh_CN',
	ko: 'ko_KR',
	vi: 'vi_VN'
};
