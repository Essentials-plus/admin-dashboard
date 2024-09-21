import {
  Check,
  ChevronLeft,
  Copy,
  MoreVertical,
  PrinterIcon,
} from 'lucide-react';

import {
  getDeleteProductOrderMutationOptions,
  getUpdateProductOrderMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getProductOrderByIdQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import FloatingFormActionsBar from '@/components/floating-form-actions-bar';
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
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormikSelect } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import envs from '@/config/envs';
import { productOrderStatusOptions } from '@/constants/product-order';
import useAppClipboard from '@/hooks/useAppClipboard';
import {
  appDefaultDateFormatter,
  getProductPrice,
  getProductTaxAmount,
} from '@/lib/utils';
import { CouponTypeEnum } from '@/types/api-responses/coupon-code';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Formik } from 'formik';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Fragment, useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

export default function EditOrder() {
  const router = useRouter();
  const { copy, copied } = useAppClipboard();

  const printContainer = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => printContainer.current,
  });

  const id = router.query.id as string;

  const orderQuery = useQuery({
    ...getProductOrderByIdQueryOptions({ id }),
  });

  const deleteOrderMutation = useMutation({
    ...getDeleteProductOrderMutationOptions(),
  });

  const updateOrderMutation = useMutation({
    ...getUpdateProductOrderMutationOptions(),
    onSuccess() {
      toast.success('Order updated successfully');
    },
  });

  const order = orderQuery?.data?.data;

  const orderedProducts = useMemo(
    () => order?.products || [],
    [order?.products]
  );

  const { orderTotalBeforeDiscount, totalTax21Percent, totalTax9Percent } =
    useMemo(
      () =>
        orderedProducts.reduce(
          (accumulator, currentValue) => {
            const price = getProductPrice(
              currentValue.product,
              currentValue.variationId
            );

            const taxAmount = getProductTaxAmount({
              productPrice: price ?? 0,
              taxPercent: currentValue.product.taxPercent,
            });

            return {
              orderTotalBeforeDiscount:
                (price ?? 0) * currentValue.count +
                accumulator.orderTotalBeforeDiscount,
              totalTax9Percent:
                (currentValue.product.taxPercent === 'TAX9' ? taxAmount : 0) +
                accumulator.totalTax9Percent,
              totalTax21Percent:
                (currentValue.product.taxPercent === 'TAX21' ? taxAmount : 0) +
                accumulator.totalTax21Percent,
            };
          },
          {
            orderTotalBeforeDiscount: 0,
            totalTax21Percent: 0,
            totalTax9Percent: 0,
          }
        ),
      [orderedProducts]
    );

  const totalTaxAmount = totalTax9Percent + totalTax21Percent;

  const shippingTaxAmount = useMemo(
    () =>
      getProductTaxAmount({
        productPrice: Number(envs.SHIPPING_CHARGE),
        taxPercent: 'TAX21',
      }),
    []
  );

  const initialValues = {
    status: order?.status,
  };

  if (!orderQuery.data) {
    return <ApiStatusIndicator query={orderQuery} noData={true} />;
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
      {({ isSubmitting }) => {
        const orderShippingAmount = Number(order?.shippingAmount) ?? 0;
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
              <CardContent className="p-6 text-sm lg:pt-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Order Details</h1>

                    <div>
                      <div className="w-[140px] print:hidden">
                        <FormikSelect
                          name="status"
                          options={productOrderStatusOptions}
                          placeholder="Select status"
                        />
                      </div>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderedProducts.map((product) => {
                        const price = getProductPrice(
                          product.product,
                          product.variationId
                        );
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Carousel className="w-9">
                                  <CarouselContent>
                                    {product.product.images.map(
                                      (image, index) => (
                                        <CarouselItem key={index}>
                                          <Image
                                            src={image}
                                            alt={product.product.name}
                                            width={100}
                                            height={100}
                                            className="size-9 rounded-sm bg-muted object-cover"
                                          />
                                        </CarouselItem>
                                      )
                                    )}
                                  </CarouselContent>
                                </Carousel>
                                <div>
                                  <p className="text-muted-foreground">
                                    {product.product.name}
                                  </p>
                                  {product.variation && (
                                    <div className="mt-px flex flex-wrap divide-x divide-muted-foreground/60 text-xs text-muted-foreground [&>p:first-child]:ml-0 [&>p:first-child]:pl-0 [&>p>span]:text-foreground [&>p]:ml-2 [&>p]:pl-2">
                                      {product.variation.termIds.map(
                                        (termId) => {
                                          const attributeTerm =
                                            product.product.attributeTerms.find(
                                              (attributeTerm) =>
                                                attributeTerm.id === termId
                                            );

                                          const attribute = (
                                            product.product.attributes || []
                                          ).find(
                                            (attribute) =>
                                              attribute.id ===
                                              attributeTerm?.productAttributeId
                                          );
                                          return (
                                            <Fragment key={termId}>
                                              <p>
                                                <span>{attribute?.name}:</span>{' '}
                                                {attributeTerm?.name}{' '}
                                              </p>
                                            </Fragment>
                                          );
                                        }
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {envs.CURRENCY_SYMBOL}
                              {price}
                            </TableCell>
                            <TableCell>
                              <span className="mr-2 opacity-40">×</span>
                              {product.count}
                            </TableCell>
                            <TableCell className="text-right">
                              {envs.CURRENCY_SYMBOL}
                              {price! * product.count}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <Separator className="my-1" />
                  <ul className="grid gap-0.5 [&>li:nth-child(odd)]:bg-muted-foreground/10 [&>li]:px-2 [&>li]:py-1.5">
                    <li className="flex items-center justify-between">
                      <span>Subtotal (excl. BTW)</span>
                      <span>
                        {envs.CURRENCY_SYMBOL}
                        {(orderTotalBeforeDiscount - totalTaxAmount)?.toFixed(
                          2
                        )}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>BTW (9%)</span>
                      <span>
                        {envs.CURRENCY_SYMBOL}
                        {totalTax9Percent?.toFixed(2)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>BTW (21%)</span>
                      <span>
                        {envs.CURRENCY_SYMBOL}
                        {totalTax21Percent?.toFixed(2)}
                      </span>
                    </li>
                    {order?.coupon && (
                      <li className="flex items-center justify-between">
                        <span>
                          Coupon(s) -{' '}
                          <span className="font-medium text-foreground">
                            {order.coupon.code}
                          </span>
                        </span>
                        <span>
                          - {envs.CURRENCY_SYMBOL}
                          {orderTotalBeforeDiscount && (
                            <>
                              {order?.coupon.type === CouponTypeEnum.amount
                                ? (
                                    orderTotalBeforeDiscount -
                                    order.coupon.value
                                  ).toFixed(2)
                                : order?.coupon.type === CouponTypeEnum.percent
                                ? (
                                    (orderTotalBeforeDiscount / 100) *
                                    order.coupon.value
                                  ).toFixed(2)
                                : '-'}
                            </>
                          )}
                        </span>
                      </li>
                    )}
                    <li className="flex items-center justify-between">
                      <span>Shipping (21% BTW included)</span>
                      <span>
                        {Number(orderShippingAmount) > 0 && (
                          <span className="mr-2 opacity-50">
                            (BTW {envs.CURRENCY_SYMBOL}
                            {shippingTaxAmount.toFixed(2)})
                          </span>
                        )}
                        {envs.CURRENCY_SYMBOL}
                        {orderShippingAmount.toFixed(2)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span>
                        {envs.CURRENCY_SYMBOL}
                        {Number(order?.amount).toFixed(2)}
                      </span>
                    </li>
                  </ul>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <div className="font-semibold">Shipping Information</div>
                    <address className="grid gap-0.5 not-italic text-muted-foreground">
                      <span>House number: {order?.user.nr || '-'}</span>
                      <span>Address: {order?.user.address || '-'}</span>
                      <span>City: {order?.user.city || '-'}</span>
                      <span>
                        Zipcode: {order?.user.zipCode?.zipCode || '-'}
                      </span>
                      <span>Addition: {order?.user.addition || '-'}</span>
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
                        {order?.user.name} {order?.user.surname}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd>
                        <a
                          className="hover:underline"
                          href={`mailto:${order?.user.email}`}
                        >
                          {order?.user.email}
                        </a>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Phone</dt>
                      <dd>
                        <a
                          className="hover:underline"
                          href={`tel:${order?.user.mobile}`}
                        >
                          {order?.user.mobile || '-'}
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
          </>
        );
      }}
    </Formik>
  );
}
