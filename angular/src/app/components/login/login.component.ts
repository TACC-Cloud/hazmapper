import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MAIN } from '../../constants/routes';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.styl'],
})
export class LoginComponent implements OnInit {
  constructor(private authSvc: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const requestedUrl = this.route.snapshot.queryParamMap.has('to') ? this.route.snapshot.queryParamMap.get('to') : MAIN;
    if (this.authSvc.isLoggedIn()) {
      this.router.navigate([requestedUrl]);
    } else {
      this.authSvc.login(requestedUrl);
    }
  }
}
