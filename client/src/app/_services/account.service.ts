import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators'
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';



@Injectable({
  providedIn: 'root'
})

export class AccountService {
  //baseUrl = 'https://localhost:5001/api/';
  baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<User | any>(1); //&&
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) {
      
  }

  register(model: any)
  {
    return this.http.post(this.baseUrl + 'account/register', model).pipe(
      map((user: any) => {
        if (user)
        {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user); 
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
       }
     }
     )
    )    
    }

  getCurrentUser()////////
  {
    console.log(localStorage.length);
    if (localStorage.getItem('user') != '{}')
    {
    this.currentUserSource.next(JSON.parse(localStorage.getItem('user') || ''));
    }
  }

  setCurrentUser(user : User)
  {
    this.currentUserSource.next(user);
  }

  logout()
  {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }
}
