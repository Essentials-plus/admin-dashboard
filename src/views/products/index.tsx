import { MoreHorizontal, OctagonAlert, Plus, Star } from 'lucide-react';

import { getDeleteProductMutationOptions } from '@/api-clients/admin-api-client/mutations';
import {
  getProductCategoriesQueryOptions,
  getProductsQueryOptions,
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
import Circle from '@/components/ui/circle';
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
import usePaginatedQuery from '@/hooks/usePaginatedQuery';
import { cn, extractQueryKey } from '@/lib/utils';
import { useDebouncedValue } from '@mantine/hooks';
import { TooltipArrow } from '@radix-ui/react-tooltip';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const Products = () => {
  const queryClient = useQueryClient();

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

  const productCategoriesQuery = useQuery({
    ...getProductCategoriesQueryOptions(),
  });

  const categoryOptions = useMemo(
    () =>
      (productCategoriesQuery.data?.data || []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [productCategoriesQuery.data?.data]
  );

  const productsQuery = usePaginatedQuery(({ page }) =>
    getProductsQueryOptions({
      axiosReqConfig: {
        params: {
          page,
          q: debouncedSearchQuery,
          categoryId: categoryId || undefined,
        },
      },
    })
  );

  const deleteProductMutation = useMutation({
    ...getDeleteProductMutationOptions(),
  });

  const clearFilters = () => {
    setCategoryId('');
    setSearchQuery('');
  };

  const showClearFiltersButton = !!categoryId || !!searchQuery;

  return (
    <div>
      <div className="grid flex-1 items-start gap-4">
        <div className="flex items-center">
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" variant={'outline'}>
              <Link href={routes.createProduct}>
                <Plus className="size-4" />
                <span className="sm:whitespace-nowrap">Add product</span>
              </Link>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-5">
            <div className="space-y-1.5">
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your products from here.</CardDescription>
            </div>

            <div className="flex gap-2 max-md:flex-wrap">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="min-w-[200px]"
              />
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.length > 0 ? (
                    categoryOptions.map((option) => (
                      <SelectItem value={option.value} key={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="-" disabled>
                      No category to show:(
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>In stock</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsQuery.data?.data?.map((product) => (
                  <TableRow
                    onDoubleClick={() => {
                      router.push(routes.editProduct(product.id));
                    }}
                    key={product.id}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative size-fit">
                                <Circle
                                  tabIndex={0}
                                  className="__fv relative w-12 rounded-md bg-muted"
                                >
                                  <Image
                                    fill
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  />

                                  {product.images.length >= 2 && (
                                    <div className="absolute bottom-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-md bg-background px-1 text-[8px]">
                                      +{product.images.length - 1}
                                    </div>
                                  )}
                                </Circle>
                              </div>
                            </TooltipTrigger>

                            {product.images.length > 1 && (
                              <TooltipContent
                                collisionPadding={15}
                                className="overflow-hidden p-2"
                              >
                                <div className="flex max-h-[300px] max-w-[400px] flex-wrap gap-2 overflow-y-auto">
                                  {product.images.map((image, i) => (
                                    <Circle
                                      key={i}
                                      className="relative w-[94px] rounded-md bg-foreground/5"
                                    >
                                      <Image
                                        fill
                                        src={image}
                                        alt={product.name}
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                      />
                                    </Circle>
                                  ))}
                                </div>
                                <TooltipArrow className="fill-muted" />
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        <div className="flex items-center gap-2">
                          <p>{product.name}</p>
                          {product.showOnHomePageBanner && (
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Star className="size-2.5 fill-yellow-500 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  This product is added on the home page banner
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.type === 'simple' ? (
                        <div>
                          {typeof product.salePrice === 'number' && (
                            <p>
                              {envs.CURRENCY_SYMBOL}
                              {product.salePrice}
                            </p>
                          )}
                          <p
                            className={cn(
                              typeof product.salePrice === 'number' &&
                                'text-xs line-through opacity-60'
                            )}
                          >
                            {typeof product.regularPrice === 'number'
                              ? `${envs.CURRENCY_SYMBOL}${product.regularPrice}`
                              : '- - -'}
                          </p>
                        </div>
                      ) : (
                        '- - -'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {product.type === 'simple' &&
                        typeof product.stock === 'number'
                          ? product.stock
                          : '- - -'}

                        {((product.type === 'simple' &&
                          typeof product.stock === 'number' &&
                          typeof product.lowStockThreshold === 'number' &&
                          product.stock <= product.lowStockThreshold) ||
                          (product.type === 'variable' &&
                            product.variations?.find(
                              (variation) =>
                                typeof variation.stock === 'number' &&
                                typeof variation.lowStockThreshold ===
                                  'number' &&
                                variation.stock <= variation.lowStockThreshold
                            ))) && (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger className="__fv rounded-full">
                                <OctagonAlert className="size-3 text-destructive" />
                              </TooltipTrigger>
                              <TooltipContent>
                                {product.type === 'simple'
                                  ? (product.stock || 0) <= 0
                                    ? 'This product is out of stock. Customers will not be able to order this product'
                                    : 'This product is running low on stock.'
                                  : 'This product has some variation that running low on stock.'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={'outline'} className="capitalize">
                        {product.type}
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
                              router.push(routes.editProduct(product.id));
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={deleteProductMutation.isPending}
                            onClick={async () => {
                              if (await confirm({})) {
                                toast.promise(
                                  deleteProductMutation.mutateAsync({
                                    id: product.id,
                                  }),
                                  {
                                    loading: `Deleting product "${product.name}"`,
                                    success(data) {
                                      queryClient.invalidateQueries({
                                        queryKey: extractQueryKey(
                                          getProductsQueryOptions
                                        ),
                                      });
                                      return `Product "${data.data.data.name}" deleted.`;
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
                !!productsQuery.data && productsQuery.data.data?.length <= 0
              }
              query={productsQuery}
            />
            <DataTablePagination query={productsQuery} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Products;
