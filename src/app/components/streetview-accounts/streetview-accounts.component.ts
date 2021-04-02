import { Component, OnInit } from '@angular/core';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';

@Component({
  selector: 'app-streetview-accounts',
  templateUrl: './streetview-accounts.component.html',
  styleUrls: ['./streetview-accounts.component.styl']
})
export class StreetviewAccountsComponent implements OnInit {

  constructor(private streetviewAuthenticationService: StreetviewAuthenticationService) { }

  ngOnInit() {
  }

  isLoggedIn(svService: string) {
    return this.streetviewAuthenticationService.isLoggedIn(svService);
  }

  login(svService: string) {
    // this.streetviewAuthenticationService.login(svService, this.activeProject.id, this.currentUser.username, true);
    this.streetviewAuthenticationService.login(svService);
  }

  logout(svService: string) {
    // this.streetviewService.logout(svService, this.activeProject.id, this.currentUser.username);
    this.streetviewAuthenticationService.logout(svService);
  }

}
