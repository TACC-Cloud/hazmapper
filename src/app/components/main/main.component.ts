import { Component, OnInit } from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {Feature} from '../../models/models';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl']
})
export class MainComponent implements OnInit {

  public activeFeature: Feature;
  public currentUser: AuthenticatedUser;

  constructor(private geoDataService: GeoDataService, private authService: AuthService) {}

  ngOnInit() {
    this.geoDataService.activeFeature.subscribe( next => {
      this.activeFeature = next;
    });
    this.authService.currentUser.subscribe(next => this.currentUser = next);
  }
}
