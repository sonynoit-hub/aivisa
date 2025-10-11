import { createVisaStaticPage } from '../_common/VisaStaticPage';
import HspIDocs from '@/features/visa/HspIDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';
export default createVisaStaticPage('highly-skilled-professional', 'hsp-i', HspIDocs, { showHeaderIcon: false, showHeaderTitle: false, showSummary: false, showHtml: false, staticI18n: staticVisaPageMessages('hsp-i') });
