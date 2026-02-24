import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              currentStep > step.number
                ? "gradient-primary text-primary-foreground"
                : currentStep === step.number
                ? "border-2 border-primary text-primary"
                : "border border-border text-muted-foreground"
            }`}>
              {currentStep > step.number ? <Check className="h-3.5 w-3.5" /> : step.number}
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-1.5 h-[2px] w-6 sm:w-10 transition-colors ${currentStep > step.number ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        {steps.map((step) => (
          <p key={step.number} className={`text-[10px] ${currentStep >= step.number ? "text-foreground" : "text-muted-foreground"}`}>
            {step.title}
          </p>
        ))}
      </div>
    </div>
  );
}
