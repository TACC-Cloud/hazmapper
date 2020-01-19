import { Component, OnInit } from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {ProjectsService} from '../../services/projects.service';
import {IPointCloud, Project} from '../../models/models';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {ModalCreatePointCloudComponent} from '../modal-create-point-cloud/modal-create-point-cloud.component';

@Component({
  selector: 'app-point-clouds-panel',
  templateUrl: './point-clouds-panel.component.html',
  styleUrls: ['./point-clouds-panel.component.styl']
})
export class PointCloudsPanelComponent implements OnInit {
  activeProject: Project;
  pointClouds: Array<IPointCloud>;

  constructor(private geoDataService: GeoDataService, private projectsService: ProjectsService, private bsModalService: BsModalService) { }

  ngOnInit() {

    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });

    this.geoDataService.pointClouds.subscribe( (next: Array<IPointCloud>) => {
      this.pointClouds = next;
    });
  }

  openPointCloudCreateModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalCreatePointCloudComponent);
    modal.content.onClose.subscribe( (next) => {
      console.log(next);
      this.geoDataService.getPointClouds(this.activeProject.id);
    });
  }

}
