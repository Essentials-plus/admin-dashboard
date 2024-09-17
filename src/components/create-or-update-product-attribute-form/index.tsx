import {
  getCreateProductAttributeMutationOptions,
  getUpdateProductAttributeMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getProductAttributeByIdQueryOptions } from '@/api-clients/admin-api-client/queries';
import {
  CreateOrUpdateProductAttributeFormProps,
  CreateProductAttributeSchema,
  createProductAttributeSchema,
} from '@/components/create-or-update-product-attribute-form/schema';

import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { FormikInput } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import { getApiErrorMessage } from '@/lib/utils';
import { Optionalize } from '@/types/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Formik } from 'formik';
import { Fragment, useEffect } from 'react';
import { toast } from 'sonner';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const CreateOrUpdateProductAttributeForm = ({
  attributeId,
  onCreateOrUpdate,
  onApiError,
}: CreateOrUpdateProductAttributeFormProps) => {
  const productAttributeQuery = useQuery({
    ...getProductAttributeByIdQueryOptions({ id: attributeId! }),
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (productAttributeQuery.isError) {
      toast.error(getApiErrorMessage(productAttributeQuery.error), {
        id: 'productAttributeQueryError',
      });
      onApiError && onApiError();
    }
  }, [productAttributeQuery.error, productAttributeQuery.isError, onApiError]);

  const createProductAttributeMutation = useMutation({
    ...getCreateProductAttributeMutationOptions(),
    onSuccess(data) {
      toast.success(`Product attribute "${data.data.data.name}" created`);
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to create product attribute')
      );
      onApiError && onApiError();
    },
  });

  const updateProductAttributeMutation = useMutation({
    ...getUpdateProductAttributeMutationOptions(),
    onSuccess(data) {
      toast.success('Product attribute updated successfully');
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to update product attribute')
      );
      onApiError && onApiError();
    },
  });

  const initialValues: Optionalize<CreateProductAttributeSchema> =
    productAttributeQuery.data?.data || {
      name: '',
    };

  if (!productAttributeQuery.data && attributeId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  const CloseButton = !!attributeId ? DialogClose : Fragment;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(createProductAttributeSchema)}
      onSubmit={async (values, actions) => {
        const parsedValue = createProductAttributeSchema.safeParse(values);

        if (parsedValue.success) {
          try {
            if (attributeId) {
              await updateProductAttributeMutation.mutateAsync({
                data: parsedValue.data,
                id: attributeId,
              });
              actions.resetForm({
                values: parsedValue.data,
              });
            } else {
              await createProductAttributeMutation.mutateAsync(
                parsedValue.data
              );
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
        <form onSubmit={handleSubmit}>
          <BeforeUnloadComponent enabled={dirty} />
          <div className="grid max-h-[70vh] gap-6 overflow-y-auto p-0.5">
            <div>
              <FormikInput name="name" label="Name" type="text" />
            </div>
            <div className="flex justify-end gap-4 sm:space-x-0">
              <CloseButton {...(!!attributeId ? { asChild: true } : {})}>
                {!!attributeId && (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    variant={'secondary'}
                  >
                    Cancel
                  </Button>
                )}
              </CloseButton>
              <Button
                disabled={!dirty && !!attributeId}
                type="submit"
                loading={isSubmitting}
              >
                {attributeId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default CreateOrUpdateProductAttributeForm;
