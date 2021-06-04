import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-foundation/modal';
import { ProjectsService } from 'src/app/services/projects.service';
import { Project } from 'src/app/models/models';
import { StreetviewService } from 'src/app/services/streetview.service';

@Component({
  selector: 'app-modal-streetview-info',
  templateUrl: './modal-streetview-info.component.html',
  styleUrls: ['./modal-streetview-info.component.styl']
})
export class ModalStreetviewInfoComponent implements OnInit {
  @Input() streetview: any;
  sortedStreetview: any = {};
  activeProject: Project;


  constructor(private streetviewService: StreetviewService,
              private projectsService: ProjectsService,
              public bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.projectsService.activeProject.subscribe((next) => {
      this.activeProject = next;
    });

    if (this.streetview) {
      for (let seq of this.streetview.sequences) {
        const sortKey = seq.organization_key ? seq.organization_key : 'other';
        if (!this.sortedStreetview[sortKey]) {
          this.sortedStreetview[sortKey] = [seq];
        } else {
          this.sortedStreetview[sortKey].push(seq);
        }
      }
    }
  }

  deleteSequence(seqId: number) {
    this.streetviewService.removeStreetviewSequence(seqId);
  }

  deleteStreetview() {
    this.streetviewService.removeStreetview(this.streetview.id);
    this.bsModalRef.hide();
  }

}
