import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators'
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { PresenceService } from './presence.service';



@Injectable({
  providedIn: 'root'
})

export class AccountService {
  //baseUrl = 'https://localhost:5001/api/';
  baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<User | any>(1); //&&
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient, private presence: PresenceService) {
      
  }

  register(model: any)
  {
    return this.http.post(this.baseUrl + 'account/register', model).pipe(
      map((user: any) => {
        if (user)
        {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user); 
          this.setCurrentUser(user);//
          this.presence.createConnections(user);
          return user;
        }
      }
      )
    )
  }

  login(model: any){
    return this.http.post(this.baseUrl + 'account/login', model).pipe(
     map((response: any) => //&&
     {
       const user : User = response; //&&
       if (user)
       {         
         localStorage.setItem('user', JSON.stringify(user));
         this.currentUserSource.next(user);
         this.setCurrentUser(user);//
         this.presence.createConnections(user);
       }
     }
     )
    )    
    }

  getCurrentUser()////////
  {
    console.log(localStorage.length);
    if (localStorage.getItem('user') != '{}' && localStorage.getItem('user'))
    {
    this.currentUserSource.next(JSON.parse(localStorage.getItem('user') || ''));
    }
  }

  setCurrentUser(user : User)
  {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout()
  {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
    this.presence.stopHubConnection();
  }

  getDecodedToken(token:string) {
    return JSON.parse(atob(token.split('.')[1]));
  }
}
