import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})

export class NavComponent implements OnInit {
  model: any = {}
  //loggedIn: boolean = false; //&&
 // currentUser$: Observable<User> = this.accountService.currentUser$; //&

  constructor(public accountService: AccountService) { }

  ngOnInit(): void {
     this.accountService.getCurrentUser();
    // this.currentUser$ = this.accountService.currentUser$; //&
    // console.log(this.currentUser$);
  }

  login() { 
    this.accountService.login(this.model).subscribe(
      response =>
      {
        console.log(response);
      },
      error => {console.log(error)}
      );
  }

  logout()
  {
    this.accountService.logout();
  }

}
