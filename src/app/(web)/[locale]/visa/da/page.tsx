import { createVisaStaticPage, buildVisaStaticMetadata } from '../_common/VisaStaticPage';
import DaDocs from '@/features/visa/DaDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';

export default createVisaStaticPage('designated-activities', 'da', DaDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('da'),
});

export const generateMetadata = buildVisaStaticMetadata('designated-activities', 'da', { staticI18n: staticVisaPageMessages('da') });
