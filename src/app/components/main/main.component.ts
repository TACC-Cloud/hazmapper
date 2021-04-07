import { Component, AfterContentInit } from '@angular/core';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import {MAIN, LOGIN} from '../../constants/routes';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl']
})
export class MainComponent implements AfterContentInit {
  public currentUser: AuthenticatedUser;
  private afterLoginRoute: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService) {
    // should support redirect to public project on login and offer way to switch to private view if user is
    // project member (see https://jira.tacc.utexas.edu/browse/DES-1921)
    this.afterLoginRoute = MAIN;
  }

  ngAfterContentInit() {
    if (this.authService.isLoggedIn()) {
      this.authService.getUserInfo();
    }
    this.authService.currentUser.subscribe(next => {
      // to avoid ExpressionChangedAfterItHasBeenCheckedError during /logout
        setTimeout(() => {
          this.currentUser = next;
        }, 0);
      }
    );
  }

  routeToWelcome() {
    this.router.navigate([MAIN]);
  }
}
