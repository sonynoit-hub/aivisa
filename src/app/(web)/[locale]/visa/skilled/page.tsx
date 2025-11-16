import { createVisaStaticPage, buildVisaStaticMetadata } from '../_common/VisaStaticPage';
import SkilledDocs from '@/features/visa/SkilledDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';

export default createVisaStaticPage('skilled-labor', 'skilled', SkilledDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('skilled'),
});
export const generateMetadata = buildVisaStaticMetadata('skilled-labor', 'skilled', { staticI18n: staticVisaPageMessages('skilled') });
