import { createVisaStaticPage, buildVisaStaticMetadata } from '../_common/VisaStaticPage';
import BmDocs from '@/features/visa/BmDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';

export default createVisaStaticPage('business-manager', 'bm', BmDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('bm'),
});
export const generateMetadata = buildVisaStaticMetadata('business-manager', 'bm', { staticI18n: staticVisaPageMessages('bm') });
