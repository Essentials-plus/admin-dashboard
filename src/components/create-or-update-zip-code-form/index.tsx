import {
  getCreateZipCodeMutationOptions,
  getUpdateZipCodeMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getZipCodeByIdQueryOptions } from '@/api-clients/admin-api-client/queries';
import {
  CreateOrUpdateZipCodeFormProps,
  CreateZipCodeSchema,
  createZipCodeSchema,
  updateZipCodeSchema,
} from '@/components/create-or-update-zip-code-form/schema';

import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { FormikInput } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import { getApiErrorMessage } from '@/lib/utils';
import { Optionalize } from '@/types/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Formik } from 'formik';
import { Lightbulb } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const CreateOrUpdateZipCodeForm = ({
  zipCodeId,
  onCreateOrUpdate,
  onApiError,
}: CreateOrUpdateZipCodeFormProps) => {
  const formSchema = useMemo(
    () => (!!zipCodeId ? updateZipCodeSchema : createZipCodeSchema),
    [zipCodeId]
  );

  const zipCodeQuery = useQuery({
    ...getZipCodeByIdQueryOptions({ id: zipCodeId! }),
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (zipCodeQuery.isError) {
      toast.error(getApiErrorMessage(zipCodeQuery.error), {
        id: 'zipCodeQueryError',
      });
      onApiError && onApiError();
    }
  }, [zipCodeQuery.error, zipCodeQuery.isError, onApiError]);

  const createZipCodeMutation = useMutation({
    ...getCreateZipCodeMutationOptions(),
    onSuccess(data) {
      toast.success(data.data.message);
      onCreateOrUpdate && onCreateOrUpdate(data.data.data?.zipCode);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to create zip code'));
      onApiError && onApiError();
    },
  });

  const updateZipCodeMutation = useMutation({
    ...getUpdateZipCodeMutationOptions(),
    onSuccess(data) {
      toast.success('Zip code updated successfully');
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to update zip code'));
      onApiError && onApiError();
    },
  });

  const initialValues: Optionalize<CreateZipCodeSchema> = zipCodeQuery.data
    ?.data || {
    lockdownDay: '',
    zipCode: '',
  };

  if (!zipCodeQuery.data && zipCodeId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(formSchema)}
      onSubmit={async (values, actions) => {
        const parsedValue = formSchema.safeParse(values);

        if (parsedValue.success) {
          try {
            if (zipCodeId) {
              await updateZipCodeMutation.mutateAsync({
                data: parsedValue.data,
                id: zipCodeId,
              });
              actions.resetForm({
                values: parsedValue.data,
              });
            } else {
              await createZipCodeMutation.mutateAsync(parsedValue.data);
              actions.resetForm();
            }
          } catch (err) {
          } finally {
            actions.setSubmitting(false);
          }
        } else {
          toast.error(getApiErrorMessage(parsedValue.error));
          actions.setSubmitting(false);
        }
      }}
    >
      {({ handleSubmit, isSubmitting, dirty }) => (
        <form onSubmit={handleSubmit} className="mt-3">
          <BeforeUnloadComponent enabled={dirty} />
          <div className="grid max-h-[70vh] gap-6 overflow-y-auto p-0.5">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormikInput
                name="zipCode"
                label="Zip code"
                type="text"
                helperText={
                  !!zipCodeId ? null : (
                    <p className="-mt-1.5 flex items-center gap-1 text-xs text-foreground">
                      <Lightbulb className="size-4 shrink-0" /> Create range of
                      zip codes. Eg: 1000-2000
                    </p>
                  )
                }
              />
              <FormikInput
                name="lockdownDay"
                label="Lockdown day"
                type="number"
              />
            </div>
            <div className="flex justify-end gap-4 sm:space-x-0">
              <DialogClose asChild>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  variant={'secondary'}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={!dirty && !!zipCodeId}
                type="submit"
                loading={isSubmitting}
              >
                {zipCodeId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default CreateOrUpdateZipCodeForm;
