import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
        destructive: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
        outline: "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300",
        success: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
        warning: "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }