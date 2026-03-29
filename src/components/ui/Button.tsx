"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-navy",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            primary:
              "bg-green text-navy hover:bg-green-light active:scale-[0.98] shadow-[0_0_20px_rgba(0,230,118,0.15)]",
            secondary:
              "border border-green/20 bg-navy-lighter text-green-light hover:bg-green/10 hover:border-green/40",
            ghost: "text-slate-400 hover:bg-white/5 hover:text-white",
            danger: "bg-wrong text-white hover:brightness-110",
          }[variant],
          {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
          }[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
