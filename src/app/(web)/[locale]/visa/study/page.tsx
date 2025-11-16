import { createVisaStaticPage, buildVisaStaticMetadata } from '../_common/VisaStaticPage';
import StudyDocs from '@/features/visa/StudyDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';
export default createVisaStaticPage('student', 'study', StudyDocs, { showHeaderIcon: false, showHeaderTitle: false, showSummary: false, showHtml: false, staticI18n: staticVisaPageMessages('study') });
export const generateMetadata = buildVisaStaticMetadata('student', 'study', { staticI18n: staticVisaPageMessages('study') });
