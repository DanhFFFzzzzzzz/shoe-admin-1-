import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 text-base shadow-sm transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-gray-400 file:text-foreground selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
