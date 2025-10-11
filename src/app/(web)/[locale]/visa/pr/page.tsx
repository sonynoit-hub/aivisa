import { createVisaStaticPage } from '../_common/VisaStaticPage';
import PrDocs from '@/features/visa/PrDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';
export default createVisaStaticPage('permanent-resident', 'pr', PrDocs, { showHeaderIcon: false, showHeaderTitle: false, showSummary: false, showHtml: false, staticI18n: staticVisaPageMessages('pr') });
