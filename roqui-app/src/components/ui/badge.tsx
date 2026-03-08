import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-roqui-gold text-roqui-black": variant === "default",
          "bg-roqui-success text-white": variant === "success",
          "bg-roqui-gold/80 text-roqui-black": variant === "warning",
          "bg-roqui-danger text-white": variant === "danger",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
