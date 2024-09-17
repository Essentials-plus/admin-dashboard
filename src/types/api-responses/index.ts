import { PaginationMeta } from '@/types/api-responses/pagination-meta';

export type ApiResponseSuccessBase<T, AdditionalInfo = {}> = {
  data: T;
  meta?: PaginationMeta;
  success: true;
} & AdditionalInfo;
