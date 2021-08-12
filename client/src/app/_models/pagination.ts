import { Member } from "./member";

export interface Pagination{
    currentPage : number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

export class PaginatedResult<T>{
    result: T | null | undefined | null | Member[];
    pagination!: Pagination;
}