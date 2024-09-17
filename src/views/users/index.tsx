import { MoreHorizontal } from 'lucide-react';

import { getDeleteUserOptions } from '@/api-clients/admin-api-client/mutations';
import { getUsersQueryOptions } from '@/api-clients/admin-api-client/queries';
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
import { useDebouncedValue } from '@mantine/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Users() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

  const usersQuery = usePaginatedQuery(({ page }) =>
    getUsersQueryOptions({
      axiosReqConfig: {
        params: {
          page,
          q: debouncedSearchQuery || null,
        },
      },
    })
  );

  const deleteUserMutation = useMutation({
    ...getDeleteUserOptions(),
  });

  const clearFilters = () => {
    setSearchQuery('');
  };

  const showClearFiltersButton = !!searchQuery.trim();

  return (
    <div>
      <div className="grid flex-1 items-start gap-4">
        {/* <div className="flex items-center">
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" variant={'outline'}>
              <Link href={routes.createWeeklyMeals}>
                <Plus className="size-4" />
                <span>Add weekly meals</span>
              </Link>
            </Button>
          </div>
        </div> */}
        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-5">
            <div className="space-y-1.5">
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage your users from here.</CardDescription>
            </div>

            <div className="flex gap-2 max-md:flex-wrap">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users"
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
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.data?.data?.map((user) => (
                  <TableRow
                    onDoubleClick={() => {
                      router.push(routes.editUser(user.id));
                    }}
                    key={user.id}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Circle className="relative w-7 bg-muted">
                          {user.profile ? (
                            <Image
                              src={user.profile}
                              alt={user.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            user.name[0]
                          )}
                        </Circle>
                        {user.name} {user.surname}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className="capitalize"
                        variant={
                          user.status === 'active'
                            ? 'success'
                            : user.status === 'blocked'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {user.status}
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
                          <DropdownMenuItem asChild>
                            <Link href={routes.editUser(user.id)}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={deleteUserMutation.isPending}
                            onClick={async () => {
                              if (await confirm({})) {
                                toast.promise(
                                  deleteUserMutation.mutateAsync({
                                    id: user.id,
                                  }),
                                  {
                                    loading: `Deleting user "${user.name}"`,
                                    success(data) {
                                      queryClient.invalidateQueries({
                                        queryKey:
                                          extractQueryKey(getUsersQueryOptions),
                                      });
                                      return `User "${data.data.data.name}" deleted.`;
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
              noData={!!usersQuery.data && usersQuery.data.data?.length <= 0}
              query={usersQuery}
            />
            <DataTablePagination query={usersQuery} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
