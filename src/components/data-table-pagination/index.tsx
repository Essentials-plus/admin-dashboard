import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ApiResponseSuccessBase } from '@/types/api-responses';
import { usePagination } from '@mantine/hooks';
import { UseQueryResult } from '@tanstack/react-query';

type DataTablePaginationProps = {
  query: UseQueryResult<ApiResponseSuccessBase<any>> & {
    // eslint-disable-next-line no-unused-vars
    fetchPage: (page: number) => void;
    activePage: number;
    totalPage: number | undefined;
  };
};

const DataTablePagination = ({ query }: DataTablePaginationProps) => {
  const pagination = usePagination({
    total: query.totalPage || 0,
    page: query.activePage,
    onChange(page) {
      query.fetchPage(page);
    },
  });

  if (pagination.range.length <= 0) return null;

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem onClick={pagination.first}>
          <PaginationFirst disabled={query.data?.meta?.previousPage === null} />
        </PaginationItem>
        <PaginationItem onClick={pagination.previous}>
          <PaginationPrevious
            disabled={query.data?.meta?.previousPage === null}
          />
        </PaginationItem>
        {pagination.range.map((page, i) => (
          <PaginationItem
            key={`${i}_${page}`}
            onClick={() => {
              if (page !== 'dots') {
                pagination.setPage(page);
              }
            }}
          >
            {page === 'dots' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationButton isActive={page === pagination.active}>
                {page}
              </PaginationButton>
            )}
          </PaginationItem>
        ))}
        <PaginationItem onClick={pagination.next}>
          <PaginationNext disabled={query.data?.meta?.nextPage === null} />
        </PaginationItem>
        <PaginationItem onClick={pagination.last}>
          <PaginationLast disabled={query.data?.meta?.nextPage === null} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default DataTablePagination;
