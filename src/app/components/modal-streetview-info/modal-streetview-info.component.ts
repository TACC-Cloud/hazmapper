import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-foundation/modal';
import { StreetviewService } from 'src/app/services/streetview.service';

@Component({
  selector: 'app-modal-streetview-info',
  templateUrl: './modal-streetview-info.component.html',
  styleUrls: ['./modal-streetview-info.component.styl']
})
export class ModalStreetviewInfoComponent implements OnInit {
  @Input() streetview: any;

  constructor(private streetviewService: StreetviewService,
              public bsModalRef: BsModalRef) { }

  ngOnInit() { }

  deleteSequence(seqId: number) {
    this.streetviewService.removeStreetviewSequence(seqId);
  }

  deleteStreetview() {
    this.streetviewService.removeStreetview(this.streetview.id);
    this.bsModalRef.hide();
  }

}
