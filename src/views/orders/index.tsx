import { Check, Copy, MoreHorizontal } from 'lucide-react';

import { getDeleteProductOrderMutationOptions } from '@/api-clients/admin-api-client/mutations';
import { getProductOrdersQueryOptions } from '@/api-clients/admin-api-client/queries';
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
import { appDefaultDateFormatter, extractQueryKey } from '@/lib/utils';
import { OrderStatusEnum } from '@/types/api-responses/order';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

const Orders = () => {
  const queryClient = useQueryClient();
  const { copy, copied } = useAppClipboard();

  const router = useRouter();

  const ordersQuery = usePaginatedQuery(({ page }) =>
    getProductOrdersQueryOptions({
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

  return (
    <div className="grid">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Manage your orders from here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersQuery.data?.data?.map((order) => (
                <TableRow
                  onDoubleClick={() => {
                    router.push(routes.orderDetails(order.id));
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
                      {order.user.name + ' ' + order.user.surname}
                    </div>
                  </TableCell>
                  <TableCell>
                    {appDefaultDateFormatter(new Date(order.createdAt))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === OrderStatusEnum.completed
                          ? 'success'
                          : 'outline'
                      }
                      className="capitalize"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {envs.CURRENCY_SYMBOL}
                    {order.amount}
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
                        <DropdownMenuItem
                          onClick={() => {
                            router.push(routes.orderDetails(order.id));
                          }}
                        >
                          View
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
            noData={!!ordersQuery.data && ordersQuery.data.data?.length <= 0}
            query={ordersQuery}
          />
          <DataTablePagination query={ordersQuery} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
