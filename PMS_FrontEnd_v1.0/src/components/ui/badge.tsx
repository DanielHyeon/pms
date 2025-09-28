import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 overflow-hidden backdrop-blur-sm shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "border-transparent text-white shadow-lg [a&]:hover:shadow-xl [a&]:hover:-translate-y-0.5",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 shadow-lg [a&]:hover:shadow-xl",
        destructive:
          "border-transparent text-white [a&]:hover:shadow-xl [a&]:hover:-translate-y-0.5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 shadow-lg",
        outline:
          "text-foreground backdrop-blur-sm [a&]:hover:bg-accent [a&]:hover:text-accent-foreground shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  const getGradientStyle = () => {
    if (variant === "default") {
      return { background: 'var(--primary)' };
    }
    if (variant === "destructive") {
      return { background: 'var(--destructive)' };
    }
    return {};
  };

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      style={getGradientStyle()}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
