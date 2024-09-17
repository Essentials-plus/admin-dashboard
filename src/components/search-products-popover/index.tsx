import { getProductsQueryOptions } from '@/api-clients/admin-api-client/queries';
import ApiStatusIndicator from '@/components/api-status-indicator';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Product } from '@/types/api-responses/product';
import { useDebouncedValue } from '@mantine/hooks';
import { PopoverAnchor } from '@radix-ui/react-popover';
import { useQuery } from '@tanstack/react-query';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { useRef, useState } from 'react';

type SearchProductsPopoverProps = {
  // eslint-disable-next-line no-unused-vars
  onSelect?: (product: Product) => void;
};

const SearchProductsPopover = ({ onSelect }: SearchProductsPopoverProps) => {
  // const [openCreateProductDialog, setOpenCreateProductDialog] = useState(false);
  const [openSearchResults, setOpenSearchResults] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const [debouncedsearchValue] = useDebouncedValue(searchValue, 500);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // const queryClient = useQueryClient();

  const productsQuery = useQuery({
    ...getProductsQueryOptions({
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
              placeholder="Search products"
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
            query={productsQuery}
            noData={
              (productsQuery.data?.data || [])?.length <= 0 && hasSearchValue
            }
            noDataContent={<p className="text-sm">No products found :(</p>}
            wrapper={{
              className: 'py-5 text-sm',
            }}
            // noDataContent={
            //   <div className="flex flex-col items-center justify-center gap-3">
            //     <p className="text-lg font-medium opacity-80">
            //       No products found
            //     </p>
            //     <Dialog
            //       open={openCreateProductDialog}
            //       onOpenChange={setOpenCreateProductDialog}
            //     >
            //       <DialogTrigger asChild>
            //         <Button>Add product</Button>
            //       </DialogTrigger>
            //       <DialogContent>
            //         <DialogTitle>Create Product</DialogTitle>
            //         <CreateOrUpdateProductForm
            //           defaultInitialValues={{
            //             name: searchValue,
            //           }}
            //           onApiError={() => {
            //             setOpenCreateProductDialog(false);
            //           }}
            //           onCreateOrUpdate={(product) => {
            //             setOpenCreateProductDialog(false);
            //             onSelect && onSelect(product);
            //             setSearchValue('');
            //             searchInputRef.current?.focus();

            //             queryClient.invalidateQueries({
            //               queryKey: extractQueryKey(getProductsQueryOptions),
            //               exact: false,
            //             });
            //           }}
            //         />
            //       </DialogContent>
            //     </Dialog>
            //   </div>
            // }
          />
          <Command.List>
            {productsQuery.data?.data?.map((product) => (
              <Command.Item
                value={product.id}
                onSelect={() => {
                  onSelect && onSelect(product);
                  setSearchValue('');
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 0);
                }}
                key={product.id}
                className="cursor-pointer rounded-md px-3 py-1.5 aria-[selected=true]:bg-muted"
              >
                <p className="text-sm">{product.name}</p>
              </Command.Item>
            ))}
          </Command.List>
        </PopoverContent>
      </Popover>
    </Command>
  );
};

export default SearchProductsPopover;
