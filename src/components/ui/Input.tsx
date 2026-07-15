import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leftIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-tva-ink tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tva-ink-m pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-white border border-tva-border rounded-12 px-4 py-3 text-[14px] text-tva-ink",
              "placeholder:text-tva-ink-m outline-none transition-all duration-200",
              "focus:border-tva-red focus:ring-2 focus:ring-tva-red/10 focus:bg-white",
              "hover:border-tva-ink-m/30",
              error && "border-tva-error focus:ring-tva-error/10 focus:border-tva-error",
              leftIcon && "pl-10",
              className,
            )}
            {...props}
          />
        </div>
        {hint && !error && <p className="text-[11px] text-tva-ink-m">{hint}</p>}
        {error && <p className="text-[11px] text-tva-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-tva-ink tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-white border border-tva-border rounded-12 px-4 py-3 text-[14px] text-tva-ink",
            "outline-none transition-all duration-200 cursor-pointer appearance-none",
            "focus:border-tva-red focus:ring-2 focus:ring-tva-red/10 focus:bg-white",
            "hover:border-tva-ink-m/30",
            "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b4f4f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_14px_center] pr-10",
            error && "border-tva-error focus:ring-tva-error/10 focus:border-tva-error",
            className,
          )}
          {...props}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p className="text-[11px] text-tva-error">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-tva-ink tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-white border border-tva-border rounded-12 px-4 py-3 text-[14px] text-tva-ink",
            "placeholder:text-tva-ink-m outline-none transition-all duration-200 resize-y min-h-[100px]",
            "focus:border-tva-red focus:ring-2 focus:ring-tva-red/10 focus:bg-white",
            "hover:border-tva-ink-m/30",
            error && "border-tva-error focus:ring-tva-error/10 focus:border-tva-error",
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-[11px] text-tva-ink-m">{hint}</p>}
        {error && <p className="text-[11px] text-tva-error">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
