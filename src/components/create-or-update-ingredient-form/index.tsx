import {
  getCreateIngredientMutationOptions,
  getUpdateIngredientMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import {
  getIngredientByIdQueryOptions,
  getIngredientCategoriesQueryOptions,
} from '@/api-clients/admin-api-client/queries';
import {
  CreateIngredientSchema,
  CreateOrUpdateIngredientFormProps,
  createIngredientSchema,
} from '@/components/create-or-update-ingredient-form/schema';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { FormikInput } from '@/components/ui/input';
import { FormikSelect } from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import { ingredientsUnityTypeOptions } from '@/constants/ingredient';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import { getApiErrorMessage } from '@/lib/utils';
import { Optionalize } from '@/types/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Formik } from 'formik';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const CreateOrUpdateIngredientForm = ({
  ingredientId,
  onCreateOrUpdate,
  onApiError,
  defaultInitialValues = {},
}: CreateOrUpdateIngredientFormProps) => {
  const ingredientQuery = useQuery({
    ...getIngredientByIdQueryOptions({ id: ingredientId! }),
    gcTime: 0,
    retry: false,
  });

  const ingredientCategoriesQuery = useQuery({
    ...getIngredientCategoriesQueryOptions(),
  });

  const categoryOptions = useMemo(
    () =>
      (ingredientCategoriesQuery.data?.data || []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [ingredientCategoriesQuery.data?.data]
  );

  useEffect(() => {
    if (ingredientQuery.isError) {
      toast.error(getApiErrorMessage(ingredientQuery.error), {
        id: 'ingredientQueryError',
      });
      onApiError && onApiError();
    }
  }, [ingredientQuery.error, ingredientQuery.isError, onApiError]);

  const createIngredientMutation = useMutation({
    ...getCreateIngredientMutationOptions(),
    onSuccess(data) {
      toast.success('Ingredient created successfully');
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to create ingredient'));
      onApiError && onApiError();
    },
  });

  const updateIngredientMutation = useMutation({
    ...getUpdateIngredientMutationOptions(),
    onSuccess(data) {
      toast.success('Ingredient updated successfully');
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to update ingredient'));
      onApiError && onApiError();
    },
  });

  const ingredientData = ingredientQuery.data?.data;
  const initialValues: Optionalize<CreateIngredientSchema> = {
    ...(ingredientData
      ? {
          name: ingredientData.name,
          quantity: ingredientData.quantity,
          unit: ingredientData.unit as any,
          kcal: ingredientData.kcal,
          proteins: ingredientData.proteins,
          carbohydrates: ingredientData.carbohydrates,
          fats: ingredientData.fats,
          fiber: ingredientData.fiber,
          categoryId: ingredientData.categoryId,
        }
      : {
          name: '',
          quantity: '',
          unit: '',
          kcal: '',
          proteins: '',
          carbohydrates: '',
          fats: '',
          fiber: '',
          categoryId: '',
        }),
    ...defaultInitialValues,
  };

  if (!ingredientQuery.data && ingredientId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(createIngredientSchema)}
      onSubmit={async (values, actions) => {
        const parsedValue = createIngredientSchema.safeParse(values);

        if (parsedValue.success) {
          try {
            if (ingredientId) {
              await updateIngredientMutation.mutateAsync({
                data: parsedValue.data,
                id: ingredientId,
              });
              actions.resetForm({
                values: parsedValue.data,
              });
            } else {
              await createIngredientMutation.mutateAsync(parsedValue.data);
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
            <FormikInput name="name" label="Name" />
            <div className="grid gap-6 sm:grid-cols-2">
              <FormikInput name="quantity" label="Quantity" type="number" />
              <FormikSelect
                options={ingredientsUnityTypeOptions}
                name="unit"
                label="Unit"
                placeholder="Select unit type"
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormikInput name="kcal" label="Kcal" type="number" />
              <FormikInput name="proteins" label="Proteins" type="number" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormikInput
                name="carbohydrates"
                label="Carbohydrates"
                type="number"
              />
              <FormikInput name="fats" label="Fats" type="number" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormikInput name="fiber" label="Fiber" type="number" />
              <FormikSelect
                name="categoryId"
                label="Category"
                options={categoryOptions}
                placeholder="Select category"
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
                disabled={!dirty && !!ingredientId}
                type="submit"
                loading={isSubmitting}
              >
                {ingredientId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default CreateOrUpdateIngredientForm;
