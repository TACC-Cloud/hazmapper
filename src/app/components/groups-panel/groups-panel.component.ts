import { Component, OnInit } from '@angular/core';
import {FeatureCollection} from 'geojson';
import {GeoDataService} from '../../services/geo-data.service';
import {BsModalService} from 'ngx-foundation';
import {ProjectsService} from '../../services/projects.service';
import {TapisFilesService} from '../../services/tapis-files.service';
import {Feature, Project} from '../../models/models';

@Component({
  selector: 'app-groups-panel',
  templateUrl: './groups-panel.component.html',
  styleUrls: ['./groups-panel.component.styl']
})
export class GroupsPanelComponent implements OnInit {
  features: FeatureCollection;
  activeFeature: Feature;
  activeProject: Project;
  constructor(private geoDataService: GeoDataService, private bsModalService: BsModalService,
              private projectsService: ProjectsService) { }

  ngOnInit() {
    this.geoDataService.features.subscribe( (fc: FeatureCollection) => {
      this.features = fc;
      console.log(fc);
      fc.features.forEach(f => {
        console.log(Object.keys(f.properties));
      });
    });
    this.geoDataService.activeFeature.subscribe( (next) => {
      this.activeFeature = next;
    });
    this.projectsService.activeProject.subscribe( (current) => {
      this.activeProject = current;
    });
  }

}
