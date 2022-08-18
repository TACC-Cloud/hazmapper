import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-foundation/modal';
import { StreetviewService } from 'src/app/services/streetview.service';
import { StreetviewSequence } from '../../models/streetview';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { ModalService } from 'src/app/services/modal.service';
import { GeoDataService } from 'src/app/services/geo-data.service';

@Component({
  selector: 'app-modal-streetview-info',
  templateUrl: './modal-streetview-info.component.html',
  styleUrls: ['./modal-streetview-info.component.styl'],
})
export class ModalStreetviewInfoComponent implements OnInit {
  @Input() streetviewInstanceId: number;
  public streetviewInstance: any;
  public activeProject: any;
  public activeStreetview: any;

  constructor(
    private streetviewService: StreetviewService,
    private projectService: ProjectsService,
    private geoDataService: GeoDataService,
    private modalService: ModalService,
    private streetviewAuthService: StreetviewAuthenticationService,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit() {
    this.streetviewAuthService.activeStreetview.subscribe((sv) => {
      this.activeStreetview = sv;
      this.streetviewInstance = sv.instances.find(
        (e) => this.streetviewInstanceId === e.id
      );
    });

    this.projectService.activeProject.subscribe((p) => {
      this.activeProject = p;
    });
  }

  removeSequence(sequence: StreetviewSequence) {
    this.streetviewService.removeStreetviewSequence(sequence.id);
  }

  removeInstance() {
    this.streetviewService.removeStreetviewInstance(this.streetviewInstance.id);
    this.close();
  }

  openSequenceFeatureModal(streetviewSequence: StreetviewSequence) {
    this.modalService.confirm(
      'Import sequence to map',
      'Are you sure you want to import this sequence as a map asset? Members of this map will be able to see this sequence. This may take a while to process.',
      ['Cancel', 'Confirm']).subscribe((answer) => {
        if (answer === 'Confirm') {
          this.sequenceToFeature(streetviewSequence);
        }
      });
  }

  sequenceToFeature(streetviewSequence: StreetviewSequence) {
    this.geoDataService.streetviewSequenceToFeature(
      streetviewSequence.id,
      this.activeProject.id
    );
  }

  close() {
    this.bsModalRef.hide();
  }

  checkSequenceState(streetviewSequence: StreetviewSequence) {
    this.streetviewService.checkStreetviewSequence(streetviewSequence, this.activeStreetview);
  }

  showInMap(sequence: StreetviewSequence) {
    this.streetviewService
      .getMapillaryImages(sequence.sequence_id)
      .subscribe((e) => {
        if (e.data.length > 0) {
          this.streetviewService
            .getMapillaryImageData(e.data[0].id, ['geometry'])
            .subscribe((ab) => {
              this.streetviewService.sequenceFocusEvent = {
                id: sequence.sequence_id,
                latlng: [
                  ab.geometry.coordinates[1],
                  ab.geometry.coordinates[0],
                ],
              };
            });
        }
      });
  }
}
