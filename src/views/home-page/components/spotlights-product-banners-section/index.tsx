import { getDeleteSpotlightsProductBannerMutationOptions } from '@/api-clients/admin-api-client/mutations';
import { getSpotlightsProductBannersQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import CreateOrUpdateSpotlightsProductBannersForm from '@/components/create-or-update-spotlights-product-banners-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Circle from '@/components/ui/circle';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Product } from '@/types/api-responses/product';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MoreHorizontal, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

const SpotlightsProductBannersSection = () => {
  const [selectedSpotlightsProductBanner, setSelectedSpotlightsProductBanner] =
    useState<{ id: string; product: Product } | null>(null);

  const spotlightsProductBannersQuery = useQuery(
    getSpotlightsProductBannersQueryOptions()
  );

  const deleteSpotlightsProductBannerMutationOptions = useMutation(
    getDeleteSpotlightsProductBannerMutationOptions()
  );

  const [
    openCreateOrUpdateSpotlightsProductBannersDialog,
    setOpenCreateOrUpdateSpotlightsProductBannersDialog,
  ] = useState(false);

  return (
    <Card>
      <CardHeader className="flex-row justify-between">
        <CardTitle className="text-lg font-semibold">
          Spotlights Product Banners
        </CardTitle>

        <Dialog
          open={openCreateOrUpdateSpotlightsProductBannersDialog}
          onOpenChange={(value) => {
            setOpenCreateOrUpdateSpotlightsProductBannersDialog(value);
            setSelectedSpotlightsProductBanner(null);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" variant={'outline'}>
              <Plus className="size-4" />
              <span className="sm:whitespace-nowrap">Add new</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              {selectedSpotlightsProductBanner ? 'Update' : 'Create'} Spotlights
              Product Banner
            </DialogTitle>
            <CreateOrUpdateSpotlightsProductBannersForm
              spotlightsProductBannerId={
                selectedSpotlightsProductBanner?.id || undefined
              }
              product={selectedSpotlightsProductBanner?.product}
              onCreateOrUpdate={() => {
                setOpenCreateOrUpdateSpotlightsProductBannersDialog(false);
                spotlightsProductBannersQuery.refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {spotlightsProductBannersQuery.data?.data.map((item) => (
              <TableRow
                key={item.id}
                onDoubleClick={() => {
                  setSelectedSpotlightsProductBanner({
                    id: item.id,
                    product: item.product,
                  });
                  setOpenCreateOrUpdateSpotlightsProductBannersDialog(true);
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Circle className="relative w-8 rounded-md bg-muted">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </Circle>
                    <div>
                      <p className="text-sm font-medium">{item.product.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Image
                    src={item.image}
                    width={300}
                    height={300}
                    className="h-[50px] w-auto overflow-hidden rounded-md"
                    alt={item.title}
                  />
                </TableCell>
                <TableCell
                  dangerouslySetInnerHTML={{
                    __html: item.title,
                  }}
                />

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedSpotlightsProductBanner({
                            id: item.id,
                            product: item.product,
                          });
                          setOpenCreateOrUpdateSpotlightsProductBannersDialog(
                            true
                          );
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={
                          deleteSpotlightsProductBannerMutationOptions.isPending
                        }
                        onClick={async () => {
                          if (await confirm({})) {
                            toast.promise(
                              deleteSpotlightsProductBannerMutationOptions.mutateAsync(
                                {
                                  id: item.id,
                                }
                              ),
                              {
                                loading: `Deleting spotlights product banner "${item.title}"`,
                                success(data) {
                                  spotlightsProductBannersQuery.refetch();
                                  return `Spotlights product banner "${data.data.data.title}" deleted.`;
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
            !!spotlightsProductBannersQuery.data &&
            spotlightsProductBannersQuery.data.data?.length <= 0
          }
          query={spotlightsProductBannersQuery}
        />
      </CardContent>
    </Card>
  );
};

export default SpotlightsProductBannersSection;
