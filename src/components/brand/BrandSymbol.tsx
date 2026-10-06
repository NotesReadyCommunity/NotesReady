import React from "react";

interface BrandSymbolProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export const BrandSymbol: React.FC<BrandSymbolProps> = ({
  size = 32,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NotesReady Symbol"
      {...props}
    >
      <path
        d="M18 16C18 11.5817 21.5817 8 26 8H35C39.4183 8 43 11.5817 43 16V38.5L62.2 11.9C64.6 8.5 68.6 6.5 72.8 6.5H74C78.4183 6.5 82 10.0817 82 14.5V84C82 88.4183 78.4183 92 74 92H65C60.5817 92 57 88.4183 57 84V61.5L37.8 88.1C35.4 91.5 31.4 93.5 27.2 93.5H26C21.5817 93.5 18 89.9183 18 85.5V16Z"
        fill="currentColor"
      />
    </svg>
  );
};
