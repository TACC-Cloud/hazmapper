import { Component, OnInit } from '@angular/core';
import {Feature} from '../../models/models';
import {GeoDataService} from '../../services/geo-data.service';

@Component({
  selector: 'app-main-public',
  templateUrl: './main-public.component.html',
  styleUrls: ['./main-public.component.styl']
})
export class MainPublicComponent implements OnInit {
  public activeFeature: Feature;

  constructor(private geoDataService: GeoDataService) {}

  ngOnInit() {
    this.geoDataService.activeFeature.subscribe( next => {
      this.activeFeature = next;
    });
  }
}
