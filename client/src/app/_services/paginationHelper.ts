import { HttpClient, HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Member } from "../_models/member";
import { PaginatedResult } from "../_models/pagination";

 export function GetPaginatedResult<T>(url : string, params : any, http : HttpClient){
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();
    return http.get<Member[]>(url, {observe: 'response', params}).pipe(
      map(response => {
        paginatedResult.result = response.body; 
        console.log('pagination: ' + JSON.stringify(response.headers.get('pagination')));
        if (response.headers.get('pagination') !== null)
        {
          paginatedResult.pagination = JSON.parse(response.headers.get('pagination') || '{}');
        }
        return paginatedResult;
      })      
    )
  }

  export function GetPaginationHeaders(pageNumber : Number, pageSize: Number){
    let params = new HttpParams();
    
    params = params.append('pageNumber', pageNumber!.toString());
    params = params.append('pageSize', pageSize!.toString());     
    
    return params;
  }