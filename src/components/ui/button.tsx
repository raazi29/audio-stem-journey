import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: [
          "shadow-md hover:shadow-lg dark:border-white/20 light:border-blue-200/70",
          "dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
          "light:bg-indigo-600 light:text-white light:hover:bg-indigo-500",
          "light:border light:shadow-blue-200/50 light:hover:shadow-blue-300/50",
        ].join(" "),
        destructive: [
          "shadow-md hover:shadow-lg dark:border-white/20 light:border-red-200/70",
          "dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90",
          "light:bg-red-600 light:text-white light:hover:bg-red-500",
          "light:border light:shadow-red-200/50 light:hover:shadow-red-300/50",
        ].join(" "),
        outline: [
          "border shadow-sm hover:shadow-md",
          "dark:border-input dark:bg-background dark:hover:bg-accent dark:hover:text-accent-foreground dark:text-white dark:border-white/20",
          "light:border-slate-300 light:bg-white light:hover:bg-slate-100 light:text-slate-900",
        ].join(" "),
        secondary: [
          "shadow-md hover:shadow-lg dark:border-white/20 light:border-purple-200/70",
          "dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80",
          "light:bg-purple-100 light:text-purple-900 light:hover:bg-purple-200",
          "light:border light:shadow-purple-100/50 light:hover:shadow-purple-200/50",
        ].join(" "),
        ghost: [
          "hover:bg-accent",
          "dark:hover:text-accent-foreground dark:text-white",
          "light:text-slate-700 light:hover:text-slate-900 light:hover:bg-slate-100",
        ].join(" "),
        link: [
          "underline-offset-4 hover:underline",
          "dark:text-white", 
          "light:text-indigo-600 light:hover:text-indigo-800",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        data-variant={variant}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
