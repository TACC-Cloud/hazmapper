import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-foundation/modal';

@Component({
  selector: 'app-modal-streetview-username',
  templateUrl: './modal-streetview-username.component.html',
  styleUrls: ['./modal-streetview-username.component.styl'],
})
export class ModalStreetviewUsernameComponent implements OnInit {
  public onClose: Subject<any> = new Subject<any>();
  public username = '';

  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit() {}

  cancel() {
    this.bsModalRef.hide();
  }

  submit() {
    this.onClose.next({
      username: this.username,
    });
    this.bsModalRef.hide();
  }
}
