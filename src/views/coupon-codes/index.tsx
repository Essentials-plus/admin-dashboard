import { MoreHorizontal, Plus } from 'lucide-react';

import { getDeleteCouponCodeMutationOptions } from '@/api-clients/admin-api-client/mutations';
import { getCouponCodesQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import CreateOrUpdateCouponCodeForm from '@/components/create-or-update-coupon-code-form';
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
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
import envs from '@/config/envs';
import usePaginatedQuery from '@/hooks/usePaginatedQuery';
import { extractQueryKey } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

const CouponCodes = () => {
  const queryClient = useQueryClient();
  const [openCreateCouponCodeDialog, setOpenCreateCouponCodeDialog] =
    useState(false);

  const [editCouponCodeId, setEditCouponCodeId] = useState<undefined | string>(
    undefined
  );

  const couponCodesQuery = usePaginatedQuery(({ page }) =>
    getCouponCodesQueryOptions({
      axiosReqConfig: {
        params: {
          page,
        },
      },
    })
  );

  const deleteCouponCodeMutation = useMutation({
    ...getDeleteCouponCodeMutationOptions(),
  });

  return (
    <div>
      <div className="grid flex-1 items-start gap-4">
        <div className="flex items-center">
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={() => {
                setOpenCreateCouponCodeDialog(true);
              }}
              size="sm"
              variant={'outline'}
            >
              <Plus className="size-4" />
              <span className="sm:whitespace-nowrap">Add coupon code</span>
            </Button>
            <Dialog
              open={openCreateCouponCodeDialog || !!editCouponCodeId}
              onOpenChange={() => {
                setOpenCreateCouponCodeDialog(false);
                setEditCouponCodeId(undefined);
              }}
            >
              <DialogContent>
                <DialogTitle>
                  {!!editCouponCodeId ? 'Update' : 'Create'} coupon code
                </DialogTitle>
                <CreateOrUpdateCouponCodeForm
                  couponCodeId={editCouponCodeId}
                  onApiError={() => {
                    setOpenCreateCouponCodeDialog(false);
                    setEditCouponCodeId(undefined);
                  }}
                  onCreateOrUpdate={() => {
                    setOpenCreateCouponCodeDialog(false);
                    setEditCouponCodeId(undefined);

                    queryClient.invalidateQueries({
                      queryKey: extractQueryKey(getCouponCodesQueryOptions),
                    });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Coupon codes</CardTitle>
            <CardDescription>
              Manage your coupon codes from here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Policy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {couponCodesQuery.data?.data?.map((couponCode) => (
                  <TableRow
                    onDoubleClick={() => {
                      setEditCouponCodeId(couponCode.id);
                    }}
                    key={couponCode.id}
                  >
                    <TableCell>{couponCode.name}</TableCell>
                    <TableCell>{couponCode.code}</TableCell>
                    <TableCell>
                      {couponCode.type === 'amount'
                        ? envs.CURRENCY_SYMBOL
                        : null}
                      {couponCode.value}
                      {couponCode.type === 'percent' ? '%' : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={'outline'} className="capitalize">
                        {couponCode.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={'outline'} className="capitalize">
                        {couponCode.policy}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="capitalize"
                        variant={
                          couponCode.status === 'active'
                            ? 'success'
                            : couponCode.status === 'inactive'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {couponCode.status}
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
                          <DropdownMenuItem
                            onClick={() => {
                              setEditCouponCodeId(couponCode.id);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={deleteCouponCodeMutation.isPending}
                            onClick={async () => {
                              if (await confirm({})) {
                                toast.promise(
                                  deleteCouponCodeMutation.mutateAsync({
                                    id: couponCode.id,
                                  }),
                                  {
                                    loading: `Deleting coupon code "${couponCode.name}"`,
                                    success(data) {
                                      queryClient.invalidateQueries({
                                        queryKey: extractQueryKey(
                                          getCouponCodesQueryOptions
                                        ),
                                      });
                                      return `Coupon code "${data.data.data.name}" deleted.`;
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
                !!couponCodesQuery.data &&
                couponCodesQuery.data.data?.length <= 0
              }
              query={couponCodesQuery}
            />
            <DataTablePagination query={couponCodesQuery} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CouponCodes;
