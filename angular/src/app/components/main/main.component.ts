import { Component, AfterContentInit } from '@angular/core';
import {
  AuthenticatedUser,
  AuthService,
} from '../../services/authentication.service';
import { MAIN, LOGIN } from '../../constants/routes';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl'],
})
export class MainComponent implements AfterContentInit {
  public currentUser: AuthenticatedUser;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngAfterContentInit() {
    if (this.authService.isLoggedIn()) {
      this.authService.getUserInfo();
    }
    this.authService.currentUser.subscribe((next) => {
      // to avoid ExpressionChangedAfterItHasBeenCheckedError during /logout
      setTimeout(() => {
        this.currentUser = next;
      }, 0);
    });
  }

  routeToWelcome() {
    this.router.navigate([MAIN]);
  }

  routeToLogin() {
    // route to login and then to this page
    this.router.navigateByUrl(
      LOGIN + '?to=' + encodeURIComponent(this.router.url)
    );
  }
}
