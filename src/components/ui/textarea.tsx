import * as React from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useField, useFormikContext } from 'formik';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, label, helperText, ...props }, ref) => {
    const uniqueId = React.useId();

    const textAreaId = id || uniqueId;

    return (
      <div className="grid grow gap-3">
        {label && <Label htmlFor={textAreaId}>{label}</Label>}
        <textarea
          id={textAreaId}
          className={cn(
            'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface FormikTextareaProps extends Omit<TextareaProps, 'name'> {
  name: string;
  showError?: boolean;
}

const FormikTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormikTextareaProps
>(({ name, className, showError = true, ...props }, ref) => {
  const { getFieldProps } = useFormikContext();
  const [, meta] = useField(name);

  const hasError = meta.error && meta.touched;

  return (
    <div>
      <Textarea
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
});

FormikTextarea.displayName = 'FormikTextarea';

export { FormikTextarea, Textarea };
