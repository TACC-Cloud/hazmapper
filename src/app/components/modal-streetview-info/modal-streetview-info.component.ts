import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-foundation/modal';
import { StreetviewService } from 'src/app/services/streetview.service';
import {StreetviewInstance, StreetviewSequence} from '../../models/streetview';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';

@Component({
  selector: 'app-modal-streetview-info',
  templateUrl: './modal-streetview-info.component.html',
  styleUrls: ['./modal-streetview-info.component.styl']
})
export class ModalStreetviewInfoComponent implements OnInit {
  @Input() streetviewInstance: StreetviewInstance;

  constructor(private streetviewService: StreetviewService,
              private streetviewAuthService: StreetviewAuthenticationService,
              public bsModalRef: BsModalRef) { }

  ngOnInit() { 

  }

  deleteSequence(sequence: StreetviewSequence) {
    // this.streetviewService.removeStreetviewSequence(seqId);
    console.log('hey');
  }

  deleteInstance() {
    // this.streetviewService.removeStreetviewInstance(this.streetviewInstance.id);
    this.bsModalRef.hide();
  }

  checkComplete(sequence: StreetviewSequence) {
    console.log('hey');
  }

  showInMap(sequenceId: StreetviewSequence) {
    console.log('hey');
  }
}
