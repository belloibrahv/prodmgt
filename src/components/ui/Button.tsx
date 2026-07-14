import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger" | "icon";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantClasses = {
  primary: "bg-tva-red text-white hover:bg-tva-red-dk active:scale-[0.98] hover:scale-[1.03] transition-all",
  outline: "bg-transparent text-tva-red border border-tva-red hover:bg-tva-red-xlt transition-all",
  ghost:   "bg-transparent text-tva-red hover:bg-tva-red-xlt transition-colors",
  danger:  "bg-tva-error text-white hover:bg-red-700 transition-all",
  icon:    "bg-transparent text-tva-ink-m hover:bg-tva-surface hover:text-tva-red transition-colors border border-transparent",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs rounded-full",
  md: "px-5 py-2 text-[13px] rounded-full",
  lg: "px-6 py-2.5 text-sm rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tva-red focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          variant === "icon" && "p-2 rounded-8",
          className,
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
