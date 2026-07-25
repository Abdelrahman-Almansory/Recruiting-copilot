import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "outline" | "secondary";
export type ButtonSize = "default" | "sm" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-slate-100 text-slate-950 hover:bg-slate-200 dark:bg-slate-100 dark:text-slate-950",
  outline:
    "border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-5 py-2.5 text-sm",
  sm: "h-9 rounded-md px-3 text-sm",
  lg: "h-12 rounded-xl px-6 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
