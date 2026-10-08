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
        d="M82 16C82 11.5817 78.4183 8 74 8H65C60.5817 8 57 11.5817 57 16V38.5L37.8 11.9C35.4 8.5 31.4 6.5 27.2 6.5H26C21.5817 6.5 18 10.0817 18 14.5V84C18 88.4183 21.5817 92 26 92H35C39.4183 92 43 88.4183 43 84V61.5L62.2 88.1C64.6 91.5 68.6 93.5 72.8 93.5H74C78.4183 93.5 82 89.9183 82 85.5V16Z"
        fill="currentColor"
      />
    </svg>
  );
};
