import { MoreHorizontal, Plus } from 'lucide-react';
import Image from 'next/image';

import {
  getDeleteMealMutationOptions,
  getDuplicateMealMutationOptions,
} from '@/api-clients/admin-api-client/mutations';
import { getMealsQueryOptions } from '@/api-clients/admin-api-client/queries';
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
import routes from '@/config/routes';
import { mealTypeOptions } from '@/constants/meal';
import usePaginatedQuery from '@/hooks/usePaginatedQuery';
import { extractQueryKey } from '@/lib/utils';
import { useDebouncedValue } from '@mantine/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Meals() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [mealType, setMealType] = useState<string>('');

  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

  const mealsQuery = usePaginatedQuery(({ page }) =>
    getMealsQueryOptions({
      axiosReqConfig: {
        params: {
          page,
          q: debouncedSearchQuery || null,
          mealType: mealType || null,
        },
      },
    })
  );

  const deleteMealMutation = useMutation({
    ...getDeleteMealMutationOptions(),
  });
  const duplicateMealMutation = useMutation({
    ...getDuplicateMealMutationOptions(),
  });

  const clearFilters = () => {
    setMealType('');
    setSearchQuery('');
  };

  const showClearFiltersButton = !!mealType || !!searchQuery;

  return (
    <div>
      <div className="grid flex-1 items-start gap-4">
        <div className="flex items-center">
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" variant={'outline'}>
              <Link href={routes.createMeal}>
                <Plus className="size-4" />
                <span>Add meal</span>
              </Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-5">
            <div className="space-y-1.5">
              <CardTitle>Meals</CardTitle>
              <CardDescription>Manage your meals from here.</CardDescription>
            </div>

            <div className="flex gap-2 max-md:flex-wrap">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meals"
                className="min-w-[200px]"
              />
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypeOptions.map((option) => (
                    <SelectItem value={option.value} key={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cooking time</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mealsQuery.data?.data?.map((meal) => (
                  <TableRow
                    onDoubleClick={() => {
                      router.push(routes.editMeal(meal.id));
                    }}
                    key={meal.id}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Circle className="relative w-12 rounded-md bg-muted">
                          <Image
                            fill
                            src={meal.image}
                            alt={meal.mealName}
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </Circle>
                        <p>{meal.mealName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="capitalize" variant={'outline'}>
                        {meal.meal}
                      </Badge>
                    </TableCell>
                    <TableCell>{meal.cookingTime}</TableCell>
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
                          <DropdownMenuItem asChild>
                            <Link href={routes.editMeal(meal.id)}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={duplicateMealMutation.isPending}
                            onClick={async () => {
                              if (
                                await confirm({
                                  description:
                                    'You are going to duplicate a meal.',
                                })
                              ) {
                                toast.promise(
                                  duplicateMealMutation.mutateAsync({
                                    mealId: meal.id,
                                  }),
                                  {
                                    loading: `Duplicating meal "${meal.mealName}"`,
                                    success() {
                                      queryClient.invalidateQueries({
                                        queryKey:
                                          extractQueryKey(getMealsQueryOptions),
                                      });
                                      return `Meal "${meal.mealName}" duplicated successfully.`;
                                    },
                                  }
                                );
                              }
                            }}
                          >
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={deleteMealMutation.isPending}
                            onClick={async () => {
                              if (await confirm({})) {
                                toast.promise(
                                  deleteMealMutation.mutateAsync({
                                    id: meal.id,
                                  }),
                                  {
                                    loading: `Deleting meal "${meal.mealName}"`,
                                    success(data) {
                                      queryClient.invalidateQueries({
                                        queryKey:
                                          extractQueryKey(getMealsQueryOptions),
                                      });
                                      return `Meal "${data.data.data.mealName}" deleted.`;
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
              noData={!!mealsQuery.data && mealsQuery.data.data?.length <= 0}
              query={mealsQuery}
            />
            <DataTablePagination query={mealsQuery} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
