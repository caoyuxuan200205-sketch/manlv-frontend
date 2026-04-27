import React from 'react';

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const HomeIcon = ({ size = 22 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

export const TripIcon = ({ size = 22 }) => (
  <svg {...iconProps} width={size} height={size}>
    <rect x="3" y="8" width="18" height="13" rx="2" />
    <path d="M8 8V6a4 4 0 018 0v2" />
    <path d="M12 13v3" />
    <circle cx="12" cy="12.5" r="1" fill="currentColor" />
  </svg>
);

export const LearnIcon = ({ size = 22 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M12 3L2 8l10 5 10-5-10-5z" />
    <path d="M2 8v6c0 2.5 4.5 4.5 10 4.5S22 16.5 22 14V8" />
    <path d="M22 8v5" />
  </svg>
);

export const InboxIcon = ({ size = 22 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const ProfileIcon = ({ size = 22 }) => (
  <svg {...iconProps} width={size} height={size}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

// --- Page content icons ---

export const CalendarIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const LocationIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const ClockIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15.5 15.5" />
  </svg>
);

export const TrainIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <rect x="4" y="3" width="16" height="13" rx="3" />
    <path d="M4 11h16" />
    <path d="M8 3v8" />
    <path d="M16 3v8" />
    <path d="M7 19l-2 2" />
    <path d="M17 19l2 2" />
    <path d="M7 19h10" />
  </svg>
);

export const HotelIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M2 21V5a2 2 0 012-2h16a2 2 0 012 2v16" />
    <path d="M2 21h20" />
    <path d="M10 21V10h8v11" />
    <rect x="6" y="8" width="3" height="3" />
  </svg>
);

export const PlaneIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.71 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.62 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.6a16 16 0 006.29 6.29l.95-.95a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

export const SearchIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const LockIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

export const EyeIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const PhoneIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.71 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.62 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.6a16 16 0 006.29 6.29l.95-.95a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

export const BackIcon = ({ size = 20 }) => (
  <svg {...iconProps} width={size} height={size}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const SendIcon = ({ size = 16 }) => (
  <svg {...iconProps} width={size} height={size}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none" />
  </svg>
);

export const BotIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <rect x="3" y="8" width="18" height="13" rx="2" />
    <path d="M9 11v2M15 11v2" />
    <path d="M9 16h6" />
    <path d="M12 8V5" />
    <circle cx="12" cy="4" r="1" />
  </svg>
);

export const WarningIcon = ({ size = 16 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const CheckIcon = ({ size = 16 }) => (
  <svg {...iconProps} width={size} height={size}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const ChevronRightIcon = ({ size = 16 }) => (
  <svg {...iconProps} width={size} height={size}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const MailIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const StarIcon = ({ size = 16 }) => (
  <svg {...iconProps} width={size} height={size}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const TrendIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const BookmarkIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

export const MapIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

export const SettingsIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export const CodeIcon = ({ size = 16 }) => (
  <svg {...iconProps} width={size} height={size}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const DownloadIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M12 3v11" />
    <polyline points="7 11 12 16 17 11" />
    <path d="M5 21h14" />
  </svg>
);

export const CopyIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M15 9V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h3" />
  </svg>
);

export const HashIcon = ({ size = 14 }) => (
  <svg {...iconProps} width={size} height={size}>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

export const UserAddIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

export const CloseIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const MinusIcon = ({ size = 18 }) => (
  <svg {...iconProps} width={size} height={size}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
