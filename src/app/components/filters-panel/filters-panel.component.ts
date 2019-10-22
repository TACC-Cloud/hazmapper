import { Component, OnInit } from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {AssetFilters, Project} from '../../models/models';
import {ProjectsService} from '../../services/projects.service';

@Component({
  selector: 'app-filters-panel',
  templateUrl: './filters-panel.component.html',
  styleUrls: ['./filters-panel.component.styl']
})
export class FiltersPanelComponent implements OnInit {

  assetFilters: AssetFilters = new AssetFilters();
  activeProject: Project;

  constructor(private geoDataService: GeoDataService, private projectsService: ProjectsService) { }

  ngOnInit() {
    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });
  }

  updateAssetTypeFilters(ftype: string): void {
    this.assetFilters.updateAssetTypes(ftype);
    this.geoDataService.getFeatures(this.activeProject.id, this.assetFilters);
  }


}
