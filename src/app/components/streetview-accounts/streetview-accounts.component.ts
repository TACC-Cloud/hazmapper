import { Component, OnInit } from '@angular/core';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';

@Component({
  selector: 'app-streetview-accounts',
  templateUrl: './streetview-accounts.component.html',
  styleUrls: ['./streetview-accounts.component.styl']
})
export class StreetviewAccountsComponent implements OnInit {
  constructor(
    private streetviewAuthenticationService: StreetviewAuthenticationService) { }

  ngOnInit() {
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
