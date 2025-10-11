import { createVisaStaticPage } from '../_common/VisaStaticPage';
import CareDocs from '@/features/visa/CareDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';

export default createVisaStaticPage('care-worker', 'care', CareDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('care'),
});
