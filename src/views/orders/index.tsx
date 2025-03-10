import { Check, Copy, MoreHorizontal, Search } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { productOrderStatusOptions } from '@/constants/product-order';
import useAppClipboard from '@/hooks/useAppClipboard';
import usePaginatedQuery from '@/hooks/usePaginatedQuery';
import { appDefaultDateFormatter, extractQueryKey } from '@/lib/utils';
import { OrderStatusEnum } from '@/types/api-responses/order';
import { useDebouncedValue } from '@mantine/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useQueryState } from 'nuqs';
import { toast } from 'sonner';

const Orders = () => {
  const [orderStatus, setOrderStatus] = useQueryState('status');
  const [searchQuery, setSearchQuery] = useQueryState('q');

  const queryClient = useQueryClient();
  const { copy, copied } = useAppClipboard();

  const router = useRouter();

  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

  const ordersQuery = usePaginatedQuery(({ page }) =>
    getProductOrdersQueryOptions({
      axiosReqConfig: {
        params: {
          page,
          q: debouncedSearchQuery,
          status: orderStatus || undefined,
        },
      },
    })
  );

  const deleteOrderMutation = useMutation({
    ...getDeleteProductOrderMutationOptions(),
  });

  const clearFilters = () => {
    setOrderStatus(null);
    setSearchQuery(null);
  };
  const showClearFiltersButton = !!orderStatus || !!searchQuery;

  return (
    <div className="grid">
      <Card className="overflow-hidden">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-5">
          <div className="space-y-1.5">
            <CardTitle>Orders</CardTitle>
            <CardDescription>Manage your orders from here.</CardDescription>
          </div>

          <div className="flex gap-2 max-md:flex-wrap">
            <Input
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders"
              className="min-w-[200px]"
            />
            <Select value={orderStatus || ''} onValueChange={setOrderStatus}>
              <SelectTrigger className="min-w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {productOrderStatusOptions.length > 0 ? (
                  productOrderStatusOptions.map((option) => (
                    <SelectItem value={option.value} key={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="-" disabled>
                    No options to show:(
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {showClearFiltersButton && (
              <Button onClick={clearFilters} variant={'secondary'}>
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Paid At</TableHead>
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
                            <span className="inline-block max-w-[120px] truncate">
                              {order.orderId || order.id}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="flex items-center gap-2.5">
                            {order.orderId || order.id}
                            <button
                              onClick={() => copy(order.orderId || order.id)}
                              className="__fv"
                            >
                              {copied ? (
                                <Check className="size-3.5 text-success" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                setSearchQuery(order.orderId || order.id)
                              }
                              className="__fv"
                            >
                              <Search className="size-3.5" />
                            </button>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="mx-1.5 text-muted-foreground/50">|</span>
                      {order.user.name + ' ' + order.user.surname}
                    </div>
                  </TableCell>
                  <TooltipProvider delayDuration={0}>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger>
                          {appDefaultDateFormatter(new Date(order.paidAt))}
                        </TooltipTrigger>
                        <TooltipContent className="space-y-1 px-5 py-4 text-sm [&>p>span:first-child]:font-semibold">
                          <p>
                            <span>Create at: </span>{' '}
                            {appDefaultDateFormatter(new Date(order.createdAt))}
                          </p>
                          <p>
                            <span>Paid at: </span>{' '}
                            {appDefaultDateFormatter(new Date(order.paidAt))}
                          </p>
                          <p>
                            <span>Last updated at: </span>{' '}
                            {appDefaultDateFormatter(new Date(order.updatedAt))}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TooltipProvider>
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
