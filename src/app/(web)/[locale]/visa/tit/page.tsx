import { createVisaStaticPage } from '../_common/VisaStaticPage';
import TitDocs from '@/features/visa/TitDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';

export default createVisaStaticPage('technical-intern-training', 'tit', TitDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('tit'),
});
