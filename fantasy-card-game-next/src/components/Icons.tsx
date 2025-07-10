import React from "react";

interface IconProps {
  className?: string;
}

export const StrengthIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"
      strokeWidth="1"
    />
  </svg>
);

export const FinesseIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" strokeWidth="1" />
    <circle cx="12" cy="12" r="6" fill="none" strokeWidth="1.5" />
  </svg>
);

export const SpeedIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      strokeWidth="1"
    />
  </svg>
);

export const StarIcon: React.FC<IconProps & { filled: boolean }> = ({
  className,
  filled,
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
      strokeWidth="2"
    />
  </svg>
);
