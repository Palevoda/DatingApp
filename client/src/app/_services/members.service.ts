import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MembersEditComponent } from '../members/members-edit/members-edit.component';
import { Member } from '../_models/member';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})

export class MembersService {
  baseUrl = environment.apiUrl;
  members : Member[] = [];

  constructor(private http: HttpClient) { }

  getMembers() {
    if (this.members.length > 0) 
    return of(this.members);
    
    return this.http.get<Member[]>(this.baseUrl + 'users').pipe(
          map((members: Member[]) =>{
            this.members = members;
            return members;
      })      
    )
  }

  getMember(username : string) {
    const member = this.members.find(member => member.userName === username);
    if (member !== undefined) return of(member);

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
}
