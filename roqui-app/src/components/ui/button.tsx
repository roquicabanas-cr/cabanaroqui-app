import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-roqui-gold disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-roqui-gold text-roqui-black hover:bg-roqui-gold/90": variant === "default",
            "border border-roqui-gold/30 bg-transparent text-roqui-cream hover:bg-roqui-gold/10": variant === "outline",
            "bg-transparent text-roqui-cream hover:bg-roqui-cream/10": variant === "ghost",
            "bg-roqui-cream/10 text-roqui-cream hover:bg-roqui-cream/20": variant === "secondary",
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 text-sm": size === "sm",
            "h-12 px-6": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
