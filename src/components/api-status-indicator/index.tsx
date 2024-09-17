import Spinner from '@/components/ui/spinner';
import { cn, getApiErrorMessage } from '@/lib/utils';
import { UseQueryResult } from '@tanstack/react-query';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

const ApiStatusIndicator = ({
  query,
  noData,
  noDataContent,
  wrapper,
}: {
  query: UseQueryResult;
  noData: boolean;
  noDataContent?: ReactNode;
  wrapper?: ComponentPropsWithoutRef<'div'>;
}) => {
  if (
    !noData &&
    (!query.isLoading || query.fetchStatus === 'idle') &&
    !query.isError
  )
    return null;

  const errorMessage = getApiErrorMessage(query.error);

  return (
    <div
      {...wrapper}
      className={cn(
        'flex items-center justify-center px-5 py-20 text-center',
        wrapper?.className
      )}
    >
      {query.isLoading && query.fetchStatus !== 'idle' ? (
        <Spinner className="size-8" />
      ) : query.isError ? (
        <>
          {typeof errorMessage === 'string' ? (
            <p className="text-lg font-medium text-red-500">{errorMessage}</p>
          ) : (
            errorMessage
          )}
        </>
      ) : noData ? (
        noDataContent && typeof noDataContent !== 'string' ? (
          noDataContent
        ) : (
          <p className="text-lg font-medium opacity-80">
            {noDataContent || 'No data to show :('}
          </p>
        )
      ) : null}
    </div>
  );
};

export default ApiStatusIndicator;
