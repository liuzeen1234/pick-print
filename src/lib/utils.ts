import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 className，支持条件类名并自动处理 Tailwind 冲突。
 * 用法：cn("px-2", isActive && "bg-brand", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
