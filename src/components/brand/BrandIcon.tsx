import React from "react";
import { BrandSymbol } from "./BrandSymbol";

interface BrandIconProps {
  size?: number;
  variant?: "light" | "dark" | "adaptive";
  className?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({
  size = 48,
  variant = "adaptive",
  className = "",
}) => {
  const containerClasses =
    variant === "light"
      ? "bg-white text-zinc-950 border border-zinc-200"
      : variant === "dark"
      ? "bg-zinc-950 text-white border border-zinc-800"
      : "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
      }}
      className={`inline-flex items-center justify-center shadow-xs transition-colors ${containerClasses} ${className}`}
    >
      <BrandSymbol size={Math.round(size * 0.62)} />
    </div>
  );
};
