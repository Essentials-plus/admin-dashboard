import {
  getCreateIngredientCategoryMutationOptions,
  getUpdateIngredientCategoryMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getIngredientCategoryByIdQueryOptions } from '@/api-clients/admin-api-client/queries';
import {
  CreateIngredientCategorySchema,
  createIngredientCategorySchema,
  CreateOrUpdateIngredientCategoryFormProps,
} from '@/components/create-or-update-ingredient-category-form/schema';

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

const CreateOrUpdateIngredientCategoryForm = ({
  categoryId,
  onCreateOrUpdate,
  onApiError,
}: CreateOrUpdateIngredientCategoryFormProps) => {
  const ingredientCategoryQuery = useQuery({
    ...getIngredientCategoryByIdQueryOptions({ id: categoryId! }),
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (ingredientCategoryQuery.isError) {
      toast.error(getApiErrorMessage(ingredientCategoryQuery.error), {
        id: 'ingredientCategoryQueryError',
      });
      onApiError && onApiError();
    }
  }, [
    ingredientCategoryQuery.error,
    ingredientCategoryQuery.isError,
    onApiError,
  ]);

  const createIngredientCategoryMutation = useMutation({
    ...getCreateIngredientCategoryMutationOptions(),
    onSuccess(data) {
      toast.success(`Ingredient category "${data.data.data.name}" created`);
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to create ingredient category')
      );
      onApiError && onApiError();
    },
  });

  const updateIngredientCategoryMutation = useMutation({
    ...getUpdateIngredientCategoryMutationOptions(),
    onSuccess(data) {
      toast.success('Ingredient category updated successfully');
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to update ingredient category')
      );
      onApiError && onApiError();
    },
  });

  const initialValues: Optionalize<CreateIngredientCategorySchema> =
    ingredientCategoryQuery.data?.data || {
      name: '',
    };

  if (!ingredientCategoryQuery.data && categoryId) {
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
      validationSchema={toFormikValidationSchema(
        createIngredientCategorySchema
      )}
      onSubmit={async (values, actions) => {
        const parsedValue = createIngredientCategorySchema.safeParse(values);

        if (parsedValue.success) {
          try {
            if (categoryId) {
              await updateIngredientCategoryMutation.mutateAsync({
                data: parsedValue.data,
                id: categoryId,
              });
              actions.resetForm({
                values: parsedValue.data,
              });
            } else {
              await createIngredientCategoryMutation.mutateAsync({
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

export default CreateOrUpdateIngredientCategoryForm;
