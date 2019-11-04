import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Project} from '../../models/models';
import {Subject} from 'rxjs';
import {BsModalRef} from 'ngx-foundation';
import {GeoDataService} from '../../services/geo-data.service';
import {ProjectsService} from '../../services/projects.service';

@Component({
  selector: 'app-modal-create-overlay',
  templateUrl: './modal-create-overlay.component.html',
  styleUrls: ['./modal-create-overlay.component.styl']
})
export class ModalCreateOverlayComponent implements OnInit {

  fileData: File;
  ovCreateForm: FormGroup;
  project: Project;
  public readonly onClose: Subject<any> = new Subject<any>();

  constructor(private bsModalRef: BsModalRef, private geoDataService: GeoDataService, private projectsService: ProjectsService) { }

  ngOnInit() {
    this.projectsService.activeProject.subscribe( (next) => {
      this.project = next;
    });
    this.ovCreateForm = new FormGroup( {
      image: new FormControl(''),
      label: new FormControl(''),
      minLat: new FormControl(''),
      maxLat: new FormControl(''),
      minLon: new FormControl(''),
      maxLon: new FormControl( '')
    });
  }

  fileSelected(ev) {
    this.fileData = ev.target.files[0];
  }

  close() {
    this.bsModalRef.hide();
  }

  submit() {

    this.geoDataService.addOverlay(
      this.project.id,
      this.fileData,
      this.ovCreateForm.get('label').value,
      this.ovCreateForm.get('minLat').value,
      this.ovCreateForm.get('maxLat').value,
      this.ovCreateForm.get('minLon').value,
      this.ovCreateForm.get('maxLon').value
    );
    this.onClose.next(null);
    this.bsModalRef.hide();
  }

}


