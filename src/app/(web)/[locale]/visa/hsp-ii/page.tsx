import { createVisaStaticPage, buildVisaStaticMetadata } from '../_common/VisaStaticPage';
import HspIIDocs from '@/features/visa/HspIIDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';
export default createVisaStaticPage('highly-skilled-professional', 'hsp-ii', HspIIDocs, { showHeaderIcon: false, showHeaderTitle: false, showSummary: false, showHtml: false, staticI18n: staticVisaPageMessages('hsp-ii') });
export const generateMetadata = buildVisaStaticMetadata('highly-skilled-professional', 'hsp-ii', { staticI18n: staticVisaPageMessages('hsp-ii') });
