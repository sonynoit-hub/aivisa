import { createVisaStaticPage, buildVisaStaticMetadata } from '../_common/VisaStaticPage';
import CareDocs from '@/features/visa/CareDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';

export default createVisaStaticPage('care-worker', 'care', CareDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('care'),
});

export const generateMetadata = buildVisaStaticMetadata('care-worker', 'care', { staticI18n: staticVisaPageMessages('care') });
