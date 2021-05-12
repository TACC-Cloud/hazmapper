import { Component, OnInit } from '@angular/core';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';
import { StreetviewService } from 'src/app/services/streetview.service';

@Component({
  selector: 'app-streetview-accounts',
  templateUrl: './streetview-accounts.component.html',
  styleUrls: ['./streetview-accounts.component.styl']
})
export class StreetviewAccountsComponent implements OnInit {
  mapillaryUser;
  constructor(
    private streetviewService: StreetviewService,
    private streetviewAuthenticationService: StreetviewAuthenticationService) { }

  ngOnInit() {
    this.streetviewService.getMapillaryUser();
    this.streetviewService.mapillaryUser.subscribe(next => {
      this.mapillaryUser = next;
    });
  }

  isLoggedIn(service: string) {
    return this.streetviewAuthenticationService.isLoggedIn(service);
  }

  login(service: string) {
    this.streetviewAuthenticationService.login(service);
  }

  logout(service: string) {
    this.streetviewAuthenticationService.logout(service);
  }
}
