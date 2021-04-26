import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-foundation/modal';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-modal-confirmation-body',
  templateUrl: './modal-confirmation-body.component.html',
  styleUrls: ['./modal-confirmation-body.component.styl']
})
export class ModalConfirmationBodyComponent {
  @Input() options: Array<any> = [false, true];
  @Input() message: string = 'message';
  @Input() title: string = 'title';
  public readonly answer: Subject<string> = new Subject<string>();

  constructor(public bsModalRef: BsModalRef) { }

  closeModal(answer: string) {
    this.answer.next(answer);
    this.bsModalRef.hide();
  }
}
