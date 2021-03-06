import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr : ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error =>{        
        if (error){
          switch(error.status){
              case 400: 
              if (error.error.errors){
                const modalStateError = [];
                for (const key in error.error.errors)
                {
                  if (error.error.errors[key]){
                    modalStateError.push(error.error.errors[key]);
                  }
                }
                throw modalStateError.flat();
              }
              else if (typeof(error.error) === 'object') {
              this.toastr.error(error.status, error.statusText);
              }
              else {
                this.toastr.error(error.error, "Error");
              }
              break;
              case 401: 
              this.toastr.error(error.status, error.statusText);
              break;
              case 404:
              this.router.navigateByUrl('/not-found');
              break;
              case 500:
              const navigationExtras: NavigationExtras = {state: {error: error.error}}
              this.router.navigateByUrl('/server-error', navigationExtras);
              break;
              default: 
              this.toastr.error('Something unexpected');
              console.log(error);
              break;
          }
        }
        return throwError(error);
      })
      
    )
  }
}
