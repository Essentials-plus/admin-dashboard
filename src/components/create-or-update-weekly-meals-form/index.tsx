import {
  getCreateWeeklyMealsMutationOptions,
  getUpdateWeeklyMealsMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getWeeklyMealByIdQueryOptions } from '@/api-clients/admin-api-client/queries';
import {
  CreateOrUpdateWeeklyMealsFormProps,
  CreateWeeklyMealsSchema,
  createWeeklyMealsSchema,
  updateWeeklyMealsSchema,
} from '@/components/create-or-update-weekly-meals-form/schema';
import FloatingFormActionsBar from '@/components/floating-form-actions-bar';
import SearchMealsPopover from '@/components/search-meals-popover';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Circle from '@/components/ui/circle';
import { FormikInput } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import { mealTypeOptions } from '@/constants/meal';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import { getApiErrorMessage } from '@/lib/utils';
import { Optionalize } from '@/types/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Formik } from 'formik';
import { ChevronLeft, CookingPot, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { toast } from 'sonner';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const CreateOrUpdateWeeklyMealsForm = ({
  onApiError,
  onCreateOrUpdate,
  weekId,
}: CreateOrUpdateWeeklyMealsFormProps) => {
  const router = useRouter();

  const weeklyMealQuery = useQuery({
    ...getWeeklyMealByIdQueryOptions({ id: weekId! }),
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (weeklyMealQuery.isError) {
      toast.error(getApiErrorMessage(weeklyMealQuery.error), {
        id: 'weeklyMealQueryError',
      });
      onApiError && onApiError();
    }
  }, [weeklyMealQuery.error, weeklyMealQuery.isError, onApiError]);

  const initialValue: Optionalize<CreateWeeklyMealsSchema> = weeklyMealQuery
    .data?.data || {
    meals: [],
    week: '',
  };

  const createWeeklyMealsMutation = useMutation({
    ...getCreateWeeklyMealsMutationOptions(),
    onSuccess() {
      toast.success('Weekly meals created successfully');
      onCreateOrUpdate && onCreateOrUpdate();
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to create weekly meals'));
      onApiError && onApiError();
    },
  });

  const updateWeeklyMealsMutation = useMutation({
    ...getUpdateWeeklyMealsMutationOptions(),
    onSuccess() {
      toast.success('Weekly meals updated successfully');
      onCreateOrUpdate && onCreateOrUpdate();
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to update weekly meals'));
      onApiError && onApiError();
    },
  });

  if (!weeklyMealQuery.data && weekId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <Formik
      validationSchema={toFormikValidationSchema(
        weekId ? updateWeeklyMealsSchema : createWeeklyMealsSchema
      )}
      initialValues={initialValue}
      onSubmit={async (values, actions) => {
        const parsedValue = createWeeklyMealsSchema.safeParse(values);

        if (parsedValue.success) {
          try {
            if (weekId) {
              await updateWeeklyMealsMutation.mutateAsync({
                data: parsedValue.data,
                id: weekId,
              });
              actions.resetForm({
                values: parsedValue.data,
              });
            } else {
              await createWeeklyMealsMutation.mutateAsync(parsedValue.data);
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
      {({ setFieldValue, values, dirty, submitForm, isSubmitting }) => (
        <div className="container">
          <BeforeUnloadComponent enabled={dirty} />
          <div className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8">
            <div className="grid flex-1 gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={router.back}
                  variant="outline"
                  size="icon"
                  className="size-7"
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Back</span>
                </Button>
                <h1 className="flex-1 shrink-0 grow text-base font-semibold tracking-tight lg:text-xl">
                  {!weekId
                    ? 'Create weekly meals'
                    : `Update week ${values.week} meals`}
                </h1>
                <div className="hidden shrink-0 items-center gap-2 md:ml-auto md:flex">
                  <Button
                    disabled={!dirty && !!weekId}
                    loading={isSubmitting}
                    onClick={submitForm}
                    size="sm"
                  >
                    {weekId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid items-start gap-4 lg:gap-8">
              {!weekId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly meals details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormikInput
                      type="number"
                      label="Week number (1-52)"
                      name="week"
                    />
                  </CardContent>
                </Card>
              )}

              <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 1024: 2 }}>
                <Masonry gutter="24px">
                  {mealTypeOptions.map((option) => {
                    const meals = (values.meals || []).filter(
                      (meal) => meal.meal === option.value
                    );

                    return (
                      <Card key={option.value}>
                        <CardHeader>
                          <CardTitle className="capitalize">
                            {option.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SearchMealsPopover
                            mealType={option.value}
                            onSelect={(meal) => {
                              const prevMeals = values.meals || [];
                              if (
                                prevMeals.some(
                                  (prevMeal) => prevMeal.id === meal.id
                                )
                              ) {
                                toast.warning(
                                  `Meal "${meal.mealName}" already added to ${meal.meal}`
                                );
                                return;
                              }
                              setFieldValue('meals', [...prevMeals, meal]);
                            }}
                            inputProps={{
                              placeholder: `Search ${option.label.toLowerCase()}`,
                            }}
                          />
                          <div className="mt-5 grid gap-2.5">
                            {meals && meals?.length > 0 ? (
                              meals
                                .filter((meal) => meal.meal === option.value)
                                ?.map((meal) => (
                                  <div
                                    key={meal.id}
                                    className="flex w-full items-center gap-2.5 overflow-hidden rounded-lg border border-muted p-2"
                                  >
                                    <Circle className="w-10 rounded-md bg-muted">
                                      <CookingPot className="size-5" />
                                    </Circle>
                                    <CardTitle className="inline-block truncate">
                                      {meal.mealName}
                                    </CardTitle>

                                    <Button
                                      size={'icon'}
                                      variant={'ghost'}
                                      className="ml-auto"
                                      onClick={() => {
                                        setFieldValue(
                                          'meals',
                                          (values.meals || []).filter(
                                            (prevMeal) =>
                                              prevMeal.id !== meal.id
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
                                No{' '}
                                <span className="text-foreground">
                                  {option.label}
                                </span>{' '}
                                added.
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Masonry>
              </ResponsiveMasonry>
            </div>

            <div className="sticky bottom-0 left-0 z-50 flex w-full border-t border-muted bg-background py-3 md:hidden">
              <Button
                className="w-full"
                loading={isSubmitting}
                onClick={submitForm}
                disabled={!dirty && !!weekId}
              >
                {weekId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
          <FloatingFormActionsBar />
        </div>
      )}
    </Formik>
  );
};

export default CreateOrUpdateWeeklyMealsForm;
