import { MoreHorizontal, Plus } from 'lucide-react';

import { getDeleteIngredientMutationOptions } from '@/api-clients/admin-api-client/mutations';
import {
  getIngredientCategoriesQueryOptions,
  getIngredientsQueryOptions,
} from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
import CreateOrUpdateIngredientForm from '@/components/create-or-update-ingredient-form';
import DataTablePagination from '@/components/data-table-pagination';
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
import usePaginatedQuery from '@/hooks/usePaginatedQuery';
import { extractQueryKey } from '@/lib/utils';
import { useDebouncedValue } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const Ingredients = () => {
  const [categoryId, setCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

  const queryClient = useQueryClient();
  const [openCreateIngredientDialog, setOpenCreateIngredientDialog] =
    useState(false);

  const [editIngredientId, setEditIngredientId] = useState<undefined | string>(
    undefined
  );

  const ingredientsQuery = usePaginatedQuery(({ page }) =>
    getIngredientsQueryOptions({
      axiosReqConfig: {
        params: {
          page,
          categoryId: categoryId || undefined,
          q: debouncedSearchQuery,
        },
      },
    })
  );

  const ingredientCategoriesQuery = useQuery({
    ...getIngredientCategoriesQueryOptions(),
  });

  const categoryOptions = useMemo(
    () =>
      (ingredientCategoriesQuery.data?.data || []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [ingredientCategoriesQuery.data?.data]
  );

  const deleteIngredientMutation = useMutation({
    ...getDeleteIngredientMutationOptions(),
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
            <Button
              onClick={() => {
                setOpenCreateIngredientDialog(true);
              }}
              size="sm"
              variant={'outline'}
            >
              <Plus className="size-4" />
              <span className="sm:whitespace-nowrap">Add ingredient</span>
            </Button>
            <Dialog
              open={openCreateIngredientDialog || !!editIngredientId}
              onOpenChange={() => {
                setOpenCreateIngredientDialog(false);
                setEditIngredientId(undefined);
              }}
            >
              <DialogContent>
                <DialogTitle>
                  {!!editIngredientId ? 'Update' : 'Create'} Ingredient
                </DialogTitle>
                <CreateOrUpdateIngredientForm
                  ingredientId={editIngredientId}
                  onApiError={() => {
                    setOpenCreateIngredientDialog(false);
                    setEditIngredientId(undefined);
                  }}
                  onCreateOrUpdate={() => {
                    setOpenCreateIngredientDialog(false);
                    setEditIngredientId(undefined);
                    queryClient.invalidateQueries({
                      queryKey: extractQueryKey(getIngredientsQueryOptions),
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
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>
                Manage your ingredients from here.
              </CardDescription>
            </div>

            <div className="flex gap-2 max-md:flex-wrap">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ingredients"
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
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Kcal</TableHead>
                  <TableHead>Proteins (gr) </TableHead>
                  <TableHead>Carbohydrates (gr) </TableHead>
                  <TableHead>Fats (gr) </TableHead>
                  <TableHead>Fiber (gr) </TableHead>
                  <TableHead>
                    {' '}
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredientsQuery.data?.data?.map((ingredient) => (
                  <TableRow
                    onDoubleClick={() => {
                      setEditIngredientId(ingredient.id);
                    }}
                    key={ingredient.id}
                  >
                    <TableCell>{ingredient.name}</TableCell>
                    <TableCell>
                      {ingredient.quantity} {ingredient.unit}
                    </TableCell>
                    <TableCell>{ingredient.unit}</TableCell>
                    <TableCell>{ingredient.kcal}</TableCell>
                    <TableCell>{ingredient.proteins}</TableCell>
                    <TableCell>{ingredient.carbohydrates}</TableCell>
                    <TableCell>{ingredient.fats}</TableCell>
                    <TableCell>{ingredient.fiber}</TableCell>
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
                              setEditIngredientId(ingredient.id);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={deleteIngredientMutation.isPending}
                            onClick={async () => {
                              if (await confirm({})) {
                                toast.promise(
                                  deleteIngredientMutation.mutateAsync({
                                    id: ingredient.id,
                                  }),
                                  {
                                    loading: `Deleting ingredient "${ingredient.name}"`,
                                    success(data) {
                                      queryClient.invalidateQueries({
                                        queryKey: extractQueryKey(
                                          getIngredientsQueryOptions
                                        ),
                                      });
                                      return `Ingredient "${data.data.data.name}" deleted.`;
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
                !!ingredientsQuery.data &&
                ingredientsQuery.data.data?.length <= 0
              }
              query={ingredientsQuery}
            />
            <DataTablePagination query={ingredientsQuery} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ingredients;
