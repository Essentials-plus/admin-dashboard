import {
  CalendarIcon,
  Check,
  Copy,
  Loader2,
  MoreHorizontal,
} from 'lucide-react';

import {
  getDeleteMealOrderMutationOptions,
  getRunAutoConfirmOrderMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getMealOrdersQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import DataTablePagination from '@/components/data-table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import envs from '@/config/envs';
import routes from '@/config/routes';
import useAppClipboard from '@/hooks/useAppClipboard';
import usePaginatedQuery from '@/hooks/usePaginatedQuery';
import {
  appDefaultDateFormatter,
  appDefaultDateFormatterWithoutTime,
  extractQueryKey,
  formatCount,
} from '@/lib/utils';
import { generateMealOrderPDF } from '@/lib/utils/generate-meal-order-pdf';
import { PlanOrderStatusEnum } from '@/types/api-responses/meal-orders';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import JSZip from 'jszip';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'sonner';

const MealOrders = () => {
  const queryClient = useQueryClient();
  const { copy, copied } = useAppClipboard();

  const router = useRouter();

  const [lockdownDate, setLockdownDate] = useState<Date | undefined>(undefined);
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
  const [isGeneratingProduction, setIsGeneratingProduction] = useState(false);

  const mealOrdersQuery = usePaginatedQuery(({ page }) =>
    getMealOrdersQueryOptions({
      axiosReqConfig: {
        params: {
          page,
          ...(lockdownDate && {
            lockdownDate: format(lockdownDate, 'yyyy-MM-dd'),
          }),
          ...(deliveryDate && {
            deliveryDate: format(deliveryDate, 'yyyy-MM-dd'),
          }),
        },
      },
    })
  );

  const deleteOrderMutation = useMutation({
    ...getDeleteMealOrderMutationOptions(),
  });
  const runAutoConfirmOrderMutation = useMutation({
    ...getRunAutoConfirmOrderMutationOptions(),
    onSuccess(data) {
      mealOrdersQuery.refetch();
      if (data.data.data.totalOrderPlaced === 0) {
        toast.warning('No orders found to place manually.');
      } else {
        toast.success(
          `Total ${data.data.data.totalOrderPlaced} ${formatCount(
            data.data.data.totalOrderPlaced,
            'order'
          )} found and placed automatically.`
        );
      }
    },
  });

  const generateProductionList = async () => {
    try {
      setIsGeneratingProduction(true);
      toast.info('Fetching meal orders...', {
        id: 'generate-production-list',
      });

      // Fetch all filtered orders (not paginated)
      const response = await getMealOrdersQueryOptions({
        axiosReqConfig: {
          params: {
            ...(lockdownDate && {
              lockdownDate: format(lockdownDate, 'yyyy-MM-dd'),
            }),
            ...(deliveryDate && {
              deliveryDate: format(deliveryDate, 'yyyy-MM-dd'),
            }),
          },
        },
      }).queryFn();

      const orders = response.data;

      if (!orders || orders.length === 0) {
        toast.warning('No meal orders found with the selected filters.', {
          id: 'generate-production-list',
        });
        return;
      }

      toast.info(`Generating PDFs for ${orders.length} orders...`, {
        id: 'generate-production-list',
      });

      // Create ZIP file
      const zip = new JSZip();

      // Generate PDF for each order
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        try {
          const pdfBlob = await generateMealOrderPDF({
            order,
            returnBlob: true,
          });

          // Skip if blob generation failed
          if (!pdfBlob) {
            console.error(`Failed to generate PDF blob for order ${order.id}`);
            continue;
          }

          // Generate filename: Invoice_ClientName_Week12.pdf
          const clientName =
            order.plan?.user?.name && order.plan?.user?.surname
              ? `${order.plan.user.name}_${order.plan.user.surname}`.replace(
                  /\s+/g,
                  '_'
                )
              : `Order_${order.id}`;
          const weekNumber = moment(order.deliveryDate).isoWeek();
          const filename = `Invoice_${clientName}_Week${weekNumber}.pdf`;

          zip.file(filename, pdfBlob);
        } catch (error) {
          console.error(`Failed to generate PDF for order ${order.id}:`, error);
          toast.error(`Failed to generate PDF for order ${order.id}`, {
            id: 'generate-production-list',
          });
        }
      }

      toast.info('Creating ZIP file...', {
        id: 'generate-production-list',
      });

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Create filename for ZIP based on filters
      let zipFilename = 'production-list';
      if (lockdownDate) {
        zipFilename += `_lockdown-${format(lockdownDate, 'yyyy-MM-dd')}`;
      }
      if (deliveryDate) {
        zipFilename += `_delivery-${format(deliveryDate, 'yyyy-MM-dd')}`;
      }
      zipFilename += '.zip';

      // Trigger download
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Production list downloaded successfully! (${orders.length} invoices)`
      );
    } catch (error) {
      console.error('Error generating production list:', error);
      toast.error('Failed to generate production list. Please try again.', {
        id: 'generate-production-list',
      });
    } finally {
      setIsGeneratingProduction(false);
    }
  };

  return (
    <div className="grid">
      <Card className="overflow-hidden">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-5">
          <div className="space-y-1.5">
            <CardTitle>Meal orders</CardTitle>
            <CardDescription>
              Manage your meal orders from here.
            </CardDescription>
          </div>

          <div>
            <div className="flex flex-col items-end gap-1">
              <Button
                loading={runAutoConfirmOrderMutation.isPending}
                onClick={() => runAutoConfirmOrderMutation.mutate()}
              >
                Run auto confirm orders
              </Button>
              <p className="text-xs text-muted-foreground">
                For week {moment().subtract(1, 'day').isoWeek()} and lockdown
                day {moment().subtract(1, 'day').isoWeekday()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Filter by lockdown date
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[200px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {lockdownDate ? (
                      format(lockdownDate, 'PPP')
                    ) : (
                      <span className="text-muted-foreground">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={lockdownDate}
                    onSelect={(date) => {
                      setLockdownDate(date);
                      mealOrdersQuery.fetchPage(1);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Filter by delivery date
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[200px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {deliveryDate ? (
                      format(deliveryDate, 'PPP')
                    ) : (
                      <span className="text-muted-foreground">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={(date) => {
                      setDeliveryDate(date);
                      mealOrdersQuery.fetchPage(1);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {(lockdownDate || deliveryDate) && (
              <Button
                variant="destructive"
                onClick={() => {
                  setLockdownDate(undefined);
                  setDeliveryDate(undefined);
                  mealOrdersQuery.fetchPage(1);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Week No</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Confirmation date</TableHead>
                <TableHead>Lockdown date</TableHead>
                <TableHead>Delivery date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mealOrdersQuery.data?.data?.map((order) => (
                <TableRow
                  onDoubleClick={() => {
                    router.push(routes.mealOrderDetails(order.id));
                  }}
                  key={order.id}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-block max-w-[50px] truncate">
                              {order.id}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="flex items-center gap-2.5">
                            {order.id}
                            <button
                              onClick={() => copy(order.id)}
                              className="__fv"
                            >
                              {copied ? (
                                <Check className="size-3.5 text-success" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="mx-1.5 text-muted-foreground/50">|</span>
                      {order.plan?.user.name + ' ' + order.plan?.user.surname}
                    </div>
                  </TableCell>
                  <TableCell>{order.week}</TableCell>
                  <TableCell>
                    {envs.CURRENCY_SYMBOL}
                    {order.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {appDefaultDateFormatter(new Date(order.createdAt))}
                  </TableCell>
                  <TableCell>
                    {order.lockdownDate
                      ? appDefaultDateFormatterWithoutTime(
                          new Date(order.lockdownDate)
                        )
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {order.deliveryDate
                      ? appDefaultDateFormatterWithoutTime(
                          new Date(order.deliveryDate)
                        )
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === PlanOrderStatusEnum.delivered
                          ? 'success'
                          : 'default'
                      }
                      className="capitalize"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={routes.mealOrderDetails(order.id)}>
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={deleteOrderMutation.isPending}
                          onClick={async () => {
                            if (await confirm({})) {
                              toast.promise(
                                deleteOrderMutation.mutateAsync({
                                  id: order.id,
                                }),
                                {
                                  loading: `Deleting order...`,
                                  success() {
                                    queryClient.invalidateQueries({
                                      queryKey: extractQueryKey(
                                        getMealOrdersQueryOptions
                                      ),
                                    });
                                    return `Order deleted successfully.`;
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <ApiStatusIndicator
            noData={
              !!mealOrdersQuery.data && mealOrdersQuery.data.data?.length <= 0
            }
            query={mealOrdersQuery}
          />
          <DataTablePagination query={mealOrdersQuery} />

          <div className="mt-4 flex justify-end">
            <Button
              onClick={generateProductionList}
              disabled={
                isGeneratingProduction ||
                mealOrdersQuery.isLoading ||
                !mealOrdersQuery.data?.data ||
                mealOrdersQuery.data.data.length === 0
              }
              className="gap-2"
            >
              {isGeneratingProduction && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Generate Production List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealOrders;
