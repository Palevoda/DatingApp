import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modal-gialog',
  templateUrl: './modal-gialog.component.html',
  styleUrls: ['./modal-gialog.component.css']
})
export class ModalGialogComponent implements OnInit {

  title!:string;
  message!:string; 
  btnOkText!:string; 
  btnCancelTextx!:string;
  result!: boolean;

  constructor(public bsModal:BsModalRef) { }

  ngOnInit(): void {
    
  }

  confirm(){
    this.result = true;
    this.bsModal.hide();
  }

  decline() {
    this.result = false;
    this.bsModal.hide();
  }

}
