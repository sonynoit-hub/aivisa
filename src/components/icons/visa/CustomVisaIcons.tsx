import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: props.strokeWidth ?? 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

// Helpers
const Head = () => (
  <>
    <circle cx="12" cy="8" r="3" />
    <path d="M6 20c0-2.5 3.5-4 6-4s6 1.5 6 4" />
  </>
);

// Student: head + graduation cap
export function StudentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4l8 4-8 4-8-4 8-4z" />
      <path d="M20 8v4" />
      <Head />
    </svg>
  );
}

// Engineer ・ Humanities ・ International: head + small globe
export function EngineerIntlIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <Head />
      <circle cx="17.5" cy="6.5" r="3" />
      <path d="M14.8 6.5h5.4M17.5 3.5c1.2 1.4 1.2 4.6 0 6M16 6.5c.5 1.2 2.5 1.2 3 0" />
    </svg>
  );
}

// Business Manager: briefcase
export function BusinessManagerIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 6h6v3H9z" />
      <rect x="3" y="9" width="18" height="11" rx="2" />
      <path d="M12 12v2" />
    </svg>
  );
}

// Skilled Labor: head + hard hat
export function SkilledLaborIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 9h8" />
      <path d="M7 9c.3-2.2 2.6-4 5-4s4.7 1.8 5 4" />
      <Head />
    </svg>
  );
}

// Technical Intern Training: clipboard + check
export function TechnicalInternIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4h6v3H9z" />
      <path d="M9 13l2 2 4-4" />
    </svg>
  );
}

// Trainee: notebook + pen
export function TraineeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="4" width="12" height="16" rx="2" />
      <path d="M8 8h6M8 12h6M8 16h4" />
      <path d="M18.5 6.5l1.5 1.5-3 3H14v-3l3-3z" />
    </svg>
  );
}

// Care Worker: head + heart
export function CareWorkerIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <Head />
      <path d="M16.5 14.5c.9-1 2.6-1 3.5 0 .9-1 2.6-1 3.5 0 0 2.2-3.5 3.7-3.5 3.7s-3.5-1.5-3.5-3.7z" />
    </svg>
  );
}

// Specified Skilled Worker: badge + check
export function SpecifiedSkilledIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l3 2 3-2 2 3 3 1-1 3 1 3-3 1-2 3-3-2-3 2-2-3-3-1 1-3-1-3 3-1 2-3z" />
      <path d="M10 12l2 2 4-4" />
    </svg>
  );
}

// Highly Skilled Professional: award
export function HighlySkilledIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M10 12l-3 7 5-3 5 3-3-7" />
    </svg>
  );
}

// Permanent Resident: home
export function PermanentResidentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

// Spouse of Japanese National: couple
export function SpouseJapaneseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8" cy="8" r="2.5" />
      <circle cx="16" cy="8" r="2.5" />
      <path d="M3 20c0-2 3-3 5-3s5 1 5 3M11 17c0-2 3-3 5-3s5 1 5 3" />
    </svg>
  );
}

// Spouse of Permanent Resident: couple variant (closer)
export function SpousePRIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="2.5" />
      <circle cx="13" cy="8" r="2.5" />
      <path d="M4 20c0-2 3-3 5-3s5 1 5 3M10 17c0-2 3-3 5-3s5 1 5 3" />
    </svg>
  );
}

// Long-term Resident: calendar + clock
export function LongTermResidentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 9h18" />
      <circle cx="16" cy="15" r="3" />
      <path d="M16 13v2l1 1" />
    </svg>
  );
}

// Dependent: head + plus
export function DependentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <Head />
      <path d="M18 6v4M16 8h4" />
    </svg>
  );
}

// Temporary Visitor: plane
export function TemporaryVisitorIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 13L2 7l2-2 9 5 7-1 2 2-6 3 1 6-2 2-3-7-5 9-2-2 5-8z" />
    </svg>
  );
}

// Designated Activities: badge + plus
export function DesignatedActivitiesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l3 2 3-2 2 3 3 1-1 3 1 3-3 1-2 3-3-2-3 2-2-3-3-1 1-3-1-3 3-1 2-3z" />
      <path d="M12 9v6M9 12h6" />
    </svg>
  );
}

// Categories
export function CatWorkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="8" width="18" height="11" rx="2" />
      <path d="M9 8V6h6v2" />
      <path d="M12 12v2" />
    </svg>
  );
}

export function CatStatusFamilyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M3 21c0-2.2 3.5-3.5 5-3.5S13 18.8 13 21M11 18.5c0-2.2 3.5-3.5 5-3.5s5 1.3 5 3.5" />
    </svg>
  );
}

export function CatStudyTrainingIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5l8 4-8 4-8-4 8-4z" />
      <path d="M20 9v4" />
      <path d="M6 17h12" />
    </svg>
  );
}

export function CatShortOthersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 8l9 5 11-3-5 6 1 6-5-4-5 4 2-6-4-8z" />
    </svg>
  );
}
