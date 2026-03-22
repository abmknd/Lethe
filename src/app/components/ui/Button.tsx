import { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "create";
  children: ReactNode;
  showArrow?: boolean;
}

export function Button({
  variant = "primary",
  children,
  showArrow = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "group flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase font-light transition-colors duration-300";

  const variants = {
    primary: "text-[#6B6B6B] hover:text-[#7FFF00]",
    secondary: "text-[#6B6B6B] hover:text-[#7FFF00]",
    ghost: "text-[#6B6B6B] hover:text-[#7FFF00]",
    create: "text-[#7FFF00] border border-[#7FFF00] rounded-full px-4 py-1.5 hover:bg-[#7FFF00]/15",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
          strokeWidth={1.5}
        />
      )}
    </button>
  );
}
