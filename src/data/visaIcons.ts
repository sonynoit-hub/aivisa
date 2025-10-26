import type { IconType } from 'react-icons';
import {
  PiGlobeHemisphereEastDuotone,
  PiBuildingsDuotone,
  PiToolboxDuotone,
  PiClipboardTextDuotone,
  PiHandHeartDuotone,
  PiSealCheckDuotone,
  PiMedalDuotone,
  PiHouseLineDuotone,
  PiUsersThreeDuotone,
  PiCalendarCheckDuotone,
  PiUserPlusDuotone,
  PiGraduationCapDuotone,
  PiNotebookDuotone,
  PiAirplaneTiltDuotone,
  PiIdentificationBadgeDuotone,
  PiBriefcaseDuotone,
  PiUsersDuotone,
  PiHeartDuotone,
} from 'react-icons/pi';
import type { VisaCategoryKey } from "./visaCategories";

export const visaIconBySlug: Record<string, IconType> = {
  // Work
  "engineer-humanities-international": PiGlobeHemisphereEastDuotone,
  "business-manager": PiBuildingsDuotone,
  "skilled-labor": PiToolboxDuotone,
  "technical-intern-training": PiClipboardTextDuotone,
  "care-worker": PiHandHeartDuotone,
  "specified-skilled-worker": PiSealCheckDuotone,
  "highly-skilled-professional": PiMedalDuotone,

  // Status/Family
  "permanent-resident": PiHouseLineDuotone,
  "spouse-of-japanese-national": PiUsersDuotone,
  "spouse-of-permanent-resident": PiUsersThreeDuotone,
  "long-term-resident": PiCalendarCheckDuotone,
  "dependent": PiUserPlusDuotone,

  // Study/Training
  "student": PiGraduationCapDuotone,
  "trainee": PiNotebookDuotone,

  // Short Stay / Others
  "visiting-relatives": PiHeartDuotone,
  "temporary-visitor": PiAirplaneTiltDuotone,
  "designated-activities": PiIdentificationBadgeDuotone,
};

export const categoryIconByKey: Record<VisaCategoryKey, IconType> = {
  work: PiBriefcaseDuotone,
  "status-family": PiUsersDuotone,
  "study-training": PiGraduationCapDuotone,
  "short-others": PiAirplaneTiltDuotone,
};
