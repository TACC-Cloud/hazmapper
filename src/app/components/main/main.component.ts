import { Component, OnInit } from '@angular/core';
import {GeoDataService} from "../../services/geo-data.service";
import {Feature} from "../../models/models";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl']
})
export class MainComponent implements OnInit {

  public activeFeature : Feature;

  constructor(private GeoDataService: GeoDataService) {}

  ngOnInit() {
    this.GeoDataService.activeFeature.subscribe( next=>{
      this.activeFeature = next;
    })
  }


}
