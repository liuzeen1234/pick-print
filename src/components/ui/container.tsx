import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// 通用内容容器：统一最大宽度与内边距
export function Container({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-5xl px-4 sm:px-6", className)}
      {...props}
    />
  );
}
