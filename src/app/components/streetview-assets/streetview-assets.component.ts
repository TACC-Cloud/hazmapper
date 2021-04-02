import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/models';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import {ProjectsService} from '../../services/projects.service'
import { StreetviewService } from 'src/app/services/streetview.service';

@Component({
  selector: 'app-streetview-assets',
  templateUrl: './streetview-assets.component.html',
  styleUrls: ['./streetview-assets.component.styl']
})
export class StreetviewAssetsComponent implements OnInit {
  private activeProject: Project;
  private currentUser: AuthenticatedUser;
  private mapillarySequences: Array<any> = [];
  // private mapillaryDisplaySequences: Array<any> = [];

  constructor(private streetviewService: StreetviewService,
              private projectsService: ProjectsService,
              private authService: AuthService) { }


  ngOnInit() {
    this.streetviewService.getStreetviewSequences('mapillary');

    this.streetviewService.streetviewSequences.subscribe((next) => {
      // TODO: Fix this to be more elegant (way to toggle switch)
      // TODO: Create a separate list of active panels and filter out that locally
      // next.forEach(x => x.open = false);
      this.mapillarySequences = next;
      console.log(next);
    })
  }

  toggleStreetview(svId: number) {
    let sv = this.mapillarySequences[svId];
    sv.open = !sv.open;
  }

  toggleSequence(seqId: number, sequences: Array<any>) {
    let seq = sequences[seqId];
    seq.open = !seq.open;
  }

  deleteSequence(service: string, seqId: number) {
    this.streetviewService.removeStreetviewSequence(service, seqId);
  }

}
