import { getIngredientsQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import CreateOrUpdateIngredientForm from '@/components/create-or-update-ingredient-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { cn, extractQueryKey } from '@/lib/utils';
import { Ingredient } from '@/types/api-responses/ingredient';
import { useDebouncedValue } from '@mantine/hooks';
import { PopoverAnchor } from '@radix-ui/react-popover';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { useRef, useState } from 'react';

type SearchIngredientsPopoverProps = {
  // eslint-disable-next-line no-unused-vars
  onSelect?: (ingredient: Ingredient) => void;
};

const SearchIngredientsPopover = ({
  onSelect,
}: SearchIngredientsPopoverProps) => {
  const [openCreateIngredientDialog, setOpenCreateIngredientDialog] =
    useState(false);
  const [openSearchResults, setOpenSearchResults] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const [debouncedsearchValue] = useDebouncedValue(searchValue, 500);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const ingredientsQuery = useQuery({
    ...getIngredientsQueryOptions({
      axiosReqConfig: {
        params: {
          q: debouncedsearchValue,
          limit: 100,
        },
      },
    }),
    enabled: !!debouncedsearchValue,
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
              placeholder="Search ingredients"
              className="pl-9"
              onFocus={() => {
                setTimeout(() => {
                  setOpenSearchResults(true);
                }, 100);
              }}
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          sideOffset={10}
          className={cn(
            'w-[--radix-popover-trigger-width] max-h-[400px] overflow-y-auto',
            !hasSearchValue && 'hidden',
            !debouncedsearchValue.trim() && 'hidden'
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ApiStatusIndicator
            query={ingredientsQuery}
            noData={
              (ingredientsQuery.data?.data || [])?.length <= 0 && hasSearchValue
            }
            noDataContent={
              <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-lg font-medium opacity-80">
                  No ingredients found
                </p>
                <Dialog
                  open={openCreateIngredientDialog}
                  onOpenChange={setOpenCreateIngredientDialog}
                >
                  <DialogTrigger asChild>
                    <Button>Add ingredient</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Create Ingredient</DialogTitle>
                    <CreateOrUpdateIngredientForm
                      defaultInitialValues={{
                        name: searchValue,
                      }}
                      onApiError={() => {
                        setOpenCreateIngredientDialog(false);
                      }}
                      onCreateOrUpdate={(ingredient) => {
                        setOpenCreateIngredientDialog(false);
                        onSelect && onSelect(ingredient);
                        setSearchValue('');
                        searchInputRef.current?.focus();

                        queryClient.invalidateQueries({
                          queryKey: extractQueryKey(getIngredientsQueryOptions),
                          exact: false,
                        });
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            }
          />
          <Command.List>
            {ingredientsQuery.data?.data?.map((ingredient) => (
              <Command.Item
                value={ingredient.id}
                onSelect={() => {
                  onSelect && onSelect(ingredient);
                  setSearchValue('');
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 0);
                }}
                key={ingredient.id}
                className="cursor-pointer rounded-md px-3 py-1.5 aria-[selected=true]:bg-muted"
              >
                <p className="text-sm">{ingredient.name}</p>
              </Command.Item>
            ))}
          </Command.List>
        </PopoverContent>
      </Popover>
    </Command>
  );
};

export default SearchIngredientsPopover;
