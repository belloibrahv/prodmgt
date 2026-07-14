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
          <label htmlFor={inputId} className="text-xs font-semibold text-tva-ink-m">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tva-ink-m">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-tva-surface border border-tva-border rounded-8 px-3.5 py-2.5 text-[13px] text-tva-ink",
              "placeholder:text-tva-ink-m outline-none transition-colors duration-150",
              "focus:border-tva-red focus:bg-white",
              error && "border-tva-error",
              leftIcon && "pl-9",
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
          <label htmlFor={inputId} className="text-xs font-semibold text-tva-ink-m">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-tva-surface border border-tva-border rounded-8 px-3.5 py-2.5 text-[13px] text-tva-ink",
            "outline-none transition-colors duration-150 cursor-pointer appearance-none",
            "focus:border-tva-red focus:bg-white",
            "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b4f4f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_12px_center] pr-9",
            error && "border-tva-error",
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
          <label htmlFor={inputId} className="text-xs font-semibold text-tva-ink-m">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-tva-surface border border-tva-border rounded-8 px-3.5 py-2.5 text-[13px] text-tva-ink",
            "placeholder:text-tva-ink-m outline-none transition-colors duration-150 resize-y min-h-[80px]",
            "focus:border-tva-red focus:bg-white",
            error && "border-tva-error",
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
