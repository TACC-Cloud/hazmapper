import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authentication.service';
import { MAIN } from '../../constants/routes';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.styl'],
})
export class LogoutComponent implements OnInit {
  readonly MAIN = MAIN;
  constructor(private authSvc: AuthService) {}

  ngOnInit() {
    this.authSvc.logout();
  }
}
