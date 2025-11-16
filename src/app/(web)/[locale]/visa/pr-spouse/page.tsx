import { createVisaStaticPage } from '../_common/VisaStaticPage';
import PrSpouseDocs from '@/features/visa/PrSpouseDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';
import { buildVisaStaticMetadata } from '../_common/VisaStaticPage';

export default createVisaStaticPage('spouse-of-permanent-resident', 'pr-spouse', PrSpouseDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('pr-spouse'),
});
export const generateMetadata = buildVisaStaticMetadata('spouse-of-permanent-resident', 'pr-spouse', { staticI18n: staticVisaPageMessages('pr-spouse') });
