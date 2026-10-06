import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrandSymbol } from "@/components/brand/BrandSymbol";
import { BrandLogo } from "@/components/brand/BrandLogo";

describe("Brand Components (Selected Concept 04)", () => {
  it("renders BrandSymbol with accessibility label", () => {
    render(<BrandSymbol size={32} />);
    const symbol = screen.getByLabelText("NotesReady Symbol");
    expect(symbol).toBeDefined();
    expect(symbol.getAttribute("width")).toBe("32");
    expect(symbol.getAttribute("height")).toBe("32");
  });

  it("renders BrandLogo with wordmark", () => {
    render(<BrandLogo showWordmark={true} />);
    expect(screen.getByText("NotesReady")).toBeDefined();
  });
});
