import { getMealsQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import CreateOrUpdateMealForm from '@/components/create-or-update-meal-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { cn, extractQueryKey } from '@/lib/utils';
import { Meal, MealType } from '@/types/api-responses/meal';
import { useDebouncedValue } from '@mantine/hooks';
import { PopoverAnchor } from '@radix-ui/react-popover';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { ComponentPropsWithoutRef, useRef, useState } from 'react';

type SearchMealsPopoverProps = {
  // eslint-disable-next-line no-unused-vars
  onSelect?: (meal: Meal) => void;
  mealType?: MealType;
  inputProps?: ComponentPropsWithoutRef<'input'>;
};

const SearchMealsPopover = ({
  onSelect,
  mealType,
  inputProps,
}: SearchMealsPopoverProps) => {
  const queryClient = useQueryClient();

  const [openCreateMealDialog, setOpenCreateMealDialog] = useState(false);

  const [openSearchResults, setOpenSearchResults] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const [debouncedsearchValue] = useDebouncedValue(searchValue, 500);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const mealsQuery = useQuery({
    ...getMealsQueryOptions({
      axiosReqConfig: {
        params: {
          q: debouncedsearchValue,
          mealType,
          filterLimit: 999999999999,
        },
      },
    }),
    enabled: !!debouncedsearchValue || openSearchResults,
  });

  const hasSearchValue = !!searchValue.trim();
  return (
    <Command>
      <Popover open={openSearchResults} onOpenChange={setOpenSearchResults}>
        <PopoverAnchor asChild>
          <div onClick={() => setOpenSearchResults(true)} className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              ref={searchInputRef}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              autoComplete="off"
              placeholder="Search meals"
              className="pl-9"
              onFocus={() => {
                setTimeout(() => {
                  setOpenSearchResults(true);
                }, 100);
              }}
              {...inputProps}
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          sideOffset={10}
          className={cn(
            'w-[--radix-popover-trigger-width] max-h-[400px] overflow-y-auto',
            !hasSearchValue && 'hidden',
            !debouncedsearchValue.trim() && 'hidden',
            (mealsQuery.data?.data || []).length > 0 && 'block'
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command.List>
            <ApiStatusIndicator
              query={mealsQuery}
              noData={
                (mealsQuery.data?.data || [])?.length <= 0 && hasSearchValue
              }
              noDataContent={
                <div className="flex flex-col items-center justify-center gap-3">
                  <p className="text-lg font-medium opacity-80">
                    No meals found
                  </p>
                  <Dialog
                    open={openCreateMealDialog}
                    onOpenChange={setOpenCreateMealDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>Add meal</Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[95vh] max-w-[1200px] overflow-y-auto pt-14">
                      <CreateOrUpdateMealForm
                        hideGoBackButton
                        defaultInitialValues={{
                          mealName: searchValue,
                        }}
                        onApiError={() => {
                          setOpenCreateMealDialog(false);
                        }}
                        onCreateOrUpdate={(meal) => {
                          setOpenCreateMealDialog(false);
                          onSelect && onSelect(meal);
                          setSearchValue('');
                          searchInputRef.current?.focus();

                          queryClient.invalidateQueries({
                            queryKey: extractQueryKey(getMealsQueryOptions),
                          });
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              }
            />
            {mealsQuery.data?.data?.map((meal) => (
              <Command.Item
                onSelect={() => {
                  onSelect && onSelect(meal);
                  setSearchValue('');
                  setOpenSearchResults(false);
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                    setOpenSearchResults(true);
                  }, 350);
                }}
                key={meal.id}
                className="cursor-pointer rounded-md px-3 py-1.5 aria-[selected=true]:bg-muted"
              >
                <p className="text-sm">{meal.mealName}</p>
              </Command.Item>
            ))}
          </Command.List>
        </PopoverContent>
      </Popover>
    </Command>
  );
};

export default SearchMealsPopover;
