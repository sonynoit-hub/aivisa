import { createVisaStaticPage } from '../_common/VisaStaticPage';
import PrSpouseDocs from '@/features/visa/PrSpouseDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';

export default createVisaStaticPage('spouse-of-permanent-resident', 'pr-spouse', PrSpouseDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('pr-spouse'),
});
