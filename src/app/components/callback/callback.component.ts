import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/authentication.service";

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.styl']
})
export class CallbackComponent implements OnInit {

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) { }

  ngOnInit() {
    let token = this.route.snapshot.queryParamMap.get("access_token");
    let expires_in = +this.route.snapshot.queryParamMap.get("expires_in");
    this.auth.setToken(token, expires_in);
    this.router.navigate(['/']);
  }

}
