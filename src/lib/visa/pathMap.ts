export const shortToCatalogSlug = {
  pr: 'permanent-resident',
  study: 'student',
  engineer: 'engineer-humanities-international',
  'hsp-i': 'highly-skilled-professional',
  'hsp-ii': 'highly-skilled-professional',
  dep: 'dependent',
  da: 'designated-activities',
  'pr-spouse': 'spouse-of-permanent-resident',
  'jp-spouse': 'spouse-of-japanese-national',
  ltr: 'long-term-resident',
  bm: 'business-manager',
  care: 'care-worker',
  skilled: 'skilled-labor',
  tit: 'technical-intern-training',
  temp: 'temporary-visitor',
  ssw: 'specified-skilled-worker',
  vr: 'visiting-relatives',
} as const;

export type ShortVisaKey = keyof typeof shortToCatalogSlug;

export const catalogToShort: Record<string, ShortVisaKey> = Object.fromEntries(
  Object.entries(shortToCatalogSlug).map(([k, v]) => [v, k as ShortVisaKey])
) as Record<string, ShortVisaKey>;

export function toShortPathFromSlug(catalogSlug: string): string {
  return catalogToShort[catalogSlug] || catalogSlug;
}
