import { getUpdateUserOptions } from '@/api-clients/admin-api-client/mutations';
import { getUserByIdQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import {
  UpdateUserSchema,
  updateUserSchema,
} from '@/components/edit-user-form/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Circle from '@/components/ui/circle';
import { FormikInput, Input } from '@/components/ui/input';
import { FormikSelect } from '@/components/ui/select';
import envs from '@/config/envs';
import {
  activityLevels,
  genders,
  goals,
  userStatusOptions,
} from '@/constants/user';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import { calculateUserCalorie, cn, getApiErrorMessage } from '@/lib/utils';
import { Optionalize } from '@/types/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Formik } from 'formik';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const EditUserForm = () => {
  const router = useRouter();

  const userId = router.query.userId as string;

  const userQuery = useQuery({
    ...getUserByIdQueryOptions({ id: userId! }),
    gcTime: 0,
    retry: false,
  });

  const updateUserMutation = useMutation({
    ...getUpdateUserOptions(),
    onSuccess() {
      toast.success('User info updated successfully');
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Failed to update user info'));
    },
  });

  useEffect(() => {
    if (userQuery.isError) {
      toast.error(getApiErrorMessage(userQuery.error), {
        id: 'userQueryError',
      });
    }
  }, [userQuery.error, userQuery.isError]);

  if (!userQuery.data) {
    return <ApiStatusIndicator noData={false} query={userQuery} />;
  }
  const userData = userQuery.data.data;
  const mealPlan = userData.plan;

  const userTotalCalNeed =
    (calculateUserCalorie(userData as any) as any) *
    (mealPlan?.numberOfDays ?? 0);

  //   const initialValues = updateUserSchema
  //     .strip()
  //     .omit({ password: true, email: true })
  //     .default({
  //       address: '',
  //       city: '',
  //       mobile: '',
  //       name: '',
  //       nr: '',
  //       profile: '',
  //       status: undefined,
  //       surname: '',
  //     })
  //     .parse(userQuery.data.data);
  const initialValues: Optionalize<UpdateUserSchema> = {
    address: userData.address || '',
    city: userData.city || '',
    mobile: userData.mobile || '',
    name: userData.name || '',
    nr: userData.nr || '',
    status: userData.status || '',
    surname: userData.surname || '',
    email: userData.email || '',
    addition: userData.addition || '',
    password: '',
  };
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, actions) => {
        const parsedValue = updateUserSchema.safeParse(values);

        if (parsedValue.success) {
          try {
            await updateUserMutation.mutateAsync({
              data: {
                ...parsedValue.data,
                password: parsedValue.data.password || undefined,
              },
              id: userId,
            });
            actions.resetForm({
              values: parsedValue.data,
            });
          } catch (err) {
          } finally {
            actions.setSubmitting(false);
          }
        } else {
          toast.error(getApiErrorMessage(parsedValue.error));
          actions.setSubmitting(false);
        }
      }}
      validationSchema={toFormikValidationSchema(updateUserSchema)}
    >
      {({ dirty, isSubmitting, submitForm, handleSubmit, values }) => {
        return (
          <form onSubmit={handleSubmit}>
            <div className="container">
              <BeforeUnloadComponent enabled={dirty} />
              <div className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8">
                <div className="grid flex-1 gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      onClick={router.back}
                      variant="outline"
                      size="icon"
                      className="size-7"
                    >
                      <ChevronLeft className="size-4" />
                      <span className="sr-only">Back</span>
                    </Button>
                    <h1 className="flex flex-1 shrink-0 grow items-center gap-2 text-base font-semibold tracking-tight lg:text-xl">
                      Update {`${userData.name}'s`} profile{' '}
                      {userData.verified && (
                        <svg
                          className="size-5 text-blue-500"
                          stroke="currentColor"
                          fill="currentColor"
                          stroke-width="0"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.007 2.10377C8.60544 1.65006 7.08181 2.28116 6.41156 3.59306L5.60578 5.17023C5.51004 5.35763 5.35763 5.51004 5.17023 5.60578L3.59306 6.41156C2.28116 7.08181 1.65006 8.60544 2.10377 10.007L2.64923 11.692C2.71404 11.8922 2.71404 12.1078 2.64923 12.308L2.10377 13.993C1.65006 15.3946 2.28116 16.9182 3.59306 17.5885L5.17023 18.3942C5.35763 18.49 5.51004 18.6424 5.60578 18.8298L6.41156 20.407C7.08181 21.7189 8.60544 22.35 10.007 21.8963L11.692 21.3508C11.8922 21.286 12.1078 21.286 12.308 21.3508L13.993 21.8963C15.3946 22.35 16.9182 21.7189 17.5885 20.407L18.3942 18.8298C18.49 18.6424 18.6424 18.49 18.8298 18.3942L20.407 17.5885C21.7189 16.9182 22.35 15.3946 21.8963 13.993L21.3508 12.308C21.286 12.1078 21.286 11.8922 21.3508 11.692L21.8963 10.007C22.35 8.60544 21.7189 7.08181 20.407 6.41156L18.8298 5.60578C18.6424 5.51004 18.49 5.35763 18.3942 5.17023L17.5885 3.59306C16.9182 2.28116 15.3946 1.65006 13.993 2.10377L12.308 2.64923C12.1078 2.71403 11.8922 2.71404 11.692 2.64923L10.007 2.10377ZM6.75977 11.7573L8.17399 10.343L11.0024 13.1715L16.6593 7.51465L18.0735 8.92886L11.0024 15.9999L6.75977 11.7573Z"></path>
                        </svg>
                      )}
                    </h1>
                    <div className="hidden shrink-0 items-center gap-2 md:ml-auto md:flex">
                      <Button
                        disabled={!dirty}
                        loading={isSubmitting}
                        onClick={submitForm}
                        size="sm"
                        type="submit"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid items-start gap-4 lg:gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>User basic information</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      <Circle className="relative w-24 bg-muted">
                        {userData.profile ? (
                          <Image
                            src={userData.profile}
                            alt={userData.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          userData.name[0]
                        )}
                      </Circle>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <FormikInput type="text" label="Name" name="name" />
                        <FormikInput
                          type="text"
                          label="Surname"
                          name="surname"
                        />
                        <FormikInput
                          type="text"
                          label="Address"
                          name="address"
                        />
                        <Input
                          type="text"
                          readOnly
                          label="Postalc Code"
                          defaultValue={userData.zipCode?.zipCode || '- - -'}
                        />
                        <FormikInput
                          type="text"
                          label="House number"
                          name="nr"
                        />
                        <FormikInput
                          type="text"
                          label="Addition"
                          name="addition"
                        />
                        <FormikInput type="text" label="City" name="city" />
                        <FormikInput type="text" label="Mobile" name="mobile" />
                        <div>
                          <FormikSelect
                            name="status"
                            options={userStatusOptions}
                            label="Status"
                            placeholder="Select status"
                            selectTrigger={{
                              className: cn(
                                values.status === 'blocked'
                                  ? '[&>span]:text-destructive'
                                  : ''
                              ),
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>User login info</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <FormikInput type="email" label="Email" name="email" />
                      <FormikInput
                        type="text"
                        label="Password"
                        name="password"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User subscription info</CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      <Input
                        defaultValue={userData.age || '-'}
                        readOnly
                        label={'Age'}
                      />
                      <Input
                        defaultValue={userData.weight || '-'}
                        readOnly
                        label={'Weight (kg):'}
                      />
                      <Input
                        defaultValue={userData.height || '-'}
                        readOnly
                        label={'Height (cm):'}
                      />
                      <Input
                        defaultValue={
                          genders.find(
                            (option) => option.value === userData.gender
                          )?.label || '-'
                        }
                        readOnly
                        label={'Gender'}
                      />
                      <Input
                        defaultValue={
                          activityLevels.find(
                            (option) => option.value === userData.activityLevel
                          )?.label || '-'
                        }
                        readOnly
                        label={'Activity level'}
                      />
                      <Input
                        defaultValue={
                          goals.find((option) => option.value === userData.goal)
                            ?.label || '-'
                        }
                        readOnly
                        label={'Goal'}
                      />
                      <Input
                        defaultValue={userData.zipCode?.lockdownDay || '-'}
                        readOnly
                        label={'Lock down day'}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Meal plan</CardTitle>
                    </CardHeader>

                    <CardContent>
                      {mealPlan ? (
                        <>
                          <div className="space-y-1.5 text-foreground/80 [&>p>span]:font-medium [&>p>span]:text-foreground">
                            <p>
                              Number of days in a week:{' '}
                              <span>{mealPlan.numberOfDays}</span>
                            </p>
                            <p>
                              Meals per day: <span>{mealPlan.mealsPerDay}</span>
                            </p>
                            <p>
                              Total kCal:{' '}
                              <span>
                                {typeof userTotalCalNeed === 'number'
                                  ? userTotalCalNeed.toFixed(0)
                                  : '- - -'}{' '}
                                kCal
                              </span>
                            </p>
                            <p>
                              Subscription price:{' '}
                              <span>
                                {envs.CURRENCY_SYMBOL}
                                {typeof userTotalCalNeed === 'number'
                                  ? `${(
                                      userTotalCalNeed * envs.CALORIE_PRICE +
                                      Number(
                                        process.env.NEXT_PUBLIC_SHIPPING_CHARGE
                                      )
                                    ).toFixed(2)}`
                                  : '- - - '}
                                /week
                              </span>
                            </p>
                          </div>
                        </>
                      ) : (
                        <p className="text-center">User has no meal plan yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div className="sticky bottom-0 left-0 z-50 flex w-full border-t border-muted bg-background py-3 md:hidden">
                  <Button
                    className="w-full"
                    loading={isSubmitting}
                    onClick={submitForm}
                    disabled={!dirty}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

export default EditUserForm;
