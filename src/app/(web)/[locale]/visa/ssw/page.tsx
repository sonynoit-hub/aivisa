import { createVisaStaticPage } from '../_common/VisaStaticPage';
import SswDocs from '@/features/visa/SswDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';

export default createVisaStaticPage('specified-skilled-worker', 'ssw', SswDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('ssw'),
});
