import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';

@Component({
  selector: 'app-streetview-callback',
  templateUrl: './streetview-callback.component.html',
  styleUrls: ['./streetview-callback.component.styl']
})
export class StreetviewCallbackComponent implements OnInit {

  constructor(private streetviewAuthenticationService: StreetviewAuthenticationService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    const state = JSON.parse(params.state);

    const service = state.service;
    const originUrl = state.origin_url;
    const projectId = state.projectId;
    const username = state.username;

    const authStr = service == 'google' ? params.code : params.access_token;
    this.streetviewAuthenticationService.setStreetviewToken(service, authStr, username, projectId);
    this.streetviewAuthenticationService.setMapillaryUserKey();

    this.router.navigate([originUrl]);
  }
}
