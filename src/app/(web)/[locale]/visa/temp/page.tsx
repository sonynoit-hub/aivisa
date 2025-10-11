import { createVisaStaticPage } from '../_common/VisaStaticPage';
import TempDocs from '@/features/visa/TempDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';

export default createVisaStaticPage('temporary-visitor', 'temp', TempDocs, {
	showHeaderIcon: false,
	showHeaderTitle: false,
	showSummary: false,
	showHtml: false,
	staticI18n: staticVisaPageMessages('temp'),
});
