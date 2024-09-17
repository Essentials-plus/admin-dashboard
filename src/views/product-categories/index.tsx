import {
  getDeleteProductCategoryMutationOptions,
  getUpdateProductCategoriesSortOrderMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getProductCategoriesQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import CreateOrUpdateProductCategoryForm from '@/components/create-or-update-product-category-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
import Spinner from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, extractQueryKey } from '@/lib/utils';
import { ApiResponseSuccessBase } from '@/types/api-responses';
import { ProductCategory } from '@/types/api-responses/product-category';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, GripVertical, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'sonner';

const ProductCategories = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editProductCategoryId, setEditProductCategoryId] = useState<
    undefined | string
  >(undefined);

  const productCategoriesQueryDefaultOptions =
    getProductCategoriesQueryOptions();

  const productCategoriesQuery = useQuery({
    ...productCategoriesQueryDefaultOptions,
  });

  const updateProductCategoriesSortOrderMutation = useMutation({
    ...getUpdateProductCategoriesSortOrderMutationOptions(),
    onSuccess() {
      productCategoriesQuery.refetch();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const productCategories = productCategoriesQuery.data?.data;

  const getItemIndex = (id: string | number | undefined) =>
    productCategories?.findIndex((category) => category.id === id);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (active.id === over?.id) return;

    queryClient.setQueryData(
      productCategoriesQueryDefaultOptions.queryKey,
      (oldData: ApiResponseSuccessBase<ProductCategory[]>) => {
        const originalPos = getItemIndex(active.id) as any;
        const newPos = getItemIndex(over?.id) as any;

        const newData = arrayMove(oldData.data, originalPos, newPos);

        updateProductCategoriesSortOrderMutation.mutate({
          ids: newData.map((item) => item.id),
        });

        return {
          ...oldData,
          data: newData,
        };
      }
    );
  };

  return (
    <section>
      <div className="flex items-center gap-4">
        <Button
          onClick={router.back}
          variant="outline"
          size="icon"
          className="size-7"
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[35%_auto]">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add new category</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateOrUpdateProductCategoryForm
                onCreateOrUpdate={() => {
                  productCategoriesQuery.refetch();
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle>All product categories</CardTitle>
                <CardDescription>
                  Manage your product categories from here.
                </CardDescription>
              </div>

              {updateProductCategoriesSortOrderMutation.isPending && (
                <Spinner className="size-5" />
              )}
            </CardHeader>
            <CardContent>
              <div className="relative">
                {Array.isArray(productCategories) && (
                  <DndContext
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={productCategories}
                      strategy={verticalListSortingStrategy}
                    >
                      <Table
                        wrapper={{ className: 'overflow-x-hidden py-0.5' }}
                      >
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>
                              <span className="sr-only">Actions</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productCategories.map((category) => (
                            <CategoryRow
                              category={category}
                              key={category.id}
                              setEditProductCategoryId={
                                setEditProductCategoryId
                              }
                              disableSortButton={
                                updateProductCategoriesSortOrderMutation.isPending
                              }
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
              <Dialog
                open={!!editProductCategoryId}
                onOpenChange={(value) => {
                  if (value === false) {
                    setEditProductCategoryId(undefined);
                  }
                }}
              >
                <DialogTrigger asChild></DialogTrigger>
                <DialogContent className="max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit category</DialogTitle>
                  </DialogHeader>
                  <CreateOrUpdateProductCategoryForm
                    categoryId={editProductCategoryId}
                    onCreateOrUpdate={() => {
                      productCategoriesQuery.refetch();
                      setEditProductCategoryId(undefined);
                    }}
                  />
                </DialogContent>
              </Dialog>

              <ApiStatusIndicator
                noData={
                  !!productCategoriesQuery.data &&
                  productCategoriesQuery.data.data?.length <= 0
                }
                query={productCategoriesQuery}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;

const CategoryRow = ({
  category,
  setEditProductCategoryId,
  disableSortButton,
}: {
  category: ProductCategory;
  setEditProductCategoryId: Dispatch<SetStateAction<string | undefined>>;
  disableSortButton?: boolean;
}) => {
  const queryClient = useQueryClient();

  const deleteProductCategoryMutation = useMutation({
    ...getDeleteProductCategoryMutationOptions(),
  });

  const {
    attributes,
    listeners,
    // transition,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    // transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      onDoubleClick={() => {
        setEditProductCategoryId(category.id);
      }}
      className={cn(
        isDragging && 'hover:bg-muted bg-muted',
        'focus-visible:ring-1 focus-visible:ring-red-600 outline-none ring-inset'
      )}
    >
      <TableCell>{category.name}</TableCell>
      <TableCell>{category.slug}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
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
                  setEditProductCategoryId(category.id);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={deleteProductCategoryMutation.isPending}
                onClick={async () => {
                  if (await confirm({})) {
                    toast.promise(
                      deleteProductCategoryMutation.mutateAsync({
                        id: category.id,
                      }),
                      {
                        loading: `Deleting product category "${category.name}"`,
                        success(data) {
                          queryClient.invalidateQueries({
                            queryKey: extractQueryKey(
                              getProductCategoriesQueryOptions
                            ),
                          });

                          return `Product category "${data.data.data.name}" deleted.`;
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

          <Button
            {...attributes}
            {...listeners}
            className="cursor-grab"
            size={'icon'}
            variant={'ghost'}
            disabled={disableSortButton}
          >
            <GripVertical className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
