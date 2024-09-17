import {
  getDeleteProductAttributeTermMutationOptions,
  getUpdateProductAttributeTermsSortOrderMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import {
  getProductAttributeByIdQueryOptions,
  getProductAttributeTermsQueryOptions,
} from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import CreateOrUpdateProductAttributeTermForm from '@/components/create-or-update-product-attribute-term-form';
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
import { cn } from '@/lib/utils';
import { ApiResponseSuccessBase } from '@/types/api-responses';
import { ProductAttributeTerms } from '@/types/api-responses/product-attribute';
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

const ProductsAttributeTerms = () => {
  const router = useRouter();
  const attributeId = router.query.attributeId as string;
  const queryClient = useQueryClient();

  const [editProductAttributeTermId, setEditProductAttributeTermId] = useState<
    undefined | string
  >(undefined);

  const productAttributeTermsQueryDefaultOptions =
    getProductAttributeTermsQueryOptions({
      attributeId,
    });

  const productAttributeTermsQuery = useQuery({
    ...productAttributeTermsQueryDefaultOptions,
  });

  const productAttributeByIdQuery = useQuery({
    ...getProductAttributeByIdQueryOptions({
      id: attributeId,
    }),
  });

  const updateProductAttributeTermsSortOrderMutation = useMutation({
    ...getUpdateProductAttributeTermsSortOrderMutationOptions(),
    onSuccess() {
      productAttributeTermsQuery.refetch();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!productAttributeByIdQuery.data) {
    return (
      <ApiStatusIndicator noData={false} query={productAttributeByIdQuery} />
    );
  }
  const productAttributeTerms = productAttributeTermsQuery.data?.data;

  const getItemIndex = (id: string | number | undefined) =>
    productAttributeTerms?.findIndex((term) => term.id === id);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (active.id === over?.id) return;

    queryClient.setQueryData(
      productAttributeTermsQueryDefaultOptions.queryKey,
      (oldData: ApiResponseSuccessBase<ProductAttributeTerms[]>) => {
        const originalPos = getItemIndex(active.id) as any;
        const newPos = getItemIndex(over?.id) as any;

        const newData = arrayMove(oldData.data, originalPos, newPos);

        updateProductAttributeTermsSortOrderMutation.mutate({
          termIds: newData.map((item) => item.id),
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
        <h1 className="text-2xl font-bold">
          Term: {productAttributeByIdQuery.data?.data.name}
        </h1>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[35%_auto]">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add new term</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateOrUpdateProductAttributeTermForm
                onCreateOrUpdate={() => {
                  productAttributeTermsQuery.refetch();
                }}
                attributeId={attributeId}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle>
                  All terms for {productAttributeByIdQuery.data?.data.name}
                </CardTitle>
                <CardDescription>
                  Manage your attribute terms from here.
                </CardDescription>
              </div>

              {updateProductAttributeTermsSortOrderMutation.isPending && (
                <Spinner className="size-5" />
              )}
            </CardHeader>
            <CardContent>
              <div className="relative">
                {Array.isArray(productAttributeTerms) && (
                  <DndContext
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={productAttributeTerms}
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
                          {productAttributeTerms.map((term) => (
                            <AttributeTermRow
                              term={term}
                              key={term.id}
                              setEditProductAttributeTermId={
                                setEditProductAttributeTermId
                              }
                              disableSortButton={
                                updateProductAttributeTermsSortOrderMutation.isPending
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
                open={!!editProductAttributeTermId}
                onOpenChange={(value) => {
                  if (value === false) {
                    setEditProductAttributeTermId(undefined);
                  }
                }}
              >
                <DialogTrigger asChild></DialogTrigger>
                <DialogContent className="max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit term</DialogTitle>
                  </DialogHeader>
                  <CreateOrUpdateProductAttributeTermForm
                    attributeTermId={editProductAttributeTermId}
                    attributeId={attributeId}
                    onCreateOrUpdate={() => {
                      productAttributeTermsQuery.refetch();
                      setEditProductAttributeTermId(undefined);
                    }}
                  />
                </DialogContent>
              </Dialog>

              <ApiStatusIndicator
                noData={
                  !!productAttributeTermsQuery.data &&
                  productAttributeTermsQuery.data.data?.length <= 0
                }
                query={productAttributeTermsQuery}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProductsAttributeTerms;

const AttributeTermRow = ({
  term,
  setEditProductAttributeTermId,
  disableSortButton,
}: {
  term: ProductAttributeTerms;
  setEditProductAttributeTermId: Dispatch<SetStateAction<string | undefined>>;
  disableSortButton?: boolean;
}) => {
  const router = useRouter();
  const attributeId = router.query.attributeId as string;

  const queryClient = useQueryClient();
  const deleteProductAttributeTermMutation = useMutation({
    ...getDeleteProductAttributeTermMutationOptions(),
  });

  const {
    attributes,
    listeners,
    // transition,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: term.id });

  const style = {
    // transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      onDoubleClick={() => {
        setEditProductAttributeTermId(term.id);
      }}
      className={cn(
        isDragging && 'hover:bg-muted bg-muted',
        'focus-visible:ring-1 focus-visible:ring-red-600 outline-none ring-inset'
      )}
    >
      <TableCell>{term.name}</TableCell>
      <TableCell>{term.slug}</TableCell>
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
                  setEditProductAttributeTermId(term.id);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={deleteProductAttributeTermMutation.isPending}
                onClick={async () => {
                  if (await confirm({})) {
                    toast.promise(
                      deleteProductAttributeTermMutation.mutateAsync({
                        id: term.id,
                      }),
                      {
                        loading: `Deleting product attribute "${term.name}"`,
                        success(data) {
                          queryClient.invalidateQueries({
                            queryKey: getProductAttributeTermsQueryOptions({
                              attributeId,
                            }).queryKey,
                          });

                          return `Product attribute "${data.data.data.name}" deleted.`;
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
