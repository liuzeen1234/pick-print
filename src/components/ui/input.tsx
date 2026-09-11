import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

// 通用输入框，统一样式与聚焦态
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700",
          className,
        )}
        {...props}
      />
    );
  },
);
