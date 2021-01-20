import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, Route} from '@angular/router';
import {StreetviewService} from '../../services/streetview.service';
@Component({
  selector: 'app-streetview-google-callback',
  templateUrl: './streetview-google-callback.component.html',
  styleUrls: ['./streetview-google-callback.component.styl']
})
export class StreetviewGoogleCallbackComponent implements OnInit {

  constructor(private streetviewService: StreetviewService,
              private route: ActivatedRoute) { }

  user: string;

  ngOnInit() {
    // TODO Check for access_denied and token expiration.
    //      When access token expiration send refresh token
    //      When refresh token expiration, re-authorize (go through get token)


    // this.streetviewService.streetviewTokens.subscribe((e) => {
    const params = this.route.snapshot.queryParams;
    this.streetviewService.getToken(params, 'google');
    // });
    // this.streetviewService.getUserStreetviewTokens();

  }

}
