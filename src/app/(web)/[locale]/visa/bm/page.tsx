import { createVisaStaticPage } from '../_common/VisaStaticPage';
import BmDocs from '@/features/visa/BmDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';

export default createVisaStaticPage('business-manager', 'bm', BmDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('bm'),
});
