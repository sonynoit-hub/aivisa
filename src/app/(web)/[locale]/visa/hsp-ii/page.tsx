import { createVisaStaticPage } from '../_common/VisaStaticPage';
import HspIIDocs from '@/features/visa/HspIIDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';
export default createVisaStaticPage('highly-skilled-professional', 'hsp-ii', HspIIDocs, { showHeaderIcon: false, showHeaderTitle: false, showSummary: false, showHtml: false, staticI18n: staticVisaPageMessages('hsp-ii') });
