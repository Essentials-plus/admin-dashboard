/* eslint-disable @next/next/no-img-element */
import {
  ChefHat,
  ChevronLeft,
  Lightbulb,
  Plus,
  ShoppingBasket,
  Upload,
  X,
} from 'lucide-react';

import {
  getCreateMealMutationOptions,
  getUpdateMealMutationOptions,
  getUploadFileMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getMealByIdQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import {
  CreateMealSchema,
  CreateOrUpdateMealFormProps,
  createMealSchema,
} from '@/components/create-or-update-meal-form/schema';
import SearchIngredientsPopover from '@/components/search-ingredients-popover';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Circle from '@/components/ui/circle';
import { FormikInput, Input } from '@/components/ui/input';
import { FormikSelect } from '@/components/ui/select';
import { FormikTextarea } from '@/components/ui/textarea';
import { mealTaxPercentOptions, mealTypeOptions } from '@/constants/meal';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import { getApiErrorMessage } from '@/lib/utils';
import { MealTaxPercentEnum } from '@/types/api-responses/meal';
import { Optionalize } from '@/types/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ErrorMessage, Formik } from 'formik';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { toFormikValidationSchema } from 'zod-formik-adapter';

export default function CreateOrUpdateMealForm({
  mealId,
  onApiError,
  onCreateOrUpdate,
  defaultInitialValues = {},
  hideGoBackButton,
}: CreateOrUpdateMealFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const router = useRouter();

  const mealQuery = useQuery({
    ...getMealByIdQueryOptions({ id: mealId! }),
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (mealQuery.isError) {
      toast.error(getApiErrorMessage(mealQuery.error), {
        id: 'mealQueryError',
      });
      onApiError && onApiError();
    }
  }, [mealQuery.error, mealQuery.isError, onApiError]);

  const uploadFileMutation = useMutation({
    ...getUploadFileMutationOptions(),
    onError(error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to upload image. Please try again')
      );
    },
  });

  const createMealMutation = useMutation({
    ...getCreateMealMutationOptions(),
    onSuccess(data) {
      toast.success('Meal created successfully');
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to create meal'));
      onApiError && onApiError();
    },
  });

  const updateMealMutation = useMutation({
    ...getUpdateMealMutationOptions(),
    onSuccess(data) {
      toast.success('Meal updated successfully');
      onCreateOrUpdate && onCreateOrUpdate(data.data.data);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to update meal'));
      onApiError && onApiError();
    },
  });

  const mealData = mealQuery.data?.data;
  const initialValues: Optionalize<CreateMealSchema> = {
    ...((mealData && {
      ...mealData,
      taxPercent: mealData.taxPercent as MealTaxPercentEnum,
      label: mealData.label || '',
      subLabel: mealData.subLabel || '',
      shortDescription: mealData.shortDescription || '',
    }) || {
      meal: '',
      mealNumber: '',
      mealName: '',
      preparationMethod: [],
      cookingTime: '',
      tips: [],
      image: '',
      ingredients: [],
      taxPercent: mealTaxPercentOptions[0].value as MealTaxPercentEnum,
      shortDescription: '',
      label: '',
      subLabel: '',
    }),
    ...defaultInitialValues,
  };

  if (!mealQuery.data && mealId) {
    return <ApiStatusIndicator query={mealQuery} noData={false} />;
  }

  return (
    <Formik
      validationSchema={toFormikValidationSchema(createMealSchema)}
      initialValues={initialValues}
      onSubmit={async (values, actions) => {
        const formValues = values;
        if (!imageFile && !values.image) {
          actions.setFieldError('image', 'Image is required');
          return;
        }

        if (imageFile) {
          const data = new FormData();
          data.append('file', imageFile);

          await uploadFileMutation
            .mutateAsync({
              data,
            })
            .then((res) => {
              formValues.image = res.data.data?.location;
              actions.setFieldValue('image', res.data.data?.location);
            });
        }

        const parsedValue = createMealSchema.safeParse(formValues);

        if (parsedValue.success) {
          try {
            if (mealId) {
              await updateMealMutation.mutateAsync({
                data: parsedValue.data,
                id: mealId,
              });
              mealQuery.refetch();
              actions.resetForm({
                values: parsedValue.data,
              });
            } else {
              await createMealMutation.mutateAsync(parsedValue.data);
              actions.resetForm();
              setImageFile(null);
            }
          } finally {
            actions.setSubmitting(false);
          }
        } else {
          toast.error(getApiErrorMessage(parsedValue.error));
          actions.setSubmitting(false);
        }
      }}
    >
      {({ values, setFieldValue, submitForm, isSubmitting, dirty }) => (
        <div className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8">
          <BeforeUnloadComponent enabled={dirty} />
          <div className="grid flex-1 gap-4">
            <div className="flex items-center gap-4">
              {!hideGoBackButton && (
                <Button
                  onClick={router.back}
                  variant="outline"
                  size="icon"
                  className="size-7"
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Back</span>
                </Button>
              )}
              <h1 className="flex-1 shrink-0 grow text-base font-semibold tracking-tight lg:text-xl">
                {!mealId ? 'Create meal' : values.mealName}
              </h1>
              <div className="hidden shrink-0 items-center gap-2 md:ml-auto md:flex">
                <Button
                  disabled={!dirty && !!mealId && !imageFile}
                  loading={isSubmitting}
                  onClick={submitForm}
                  size="sm"
                >
                  {mealId ? 'Update' : 'Create'} Meal
                </Button>
              </div>
            </div>
            <div className="grid gap-4 lg:gap-8 xl:grid-cols-[auto_340px]">
              <div className="grid items-start gap-4 lg:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Meal Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <FormikInput
                        name="mealName"
                        type="text"
                        className="w-full"
                        label="Meal name"
                      />
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormikInput
                          name="mealNumber"
                          type="text"
                          className="w-full"
                          label="Meal number"
                        />
                        <div>
                          <FormikSelect
                            name="meal"
                            options={mealTypeOptions}
                            label="Meal type"
                            placeholder="Select meal type"
                          />
                        </div>
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormikSelect
                          options={mealTaxPercentOptions}
                          name="taxPercent"
                          label="Tax percent"
                          placeholder="Select tax percent"
                        />
                        <FormikInput name="cookingTime" label="Cooking time" />
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormikInput name="label" label="Label" />
                        <FormikInput name="subLabel" label="Sub-label" />
                      </div>
                      <FormikTextarea
                        name="shortDescription"
                        label="Short description"
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Meal Ingredients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <SearchIngredientsPopover
                        onSelect={(ingredient) => {
                          const prevIngredients = values.ingredients || [];

                          if (
                            prevIngredients.some(
                              (prevIngredient) =>
                                prevIngredient.id === ingredient.id
                            )
                          ) {
                            toast.warning(
                              `Ingredient "${ingredient.name}" is already added`
                            );
                            return;
                          }

                          setFieldValue('ingredients', [
                            ...(values.ingredients || []),
                            ingredient,
                          ]);
                        }}
                      />
                    </div>
                    <div className="mt-5 grid gap-2.5">
                      {values.ingredients && values.ingredients?.length > 0 ? (
                        values.ingredients?.map((ingredient) => (
                          <div
                            key={ingredient.id}
                            className="flex w-full items-center gap-2.5 overflow-hidden rounded-lg border border-muted p-2"
                          >
                            <Circle className="w-10 rounded-md bg-muted">
                              <ShoppingBasket className="size-5" />
                            </Circle>
                            <CardTitle className="inline-block truncate">
                              {ingredient.name}
                            </CardTitle>

                            <Button
                              size={'icon'}
                              variant={'ghost'}
                              className="ml-auto"
                              onClick={() => {
                                setFieldValue(
                                  'ingredients',
                                  (values.ingredients || []).filter(
                                    (prevIngredient) =>
                                      prevIngredient.id !== ingredient.id
                                  )
                                );
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="py-5 text-center text-sm text-muted-foreground">
                          No Ingredients added.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Meal Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();

                        const tipValueInput = (e.target as any).elements
                          ?.tipValue;
                        const tipValue = (
                          tipValueInput?.value || ''
                        ).trim() as string;

                        if (!tipValue) {
                          tipValueInput.value = '';
                          tipValueInput?.focus();
                          return;
                        }

                        const prevTips = values.tips || [];

                        if (
                          prevTips.some(
                            (prevTip) =>
                              prevTip.label.toLowerCase() ===
                              tipValue.toLowerCase()
                          )
                        ) {
                          toast.warning(`Tip "${tipValue}" is already added`);
                          return;
                        }

                        setFieldValue('tips', [
                          ...prevTips,
                          {
                            id: uuidv4(),
                            label: tipValue,
                          },
                        ]);
                        tipValueInput.value = '';
                        tipValueInput?.focus();
                      }}
                      className="flex items-center gap-2.5"
                    >
                      <Input
                        autoComplete="off"
                        name="tipValue"
                        placeholder="Add new tips"
                      />
                      <Button type="submit" size={'icon'} variant={'secondary'}>
                        <Plus className="size-4" />
                      </Button>
                    </form>
                    <div className="mt-5 grid gap-2.5">
                      {values.tips && values.tips.length > 0 ? (
                        values.tips?.map((tip) => (
                          <div
                            key={tip.id}
                            className="flex w-full items-center gap-1 overflow-hidden rounded-lg border border-muted p-2"
                          >
                            <Circle className="w-10 rounded-md bg-muted">
                              <Lightbulb className="size-5" />
                            </Circle>
                            <Input
                              className="w-full border-transparent p-0 px-1.5 shadow-none"
                              value={tip.label}
                              onChange={(e) => {
                                setFieldValue(
                                  'tips',
                                  values.tips?.map((prevTip) => {
                                    if (prevTip.id === tip.id) {
                                      return {
                                        ...prevTip,
                                        label: e.target.value,
                                      };
                                    }
                                    return prevTip;
                                  })
                                );
                              }}
                            />

                            <Button
                              size={'icon'}
                              variant={'ghost'}
                              className="ml-auto"
                              onClick={() => {
                                setFieldValue(
                                  'tips',
                                  (values.tips || []).filter(
                                    (prevTip) => prevTip.id !== tip.id
                                  )
                                );
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="py-5 text-center text-sm text-muted-foreground">
                          No Tips added.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Meal Preparation Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();

                        const preparationMethodInput = (e.target as any)
                          .elements?.preparationMethod;
                        const preparationMethod = (
                          preparationMethodInput?.value || ''
                        ).trim() as string;

                        if (!preparationMethod) {
                          preparationMethodInput.value = '';
                          preparationMethodInput?.focus();
                          return;
                        }

                        const prevreparationMethods =
                          values.preparationMethod || [];

                        if (
                          prevreparationMethods.some(
                            (prevPreparationMethod) =>
                              prevPreparationMethod.label.toLowerCase() ===
                              preparationMethod.toLowerCase()
                          )
                        ) {
                          toast.warning(
                            `Preparation method "${preparationMethod}" is already added`
                          );
                          return;
                        }

                        setFieldValue('preparationMethod', [
                          ...prevreparationMethods,
                          {
                            id: uuidv4(),
                            label: preparationMethod,
                          },
                        ]);
                        preparationMethodInput.value = '';
                        preparationMethodInput?.focus();
                      }}
                      className="flex items-center gap-2.5"
                    >
                      <Input
                        autoComplete="off"
                        name="preparationMethod"
                        placeholder="Add new preparation method"
                      />
                      <Button type="submit" size={'icon'} variant={'secondary'}>
                        <Plus className="size-4" />
                      </Button>
                    </form>
                    <div className="mt-5 grid gap-2.5">
                      {values.preparationMethod &&
                      values.preparationMethod.length > 0 ? (
                        values.preparationMethod?.map((preparationMethod) => (
                          <div
                            key={preparationMethod.id}
                            className="flex w-full items-center gap-1 overflow-hidden rounded-lg border border-muted p-2"
                          >
                            <Circle className="w-10 rounded-md bg-muted">
                              <ChefHat className="size-5" />
                            </Circle>
                            <Input
                              className="w-full border-transparent p-0 px-1.5 shadow-none"
                              value={preparationMethod.label}
                              onChange={(e) => {
                                setFieldValue(
                                  'preparationMethod',
                                  values.preparationMethod?.map(
                                    (prevPreparationMethod) => {
                                      if (
                                        prevPreparationMethod.id ===
                                        preparationMethod.id
                                      ) {
                                        return {
                                          ...prevPreparationMethod,
                                          label: e.target.value,
                                        };
                                      }
                                      return prevPreparationMethod;
                                    }
                                  )
                                );
                              }}
                            />

                            <Button
                              size={'icon'}
                              variant={'ghost'}
                              className="ml-auto"
                              onClick={() => {
                                setFieldValue(
                                  'preparationMethod',
                                  (values.preparationMethod || []).filter(
                                    (prevTip) =>
                                      prevTip.id !== preparationMethod.id
                                  )
                                );
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="py-5 text-center text-sm text-muted-foreground">
                          No Preparation method added.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid items-start gap-4 lg:gap-8">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Meal Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            setImageFile(files[0]);
                          }
                        }}
                        accept="image/*"
                      />
                      {imageFile ? (
                        <div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <div className="relative">
                            <Button
                              size={'icon'}
                              className="absolute right-2 top-2 size-6 rounded-md"
                              variant={'destructive'}
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageFile(null);
                              }}
                            >
                              <X className="size-3.5" />
                            </Button>
                            <img
                              src={URL.createObjectURL(imageFile)}
                              alt="Image"
                            />
                          </div>
                        </div>
                      ) : values.mealName && values.image ? (
                        <img
                          alt={values.mealName}
                          className="w-full"
                          src={values.image}
                        />
                      ) : (
                        <div className="flex aspect-square flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-dashed border-muted text-sm">
                          <Upload className="size-8 opacity-80" />
                          <p className="opacity-70">Upload Image</p>
                        </div>
                      )}
                    </label>
                    <ErrorMessage name="image">
                      {(errorMessage) => (
                        <p className="mt-2 text-xs text-red-500">
                          {errorMessage}
                        </p>
                      )}
                    </ErrorMessage>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="sticky bottom-0 left-0 z-50 flex w-full border-t border-muted bg-background py-3 md:hidden">
              <Button
                className="w-full"
                loading={isSubmitting}
                onClick={submitForm}
                disabled={!dirty && !!mealId && !imageFile}
              >
                {mealId ? 'Update' : 'Create'} Meal
              </Button>
            </div>
          </div>
        </div>
      )}
    </Formik>
  );
}
