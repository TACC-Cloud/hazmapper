import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import {MAIN} from '../../constants/routes';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent implements OnInit {
  public currentUser: AuthenticatedUser = null;
  private afterLoginRoute: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService) {
    // should support redirect to public project on login and offer way to switch to private view if user is
    // project member (see https://jira.tacc.utexas.edu/browse/DES-1921)
    this.afterLoginRoute = MAIN;
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.authService.getUserInfo();
    }
    this.authService.currentUser.subscribe(next => this.currentUser = next);
  }

  routeToWelcome() {
    this.router.navigate([MAIN]);
  }
}
