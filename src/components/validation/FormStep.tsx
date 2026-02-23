import { cn } from "@/lib/utils";

interface FormStepProps {
  children: React.ReactNode;
  active: boolean;
  direction: "left" | "right";
}

const FormStep = ({ children, active, direction }: FormStepProps) => (
  <div
    className={cn(
      "absolute inset-0 transition-all duration-300 ease-in-out",
      active
        ? "translate-x-0 opacity-100"
        : direction === "left"
        ? "-translate-x-full opacity-0"
        : "translate-x-full opacity-0"
    )}
  >
    {children}
  </div>
);

export default FormStep;
