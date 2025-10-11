import { createVisaStaticPage } from '../_common/VisaStaticPage';
import DepDocs from '@/features/visa/DepDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';
export default createVisaStaticPage('dependent', 'dep', DepDocs, { showHeaderIcon: false, showHeaderTitle: false, showSummary: false, showHtml: false, staticI18n: staticVisaPageMessages('dep') });
