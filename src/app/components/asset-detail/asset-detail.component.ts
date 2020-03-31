import { Component, OnInit } from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {Feature, Project} from '../../models/models';
import {AppEnvironment, environment} from '../../../environments/environment';
import {ProjectsService} from '../../services/projects.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.styl']
})
export class AssetDetailComponent implements OnInit {

  environment: AppEnvironment;
  feature: Feature;
  featureSource: string;
  activeProject: Project;
  safePointCloudUrl: SafeResourceUrl;
  constructor(private geoDataService: GeoDataService,
              private projectsService: ProjectsService,
              public sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.environment = environment;
    this.geoDataService.activeFeature.subscribe( (next) => {
      this.feature = next;
      try {
        let featureSource = this.environment.apiUrl + '/assets/' + this.feature.assets[0].path;
        // Strip out any possible double slashes or wso2 gets messed up
        featureSource = featureSource.replace(/([^:])(\/{2,})/g, '$1/');
        this.featureSource = featureSource;

        if (this.feature.featureType() === 'point_cloud') {
          this.safePointCloudUrl = this.sanitizer.bypassSecurityTrustResourceUrl(featureSource + '/preview.html');
        } else {
          this.safePointCloudUrl = null;
        }
      } catch (e) {
        this.featureSource = null;
        this.safePointCloudUrl = null;
      }
    });
    this.projectsService.activeProject.subscribe( (current) => {
      this.activeProject = current;
    });
  }

  handleAssetFileInput(files: FileList) {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < files.length; i++) {
      this.geoDataService.uploadAssetFile(this.activeProject.id, Number(this.feature.id), files[i]);
    }
  }

  close() {
    this.geoDataService.activeFeature = null;
  }


}
