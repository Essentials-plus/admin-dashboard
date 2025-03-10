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
import { cn } from '@/lib/utils';
import { ApiResponseSuccessBase } from '@/types/api-responses';
import { PaginationMeta } from '@/types/api-responses/pagination-meta';
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
import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, GripVertical, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  CSSProperties,
  Dispatch,
  SetStateAction,
  forwardRef,
  useEffect,
  useState,
} from 'react';
import useMeasure from 'react-use-measure';
import { toast } from 'sonner';

const tableGrid = 'grid grid-cols-[auto,300px,100px] gap-5 text-sm';

const ProductCategories = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editProductCategoryId, setEditProductCategoryId] = useState<
    undefined | string
  >(undefined);

  const productCategoriesQueryDefaultOptions = getProductCategoriesQueryOptions(
    {
      axiosReqConfig: {
        params: {
          where: { parentCategoryId: 'null' },
        },
      },
    }
  );

  const productCategoriesQuery = useQuery({
    ...productCategoriesQueryDefaultOptions,
  });

  const categories = productCategoriesQuery.data?.data;

  const invalidateProductCategoriesQuery = () => {
    queryClient.invalidateQueries({
      queryKey: getProductCategoriesQueryOptions().queryKey.slice(0, 1),
    });
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
                  invalidateProductCategoriesQuery();
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

              {/* @TODO */}
              {/* {updateProductCategoriesSortOrderMutation.isPending && (
                <Spinner className="size-5" />
              )} */}
            </CardHeader>
            <CardContent>
              <ProductCategoriesDND
                invalidateProductCategoriesQuery={
                  invalidateProductCategoriesQuery
                }
                categories={categories || []}
                productCategoriesQuery={productCategoriesQuery}
                productCategoriesQueryDefaultOptions={
                  productCategoriesQueryDefaultOptions
                }
                setEditProductCategoryId={setEditProductCategoryId}
              />
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
                      invalidateProductCategoriesQuery();
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

type CategoriyRowProps = {
  category: ProductCategory;
  setEditProductCategoryId: Dispatch<SetStateAction<string | undefined>>;
  disableSortButton?: boolean;
  invalidateProductCategoriesQuery: () => void;
  hideRoundedBorder?: boolean;
};
const CategoryRow = forwardRef<HTMLDivElement, CategoriyRowProps>(
  (
    {
      category,
      setEditProductCategoryId,
      disableSortButton,
      invalidateProductCategoriesQuery,
      hideRoundedBorder = false,
    },
    ref
  ) => {
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

    const productSubCategoriesQueryDefaultOptions =
      getProductCategoriesQueryOptions({
        axiosReqConfig: {
          params: {
            where: { parentCategoryId: category.id },
          },
        },
      });
    const productSubCategoriesQuery = useQuery({
      ...productSubCategoriesQueryDefaultOptions,
    });

    const subCategories = productSubCategoriesQuery.data?.data || [];

    return (
      <motion.div {...(isDragging ? {} : { layout: true })} ref={ref}>
        <div
          ref={setNodeRef}
          style={style}
          onDoubleClick={() => {
            setEditProductCategoryId(category.id);
          }}
          className={cn(
            tableGrid,
            'relative pt-2.5 isolate group',
            'hover:bg-transparent',
            'focus-visible:ring-1 focus-visible:ring-red-600 outline-none ring-inset'
          )}
        >
          <div className="pointer-events-none absolute inset-0 -inset-x-1 z-[-1] translate-y-[5px] rounded-md bg-muted opacity-0 duration-100 group-hover:opacity-100" />
          {!hideRoundedBorder && (
            <span className="pointer-events-none absolute top-[calc(50%-10px)] z-10 size-5 -translate-x-full -translate-y-1/2 rounded-bl-lg border-b-[1.5px] border-l-[1.5px]" />
          )}
          <div>
            <div className="relative flex items-center gap-2">
              {/* <span className="absolute right-full top-1/2 z-10 h-px w-6 -translate-y-1/2 bg-red-600" /> */}
              <Image
                src={category.image}
                alt={category.name}
                className="h-10 w-auto rounded-md object-cover ring-1 ring-border"
                width={500}
                height={500}
              />
              {category.name}
            </div>
          </div>
          <div className="flex items-center">{category.slug}</div>
          <div>
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
                              invalidateProductCategoriesQuery();
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
          </div>
        </div>

        {subCategories.length > 0 && (
          <div
          // className={cn(isDragging && 'hidden')}
          >
            <div>
              <div className="relative pl-10">
                <ProductCategoriesDND
                  invalidateProductCategoriesQuery={
                    invalidateProductCategoriesQuery
                  }
                  hideTableHeader
                  sortOrderPrefix={category.sortOrder}
                  setEditProductCategoryId={setEditProductCategoryId}
                  categories={subCategories}
                  productCategoriesQuery={productSubCategoriesQuery}
                  productCategoriesQueryDefaultOptions={
                    productSubCategoriesQueryDefaultOptions
                  }
                />
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  }
);
CategoryRow.displayName = 'CategoryRow';

const ProductCategoriesDND = ({
  categories,
  productCategoriesQuery,
  productCategoriesQueryDefaultOptions,
  setEditProductCategoryId,
  hideTableHeader = false,
  sortOrderPrefix,
  invalidateProductCategoriesQuery,
}: {
  hideTableHeader?: boolean;
  categories: ProductCategory[];
  productCategoriesQuery: UseQueryResult<
    {
      data: ProductCategory[];
      meta?: PaginationMeta;
      success: true;
    },
    Error
  >;
  productCategoriesQueryDefaultOptions: any;
  sortOrderPrefix?: number;
  setEditProductCategoryId: Dispatch<SetStateAction<string | undefined>>;
  invalidateProductCategoriesQuery: () => void;
}) => {
  const [firstRowRef, firstRowBounds] = useMeasure();
  const [lastRowRef, lastRowBounds] = useMeasure();

  const [reRender, setReRender] = useState(0);

  const queryClient = useQueryClient();

  const updateProductCategoriesSortOrderMutation = useMutation({
    ...getUpdateProductCategoriesSortOrderMutationOptions({
      axiosConfig: {
        params: {
          sortOrderPrefix,
        },
      },
    }),
    onSuccess() {
      productCategoriesQuery.refetch();
    },
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setReRender((prev) => prev + 1);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getItemIndex = (id: string | number | undefined) =>
    categories?.findIndex((category) => category.id === id);

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
    <div className="relative">
      {hideTableHeader && (
        <div
          style={
            {
              '--lineHeight':
                lastRowBounds.top - firstRowBounds.top + 10 + 'px',
            } as CSSProperties
          }
          className="absolute left-0 top-0 h-[--lineHeight] w-5 -translate-x-full border-l-[1.5px]"
        />
      )}

      {Array.isArray(categories) && (
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={categories}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {!hideTableHeader && (
                <div>
                  <div className={cn(tableGrid, 'text-muted-foreground')}>
                    <div>Name</div>
                    <div>Slug</div>
                    <div>
                      <span className="sr-only">Actions</span>
                    </div>
                  </div>
                </div>
              )}
              <div key={reRender}>
                {categories.map((category, i) => (
                  <CategoryRow
                    ref={
                      i === 0
                        ? firstRowRef
                        : i + 1 === categories.length
                        ? lastRowRef
                        : undefined
                    }
                    invalidateProductCategoriesQuery={
                      invalidateProductCategoriesQuery
                    }
                    hideRoundedBorder={!hideTableHeader}
                    category={category}
                    key={category.id}
                    setEditProductCategoryId={setEditProductCategoryId}
                    disableSortButton={
                      updateProductCategoriesSortOrderMutation.isPending
                    }
                  />
                ))}
              </div>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
