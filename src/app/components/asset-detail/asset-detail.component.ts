import { Component, OnInit } from '@angular/core';
import {GeoDataService} from "../../services/geo-data.service";

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.styl']
})
export class AssetDetailComponent implements OnInit {

  constructor(private GeoDataService: GeoDataService) { }

  ngOnInit() {
  }

  close() {
    this.GeoDataService.activeFeature = null;
  }

}
