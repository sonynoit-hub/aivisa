export type OfficeDetail = {
  id: string;
  slug: string;
  code?: string;
  name: string;
  shortDesc?: string;
  descriptionMd?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  address?:
    | string
    | {
        pref?: string;
        city?: string;
        zip?: string;
        line1?: string;
        line2?: string;
        country?: string;
      };
  languages?: string[]; // e.g., ['ja','en','zh']
  services?: string[];  // e.g., ['spouse','pr','study']
  badgeText?: string;   // e.g., '広告(PR)'
  badgeVariant?: string; // e.g., 'pr' | 'legal' | 'life' | 'career'
  sns?: Record<string, string>; // e.g., { x: 'https://x.com/..', line: '...', facebook: '...' }
};
