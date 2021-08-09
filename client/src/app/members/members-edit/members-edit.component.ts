import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-members-edit',
  templateUrl: './members-edit.component.html',
  styleUrls: ['./members-edit.component.css']
})
export class MembersEditComponent implements OnInit {
  @ViewChild('editForm') editForm!: NgForm;
  @HostListener('window:beforeunload',  ['$event']) unloadNotification($event : any){
    if (this.editForm.dirty)
    $event.returnValue(true); //
  } 
  member!:Member;
  user!: User;

  constructor(private accountService:AccountService, private memberService : MembersService,
    private toastrService : ToastrService) { 
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {this.user = user});
  }

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember()
  {
    this.memberService.getMember(this.user.username).subscribe(member => this.member = member);
  };

  UpdateMember()
  {
    this.memberService.UpdateUser(this.member).subscribe(()=>{
        this.toastrService.success("Your profile updated successfully");
        this.editForm.reset(this.member);
      }
    )    
  }
}
