import { Check, Copy, MoreHorizontal } from 'lucide-react';

import {
  getDeleteProductOrderMutationOptions,
  getRunAutoConfirmOrderMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import {
  getMealOrdersQueryOptions,
  getProductOrdersQueryOptions,
} from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import DataTablePagination from '@/components/data-table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  extractQueryKey,
  formatCount,
} from '@/lib/utils';
import { PlanOrderStatusEnum } from '@/types/api-responses/meal-orders';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

const MealOrders = () => {
  const queryClient = useQueryClient();
  const { copy, copied } = useAppClipboard();

  const router = useRouter();

  const mealOrdersQuery = usePaginatedQuery(({ page }) =>
    getMealOrdersQueryOptions({
      axiosReqConfig: {
        params: {
          page,
        },
      },
    })
  );

  const deleteOrderMutation = useMutation({
    ...getDeleteProductOrderMutationOptions(),
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
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Week No</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Date</TableHead>
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
                                  loading: `Deleting order "${order.id}"`,
                                  success(data) {
                                    queryClient.invalidateQueries({
                                      queryKey: extractQueryKey(
                                        getProductOrdersQueryOptions
                                      ),
                                    });
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
        </CardContent>
      </Card>
    </div>
  );
};

export default MealOrders;
