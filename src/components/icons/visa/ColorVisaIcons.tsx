import type { SVGProps } from 'react';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'color'> & { size?: number };

const svg = (props: IconProps) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: props.size ?? 24,
  height: props.size ?? 24,
  ...props,
});

// Palette (kept minimal and tasteful)
const COLORS = {
  cap: '#2F3640',
  tassel: '#F7C744',
  hairDark: '#5B4B3A',
  hairBrown: '#6B4F4F',
  skin: '#F2C7A1',
  skinAlt: '#F4D0AE',
  suit: '#2F3640',
  shirt: '#FFFFFF',
  tieBlue: '#3B82F6',
  tieRed: '#EF4444',
  scrubPink: '#F472B6',
  scrubPinkDark: '#EC407A',
  badge: '#FFFFFF',
  cross: '#EF4444',
};

// Single graduate (male-ish neutral)
export function StudentColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      {/* Cap */}
      <path d="M12 3l8 4-8 4-8-4 8-4z" fill={COLORS.cap} />
      <path d="M20 7v4" stroke={COLORS.tassel} strokeWidth={1.4} strokeLinecap="round" />
      {/* Head */}
      <circle cx="12" cy="10" r="3.2" fill={COLORS.skin} />
      {/* Hair fringe */}
      <path d="M9 9.2c.8-1.3 2.1-2 3-2 1 0 2.2.7 3 2" fill={COLORS.hairDark} />
      {/* Torso */}
      <path d="M6 20c0-2.2 3.6-3.8 6-3.8S18 17.8 18 20v.5H6V20z" fill={COLORS.suit} />
      <path d="M9.2 16.8h5.6v2.2H9.2z" fill={COLORS.shirt} />
      <path d="M12 16.6l1.1 2H10.9l1.1-2z" fill={COLORS.tieBlue} />
    </svg>
  );
}

// Two graduates (group)
export function StudentsColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      {/* Back person */}
      <path d="M7 4l6 3-6 3-6-3 6-3z" fill={COLORS.cap} />
      <path d="M13 7v3" stroke={COLORS.tassel} strokeWidth={1.2} strokeLinecap="round" />
      <circle cx="7" cy="11" r="2.6" fill={COLORS.skinAlt} />
      <path d="M4.9 18c0-1.8 2.6-3 4.2-3s4.2 1.2 4.2 3v.4H4.9V18z" fill={COLORS.suit} />

      {/* Front person */}
      <path d="M13 5.5l7 3.5-7 3.5-7-3.5 7-3.5z" fill={COLORS.cap} />
      <path d="M20 9v3.5" stroke={COLORS.tassel} strokeWidth={1.3} strokeLinecap="round" />
      <circle cx="13" cy="13.2" r="3" fill={COLORS.skin} />
      <path d="M10.5 12.6c.8-1.2 2-1.9 2.8-1.9.9 0 2 .7 2.8 1.9" fill={COLORS.hairBrown} />
      <path d="M8 22c0-2 3.2-3.4 5-3.4s5 1.4 5 3.4v.4H8V22z" fill={COLORS.suit} />
      <path d="M10.8 19h4.4v1.9h-4.4z" fill={COLORS.shirt} />
      <path d="M13 18.8l.9 1.8h-1.8l.9-1.8z" fill={COLORS.tieRed} />
    </svg>
  );
}

// Care worker / nurse
export function CareWorkerColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      {/* Cap with cross */}
      <path d="M7 6.5h10l1 2.5H6l1-2.5z" fill={COLORS.badge} />
      <path d="M12 7.4v2M11 8.4h2" stroke={COLORS.cross} strokeWidth={1.2} strokeLinecap="round" />
      {/* Head */}
      <circle cx="12" cy="12" r="3.2" fill={COLORS.skin} />
      {/* Hair and mask */}
      <path d="M8.5 11.2c.9-1.4 2.3-2.2 3.5-2.2s2.6.8 3.5 2.2" fill={COLORS.hairBrown} />
      <rect x="9" y="12" width="6" height="2.4" rx="1.2" fill={COLORS.badge} />
      {/* Scrub uniform */}
      <path d="M5 22c0-2.6 4-4.3 7-4.3s7 1.7 7 4.3v.5H5V22z" fill={COLORS.scrubPink} />
      <rect x="10.8" y="18.1" width="2.4" height="3" rx="0.6" fill={COLORS.scrubPinkDark} />
      {/* Name badge */}
      <rect x="7.6" y="18.6" width="3.2" height="1.6" rx="0.3" fill={COLORS.badge} />
    </svg>
  );
}

// Engineer ・ Humanities ・ International (avatar + globe badge)
export function EngineerIntlColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      {/* Head */}
      <circle cx="12" cy="9.8" r="3.1" fill={COLORS.skin} />
      <path d="M9.3 9.2c.8-1.2 2-1.9 2.7-1.9.9 0 1.9.7 2.7 1.9" fill={COLORS.hairDark} />
      {/* Torso */}
      <path d="M6 20c0-2.1 3.4-3.6 6-3.6s6 1.5 6 3.6v.5H6V20z" fill={COLORS.suit} />
      <path d="M9.4 16.9h5.2v2H9.4z" fill={COLORS.shirt} />
      <path d="M12 16.7l1 1.9h-2l1-1.9z" fill={COLORS.tieBlue} />
      {/* Globe badge */}
      <circle cx="18" cy="6" r="2.4" fill="#60A5FA" />
      <path d="M16.8 6h2.4M18 3.9c.9 1 .9 3.2 0 4.2M17 6c.4.8 2 .8 2.4 0" stroke="#0B5ED7" strokeWidth={0.8} fill="none" />
    </svg>
  );
}

// Business Manager (suit + badge)
export function BusinessManagerColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <circle cx="12" cy="9.6" r="3.1" fill={COLORS.skin} />
      <path d="M9.4 9c.8-1.2 2-1.8 2.6-1.8.8 0 1.9.6 2.6 1.8" fill={COLORS.hairBrown} />
      <path d="M6 20c0-2.1 3.4-3.6 6-3.6s6 1.5 6 3.6v.5H6V20z" fill={COLORS.suit} />
      <path d="M9.4 16.8h5.2v2H9.4z" fill={COLORS.shirt} />
      <path d="M12 16.6l1 1.9h-2l1-1.9z" fill={COLORS.tieBlue} />
      <rect x="15.8" y="17.3" width="2.6" height="1.8" rx="0.3" fill={COLORS.badge} />
    </svg>
  );
}

// Skilled Labor (avatar + hard hat)
export function SkilledLaborColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      {/* Helmet */}
      <path d="M7.5 9.2c.3-2 2.4-3.7 4.5-3.7s4.2 1.7 4.5 3.7H7.5z" fill="#FCD34D" />
      <rect x="7.3" y="9.2" width="9.4" height="1.2" fill="#EAB308" />
      {/* Head */}
      <circle cx="12" cy="12" r="3.1" fill={COLORS.skin} />
      {/* Torso */}
      <path d="M5.5 22c0-2.3 4-3.9 6.5-3.9s6.5 1.6 6.5 3.9v.5H5.5V22z" fill="#64748B" />
    </svg>
  );
}

// Specified Skilled Worker (badge + check + avatar hint)
export function SpecifiedSkilledColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <circle cx="12" cy="12" r="5.8" fill="#DBEAFE" />
      <path d="M8.8 12.2l2 2 4.2-4.2" stroke="#2563EB" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M10 20c0-1.8 2.8-3 4-3s4 1.2 4 3" fill="#C7D2FE" />
    </svg>
  );
}

// Highly Skilled Professional (award)
export function HighlySkilledColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <circle cx="12" cy="8.5" r="3.6" fill="#FDE68A" />
      <circle cx="12" cy="8.5" r="2.2" fill="#F59E0B" />
      <path d="M10 12.5l-3 6.8 5-2.7 5 2.7-3-6.8" fill="#F59E0B" />
    </svg>
  );
}

// Permanent Resident (home)
export function PermanentResidentColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <path d="M4 11.5l8-6.2 8 6.2" fill="#94A3B8" />
      <path d="M6 10.5v9.5h12v-9.5" fill="#E2E8F0" />
      <rect x="10" y="14" width="4" height="6" fill="#CBD5E1" />
    </svg>
  );
}

// Spouse of Japanese National (two avatars)
export function SpouseJapaneseColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      {/* Back */}
      <circle cx="8" cy="10" r="2.6" fill={COLORS.skinAlt} />
      <path d="M5.9 16.4c0-1.5 2.3-2.6 3.6-2.6s3.6 1.1 3.6 2.6v.4H5.9v-.4z" fill={COLORS.suit} />
      {/* Front */}
      <circle cx="14.5" cy="11.2" r="3" fill={COLORS.skin} />
      <path d="M12.4 10.6c.8-1.1 2-1.8 2.7-1.8s1.9.7 2.7 1.8" fill={COLORS.hairBrown} />
      <path d="M10.6 20.5c0-1.9 3-3.2 4.9-3.2s4.9 1.3 4.9 3.2v.4h-9.8v-.4z" fill={COLORS.suit} />
      <path d="M12.8 18h3.4v1.6h-3.4z" fill={COLORS.shirt} />
      <path d="M14.5 17.9l.8 1.6h-1.6l.8-1.6z" fill={COLORS.tieRed} />
    </svg>
  );
}

// Spouse of Permanent Resident (two avatars variant)
export function SpousePRColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <circle cx="9.5" cy="10.5" r="2.8" fill={COLORS.skin} />
      <circle cx="14.5" cy="11.2" r="2.6" fill={COLORS.skinAlt} />
      <path d="M6.8 18.6c0-1.7 2.8-2.9 4.5-2.9s4.5 1.2 4.5 2.9v.4H6.8v-.4z" fill={COLORS.suit} />
      <rect x="8.6" y="18.1" width="3.2" height="1.4" rx="0.3" fill={COLORS.shirt} />
    </svg>
  );
}

// Long-term Resident (calendar + clock)
export function LongTermResidentColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <rect x="3.2" y="5.4" width="17.6" height="15" rx="2" fill="#E5E7EB" />
      <rect x="3.2" y="9.2" width="17.6" height=".8" fill="#CBD5E1" />
      <rect x="6.2" y="4" width="1.8" height="3" rx="0.9" fill="#94A3B8" />
      <rect x="16" y="4" width="1.8" height="3" rx="0.9" fill="#94A3B8" />
      <circle cx="16.5" cy="15" r="2.8" fill="#BFDBFE" />
      <path d="M16.5 13.8v1.4l1 1" stroke="#1D4ED8" strokeWidth={1.2} fill="none" />
    </svg>
  );
}

// Dependent (avatar + plus badge)
export function DependentColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <circle cx="12" cy="10.2" r="3.1" fill={COLORS.skin} />
      <path d="M8.7 20.2c0-2 3.1-3.4 5.3-3.4 2.2 0 5.3 1.4 5.3 3.4v.4H8.7v-.4z" fill={COLORS.suit} />
      <circle cx="18.8" cy="7.2" r="2.2" fill="#DCFCE7" />
      <path d="M18.8 6.2v2M17.8 7.2h2" stroke="#22C55E" strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}

// Trainee (avatar + notebook)
export function TraineeColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <circle cx="12" cy="10.2" r="3.1" fill={COLORS.skin} />
      <path d="M9.2 9.6c.8-1.2 2-1.8 2.8-1.8.9 0 2 .6 2.8 1.8" fill={COLORS.hairDark} />
      <path d="M6.2 20.3c0-2 3.5-3.5 5.8-3.5s5.8 1.5 5.8 3.5v.4H6.2v-.4z" fill={COLORS.suit} />
      <rect x="5.2" y="6.6" width="5" height="6.4" rx="0.8" fill="#F8FAFC" stroke="#94A3B8" strokeWidth={0.8} />
      <path d="M6.3 8.3h3.1M6.3 10h3.1M6.3 11.7h2.4" stroke="#9CA3AF" strokeWidth={0.8} />
    </svg>
  );
}

// Technical Intern Training (clipboard + check)
export function TechnicalInternColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <rect x="6" y="4.2" width="12" height="15.2" rx="2" fill="#F1F5F9" />
      <rect x="9" y="4.2" width="6" height="2.6" rx="0.6" fill="#E2E8F0" />
      <path d="M9 12.8l2.1 2.1 4.1-4.1" stroke="#10B981" strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Temporary Visitor (plane)
export function TemporaryVisitorColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <path d="M3 9l8 4.5 10-2.6-4.6 5 .8 5.8-4.8-3.4-4.8 3.4 1.9-5.5L3 9z" fill="#93C5FD" />
    </svg>
  );
}

// Designated Activities (badge + plus)
export function DesignatedActivitiesColorIcon(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <circle cx="12" cy="12" r="6" fill="#E9D5FF" />
      <path d="M12 9.3v5.4M9.3 12h5.4" stroke="#7C3AED" strokeWidth={1.6} strokeLinecap="round" />
      <path d="M10 20c0-1.7 2.6-2.8 4-2.8s4 1.1 4 2.8" fill="#C4B5FD" />
    </svg>
  );
}
