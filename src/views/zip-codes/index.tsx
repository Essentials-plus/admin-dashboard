import { MoreHorizontal, Plus } from 'lucide-react';

import { getDeleteZipCodeMutationOptions } from '@/api-clients/admin-api-client/mutations';
import { getZipCodesQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import CreateOrUpdateZipCodeForm from '@/components/create-or-update-zip-code-form';
import DataTablePagination from '@/components/data-table-pagination';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
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
import usePaginatedQuery from '@/hooks/usePaginatedQuery';
import { extractQueryKey } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@mantine/hooks';

const ZipCodes = () => {
  const queryClient = useQueryClient();
  const [openCreateZipCodeDialog, setOpenCreateZipCodeDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

  const [editZipCodeId, setEditZipCodeId] = useState<undefined | string>(
    undefined
  );

  const zipCodesQuery = usePaginatedQuery(({ page }) =>
    getZipCodesQueryOptions({
      axiosReqConfig: {
        params: {
          page,
          q: debouncedSearchQuery || null,
        },
      },
    })
  );

  const deleteZipCodeMutation = useMutation({
    ...getDeleteZipCodeMutationOptions(),
  });

  const clearFilters = () => {
    setSearchQuery('');
  };

  const showClearFiltersButton = !!searchQuery.trim();

  return (
    <div>
      <div className="grid flex-1 items-start gap-4">
        <div className="flex items-center">
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={() => {
                setOpenCreateZipCodeDialog(true);
              }}
              size="sm"
              variant={'outline'}
            >
              <Plus className="size-4" />
              <span className="sm:whitespace-nowrap">Add zip code</span>
            </Button>
            <Dialog
              open={openCreateZipCodeDialog || !!editZipCodeId}
              onOpenChange={() => {
                setOpenCreateZipCodeDialog(false);
                setEditZipCodeId(undefined);
              }}
            >
              <DialogContent>
                <DialogTitle>
                  {!!editZipCodeId ? 'Update' : 'Create'} Zip code
                </DialogTitle>
                <CreateOrUpdateZipCodeForm
                  zipCodeId={editZipCodeId}
                  onApiError={() => {
                    setOpenCreateZipCodeDialog(false);
                  }}
                  onCreateOrUpdate={() => {
                    setOpenCreateZipCodeDialog(false);
                    setEditZipCodeId(undefined);

                    queryClient.invalidateQueries({
                      queryKey: extractQueryKey(getZipCodesQueryOptions),
                    });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-5">
            <div className="space-y-1.5">
              <CardTitle>Zip codes</CardTitle>
              <CardDescription>
                Manage your zip codes from here.
              </CardDescription>{' '}
            </div>

            <div className="flex gap-2 max-md:flex-wrap">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search zip codes"
                className="min-w-[200px]"
              />
              {showClearFiltersButton && (
                <Button onClick={clearFilters} variant={'secondary'}>
                  Clear filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zip code</TableHead>
                  <TableHead>Lockdown day</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zipCodesQuery.data?.data?.map((zipCode) => (
                  <ContextMenu key={zipCode.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        onDoubleClick={() => {
                          setEditZipCodeId(zipCode.id);
                        }}
                      >
                        <TableCell>{zipCode.zipCode}</TableCell>
                        <TableCell>{zipCode.lockdownDay}</TableCell>
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
                                  setEditZipCodeId(zipCode.id);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={deleteZipCodeMutation.isPending}
                                onClick={async () => {
                                  if (await confirm({})) {
                                    toast.promise(
                                      deleteZipCodeMutation.mutateAsync({
                                        id: zipCode.id,
                                      }),
                                      {
                                        loading: `Deleting zip code "${zipCode.zipCode}"`,
                                        success(data) {
                                          zipCodesQuery.refetch();
                                          return `Zip code "${data.data.data.zipCode}" deleted.`;
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
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuLabel>Actions</ContextMenuLabel>
                      <ContextMenuItem
                        onClick={() => {
                          setEditZipCodeId(zipCode.id);
                        }}
                      >
                        Edit
                      </ContextMenuItem>
                      <ContextMenuItem
                        disabled={deleteZipCodeMutation.isPending}
                        onClick={async () => {
                          if (await confirm({})) {
                            toast.promise(
                              deleteZipCodeMutation.mutateAsync({
                                id: zipCode.id,
                              }),
                              {
                                loading: `Deleting zip code "${zipCode.zipCode}"`,
                                success(data) {
                                  return `Zip code "${data.data.data.zipCode}" deleted.`;
                                },
                              }
                            );
                          }
                        }}
                      >
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </TableBody>
            </Table>

            <ApiStatusIndicator
              noData={
                !!zipCodesQuery.data && zipCodesQuery.data.data?.length <= 0
              }
              query={zipCodesQuery}
            />
            <DataTablePagination query={zipCodesQuery} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ZipCodes;
