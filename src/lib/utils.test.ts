import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("合并多个类名", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("处理条件类名", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("后者覆盖冲突的 Tailwind 类", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
