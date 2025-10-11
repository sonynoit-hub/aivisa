import { createVisaStaticPage } from '../_common/VisaStaticPage';
import LtrDocs from '@/features/visa/LtrDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';

export default createVisaStaticPage('long-term-resident', 'ltr', LtrDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('ltr'),
});
