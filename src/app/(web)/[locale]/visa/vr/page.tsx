import { createVisaStaticPage } from '../_common/VisaStaticPage';
import VRDocs from '@/features/visa/VRDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';
export default createVisaStaticPage('visiting-relatives', 'vr', VRDocs, { showHeaderIcon: false, showHeaderTitle: false, showSummary: false, showHtml: false, staticI18n: staticVisaPageMessages('vr') });