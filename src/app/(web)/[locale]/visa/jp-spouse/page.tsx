import { createVisaStaticPage, buildVisaStaticMetadata } from '../_common/VisaStaticPage';
import JpSpouseDocs from '@/features/visa/JpSpouseDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';

export default createVisaStaticPage('spouse-of-japanese-national', 'jp-spouse', JpSpouseDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('jp-spouse'),
});

export const generateMetadata = buildVisaStaticMetadata('spouse-of-japanese-national', 'jp-spouse', { staticI18n: staticVisaPageMessages('jp-spouse') });
