import { createVisaStaticPage, buildVisaStaticMetadata } from '../_common/VisaStaticPage';
import EngineerDocs from '@/features/visa/EngineerDocs';
import { staticVisaPageMessages } from '@/i18n/messages/visaPages';
export default createVisaStaticPage('engineer-humanities-international', 'engineer', EngineerDocs, { showHeaderIcon: false, showHeaderTitle: false, showSummary: false, showHtml: false, staticI18n: staticVisaPageMessages('engineer') });
export const generateMetadata = buildVisaStaticMetadata('engineer-humanities-international', 'engineer', { staticI18n: staticVisaPageMessages('engineer') });
