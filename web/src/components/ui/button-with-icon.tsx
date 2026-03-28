"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonWithIconProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function ButtonWithIcon({ children, onClick, disabled, className, variant = "default" }: ButtonWithIconProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      className={cn(
        "relative text-sm font-medium rounded-full h-12 p-1 ps-6 pe-14 group transition-all duration-500 hover:ps-14 hover:pe-6 w-fit overflow-hidden cursor-pointer uppercase tracking-widest",
        className
      )}
    >
      <span className="relative z-10 transition-all duration-500">
        {children}
      </span>
      <div className={cn(
        "absolute right-1 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45",
        variant === "default" ? "bg-black text-white" : "bg-white text-black"
      )}>
        <ArrowUpRight size={16} />
      </div>
    </Button>
  );
}
