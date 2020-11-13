import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-modal-create-tile-server',
  templateUrl: './modal-create-tile-server.component.html',
  styleUrls: ['./modal-create-tile-server.component.styl']
})
export class ModalCreateTileServerComponent implements OnInit {
  ovCreateForm: FormGroup;
  public readonly onClose: Subject<any> = new Subject<any>();
  constructor(private bsModalRef: BsModalRef,
              private bsModalService: BsModalService) { }


  ngOnInit() {
    this.ovCreateForm = new FormGroup( {
      label: new FormControl(''),
      minLat: new FormControl(''),
      maxLat: new FormControl(''),
      minLon: new FormControl(''),
      maxLon: new FormControl( '')
    });
  }

  close() {
    this.bsModalRef.hide();
  }
  submit() {
    this.onClose.next(null);
    this.bsModalRef.hide();
  }

}
