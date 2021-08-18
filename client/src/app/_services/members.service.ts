import { HttpClient, HttpHandler, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MembersEditComponent } from '../members/members-edit/members-edit.component';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { GetPaginatedResult, GetPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})

export class MembersService {
  baseUrl = environment.apiUrl;
  members : Member[] = [];
  memberCash = new Map();
  user: any;
  userParams!: UserParams;
  

  constructor(private http: HttpClient, private accountService : AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user = user;
      this.userParams = new UserParams(user);
    })
  }

  AddLike(username : string){
    return this.http.post(this.baseUrl + 'likes/' + username, {})
  }

  getLikes(predicate: string, pageNumber : Number, pageSize : Number) {
    let params = GetPaginationHeaders(pageNumber, pageSize);
    params = params.append('predicate', predicate);
   // return this.http.get<Partial<Member[]>>(this.baseUrl + 'likes?predicate=' + predicate);
   return GetPaginatedResult<Partial<Member[]>>(this.baseUrl + 'likes', params, this.http);
  }

  getUserParams(){
    return this.userParams;
  }

   setUserParams(params : UserParams){
     this.userParams = params;
   }

  getMembers(userParams : UserParams) {

    var response = this.memberCash.get(Object.values(userParams).join('-'));
    console.log('response ==>' + response);
    if (response) {
        return of(response);
    }

    let params = GetPaginationHeaders(userParams.pageNumber, userParams.pageSize);

    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender);
    params = params.append('OrderBy', userParams.OrderBy);

    return GetPaginatedResult<Member[]>(this.baseUrl + 'users', params, this.http)
    .pipe(
      map(response =>{
        this.memberCash.set(Object.values(userParams).join('-'), response);
        return response;
      })
    )
    
  }

  // GetPaginatedResult<T>(url : string, params : HttpParams){
  //   const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();
  //   return this.http.get<Member[]>(url, {observe: 'response', params}).pipe(
  //     map(response => {
  //       paginatedResult.result = response.body; 
  //       console.log('pagination: ' + JSON.stringify(response.headers.get('pagination')));
  //       if (response.headers.get('pagination') !== null)
  //       {
  //         paginatedResult.pagination = JSON.parse(response.headers.get('pagination') || '{}');
  //       }
  //       return paginatedResult;
  //     })      
  //   )
  // }

  // private GetPaginationHeaders(pageNumber : Number, pageSize: Number){
  //   let params = new HttpParams();
    
  //   params = params.append('pageNumber', pageNumber!.toString());
  //   params = params.append('pageSize', pageSize!.toString());     
    
  //   return params;
  // }

  getMember(username : string) {
    const member = [...this.memberCash.values()].reduce(
      (arr, elem) => arr.concat(elem.result), []).find((member:Member) => member.userName === username);
    console.log(member);

    if (member) return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  UpdateUser(member : Member)
  {
     return this.http.put(this.baseUrl + 'users', member).pipe(
       map(()=>{
         const index = this.members.indexOf(member);
         this.members[index] = member; 
       })
     )
  }

  resetUserParams(){
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  SetMainPhoto(photoId : Number){
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  DeletePhoto(photoId : Number){
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId)
  }
}

