import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthGuard } from './_guards/auth.guard';
import { User } from './_models/user';
import { AccountService } from './_services/account.service';
import { PresenceService } from './_services/presence.service';

@Component({
  selector: 'app-root', 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'The dating app';
  users: any;

  constructor(private accountService : AccountService, private presenceService: PresenceService) {
    
  }

  ngOnInit()
  {
      // this.getUsers(); 1      
      this.setCurrentUser();
  }

  setCurrentUser(){
    const user : User = JSON.parse(localStorage.getItem('user') || '{}'); //&&
    if (user.username != undefined) {
      this.accountService.setCurrentUser(user);
      this.presenceService.createConnections(user);
    }
  }

  // getUsers() 1
  // {
  //   this.http.get("https://localhost:5001/api/users").subscribe(
  //     responce => {this.users = responce}, 
  //     error => {console.log(error);
  //     })    
  // }
}
