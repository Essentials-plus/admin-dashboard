import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ButtonVariations } from '@/components/ui/button';
import { confirmable, createConfirmation } from 'react-confirm';

type ConfirmDialogProps = {
  title?: string;
  description?: string;
  coninuteButtonVariations?: ButtonVariations;
  cancelButtonVariations?: ButtonVariations;
};

const ConfirmDialog = ({
  description = 'This action is not reversable.',
  title = 'Are you sure?',
  coninuteButtonVariations,
  cancelButtonVariations,
  ...props
}: ConfirmDialogProps) => {
  const { show, proceed } = props as any;
  return (
    <AlertDialog open={show} onOpenChange={proceed}>
      <AlertDialogContent className="max-sm:w-[calc(100%-40px)]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-4">
          <AlertDialogAction
            className="m-0"
            onClick={() => proceed(true)}
            buttonVariations={coninuteButtonVariations}
          >
            Continue
          </AlertDialogAction>
          <AlertDialogCancel
            className="m-0"
            onClick={() => proceed(false)}
            buttonVariations={cancelButtonVariations}
          >
            Cancel
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const confirm = createConfirmation(confirmable(ConfirmDialog));
