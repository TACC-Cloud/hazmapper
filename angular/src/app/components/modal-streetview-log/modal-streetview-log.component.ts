import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-foundation';
import { IProgressNotification } from 'src/app/models/notification';

@Component({
  selector: 'app-modal-streetview-log',
  templateUrl: './modal-streetview-log.component.html',
  styleUrls: ['./modal-streetview-log.component.styl']
})
export class ModalStreetviewLogComponent implements OnInit {
  @Input() notification: IProgressNotification;

  constructor(private bsModalRef: BsModalRef) { }

  ngOnInit() {
  }

  close() {
    this.bsModalRef.hide();
  }

}
