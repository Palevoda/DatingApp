import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  @Output() CancelRegister = new EventEmitter();
  registerForm!: FormGroup;
  maxDate!: Date;
  validationErrors!: string[];
  constructor(private accountService: AccountService, private toastr: ToastrService, private fb : FormBuilder, 
    private router: Router) { }

  ngOnInit(): void {
    this.InitializeForm();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  InitializeForm(){
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.maxLength(8), Validators.minLength(4)]],
      confirmPassword: ['', Validators.required],
    })

    this.registerForm.controls.confirmPassword.setValidators(this.MatchValues('password'));
    this.registerForm.controls.password.valueChanges.subscribe(()=>{
      this.registerForm.controls.confirmPassword.updateValueAndValidity();
    })
  }

  MatchValues(matchTo:string) : ValidatorFn{ //Как это вообще работает?
    return (control: AbstractControl) =>{
      return control?.value === (control!.parent!.controls as { [key: string]: AbstractControl })![matchTo]!.value! ? null : { isMatching: true }; //
    }
  }


  register() 
  {
    this.accountService.register(this.registerForm.value).subscribe(response => {
      this.router.navigateByUrl('/members');
      this.cancel();
      this.toastr.success('You successfully been registered');
    }, error => {
      console.log(error);
      this.validationErrors! = error;
    });

  }

  cancel()
  {
    this.CancelRegister.emit(false);
  }
}
