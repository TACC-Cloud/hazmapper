import { Component, AfterContentInit } from '@angular/core';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import {MAIN} from '../../constants/routes';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl']
})
export class MainComponent implements AfterContentInit {
  public currentUser: AuthenticatedUser;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService) {}

  ngAfterContentInit() {
    if (this.authService.isLoggedIn()) {
      this.authService.getUserInfo();
    }
    this.authService.currentUser.subscribe(next => this.currentUser = next);
  }

  routeToWelcome() {
    this.router.navigate([MAIN]);
  }
}
