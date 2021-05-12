import { Component, OnInit } from '@angular/core';
import {FilterService} from '../../services/filter.service';
import {featureTypes, featureTypeLabels} from '../../constants/assets';
import {GeoDataService} from '../../services/geo-data.service';
import {AssetFilters, Project} from '../../models/models';
import {ProjectsService} from '../../services/projects.service';

@Component({
  selector: 'app-filters-panel',
  templateUrl: './filters-panel.component.html',
  styleUrls: ['./filters-panel.component.styl']
})
export class FiltersPanelComponent implements OnInit {

  assetFilters: AssetFilters;
  activeProject: Project;

  readonly featureTypes = featureTypes;
  readonly featureTypeLabels = featureTypeLabels;

  constructor(private filterService: FilterService, private geoDataService: GeoDataService, private projectsService: ProjectsService) { }

  ngOnInit() {
    this.filterService.assetFilter.subscribe( (next) => {
      this.assetFilters = next;
    });
    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });
  }

  updateAssetTypeFilters(ftype: string): void {
    this.filterService.updateAssetTypes(ftype);
    this.geoDataService.getFeatures(this.activeProject.id, false);
  }
}
