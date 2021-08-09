import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { MembersEditComponent } from '../members/members-edit/members-edit.component';

@Injectable({
  providedIn: 'root'
})
export class PreventUnsavedChangesGuard implements CanDeactivate<unknown> {
  canDeactivate(component: MembersEditComponent): boolean {
    if (component.editForm.dirty)
      return confirm("Are you shure you want to continue. if you go away, any unsaved changes will be lost.");
      
    return true;
  }
  
}
