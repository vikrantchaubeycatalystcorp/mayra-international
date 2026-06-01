import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#E7F0EB] text-[#164A37]",
        secondary:
          "border-transparent bg-[#EEEAE1] text-[#6E6457]",
        destructive:
          "border-transparent bg-[#F8E7E0] text-[#B23A1E]",
        outline: "border-[#D8CFBE] text-[#574F45] bg-white",
        success:
          "border-transparent bg-[#E5F2EA] text-[#1F7A48]",
        warning:
          "border-transparent bg-[#FBF0D9] text-[#9A6410]",
        live: "border-transparent bg-[#B23A1E] text-white",
        blue: "border-transparent bg-[#E7F0EB] text-[#164A37]",
        orange: "border-[#EAD3A3] bg-[#FBEFD8] text-[#A96A0F]",
        purple: "border-transparent bg-[#DEF0F1] text-[#0E6E78]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
