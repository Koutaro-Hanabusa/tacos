import { forwardRef, type ComponentPropsWithoutRef, type Ref } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";

const buttonSizes: Record<ButtonSize, string> = {
  default: "taco-button-size-default",
  sm: "taco-button-size-sm",
  lg: "taco-button-size-lg",
  icon: "taco-button-size-icon",
  "icon-xs": "taco-button-size-icon-xs",
  "icon-sm": "taco-button-size-icon-sm",
  "icon-lg": "taco-button-size-icon-lg",
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "primary",
  secondary: "secondary",
};

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  size?: ButtonSize;
  unstyled?: boolean;
  variant?: ButtonVariant;
};

type InternalButtonProps = Omit<ButtonProps, "variant"> & {
  variant: ButtonVariant | "danger";
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

const InternalButton = forwardRef(function InternalButton(
  { className, size = "default", unstyled = false, variant, ...props }: InternalButtonProps,
  ref: Ref<HTMLButtonElement>,
) {
  return (
    <button
      {...props}
      ref={ref}
      className={joinClassNames(
        unstyled ? "taco-button-unstyled" : "taco-button",
        unstyled ? undefined : buttonSizes[size],
        className,
      )}
      data-size={unstyled ? undefined : size}
      data-slot="button"
      data-variant={variant}
    />
  );
});

const Button = forwardRef(function Button(
  { variant = "primary", ...props }: ButtonProps,
  ref: Ref<HTMLButtonElement>,
) {
  return <InternalButton {...props} ref={ref} variant={variant} />;
});

type DangerButtonProps = Omit<ButtonProps, "variant">;

const DangerButton = forwardRef(function DangerButton(
  props: DangerButtonProps,
  ref: Ref<HTMLButtonElement>,
) {
  return <InternalButton {...props} ref={ref} variant="danger" />;
});

export {
  Button,
  DangerButton,
  buttonSizes,
  buttonVariants,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
  type DangerButtonProps,
};
