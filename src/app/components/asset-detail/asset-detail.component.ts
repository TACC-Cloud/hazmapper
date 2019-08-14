import { Component, OnInit } from '@angular/core';
import {GeoDataService} from "../../services/geo-data.service";
import {Feature} from "../../models/models";
import {AppEnvironment, environment} from "../../../environments/environment";

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.styl']
})
export class AssetDetailComponent implements OnInit {

  environment: AppEnvironment;
  feature: Feature;
  featureSource: string;
  constructor(private GeoDataService: GeoDataService) { }

  ngOnInit() {
   this.environment = environment;
   this.GeoDataService.activeFeature.subscribe( (next)=>{
     this.feature = next;
     try {
       this.featureSource = this.environment.apiUrl + this.feature.assets[0].path;
     } catch (e) {
       this.featureSource = null;
     }
   })
  }

  close() {
    this.GeoDataService.activeFeature = null;
  }


}
