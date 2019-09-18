import { Component, OnInit } from '@angular/core';
import {GeoDataService} from "../../services/geo-data.service";
import {Feature} from "../../models/models";
import {AuthenticatedUser, AuthService} from "../../services/authentication.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl']
})
export class MainComponent implements OnInit {

  public activeFeature : Feature;
  public currentUser: AuthenticatedUser;

  constructor(private GeoDataService: GeoDataService, private authService: AuthService) {}

  ngOnInit() {
    this.GeoDataService.activeFeature.subscribe( next=>{
      this.activeFeature = next;
    });
    // this.currentUser = this.authService.currentUser;
    this.authService.currentUser.subscribe(next=> this.currentUser = next)
  }


}
