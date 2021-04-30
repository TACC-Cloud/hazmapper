import { Component, Output, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-foundation/modal';

@Component({
  selector: 'app-modal-confirmation-body',
  templateUrl: './modal-confirmation-body.component.html',
  styleUrls: ['./modal-confirmation-body.component.styl']
})
export class ModalConfirmationBodyComponent {
  title: string;
  message: string;
  options: string;
  answer: string;

  constructor(public bsModalRef: BsModalRef) { }

 closeModal(answer) {
   this.answer = answer;
   this.bsModalRef.hide();
 }
}
