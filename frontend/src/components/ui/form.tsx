import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import { cn } from "@/lib/utils";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TFieldPath extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TFieldPath;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, getValues, register, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);
  const fieldOrVal = getValues(fieldContext.name);

  // Ensure all values are present before attempting to access them
  if (!fieldContext.name) {
    throw new Error("useFormField should be used within a FormField");
  }

  const commonProps = {
    id: itemContext.id,
    name: fieldContext.name,
    form: itemContext.form,
    ref: register(fieldContext.name).ref,
    value: fieldOrVal,
    onChange: (e: any) => register(fieldContext.name).onChange(e.target.value), // Simplified for basic inputs
    onBlur: register(fieldContext.name).onBlur,
    disabled: itemContext.disabled,
    ...fieldState,
  };

  return {
    id: itemContext.id,
    name: fieldContext.name,
    disabled: itemContext.disabled,
    formItemId: itemContext.id,
    formDescriptionId: `${itemContext.id}-description`,
    formMessageId: `${itemContext.id}-message`,
    ...commonProps,
  };
};

type FormItemContextValue = {
  id: string;
  disabled?: boolean;
  form?: string; // Add form attribute if needed
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { formItemId, disabled } = useFormField();

  return (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
      // Add form attribute if needed, e.g., data-form={form}
      data-disabled={disabled ? "" : ""}
    />
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    form?: string;
  }
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  const { form } = props; // Destructure form from props

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        error && "text-destructive",
        className
      )}
      htmlFor={formItemId}
      {...props}
      // Add form attribute if needed
      data-form={form}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId, disabled } =
    useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        error
          ? `${formItemId}-error`
          : `${formItemId}-description`
      }
      aria-invalid={!!error}
      {...props}
      // Add aria-disabled if needed
      aria-disabled={disabled}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  const { formMessageId } = useFormField(); // Ensure formMessageId is available

  const derivedError = error ? String(error.message) : null;

  if (!derivedError) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId} // Use formMessageId here
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {derivedError}
      {children}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

// Controller component wrapper
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...fieldProps
}: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: fieldProps.name }}>
      <FormItem>
        {fieldProps.label && <FormLabel form={fieldProps.form}>{fieldProps.label}</FormLabel>}
        <Controller {...fieldProps} />
        {fieldProps.description && <FormDescription>{fieldProps.description}</FormDescription>}
        <FormMessage />
      </FormItem>
    </FormFieldContext.Provider>
  );
}

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
  FormFieldContext, // Export FormFieldContext
  FormItemContext, // Export FormItemContext
};
