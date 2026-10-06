import React from "react";
import { BrandSymbol } from "./BrandSymbol";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showWordmark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  className = "",
  showWordmark = true,
}) => {
  const symbolSize = size === "sm" ? 22 : size === "lg" ? 36 : 28;
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <BrandSymbol size={symbolSize} className="text-foreground shrink-0" />
      {showWordmark && (
        <span
          className={`font-semibold tracking-[-0.03em] text-foreground ${textSize}`}
          style={{ letterSpacing: "-0.03em" }}
        >
          NotesReady
        </span>
      )}
    </div>
  );
};
