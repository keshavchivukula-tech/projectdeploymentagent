import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const id = React.useId()
    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="text-[13px] font-semibold text-[#4F566B] mb-1.5 block tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-[#E6EBF1] bg-white px-3.5 py-2 text-[14px] text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all placeholder:text-[#AAB7C4] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
