import type { VariantProps } from "class-variance-authority";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive rounded-none border border-transparent bg-clip-padding text-xs font-medium focus-visible:ring-1 aria-invalid:ring-1 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        primary:
          "border-taco-roja-strong bg-taco-roja-strong text-taco-cream hover:bg-taco-roja aria-expanded:bg-taco-roja",
        secondary:
          "border-taco-verde-strong bg-transparent text-taco-verde-strong hover:bg-taco-verde/10 aria-expanded:bg-taco-verde/10",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-none px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-none px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-3 text-sm has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        icon: "size-8",
        "icon-xs": "size-6 rounded-none [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-none",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

function Button({ className, variant = "primary", size = "default", ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

type DangerButtonProps = Omit<ButtonProps, "variant">;

function DangerButton({ className, ...props }: DangerButtonProps) {
  return (
    <Button
      {...props}
      className={cn(
        "border-taco-roja-strong bg-taco-roja-strong text-taco-cream hover:bg-taco-roja focus-visible:border-taco-roja-strong focus-visible:ring-taco-roja/30",
        className,
      )}
      variant="primary"
    />
  );
}

export { Button, buttonVariants, DangerButton };
