import { MoreHorizontal, Plus } from 'lucide-react';

import { getDeleteWeeklyMealsOptions } from '@/api-clients/admin-api-client/mutations';
import { getWeeklyMealsQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { confirm } from '@/components/confirm';
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
import routes from '@/config/routes';
import usePaginatedQuery from '@/hooks/usePaginatedQuery';
import { extractQueryKey } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

export default function WeeklyMeals() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const weeklyMealsQuery = usePaginatedQuery(({ page }) =>
    getWeeklyMealsQueryOptions({
      axiosReqConfig: {
        params: {
          page,
        },
      },
    })
  );

  const deleteWeeklyMealsMutation = useMutation({
    ...getDeleteWeeklyMealsOptions(),
  });

  return (
    <div>
      <div className="grid flex-1 items-start gap-4">
        <div className="flex items-center">
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" variant={'outline'}>
              <Link href={routes.createWeeklyMeal}>
                <Plus className="size-4" />
                <span>Add weekly meals</span>
              </Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Meals</CardTitle>
            <CardDescription>
              Manage your weekly meals from here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Total Meals</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeklyMealsQuery.data?.data?.map((weeklyMeal) => (
                  <TableRow
                    onDoubleClick={() => {
                      router.push(routes.editWeeklyMeal(weeklyMeal.id));
                    }}
                    key={weeklyMeal.id}
                  >
                    <TableCell>{weeklyMeal.week}</TableCell>
                    <TableCell>{weeklyMeal.meals.length}</TableCell>
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
                            <Link href={routes.editWeeklyMeal(weeklyMeal.id)}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={deleteWeeklyMealsMutation.isPending}
                            onClick={async () => {
                              if (await confirm({})) {
                                toast.promise(
                                  deleteWeeklyMealsMutation.mutateAsync({
                                    id: weeklyMeal.id,
                                  }),
                                  {
                                    loading: `Deleting week "${weeklyMeal.week}"`,
                                    success(data) {
                                      queryClient.invalidateQueries({
                                        queryKey: extractQueryKey(
                                          getWeeklyMealsQueryOptions
                                        ),
                                      });
                                      return `Week ${data.data.data.week} deleted.`;
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
                !!weeklyMealsQuery.data &&
                weeklyMealsQuery.data.data?.length <= 0
              }
              query={weeklyMealsQuery}
            />
            <DataTablePagination query={weeklyMealsQuery} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
