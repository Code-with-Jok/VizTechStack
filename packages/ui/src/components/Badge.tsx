import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ReactNode } from "react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive";
  className?: string;
  children?: React.ReactNode;
}

export function Badge({
  variant = "default",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        {
          "bg-primary/10 text-primary": variant === "default",
          "bg-secondary text-secondary-foreground": variant === "secondary",
          "bg-green-500/10 text-green-500": variant === "success",
          "bg-yellow-500/10 text-yellow-500": variant === "warning",
          "bg-destructive/10 text-destructive": variant === "destructive",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
