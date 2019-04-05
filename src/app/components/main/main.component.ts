import { Component, OnInit } from '@angular/core';
import {GeoDataService} from "../../services/geo-data.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl']
})
export class MainComponent implements OnInit {

  constructor(private GeoDataService: GeoDataService) { }

  ngOnInit() {
    this.GeoDataService.activeFeature.subscribe( next=>{
      console.log("MainComponent", next);
    })
  }


}
