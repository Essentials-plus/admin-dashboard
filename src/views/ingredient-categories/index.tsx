import {
  getDeleteIngredientCategoryMutationOptions,
  getUpdateIngredientCategoriesSortOrderMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getIngredientCategoriesQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import CreateOrUpdateIngredientCategoryForm from '@/components/create-or-update-ingredient-category-form';
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
import { IngredientCategory } from '@/types/api-responses/ingredient-category';
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

const IngredientCategories = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editIngredientCategoryId, setEditIngredientCategoryId] = useState<
    undefined | string
  >(undefined);

  const ingredientCategoriesQueryDefaultOptions =
    getIngredientCategoriesQueryOptions();

  const ingredientCategoriesQuery = useQuery({
    ...ingredientCategoriesQueryDefaultOptions,
  });

  const updateIngredientCategoriesSortOrderMutation = useMutation({
    ...getUpdateIngredientCategoriesSortOrderMutationOptions(),
    onSuccess() {
      ingredientCategoriesQuery.refetch();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const ingredientCategories = ingredientCategoriesQuery.data?.data;

  const getItemIndex = (id: string | number | undefined) =>
    ingredientCategories?.findIndex((category) => category.id === id);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (active.id === over?.id) return;

    queryClient.setQueryData(
      ingredientCategoriesQueryDefaultOptions.queryKey,
      (oldData: ApiResponseSuccessBase<IngredientCategory[]>) => {
        const originalPos = getItemIndex(active.id) as any;
        const newPos = getItemIndex(over?.id) as any;

        const newData = arrayMove(oldData.data, originalPos, newPos);

        updateIngredientCategoriesSortOrderMutation.mutate({
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
              <CreateOrUpdateIngredientCategoryForm
                onCreateOrUpdate={() => {
                  ingredientCategoriesQuery.refetch();
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle>All ingredient categories</CardTitle>
                <CardDescription>
                  Manage your ingredient categories from here.
                </CardDescription>
              </div>

              {updateIngredientCategoriesSortOrderMutation.isPending && (
                <Spinner className="size-5" />
              )}
            </CardHeader>
            <CardContent>
              <div className="relative">
                {Array.isArray(ingredientCategories) && (
                  <DndContext
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={ingredientCategories}
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
                          {ingredientCategories.map((category) => (
                            <CategoryRow
                              category={category}
                              key={category.id}
                              setEditIngredientCategoryId={
                                setEditIngredientCategoryId
                              }
                              disableSortButton={
                                updateIngredientCategoriesSortOrderMutation.isPending
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
                open={!!editIngredientCategoryId}
                onOpenChange={(value) => {
                  if (value === false) {
                    setEditIngredientCategoryId(undefined);
                  }
                }}
              >
                <DialogTrigger asChild></DialogTrigger>
                <DialogContent className="max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit category</DialogTitle>
                  </DialogHeader>
                  <CreateOrUpdateIngredientCategoryForm
                    categoryId={editIngredientCategoryId}
                    onCreateOrUpdate={() => {
                      ingredientCategoriesQuery.refetch();
                      setEditIngredientCategoryId(undefined);
                    }}
                  />
                </DialogContent>
              </Dialog>

              <ApiStatusIndicator
                noData={
                  !!ingredientCategoriesQuery.data &&
                  ingredientCategoriesQuery.data.data?.length <= 0
                }
                query={ingredientCategoriesQuery}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default IngredientCategories;

const CategoryRow = ({
  category,
  setEditIngredientCategoryId,
  disableSortButton,
}: {
  category: IngredientCategory;
  setEditIngredientCategoryId: Dispatch<SetStateAction<string | undefined>>;
  disableSortButton?: boolean;
}) => {
  const queryClient = useQueryClient();

  const deleteIngredientCategoryMutation = useMutation({
    ...getDeleteIngredientCategoryMutationOptions(),
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
        setEditIngredientCategoryId(category.id);
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
                  setEditIngredientCategoryId(category.id);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={deleteIngredientCategoryMutation.isPending}
                onClick={async () => {
                  if (await confirm({})) {
                    toast.promise(
                      deleteIngredientCategoryMutation.mutateAsync({
                        id: category.id,
                      }),
                      {
                        loading: `Deleting ingredient category "${category.name}"`,
                        success(data) {
                          queryClient.invalidateQueries({
                            queryKey: extractQueryKey(
                              getIngredientCategoriesQueryOptions
                            ),
                          });

                          return `Ingredient category "${data.data.data.name}" deleted.`;
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
