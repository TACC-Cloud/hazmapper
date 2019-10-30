import { Component, OnInit } from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {ProjectsService} from '../../services/projects.service';
import {IPointCloud, Project} from '../../models/models';
import {combineAll} from 'rxjs/operators';

@Component({
  selector: 'app-point-clouds-panel',
  templateUrl: './point-clouds-panel.component.html',
  styleUrls: ['./point-clouds-panel.component.styl']
})
export class PointCloudsPanelComponent implements OnInit {
  activeProject: Project;
  pointClouds: Array<IPointCloud>;

  constructor(private geoDataService: GeoDataService, private projectsService: ProjectsService) { }

  ngOnInit() {

    this.geoDataService.pointClouds.subscribe( (next) => {
      this.pointClouds = next;
    });
  }


  addPointCloud() {

  }

}
