export enum PaginationSort {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface IPagination {
  page: number;
  limit: number;
  orderBy?: string;
  sort?: PaginationSort;
}
