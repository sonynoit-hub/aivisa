import { createVisaStaticPage, buildVisaStaticMetadata } from '../_common/VisaStaticPage';
import VRDocs from '@/features/visa/VRDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';
export default createVisaStaticPage('visiting-relatives', 'vr', VRDocs, { showHeaderIcon: false, showHeaderTitle: false, showSummary: false, showHtml: false, staticI18n: staticVisaPageMessages('vr') });
export const generateMetadata = buildVisaStaticMetadata('visiting-relatives', 'vr', { staticI18n: staticVisaPageMessages('vr') });