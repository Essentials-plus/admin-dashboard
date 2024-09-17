import { useIntersection } from "@mantine/hooks";
import { useEffect, useRef } from "react";

type UseFetchInfinitelyProps = {
  enableFetchNextPage?: boolean;
  onFetchNextPage?: () => void;
};

const useFetchInfinitely = ({
  enableFetchNextPage,
  onFetchNextPage,
}: UseFetchInfinitelyProps) => {
  const lastItemRef = useRef<HTMLElement>(null);

  const { entry, ref } = useIntersection({
    root: lastItemRef.current,
    threshold: 0,
  });
  useEffect(() => {
    if (entry?.isIntersecting && enableFetchNextPage) {
      onFetchNextPage && onFetchNextPage();
    }
  }, [enableFetchNextPage, entry?.isIntersecting, onFetchNextPage]);

  const getRef = (index: number, results: any[]) => {
    return index === results.length - 1 ? ref : undefined;
  };

  return { getRef };
};

export default useFetchInfinitely;
