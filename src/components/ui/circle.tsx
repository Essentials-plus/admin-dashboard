import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { HTMLAttributes, forwardRef } from 'react';

type CircleProps = {
  asChild?: boolean;
} & HTMLAttributes<HTMLDivElement>;

const Circle = forwardRef<HTMLDivElement, CircleProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        ref={ref}
        className={cn(
          'aspect-square shrink-0 rounded-full overflow-hidden flex justify-center items-center',
          className
        )}
        {...props}
      />
    );
  }
);

Circle.displayName = 'Circle';

export default Circle;
