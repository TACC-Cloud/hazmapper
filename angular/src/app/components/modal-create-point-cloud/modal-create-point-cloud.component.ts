import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-foundation';
import { GeoDataService } from '../../services/geo-data.service';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal-create-point-cloud',
  templateUrl: './modal-create-point-cloud.component.html',
  styleUrls: ['./modal-create-point-cloud.component.styl'],
})
export class ModalCreatePointCloudComponent implements OnInit {
  pcCreateForm: FormGroup;
  project: Project;
  public readonly onClose: Subject<any> = new Subject<any>();

  constructor(private bsModalRef: BsModalRef, private geoDataService: GeoDataService, private projectsService: ProjectsService) {}

  ngOnInit() {
    this.projectsService.activeProject.subscribe((next) => {
      this.project = next;
    });
    this.pcCreateForm = new FormGroup({
      description: new FormControl(''),
      conversionParameters: new FormControl(''),
    });
  }

  close() {
    this.bsModalRef.hide();
  }

  submit() {
    this.geoDataService.addPointCloud(
      this.project.id,
      this.pcCreateForm.get('description').value,
      this.pcCreateForm.get('conversionParameters').value
    );
    this.onClose.next(null);
    this.bsModalRef.hide();
  }
}
