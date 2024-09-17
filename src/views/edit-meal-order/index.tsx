import {
  Check,
  ChevronLeft,
  Copy,
  MoreVertical,
  PrinterIcon,
} from 'lucide-react';

import {
  getDeleteProductOrderMutationOptions,
  getUpdateMealOrderMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getMealOrderByIdQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import FloatingFormActionsBar from '@/components/floating-form-actions-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormikSelect } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import envs from '@/config/envs';
import { mealTypeOptions } from '@/constants/meal';
import { mealOrderStatusOptions } from '@/constants/meal-order';
import useAppClipboard from '@/hooks/useAppClipboard';
import { BeforeUnloadComponent } from '@/hooks/useBeforeUnload';
import {
  appDefaultDateFormatter,
  getProductTaxAmount,
  sortMealsByMealType,
  sumOf,
} from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Formik } from 'formik';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo, useRef } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

export default function EditMealOrder() {
  const router = useRouter();
  const { copy, copied } = useAppClipboard();

  const printContainer = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => printContainer.current,
  });

  const id = router.query.id as string;

  const mealOrderQuery = useQuery({
    ...getMealOrderByIdQueryOptions({ id }),
  });

  const deleteOrderMutation = useMutation({
    ...getDeleteProductOrderMutationOptions(),
  });

  const updateOrderMutation = useMutation({
    ...getUpdateMealOrderMutationOptions(),
    onSuccess() {
      toast.success('Order updated successfully');
    },
  });

  const order = mealOrderQuery?.data?.data;

  const initialValues = {
    status: order?.status,
  };

  const totalAmount = order?.totalAmount || 0;
  const shippingAmount = order?.shippingAmount || 0;

  const tax9Percent = useMemo(
    () =>
      getProductTaxAmount({
        productPrice: totalAmount,
        taxPercent: 'TAX9',
      }),
    [totalAmount]
  );

  const shippingAmountTax = useMemo(
    () =>
      getProductTaxAmount({
        productPrice: shippingAmount,
        taxPercent: 'TAX21',
      }).toFixed(2),
    [shippingAmount]
  );

  if (!mealOrderQuery.data) {
    return <ApiStatusIndicator query={mealOrderQuery} noData={true} />;
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, actions) => {
        if (!order?.id) return;

        try {
          await updateOrderMutation.mutateAsync({
            id: order?.id,
            data: values as any,
          });
          actions.resetForm({
            values,
          });
        } catch (error) {}
      }}
    >
      {({ isSubmitting, dirty }) => {
        return (
          <>
            <Card className="overflow-hidden" ref={printContainer}>
              <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="flex gap-4">
                  <Button
                    onClick={router.back}
                    variant="outline"
                    size="icon"
                    className="size-8 print:hidden"
                  >
                    <ChevronLeft className="size-4" />
                    <span className="sr-only">Back</span>
                  </Button>
                  <div className="grid gap-0.5">
                    <CardTitle className="group flex items-center gap-2 overflow-hidden text-lg">
                      <span className="inline-block truncate">
                        Order {order?.id}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => copy(order?.id)}
                      >
                        {copied ? (
                          <Check className="size-3 text-success" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        <span className="sr-only">Copy Order ID</span>
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Date: {appDefaultDateFormatter(order?.createdAt!)}
                    </CardDescription>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  {/* <Button size="sm" variant="outline" className="h-8 gap-1">
            <Truck className="size-3.5" />
            <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
              Track Order
            </span>
          </Button> */}
                  <Button
                    onClick={() => {
                      handlePrint();
                    }}
                    size={'icon'}
                    variant="outline"
                    className="size-8 print:hidden"
                  >
                    <PrinterIcon className="size-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 print:hidden"
                      >
                        <MoreVertical className="size-3.5" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}
                      {/* <DropdownMenuItem>Export</DropdownMenuItem> */}
                      {/* <DropdownMenuSeparator /> */}
                      <DropdownMenuItem
                        onClick={async () => {
                          if (await confirm({})) {
                            toast.promise(
                              deleteOrderMutation.mutateAsync({
                                id: order?.id!,
                              }),
                              {
                                loading: `Deleting order "${order?.id}"`,
                                success(data) {
                                  router.back();
                                  return `Order "${data.data.data.id}" deleted.`;
                                },
                              }
                            );
                          }
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-sm">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between print:hidden">
                    <h1 className="text-xl font-semibold">Order Details</h1>

                    <div>
                      <div className="w-[140px]">
                        <FormikSelect
                          name="status"
                          options={mealOrderStatusOptions}
                          placeholder="Select status"
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h2 className="text-base font-semibold">Meal Details</h2>

                    <Tabs
                      className="mt-4 print:hidden"
                      defaultValue={order?.mealsForTheWeek[0].day.toString()}
                    >
                      <TabsList>
                        {order?.mealsForTheWeek.map((day) => (
                          <TabsTrigger value={day.day.toString()} key={day.day}>
                            Day {day.day}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {order?.mealsForTheWeek.map((day) => (
                        <TabsContent
                          value={day.day.toString()}
                          key={day.day}
                          className="mt-0 data-[state=active]:mt-3"
                        >
                          <ResponsiveMasonry
                            columnsCountBreakPoints={{
                              350: 1,
                              900: 2,
                              1100: 3,
                            }}
                          >
                            <Masonry gutter="16px">
                              {sortMealsByMealType(day.meals).map((meal, i) => (
                                <Card
                                  key={day.day + '__' + meal.id}
                                  className="relative isolate"
                                >
                                  <span className="pointer-events-none absolute right-3 top-2 z-[-] text-7xl font-bold opacity-15">
                                    {i + 1}
                                  </span>
                                  <CardHeader className="flex flex-row gap-3 p-2">
                                    <div className="flex size-[100px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                                      {meal.image && meal.mealName ? (
                                        <Image
                                          src={meal.image}
                                          alt={meal.mealName}
                                          width={200}
                                          height={200}
                                          className="size-full object-cover"
                                        />
                                      ) : (
                                        meal.meal || 'No Image'
                                      )}
                                    </div>
                                    <div className="space-y-1 [&>p>span]:font-medium [&>p>span]:text-foreground [&>p]:text-muted-foreground">
                                      <CardTitle className="!mb-2">
                                        {meal.mealName}
                                      </CardTitle>
                                      <p>
                                        Meal no:{' '}
                                        <span>
                                          {meal.mealNumber || '- - -'}
                                        </span>
                                      </p>
                                      <p>
                                        Type:{' '}
                                        <span>
                                          <Badge
                                            variant={'secondary'}
                                            className="px-1.5"
                                          >
                                            {mealTypeOptions.find(
                                              (option) =>
                                                option.value === meal.meal
                                            )?.label || '- - -'}
                                          </Badge>
                                        </span>
                                      </p>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="p-2 pt-0">
                                    <div className="rounded-md bg-muted p-3 pt-2.5">
                                      <p className="text-base font-medium">
                                        Ingredients
                                      </p>
                                      <ul className="mt-2 space-y-1 text-foreground">
                                        {meal.ingredients.map((ingredient) => {
                                          const sumOfKCal = sumOf(
                                            meal.ingredients,
                                            'kcal'
                                          );

                                          const totalNeededServings =
                                            Math.round(
                                              meal.kCalNeed / sumOfKCal
                                            );

                                          return (
                                            <li
                                              key={ingredient.id}
                                              className="list-item list-inside list-disc marker:text-muted-foreground"
                                            >
                                              {typeof ingredient.quantity ===
                                              'number'
                                                ? ingredient.quantity *
                                                  totalNeededServings
                                                : '- - -'}{' '}
                                              {ingredient.unit}{' '}
                                              {ingredient.name}
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </Masonry>
                          </ResponsiveMasonry>
                        </TabsContent>
                      ))}
                    </Tabs>

                    <div className="mt-4 hidden space-y-5 print:block">
                      {order?.mealsForTheWeek.map((day) => (
                        <div
                          key={day.day}
                          className="mt-0 rounded-md bg-muted p-4 data-[state=active]:mt-3"
                        >
                          <div className="mb-2.5 text-lg font-semibold">
                            Day {day.day}
                          </div>
                          <ResponsiveMasonry
                            columnsCountBreakPoints={{
                              350: 1,
                              900: 2,
                              1100: 3,
                            }}
                          >
                            <Masonry gutter="16px">
                              {sortMealsByMealType(day.meals).map((meal, i) => (
                                <Card
                                  key={day.day + '__' + meal.id}
                                  className="relative isolate"
                                >
                                  <span className="pointer-events-none absolute right-3 top-2 z-[-] text-7xl font-bold opacity-15">
                                    {i + 1}
                                  </span>
                                  <CardHeader className="flex flex-row gap-3 p-2">
                                    <div className="flex size-[100px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                                      {meal.image && meal.mealName ? (
                                        <Image
                                          src={meal.image}
                                          alt={meal.mealName}
                                          width={200}
                                          height={200}
                                          className="size-full object-cover"
                                        />
                                      ) : (
                                        meal.meal || 'No Image'
                                      )}
                                    </div>
                                    <div className="space-y-1 [&>p>span]:font-medium [&>p>span]:text-foreground [&>p]:text-muted-foreground">
                                      <CardTitle className="!mb-2">
                                        {meal.mealName}
                                      </CardTitle>
                                      <p>
                                        Meal no:{' '}
                                        <span>
                                          {meal.mealNumber || '- - -'}
                                        </span>
                                      </p>
                                      <p>
                                        Type:{' '}
                                        <span>
                                          <Badge
                                            variant={'secondary'}
                                            className="px-1.5"
                                          >
                                            {mealTypeOptions.find(
                                              (option) =>
                                                option.value === meal.meal
                                            )?.label || '- - -'}
                                          </Badge>
                                        </span>
                                      </p>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="p-2 pt-0">
                                    <div className="rounded-md bg-muted p-3 pt-2.5">
                                      <p className="text-base font-medium">
                                        Ingredients
                                      </p>
                                      <ul className="mt-2 space-y-1 text-foreground">
                                        {meal.ingredients.map((ingredient) => {
                                          const sumOfKCal = sumOf(
                                            meal.ingredients,
                                            'kcal'
                                          );

                                          const totalNeededServings =
                                            Math.round(
                                              meal.kCalNeed / sumOfKCal
                                            );

                                          return (
                                            <li
                                              key={ingredient.id}
                                              className="list-item list-inside list-disc marker:text-muted-foreground"
                                            >
                                              {typeof ingredient.quantity ===
                                              'number'
                                                ? ingredient.quantity *
                                                  totalNeededServings
                                                : '- - -'}{' '}
                                              {ingredient.unit}{' '}
                                              {ingredient.name}
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </Masonry>
                          </ResponsiveMasonry>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-1" />
                  <ul className="grid gap-0.5 [&>li:nth-child(odd)]:bg-muted-foreground/10 [&>li]:px-2 [&>li]:py-1.5">
                    <li className="flex items-center justify-between">
                      <span>Subtotal (excl. BTW)</span>
                      <span>
                        {envs.CURRENCY_SYMBOL}
                        {(
                          totalAmount -
                          (shippingAmount + tax9Percent)
                        )?.toFixed(2)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>BTW (9%)</span>
                      <span>
                        {envs.CURRENCY_SYMBOL}
                        {tax9Percent.toFixed(2)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Shipping (21% BTW included)</span>
                      <span>
                        {Number(shippingAmount) > 0 && (
                          <span className="mr-2 opacity-50">
                            (BTW {envs.CURRENCY_SYMBOL}
                            {shippingAmountTax})
                          </span>
                        )}
                        {envs.CURRENCY_SYMBOL}
                        {shippingAmount.toFixed(2)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span>
                        {envs.CURRENCY_SYMBOL}
                        {Number(totalAmount).toFixed(2)}
                      </span>
                    </li>
                  </ul>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <div className="font-semibold">Shipping Information</div>
                    <address className="grid gap-0.5 not-italic text-muted-foreground">
                      <span>House number: {order?.plan?.user.nr || '-'}</span>
                      <span>Address: {order?.plan?.user.address || '-'}</span>
                      <span>City: {order?.plan?.user.city || '-'}</span>
                      <span>
                        Zipcode: {order?.plan?.user.zipCode?.zipCode || '-'}
                      </span>
                      <span>Addition: {order?.plan?.user.addition || '-'}</span>
                    </address>
                  </div>
                  <div className="grid auto-rows-max gap-3">
                    <div className="font-semibold">Billing Information</div>
                    <div className="text-muted-foreground">
                      Same as shipping address
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3">
                  <div className="font-semibold">Customer Information</div>
                  <dl className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Customer</dt>
                      <dd>
                        {order?.plan?.user.name} {order?.plan?.user.surname}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd>
                        <a
                          className="hover:underline"
                          href={`mailto:${order?.plan?.user.email}`}
                        >
                          {order?.plan?.user.email}
                        </a>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Phone</dt>
                      <dd>
                        <a
                          className="hover:underline"
                          href={`tel:${order?.plan?.user.mobile}`}
                        >
                          {order?.plan?.user.mobile || '-'}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>
                {/* <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Payment Information</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1 text-muted-foreground">
                <CreditCard className="size-4" />
                Visa
              </dt>
              <dd>**** **** **** 4532</dd>
            </div>
          </dl>
        </div> */}
              </CardContent>
              <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3 print:hidden">
                <div className="text-xs text-muted-foreground">
                  Last updated{' '}
                  <time dateTime="2023-11-23">
                    {appDefaultDateFormatter(order?.updatedAt!)}
                  </time>
                </div>
                {/* <Pagination className="ml-auto mr-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button size="icon" variant="outline" className="size-6">
                <ChevronLeft className="size-3.5" />
                <span className="sr-only">Previous Order</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button size="icon" variant="outline" className="size-6">
                <ChevronRight className="size-3.5" />
                <span className="sr-only">Next Order</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination> */}
              </CardFooter>
            </Card>

            <FloatingFormActionsBar
              saveButton={{
                loading: isSubmitting,
              }}
              discardButton={{ disabled: isSubmitting }}
            />
            <BeforeUnloadComponent enabled={dirty} />
          </>
        );
      }}
    </Formik>
  );
}
