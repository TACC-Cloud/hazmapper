import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Project} from '../../models/models';
import {Subject} from 'rxjs';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {GeoDataService} from '../../services/geo-data.service';
import {ProjectsService} from '../../services/projects.service';
import {TapisFilesService} from "../../services/tapis-files.service";
import {RemoteFile} from "ng-tapis";

@Component({
  selector: 'app-modal-create-overlay',
  templateUrl: './modal-create-overlay.component.html',
  styleUrls: ['./modal-create-overlay.component.styl']
})
export class ModalCreateOverlayComponent implements OnInit {
  remoteFileData: Array<RemoteFile> = new Array<RemoteFile>();
  ovCreateForm: FormGroup;
  project: Project;
  public readonly onClose: Subject<any> = new Subject<any>();

  constructor(private bsModalRef: BsModalRef,
              private geoDataService: GeoDataService,
              private projectsService: ProjectsService,
              private bsModalService: BsModalService,
              private tapisFilesService: TapisFilesService) { }

  ngOnInit() {
    this.remoteFileData = Array<RemoteFile>();
    this.projectsService.activeProject.subscribe( (next) => {
      this.project = next;
    });
    this.ovCreateForm = new FormGroup( {
      label: new FormControl(''),
      minLat: new FormControl(''),
      maxLat: new FormControl(''),
      minLon: new FormControl(''),
      maxLon: new FormControl( '')
    });
  }

  onDSFileSelection(files: Array<RemoteFile>) {
    this.remoteFileData = files;
  }

  close() {
    this.bsModalRef.hide();
  }

  submit() {
    this.geoDataService.importOverlayFileFromTapis(
      this.project.id,
      this.remoteFileData[0],
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


