import React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
  steps: string[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="relative flex justify-between w-full max-w-4xl mx-auto mb-16 px-4">
      {/* Background Line */}
      <div className="absolute top-4 left-0 w-full h-[1px] bg-[#E6EBF1] z-0" />
      
      {/* Progress Line */}
      <div 
        className="absolute top-4 left-0 h-[1px] bg-primary z-0 transition-all duration-500 ease-in-out" 
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep

        return (
          <div key={step} className="relative z-10 flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
                isCompleted
                  ? "bg-primary border-primary text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                  : isCurrent
                  ? "bg-white border-primary text-primary shadow-[0_0_15px_rgba(99,91,255,0.2)]"
                  : "bg-white border-[#E6EBF1] text-[#697386]"
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" strokeWidth={3.5} />
              ) : (
                <span className={cn(
                  "text-[14px] font-bold",
                  isCurrent ? "text-primary" : "text-[#7B8495]"
                )}>{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                "absolute top-11 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.08em] transition-colors duration-300",
                isCurrent ? "text-[#1A1F36]" : "text-[#697386]"
              )}
            >
              {step}
            </span>
          </div>
        )
      })}
    </div>
  )
}
