import { confirm } from '@/components/confirm';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useElementSize } from '@mantine/hooks';
import { useFormikContext } from 'formik';
import { ComponentPropsWithoutRef, useEffect } from 'react';
import { Portal } from 'react-portal';

type FloatingFormActionsBarProps = {
  saveButton?: ButtonProps;
  discardButton?: ButtonProps;
  wrapper?: ComponentPropsWithoutRef<'div'>;
};

const FloatingFormActionsBar = ({
  discardButton,
  saveButton,
  wrapper,
}: FloatingFormActionsBarProps) => {
  const { dirty, submitForm, resetForm } = useFormikContext();
  const { ref, height } = useElementSize();

  useEffect(() => {
    const contentWrapper = document.getElementById('contentWrapper');
    if (!contentWrapper || !height || !dirty) return;

    contentWrapper.style.paddingBottom = `${height + 28 + 20}px`;

    return () => {
      contentWrapper.style.paddingBottom = `0px`;
    };
  }, [dirty, height]);

  return (
    <Portal>
      <div
        ref={ref}
        {...wrapper}
        className={cn(
          'fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-full flex items-center gap-1.5 border border-border bg-background p-1.5 duration-300',
          !dirty && 'translate-y-16 opacity-0 scale-125 pointer-events-none',
          '[&>button]:rounded-none [&>button:first-child]:rounded-l-full [&>button:last-child]:rounded-r-full',
          wrapper?.className
        )}
      >
        <Button onClick={submitForm} size={'sm'} {...saveButton}>
          Save changes
        </Button>
        <Button
          onClick={async () => {
            if (
              await confirm({
                description: 'All the changes will be reset.',
              })
            ) {
              resetForm();
            }
          }}
          size={'sm'}
          variant={'destructive'}
          {...discardButton}
        >
          Discard changes
        </Button>
      </div>
    </Portal>
  );
};

export default FloatingFormActionsBar;
