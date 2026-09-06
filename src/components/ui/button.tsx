import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg" | "xl";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none cursor-pointer";

    const variants = {
      primary:
        "bg-sky-600 text-white hover:bg-sky-700 shadow-sm hover:shadow active:bg-sky-800 focus-visible:ring-sky-500",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400",
      outline:
        "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-300",
      danger:
        "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 focus-visible:ring-rose-400",
      ghost:
        "text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-300",
      success:
        "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-5 text-base gap-2.5",
      xl: "h-14 px-6 text-lg font-semibold gap-3",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
