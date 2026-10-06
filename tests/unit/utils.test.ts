import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility helper", () => {
  it("merges class names correctly", () => {
    const result = cn("px-2 py-1", "bg-white", { "text-black": true, "hidden": false });
    expect(result).toBe("px-2 py-1 bg-white text-black");
  });

  it("handles tailwind class conflicts cleanly", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });
});
