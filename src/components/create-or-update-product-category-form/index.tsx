import {
  getCreateProductCategoryMutationOptions,
  getUpdateProductCategoryMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getProductCategoryByIdQueryOptions } from '@/api-clients/admin-api-client/queries';
import {
  CreateOrUpdateProductCategoryFormProps,
  CreateProductCategorySchema,
  createProductCategorySchema,
} from '@/components/create-or-update-product-category-form/schema';

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

const CreateOrUpdateProductCategoryForm = ({
  categoryId,
  onCreateOrUpdate,
  onApiError,
}: CreateOrUpdateProductCategoryFormProps) => {
  const productCategoryQuery = useQuery({
    ...getProductCategoryByIdQueryOptions({ id: categoryId! }),
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (productCategoryQuery.isError) {
      toast.error(getApiErrorMessage(productCategoryQuery.error), {
        id: 'productCategoryQueryError',
      });
      onApiError && onApiError();
    }
  }, [productCategoryQuery.error, productCategoryQuery.isError, onApiError]);

  const createProductCategoryMutation = useMutation({
    ...getCreateProductCategoryMutationOptions(),
    onSuccess(data) {
      toast.success(`Product category "${data.data.data.name}" created`);
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to create product category')
      );
      onApiError && onApiError();
    },
  });

  const updateProductCategoryMutation = useMutation({
    ...getUpdateProductCategoryMutationOptions(),
    onSuccess(data) {
      toast.success('Product category updated successfully');
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to update product category')
      );
      onApiError && onApiError();
    },
  });

  const initialValues: Optionalize<CreateProductCategorySchema> =
    productCategoryQuery.data?.data || {
      name: '',
    };

  if (!productCategoryQuery.data && categoryId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  const CloseButton = !!categoryId ? DialogClose : Fragment;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(createProductCategorySchema)}
      onSubmit={async (values, actions) => {
        const parsedValue = createProductCategorySchema.safeParse(values);

        if (parsedValue.success) {
          try {
            if (categoryId) {
              await updateProductCategoryMutation.mutateAsync({
                data: parsedValue.data,
                id: categoryId,
              });
              actions.resetForm({
                values: parsedValue.data,
              });
            } else {
              await createProductCategoryMutation.mutateAsync({
                ...parsedValue.data,
              });
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
              <CloseButton {...(!!categoryId ? { asChild: true } : {})}>
                {!!categoryId && (
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
                disabled={!dirty && !!categoryId}
                type="submit"
                loading={isSubmitting}
              >
                {categoryId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default CreateOrUpdateProductCategoryForm;
