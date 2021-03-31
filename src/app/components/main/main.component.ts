import { Component, OnInit } from '@angular/core';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl']
})
export class MainComponent implements OnInit {
  public currentUser: AuthenticatedUser;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(next => this.currentUser = next);
  }

  routeToWelcome() {
    this.router.navigate([''], { relativeTo: this.route });
  }
}
