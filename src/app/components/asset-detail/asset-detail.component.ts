import { Component, OnInit } from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {Feature} from '../../models/models';
import {AppEnvironment, environment} from '../../../environments/environment';

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.styl']
})
export class AssetDetailComponent implements OnInit {

  environment: AppEnvironment;
  feature: Feature;
  featureSource: string;
  constructor(private geoDataService: GeoDataService) { }

  ngOnInit() {
   this.environment = environment;
   this.geoDataService.activeFeature.subscribe( (next) => {
     this.feature = next;
     try {

       let featureSource = this.environment.apiUrl + '/assets/' + this.feature.assets[0].path;
       // Strip out any possible double slashes or wso2 gets messed up
       featureSource = featureSource.replace(/([^:])(\/{2,})/g, '$1/');
       this.featureSource = featureSource;
     } catch (e) {
       this.featureSource = null;
     }
   });
  }

  close() {
    this.geoDataService.activeFeature = null;
  }


}
