import {
  getCreateCouponCodeMutationOptions,
  getUpdateCouponCodeMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getCouponCodeByIdQueryOptions } from '@/api-clients/admin-api-client/queries';
import {
  CreateCouponCodeSchema,
  CreateOrUpdateCouponCodeFormProps,
  createCouponCodeSchema,
} from '@/components/create-or-update-coupon-code-form/schema';

import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { FormikInput } from '@/components/ui/input';
import { FormikSelect } from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import {
  couponPolicyOptions,
  couponStatusOptions,
  couponTypeOptions,
} from '@/constants/coupon-code';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import { getApiErrorMessage } from '@/lib/utils';
import { Optionalize } from '@/types/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Formik } from 'formik';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const CreateOrUpdateCouponCodeForm = ({
  couponCodeId,
  onCreateOrUpdate,
  onApiError,
}: CreateOrUpdateCouponCodeFormProps) => {
  const couponCodeQuery = useQuery({
    ...getCouponCodeByIdQueryOptions({ id: couponCodeId! }),
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (couponCodeQuery.isError) {
      toast.error(getApiErrorMessage(couponCodeQuery.error), {
        id: 'couponCodeQueryError',
      });
      onApiError && onApiError();
    }
  }, [couponCodeQuery.error, couponCodeQuery.isError, onApiError]);

  const createCouponCodeMutation = useMutation({
    ...getCreateCouponCodeMutationOptions(),
    onSuccess(data) {
      toast.success(data.data.message);
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to create coupon code'));
      onApiError && onApiError();
    },
  });

  const updateCouponCodeMutation = useMutation({
    ...getUpdateCouponCodeMutationOptions(),
    onSuccess(data) {
      toast.success('Coupon code updated successfully');
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to update coupon code'));
      onApiError && onApiError();
    },
  });

  const initialValues: Optionalize<CreateCouponCodeSchema> = couponCodeQuery
    .data?.data || {
    code: '',
    name: '',
    policy: '',
    type: '',
    value: '',
    status: '',
  };

  if (!couponCodeQuery.data && couponCodeId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(createCouponCodeSchema)}
      onSubmit={async (values, actions) => {
        const parsedValue = createCouponCodeSchema.safeParse(values);

        if (parsedValue.success) {
          try {
            if (couponCodeId) {
              await updateCouponCodeMutation.mutateAsync({
                data: parsedValue.data,
                id: couponCodeId,
              });
              actions.resetForm({
                values: parsedValue.data,
              });
            } else {
              await createCouponCodeMutation.mutateAsync(parsedValue.data);
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
            <FormikInput name="name" label="Name" type="text" />
            <div className="grid gap-6 sm:grid-cols-2">
              <FormikInput name="code" label="Code" type="text" />
              <FormikInput name="value" label="Amount" type="number" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormikSelect
                name="type"
                options={couponTypeOptions}
                label="Coupon type"
                placeholder="Select coupon type"
              />
              <FormikSelect
                name="policy"
                options={couponPolicyOptions}
                label="Coupon policy"
                placeholder="Select coupon policy"
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormikSelect
                name="status"
                options={couponStatusOptions}
                label="Coupon status"
                placeholder="Select coupon status"
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
                disabled={!dirty && !!couponCodeId}
                type="submit"
                loading={isSubmitting}
              >
                {couponCodeId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default CreateOrUpdateCouponCodeForm;
