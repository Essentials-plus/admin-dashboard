import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useField, useFormikContext } from 'formik';
import * as React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  // labelProps?: React.ComponentPropsWithoutRef<typeof Label>
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, id, helperText, children, ...props }, ref) => {
    const uniqueId = React.useId();

    const inputId = id || uniqueId;

    return (
      <div className={'grid grow gap-3'}>
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(
              props.disabled && 'opacity-50 disabled:pointer-events-none'
            )}
          >
            {label}
          </Label>
        )}
        <div className="relative">
          <input
            type={type}
            autoComplete="off"
            id={inputId}
            className={cn(
              'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-white/5 read-only:focus-visible:ring-0',
              className
            )}
            ref={ref}
            {...props}
          />
          {children}
        </div>
        {helperText}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface FormikInputProps extends Omit<InputProps, 'name'> {
  name: string;
  showError?: boolean;
}

const FormikInput = React.forwardRef<HTMLInputElement, FormikInputProps>(
  ({ name, className, showError = true, ...props }, ref) => {
    const { getFieldProps } = useFormikContext();
    const [, meta] = useField(name);

    const hasError = meta.error && meta.touched;

    return (
      <div>
        <Input
          {...props}
          {...getFieldProps(name)}
          className={cn(className, hasError && '!border-red-500')}
          name={name}
          ref={ref}
        />
        {showError && hasError && (
          <p className="mt-2 text-xs text-red-500">{meta.error}</p>
        )}
      </div>
    );
  }
);

FormikInput.displayName = 'FormikInput';

export { FormikInput, Input };
