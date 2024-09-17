import {
  getCreateProductAttributeTermMutationOptions,
  getUpdateProductAttributeTermMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getProductAttributeTermByIdQueryOptions } from '@/api-clients/admin-api-client/queries';
import {
  CreateProductAttributeSchema,
  createProductAttributeSchema,
} from '@/components/create-or-update-product-attribute-form/schema';
import { CreateOrUpdateProductAttributeTermFormProps } from '@/components/create-or-update-product-attribute-term-form/schema';

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

const CreateOrUpdateProductAttributeTermForm = ({
  attributeTermId,
  onCreateOrUpdate,
  onApiError,
  attributeId,
}: CreateOrUpdateProductAttributeTermFormProps) => {
  const productAttributeTermQuery = useQuery({
    ...getProductAttributeTermByIdQueryOptions({ id: attributeTermId! }),
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (productAttributeTermQuery.isError) {
      toast.error(getApiErrorMessage(productAttributeTermQuery.error), {
        id: 'productAttributeTermQueryError',
      });
      onApiError && onApiError();
    }
  }, [
    productAttributeTermQuery.error,
    productAttributeTermQuery.isError,
    onApiError,
  ]);

  const createProductAttributeMutation = useMutation({
    ...getCreateProductAttributeTermMutationOptions(),
    onSuccess(data) {
      toast.success(`Product attribute term "${data.data.data.name}" created`);
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to create product attribute term')
      );
      onApiError && onApiError();
    },
  });

  const updateProductAttributeMutation = useMutation({
    ...getUpdateProductAttributeTermMutationOptions(),
    onSuccess(data) {
      toast.success('Product attribute term updated successfully');
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to update product attribute term')
      );
      onApiError && onApiError();
    },
  });

  const initialValues: Optionalize<CreateProductAttributeSchema> =
    productAttributeTermQuery.data?.data || {
      name: '',
    };

  if (!productAttributeTermQuery.data && attributeTermId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  const CloseButton = !!attributeTermId ? DialogClose : Fragment;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(createProductAttributeSchema)}
      onSubmit={async (values, actions) => {
        const parsedValue = createProductAttributeSchema.safeParse(values);

        if (parsedValue.success) {
          try {
            if (attributeTermId) {
              await updateProductAttributeMutation.mutateAsync({
                data: parsedValue.data,
                id: attributeTermId,
              });
              actions.resetForm({
                values: parsedValue.data,
              });
            } else {
              if (attributeId) {
                await createProductAttributeMutation.mutateAsync({
                  ...parsedValue.data,
                  productAttributeId: attributeId,
                });
                actions.resetForm();
              } else {
                toast.error('Attribute id not available');
              }
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
              <CloseButton {...(!!attributeTermId ? { asChild: true } : {})}>
                {!!attributeTermId && (
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
                disabled={!dirty && !!attributeTermId}
                type="submit"
                loading={isSubmitting}
              >
                {attributeTermId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default CreateOrUpdateProductAttributeTermForm;
