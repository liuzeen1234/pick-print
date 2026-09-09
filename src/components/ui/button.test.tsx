import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("渲染文本内容", () => {
    render(<Button>点击</Button>);
    expect(screen.getByRole("button", { name: "点击" })).toBeInTheDocument();
  });

  it("应用 outline 变体样式", () => {
    render(<Button variant="outline">边框</Button>);
    expect(screen.getByRole("button")).toHaveClass("border");
  });
});
