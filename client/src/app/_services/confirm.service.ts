import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { ModalGialogComponent } from '../modals/modal-gialog/modal-gialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  bsModalRef!: BsModalRef;

  constructor(private modalService: BsModalService) { }

  confirm(title = 'Confirmation', 
  message = 'Are you sur you want to do this?',
  btnOkText = 'Ok',
  btnCancelTextx = 'Cancel') : Observable<boolean> {
    const config = {
        initialState: {
          title,
          message, 
          btnOkText, 
          btnCancelTextx
        }
    }
    this.bsModalRef = this.modalService.show(ModalGialogComponent, config);
    return new Observable<boolean>(this.getResult());
  }

  private getResult() {
    return (observer: { next: (arg0: any) => void; complete: () => void; }) => {
      const subscription = this.bsModalRef.onHidden?.subscribe(()=>{
        observer.next(this.bsModalRef.content.result);
        observer.complete();
      });

      return {
        unsubscribe() {
          subscription?.unsubscribe();
        }
      }
    }
  }
}
