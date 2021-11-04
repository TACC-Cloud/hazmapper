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
  @Input() streetviewInstanceId: number;
  public streetviewInstance: any;

  constructor(private streetviewService: StreetviewService,
              private streetviewAuthService: StreetviewAuthenticationService,
              public bsModalRef: BsModalRef) { }

  ngOnInit() {
    // TODO: Call to check if any of the sequences are complete
    this.streetviewAuthService.activeStreetview.subscribe(sv => {
      this.streetviewInstance = sv.instances.find(e => this.streetviewInstanceId === e.id);
    });

  }

  removeSequence(sequence: StreetviewSequence) {
    this.streetviewService.removeStreetviewSequence(sequence.id);
  }

  removeInstance() {
    this.streetviewService.removeStreetviewInstance(this.streetviewInstance.id);
    this.close();
  }

  close() {
    this.bsModalRef.hide();
  }

  showInMap(sequence: StreetviewSequence) {
    this.streetviewService.getMapillaryImages(sequence.sequence_id).subscribe(e => {
      if (e.data.length > 0) {
        this.streetviewService.getMapillaryImageData(e.data[0].id, ['geometry']).subscribe(ab => {
          this.streetviewService.sequenceFocusEvent = {
            id: sequence.sequence_id,
            latlng: [ab.geometry.coordinates[1], ab.geometry.coordinates[0]]
          };
        });
      }
    });
  }
}
